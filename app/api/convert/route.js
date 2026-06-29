export const maxDuration = 60; // seconds — needed for large PDFs on Vercel/Railway

import { NextResponse }     from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { getUsageToday, incrementUsage, isPro, getPlan, getFreeLimit, isPremium } from "@/lib/supabase";
import { pdfToDocx }        from "@/lib/pdfToDocx";
import { execFileSync }     from "child_process";
import { writeFileSync, readFileSync, unlinkSync, mkdtempSync, rmdirSync } from "fs";
import { join }             from "path";
import { tmpdir }           from "os";

const PREMIUM_TOOLS = new Set(["protect-pdf", "compress-image", "unlock-pdf"]);
const VALID_TYPES   = new Set([
  "pdf-to-word", "word-to-pdf", "compress-pdf", "merge-pdf",
  "split-pdf", "image-to-pdf", "protect-pdf", "unlock-pdf", "compress-image",
]);
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

// ─── POST handler ──────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const formData = await request.formData();
    const type = formData.get("type");

    // ── Type validation (before consuming quota) ───────────────────────────
    if (!type || !VALID_TYPES.has(type)) {
      return NextResponse.json({ error: "Unsupported type" }, { status: 400 });
    }

    // ── File size validation ───────────────────────────────────────────────
    const mainFile = formData.get("file") ?? formData.getAll("files")[0];
    if (mainFile && mainFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 413 });
    }

    // ── Usage gate ─────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    const pro     = session?.user?.email ? await isPro(session.user.email) : false;

    if (!pro) {
      const identifier = session?.user?.email
        ?? (request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for") ?? "anonymous").split(",")[0].trim();
      const [used, freeLimit] = await Promise.all([getUsageToday(identifier), getFreeLimit()]);
      if (used >= freeLimit) {
        return NextResponse.json(
          { error: "LIMIT_REACHED", message: `Daily limit of ${freeLimit} reached. Upgrade to Pro or watch an ad.` },
          { status: 429 }
        );
      }
      await incrementUsage(identifier);
    }

    // ── Premium gate ──────────────────────────────────────────────────────
    if (PREMIUM_TOOLS.has(type)) {
      const hasPremium = session?.user?.email ? await isPremium(session.user.email) : false;
      if (!hasPremium) {
        return NextResponse.json(
          { error: "PREMIUM_REQUIRED", message: "This tool requires a Premium subscription." },
          { status: 403 }
        );
      }
    }

    // ── PDF → Word ─────────────────────────────────────────────────────────
    if (type === "pdf-to-word") {
      const file = formData.get("file");
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      let docxBuffer;
      try {
        docxBuffer = await pdfToDocx(buffer);
      } catch (e) {
        console.error("PDF→DOCX error:", e);
        return NextResponse.json(
          { error: "Could not convert this PDF: " + e.message },
          { status: 422 }
        );
      }

      return NextResponse.json({
        file:     docxBuffer.toString("base64"),
        filename: file.name.replace(/\.pdf$/i, ".docx"),
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
    }

    // ── Word → PDF ─────────────────────────────────────────────────────────
    if (type === "word-to-pdf") {
      const file = formData.get("file");
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const { default: mammoth } = await import("mammoth");
      let extractResult;
      try {
        extractResult = await mammoth.extractRawText({ buffer });
      } catch (e) {
        const msg = e.message || "";
        const userMsg = (msg.includes("central directory") || msg.includes("zip") || msg.includes("End of central directory"))
          ? "Fichier .docx invalide ou corrompu. Vérifiez que le fichier est bien un document Word (.docx)."
          : "Impossible de lire ce fichier Word : " + msg;
        return NextResponse.json({ error: userMsg }, { status: 422 });
      }
      const { value: text } = extractResult;
      const lines = text.split("\n").filter(l => l.trim());

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 11;
      const margin = 50;
      const pageWidth = 595;
      const pageHeight = 842;
      const maxWidth = pageWidth - margin * 2;
      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      for (const line of lines) {
        const words = line.split(" ");
        let currentLine = "";
        for (const word of words) {
          const testLine = currentLine ? currentLine + " " + word : word;
          const w = font.widthOfTextAtSize(testLine, fontSize);
          if (w > maxWidth && currentLine) {
            if (y < margin + fontSize) {
              page = pdfDoc.addPage([pageWidth, pageHeight]);
              y = pageHeight - margin;
            }
            page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
            y -= fontSize * 1.6;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) {
          if (y < margin + fontSize) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }
          page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
          y -= fontSize * 1.6;
        }
        y -= 4;
      }

      const pdfBytes = await pdfDoc.save();
      return NextResponse.json({
        file: Buffer.from(pdfBytes).toString("base64"),
        filename: file.name.replace(/\.docx?$/i, ".pdf"),
        mimeType: "application/pdf",
      });
    }

    // ── Compress PDF ───────────────────────────────────────────────────────
    if (type === "compress-pdf") {
      const file = formData.get("file");
      const bytes = await file.arrayBuffer();
      let pdfDoc;
      try {
        pdfDoc = await PDFDocument.load(bytes);
      } catch (e) {
        return NextResponse.json(
          { error: "Fichier PDF invalide ou corrompu. Vérifiez que le fichier est bien un PDF valide." },
          { status: 422 }
        );
      }
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      return NextResponse.json({
        file: Buffer.from(pdfBytes).toString("base64"),
        filename: "compressed_" + file.name,
        mimeType: "application/pdf",
      });
    }

    // ── Merge PDFs ─────────────────────────────────────────────────────────
    if (type === "merge-pdf") {
      const files = formData.getAll("files");
      const merged = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        let doc;
        try {
          doc = await PDFDocument.load(bytes);
        } catch {
          return NextResponse.json(
            { error: `Le fichier "${file.name}" est invalide ou corrompu.` },
            { status: 422 }
          );
        }
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
      const pdfBytes = await merged.save();
      return NextResponse.json({
        file: Buffer.from(pdfBytes).toString("base64"),
        filename: "merged.pdf",
        mimeType: "application/pdf",
      });
    }

    // ── Split PDF ──────────────────────────────────────────────────────────
    if (type === "split-pdf") {
      const file = formData.get("file");
      const pageNum = parseInt(formData.get("page") || "1") - 1;
      const bytes = await file.arrayBuffer();
      let srcDoc;
      try {
        srcDoc = await PDFDocument.load(bytes);
      } catch {
        return NextResponse.json(
          { error: "Fichier PDF invalide ou corrompu. Vérifiez que le fichier est bien un PDF valide." },
          { status: 422 }
        );
      }
      const total = srcDoc.getPageCount();
      const safePageNum = Math.min(Math.max(0, pageNum), total - 1);
      const newDoc = await PDFDocument.create();
      const [copied] = await newDoc.copyPages(srcDoc, [safePageNum]);
      newDoc.addPage(copied);
      const pdfBytes = await newDoc.save();
      return NextResponse.json({
        file: Buffer.from(pdfBytes).toString("base64"),
        filename: `page_${safePageNum + 1}.pdf`,
        mimeType: "application/pdf",
      });
    }

    // ── Images → PDF ───────────────────────────────────────────────────────
    if (type === "image-to-pdf") {
      const files = formData.getAll("files");
      const pdfDoc = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const mime = file.type;
        let img;
        try {
          if (mime === "image/jpeg" || mime === "image/jpg") {
            img = await pdfDoc.embedJpg(bytes);
          } else if (mime === "image/png") {
            img = await pdfDoc.embedPng(bytes);
          } else continue;
        } catch { continue; }
        const page = pdfDoc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      const pdfBytes = await pdfDoc.save();
      return NextResponse.json({
        file: Buffer.from(pdfBytes).toString("base64"),
        filename: "images.pdf",
        mimeType: "application/pdf",
      });
    }

    // ── Protect PDF (qpdf encryption) ────────────────────────────────────
    if (type === "protect-pdf") {
      const file = formData.get("file");
      const password = formData.get("password");
      if (!password) return NextResponse.json({ error: "Password is required" }, { status: 400 });

      const bytes = Buffer.from(await file.arrayBuffer());
      const dir = mkdtempSync(join(tmpdir(), "ds-"));
      const inPath = join(dir, "in.pdf");
      const outPath = join(dir, "out.pdf");
      try {
        writeFileSync(inPath, bytes);
        execFileSync("qpdf", ["--encrypt", password, password, "256", "--", inPath, outPath]);
        const result = readFileSync(outPath);
        return NextResponse.json({
          file: result.toString("base64"),
          filename: "protected_" + file.name,
          mimeType: "application/pdf",
        });
      } catch (e) {
        return NextResponse.json({ error: "Encryption failed: " + e.message }, { status: 422 });
      } finally {
        try { unlinkSync(inPath); } catch {}
        try { unlinkSync(outPath); } catch {}
        try { rmdirSync(dir); } catch {}
      }
    }

    // ── Unlock PDF (qpdf decryption) ──────────────────────────────────────
    if (type === "unlock-pdf") {
      const file = formData.get("file");
      const password = formData.get("password") || "";

      const bytes = Buffer.from(await file.arrayBuffer());
      const dir = mkdtempSync(join(tmpdir(), "ds-"));
      const inPath = join(dir, "in.pdf");
      const outPath = join(dir, "out.pdf");
      try {
        writeFileSync(inPath, bytes);
        execFileSync("qpdf", ["--password=" + password, "--decrypt", inPath, outPath]);
        const result = readFileSync(outPath);
        return NextResponse.json({
          file: result.toString("base64"),
          filename: "unlocked_" + file.name,
          mimeType: "application/pdf",
        });
      } catch {
        return NextResponse.json({ error: "Decryption failed — wrong password or unsupported encryption." }, { status: 422 });
      } finally {
        try { unlinkSync(inPath); } catch {}
        try { unlinkSync(outPath); } catch {}
        try { rmdirSync(dir); } catch {}
      }
    }

    // ── Compress Image (sharp) ─────────────────────────────────────────────
    if (type === "compress-image") {
      const file = formData.get("file");
      const quality = Math.min(100, Math.max(1, parseInt(formData.get("quality") || "75")));
      const bytes = Buffer.from(await file.arrayBuffer());

      const sharp = (await import("sharp")).default;
      const mime = file.type;
      let result, outMime, ext;

      if (mime === "image/png") {
        result = await sharp(bytes).png({ quality, compressionLevel: 9 }).toBuffer();
        outMime = "image/png"; ext = ".png";
      } else {
        result = await sharp(bytes).jpeg({ quality, mozjpeg: true }).toBuffer();
        outMime = "image/jpeg"; ext = ".jpg";
      }

      return NextResponse.json({
        file: result.toString("base64"),
        filename: "compressed_" + file.name.replace(/\.\w+$/, ext),
        mimeType: outMime,
      });
    }

    return NextResponse.json({ error: "Unsupported type" }, { status: 400 });

  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
