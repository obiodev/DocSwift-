import { NextResponse }     from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { getUsageToday, incrementUsage, isPro, getFreeLimit } from "@/lib/supabase";
import { pdfToDocx }        from "@/lib/pdfToDocx";


// ─── POST handler ──────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    // ── Usage gate ─────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    const pro     = session?.user?.email ? await isPro(session.user.email) : false;

    if (!pro) {
      const identifier = session?.user?.email
        ?? (request.headers.get("x-forwarded-for") ?? "anonymous").split(",")[0].trim();
      const [used, freeLimit] = await Promise.all([getUsageToday(identifier), getFreeLimit()]);
      if (used >= freeLimit) {
        return NextResponse.json(
          { error: "LIMIT_REACHED", message: `Daily limit of ${freeLimit} reached. Upgrade to Pro or watch an ad.` },
          { status: 429 }
        );
      }
      // Increment BEFORE conversion so concurrent requests can't race
      await incrementUsage(identifier);
    }

    const formData = await request.formData();
    const type = formData.get("type");

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
      const { value: text } = await mammoth.extractRawText({ buffer });
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
      const pdfDoc = await PDFDocument.load(bytes);
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
        const doc = await PDFDocument.load(bytes);
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
      const srcDoc = await PDFDocument.load(bytes);
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

    return NextResponse.json({ error: "Unsupported type" }, { status: 400 });

  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
