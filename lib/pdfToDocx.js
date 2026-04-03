/**
 * PDF → DOCX converter — pdfjs-dist edition
 *
 * Extraction : pdfjs-dist legacy (même moteur que Firefox/Chrome)
 *   → gère tous les encodages, XRef streams, polices complexes
 *   → conserve positions précises, taille de police exacte, nom de police
 *
 * Génération : package `docx` → vrai .docx Word avec styles Heading1/2/3
 */

import {
  Document, Paragraph, TextRun, HeadingLevel,
  Packer, PageBreak, AlignmentType,
} from "docx";

// ─── 1. Extraction complète via pdfjs-dist ────────────────────────────────

async function extractPages(buffer) {
  // Charger le build legacy (compatible Node.js sans canvas/DOMMatrix)
  const { default: pdfjsLib } = await import("pdfjs-dist/legacy/build/pdf.js");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "";

  const loadingTask = pdfjsLib.getDocument({
    data:             new Uint8Array(buffer),
    useWorkerFetch:   false,
    isEvalSupported:  false,
    disableFontFace:  true,
    verbosity:        0,          // silencer les warnings canvas/Path2D
  });

  const pdf   = await loadingTask.promise;
  const pages = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page     = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const content  = await page.getTextContent({
      normalizeWhitespace:    false,
      disableCombineTextItems: false,
    });

    const pageH     = viewport.height;
    const pageItems = [];

    for (const item of content.items) {
      // MarkedContent dividers (no text) — skip
      if (!("str" in item)) continue;
      const text = item.str;
      if (!text) continue;

      // transform = [a, b, c, d, e, f]
      // e = x,  f = y (PDF space: bottom-left origin)
      // |d| ≈ rendered font size  (or item.height for pdfjs-dist)
      const [a, , , d, x, y] = item.transform;
      const fontSize = Math.round(
        item.height > 0 ? item.height : Math.max(Math.abs(a), Math.abs(d), 8)
      );

      // Bold/italic: pdfjs-dist expose souvent la vraie famille dans fontName
      // ex: "ABCDE+TimesNewRomanPS-BoldMT", "GHIJK+Helvetica-Bold", etc.
      const fontLower = (item.fontName || "").toLowerCase();
      const bold   = /bold|heavy|black|demi|semibold/.test(fontLower);
      const italic = /italic|oblique|slant/.test(fontLower);

      pageItems.push({
        x,
        y:       pageH - y,   // → origine haut-gauche (Y croît vers le bas)
        w:       item.width,
        text,
        fontSize,
        bold,
        italic,
        hasEOL:  item.hasEOL ?? false,
      });
    }

    pages.push(pageItems);
  }

  return pages;
}

// ─── 2. Espacement de ligne réel depuis les Y-gaps ────────────────────────

function lineSpacingFromItems(items) {
  const ys = [...new Set(items.map(i => Math.round(i.y * 10) / 10))].sort((a, b) => a - b);
  const gaps = [];
  for (let i = 1; i < ys.length; i++) {
    const g = ys[i] - ys[i - 1];
    if (g > 0.5 && g < 50) gaps.push(g);   // exclure valeurs aberrantes
  }
  if (!gaps.length) return 14;
  gaps.sort((a, b) => a - b);
  return gaps[Math.floor(gaps.length * 0.25)] ?? gaps[0];  // 25e percentile
}

// ─── 3. Grouper items en lignes par proximité Y ───────────────────────────

function groupIntoLines(items, lineSpacing) {
  if (!items.length) return [];

  const YT     = lineSpacing * 0.35;   // tolérance même-ligne
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);

  const rawLines = [];
  for (const item of sorted) {
    const last = rawLines[rawLines.length - 1];
    if (last && Math.abs(last.avgY - item.y) <= YT) {
      last.items.push(item);
      last.avgY = last.items.reduce((s, i) => s + i.y, 0) / last.items.length;
    } else {
      rawLines.push({ avgY: item.y, items: [item] });
    }
  }

  const lines = rawLines.map(l => ({
    ...l,
    items: l.items.sort((a, b) => a.x - b.x),
  }));

  for (let i = 1; i < lines.length; i++) {
    lines[i].gap = lines[i].avgY - lines[i - 1].avgY;
  }
  return lines;
}

// ─── 4. Taille de corps (mode = taille la plus fréquente en nb chars) ─────

function bodyFontSize(items) {
  const freq = {};
  for (const item of items) {
    freq[item.fontSize] = (freq[item.fontSize] || 0) + item.text.length;
  }
  const best = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
  return best ? parseFloat(best[0]) : 12;
}

// ─── 5. Détection du niveau de titre ─────────────────────────────────────

function headingLevel(line, bodySize, rankSizes) {
  const maxSize = Math.max(...line.items.map(i => i.fontSize));
  const allBold = line.items.length > 0 && line.items.every(i => i.bold);
  const text    = line.items.map(i => i.text).join("").trim();

  // Ne pas appliquer de style titre au corps
  if (maxSize <= bodySize && !allBold) return null;
  // Trop long pour un titre
  if (text.length > 160) return null;

  if (maxSize >= bodySize * 1.5 || rankSizes[0] === maxSize) return HeadingLevel.HEADING_1;
  if (maxSize >= bodySize * 1.2 || rankSizes[1] === maxSize) return HeadingLevel.HEADING_2;
  if (maxSize >= bodySize * 1.08 || (allBold && text.length < 100)) return HeadingLevel.HEADING_3;

  return null;
}

// ─── 6. Construire les TextRun d'une ou plusieurs lignes ─────────────────

function buildRuns(lines, isHeading = false) {
  const runs = [];

  for (let li = 0; li < lines.length; li++) {
    const { items } = lines[li];

    for (let i = 0; i < items.length; i++) {
      const curr = items[i];
      const prev = items[i - 1];

      let text = curr.text;

      // Espace entre items si gap horizontal visible
      if (prev && !text.startsWith(" ") && !prev.text.endsWith(" ")) {
        const prevEnd = prev.x + (prev.w || 0);
        if (curr.x - prevEnd > 1) text = " " + text;
      }

      runs.push(new TextRun({
        text,
        bold:    isHeading ? true : curr.bold,
        italics: curr.italic,
        size:    Math.max(16, Math.round(curr.fontSize * 2)),  // demi-points
        font:    "Calibri",
      }));
    }

    // Espace entre lignes fusionnées (pas de saut de ligne dur)
    if (li < lines.length - 1) {
      const last = runs[runs.length - 1];
      if (last && !last.options?.text?.endsWith(" ")) {
        runs.push(new TextRun({ text: " " }));
      }
    }
  }

  return runs;
}

// ─── 7. Conversion principale ─────────────────────────────────────────────

export async function pdfToDocx(buffer) {
  const pages = await extractPages(buffer);

  if (!pages.length || pages.every(p => p.length === 0)) {
    throw new Error("Aucun texte extrait — le PDF est peut-être basé sur des images (PDF scanné).");
  }

  // Analyse globale des tailles de police sur tout le document
  const allItems  = pages.flat();
  const bodySize  = bodyFontSize(allItems);
  const topSizes  = [...new Set(allItems.map(i => i.fontSize))]
    .filter(s => s > bodySize)
    .sort((a, b) => b - a);

  const docChildren = [];

  for (let pi = 0; pi < pages.length; pi++) {
    const pageItems = pages[pi];
    if (!pageItems.length) continue;

    const ls        = lineSpacingFromItems(pageItems);
    const PARA_GAP  = ls * 1.7;   // écart > 1.7x → nouveau paragraphe
    const lines     = groupIntoLines(pageItems, ls);

    let paraBuffer  = [];

    const flushPara = () => {
      if (!paraBuffer.length) return;
      const runs = buildRuns(paraBuffer);
      if (runs.length) {
        docChildren.push(new Paragraph({
          children: runs,
          spacing:  { after: 120, line: 276, lineRule: "auto" },
        }));
      }
      paraBuffer = [];
    };

    for (const line of lines) {
      const text   = line.items.map(i => i.text).join("").trim();
      if (!text) continue;

      const hlevel = headingLevel(line, bodySize, topSizes);
      const bigGap = line.gap != null && line.gap > PARA_GAP;

      // Saut de ligne dur détecté par pdfjs (hasEOL sur le dernier item)
      const eol = line.items[line.items.length - 1]?.hasEOL ?? false;

      if (hlevel) {
        // Titre : vider le buffer courant puis créer un paragraphe Heading
        flushPara();
        docChildren.push(new Paragraph({
          heading:  hlevel,
          children: buildRuns([line], true),
          spacing:  { before: 240, after: 120 },
        }));
      } else if (bigGap || eol) {
        // Grand écart ou fin de ligne dure → nouveau paragraphe
        flushPara();
        paraBuffer.push(line);
      } else {
        // Vérifier changement de marge gauche (liste, nouvelle section)
        const currX = line.items[0]?.x ?? 0;
        const prevX = paraBuffer[paraBuffer.length - 1]?.items[0]?.x ?? currX;
        if (paraBuffer.length && Math.abs(currX - prevX) > ls * 1.5) {
          flushPara();
        }
        paraBuffer.push(line);
      }
    }

    flushPara();

    // Saut de page entre les pages (pas après la dernière)
    if (pi < pages.length - 1) {
      docChildren.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }

  if (!docChildren.length) {
    throw new Error("Impossible de construire le document Word.");
  }

  // ── Construction du document final ───────────────────────────────────
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: Math.round(bodySize * 2),   // demi-points
          },
        },
        heading1: { run: { font: "Calibri Light", color: "2E74B5", bold: true,  size: Math.round(bodySize * 2 * 1.6) } },
        heading2: { run: { font: "Calibri Light", color: "2E74B5", bold: false, size: Math.round(bodySize * 2 * 1.3) } },
        heading3: { run: { font: "Calibri",        color: "1F3763", bold: true,  size: Math.round(bodySize * 2 * 1.15) } },
      },
    },
    sections: [{
      properties: {
        page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } },
      },
      children: docChildren,
    }],
  });

  return Packer.toBuffer(doc);
}
