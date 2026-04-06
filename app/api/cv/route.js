import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// ─── Helpers ───────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
}

function splitLines(text, font, size, maxWidth) {
  if (!text) return [];
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function POST(request) {
  const data = await request.json();
  const {
    name = "", title = "", email = "", phone = "", address = "", website = "",
    summary = "",
    experiences = [],
    educations = [],
    skills = [],
    languages = [],
    accentColor = "#2563EB",
  } = data;

  const doc  = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const boldFont   = await doc.embedFont(StandardFonts.HelveticaBold);
  const regFont    = await doc.embedFont(StandardFonts.Helvetica);
  const accent     = hexToRgb(accentColor);
  const dark       = rgb(0.1, 0.1, 0.1);
  const gray       = rgb(0.45, 0.45, 0.45);
  const lightGray  = rgb(0.93, 0.93, 0.93);
  const white      = rgb(1, 1, 1);

  let y = height;

  // ── Header background ──
  const headerH = 140;
  page.drawRectangle({ x: 0, y: height - headerH, width, height: headerH, color: accent });

  // ── Name ──
  const nameSize = Math.min(28, 560 / Math.max(name.length, 1) * 1.8);
  page.drawText(name || "Votre Nom", {
    x: 40, y: height - 52,
    size: Math.min(nameSize, 28), font: boldFont, color: white,
  });

  // ── Title ──
  if (title) {
    page.drawText(title, { x: 40, y: height - 78, size: 13, font: regFont, color: rgb(0.85, 0.9, 1) });
  }

  // ── Contact info ──
  const contacts = [email, phone, address, website].filter(Boolean);
  const contactStr = contacts.join("  ·  ");
  if (contactStr) {
    page.drawText(contactStr, { x: 40, y: height - 106, size: 9, font: regFont, color: rgb(0.85, 0.9, 1), maxWidth: width - 80 });
  }

  y = height - headerH - 20;

  // ── Section helper ──
  const drawSection = (label) => {
    y -= 8;
    page.drawRectangle({ x: 40, y: y - 2, width: width - 80, height: 22, color: lightGray });
    page.drawRectangle({ x: 40, y: y - 2, width: 4, height: 22, color: accent });
    page.drawText(label.toUpperCase(), { x: 50, y: y + 4, size: 10, font: boldFont, color: accent });
    y -= 24;
  };

  // ── Summary ──
  if (summary) {
    drawSection("Profil");
    const lines = splitLines(summary, regFont, 10, width - 80);
    for (const line of lines) {
      if (y < 60) break;
      page.drawText(line, { x: 40, y, size: 10, font: regFont, color: dark });
      y -= 14;
    }
    y -= 8;
  }

  // ── Experience ──
  if (experiences.filter(e => e.company || e.position).length > 0) {
    drawSection("Expériences professionnelles");
    for (const exp of experiences) {
      if (!exp.company && !exp.position) continue;
      if (y < 80) break;
      // Position + Company
      page.drawText(exp.position || "", { x: 40, y, size: 11, font: boldFont, color: dark });
      const companyDate = [exp.company, [exp.startDate, exp.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ");
      if (companyDate) {
        page.drawText(companyDate, { x: 40, y: y - 14, size: 9, font: regFont, color: gray });
        y -= 14;
      }
      y -= 14;
      // Description
      if (exp.description) {
        const lines = splitLines(exp.description, regFont, 9.5, width - 90);
        for (const line of lines) {
          if (y < 60) break;
          page.drawText("• " + line, { x: 46, y, size: 9.5, font: regFont, color: dark });
          y -= 13;
        }
      }
      y -= 8;
    }
  }

  // ── Education ──
  if (educations.filter(e => e.school || e.degree).length > 0) {
    drawSection("Formation");
    for (const edu of educations) {
      if (!edu.school && !edu.degree) continue;
      if (y < 60) break;
      page.drawText(edu.degree || "", { x: 40, y, size: 11, font: boldFont, color: dark });
      const schoolDate = [edu.school, [edu.startDate, edu.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ");
      if (schoolDate) {
        page.drawText(schoolDate, { x: 40, y: y - 14, size: 9, font: regFont, color: gray });
        y -= 14;
      }
      y -= 16;
    }
  }

  // ── Skills & Languages side by side ──
  const hasSkills = skills.filter(Boolean).length > 0;
  const hasLangs  = languages.filter(l => l.lang).length > 0;

  if (hasSkills || hasLangs) {
    const colW = (width - 100) / 2;

    if (hasSkills) {
      drawSection("Compétences");
      const chunks = [];
      for (let i = 0; i < skills.length; i += 3) chunks.push(skills.slice(i, i + 3));
      for (const row of chunks) {
        if (y < 60) break;
        let xOff = 40;
        for (const skill of row) {
          if (!skill) continue;
          page.drawRectangle({ x: xOff, y: y - 2, width: regFont.widthOfTextAtSize(skill, 9) + 16, height: 16, color: hexToRgb(accentColor + "22") || lightGray, borderColor: accent, borderWidth: 0.5 });
          page.drawText(skill, { x: xOff + 8, y: y + 2, size: 9, font: regFont, color: accent });
          xOff += regFont.widthOfTextAtSize(skill, 9) + 24;
          if (xOff > width - 80) { xOff = 40; y -= 20; }
        }
        y -= 20;
      }
      y -= 4;
    }

    if (hasLangs) {
      drawSection("Langues");
      for (const l of languages) {
        if (!l.lang) continue;
        if (y < 60) break;
        const label = l.level ? `${l.lang}  —  ${l.level}` : l.lang;
        page.drawText(label, { x: 40, y, size: 10, font: regFont, color: dark });
        y -= 16;
      }
    }
  }

  // ── Footer ──
  page.drawLine({ start: { x: 40, y: 30 }, end: { x: width - 40, y: 30 }, thickness: 0.5, color: lightGray });
  page.drawText("Créé avec DocSwift — getdocswift.com", { x: 40, y: 16, size: 7, font: regFont, color: gray });

  const pdfBytes = await doc.save();
  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="${(name || "cv").replace(/\s+/g, "_")}_CV.pdf"`,
    },
  });
}
