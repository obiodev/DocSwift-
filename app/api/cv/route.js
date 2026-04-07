import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { getUsageToday, incrementUsage, isPro, getFreeLimit } from "@/lib/supabase";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

function getIdentifier(request, session) {
  if (session?.user?.email) return session.user.email;
  const forwarded = request.headers.get("x-forwarded-for");
  return (forwarded ? forwarded.split(",")[0] : "anonymous").trim();
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const clean = hex.replace("#","");
  const r = parseInt(clean.slice(0,2),16)/255;
  const g = parseInt(clean.slice(2,4),16)/255;
  const b = parseInt(clean.slice(4,6),16)/255;
  return rgb(r,g,b);
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

function drawSectionHeader(page, label, x, y, width, font, accent, lightGray) {
  page.drawRectangle({ x, y: y-2, width, height: 22, color: lightGray });
  page.drawRectangle({ x, y: y-2, width: 4, height: 22, color: accent });
  page.drawText(label.toUpperCase(), { x: x+10, y: y+4, size: 10, font, color: accent });
}

async function embedPhoto(doc, photo) {
  if (!photo || !photo.startsWith("data:image")) return null;
  try {
    const base64 = photo.split(",")[1];
    const bytes  = Buffer.from(base64, "base64");
    if (photo.includes("data:image/png")) return await doc.embedPng(bytes);
    return await doc.embedJpg(bytes);
  } catch { return null; }
}

// ─── Template: Classique ───────────────────────────────────────────────────
async function buildClassique(doc, data) {
  const {
    name="", title="", email="", phone="", address="", website="",
    summary="", experiences=[], educations=[], skills=[], languages=[],
    projects=[], certifications=[], interests="", accentColor="#2563EB", photoImage,
  } = data;

  const page = doc.addPage([595, 842]);
  const { width, height } = page.getSize();

  const boldFont  = await doc.embedFont(StandardFonts.HelveticaBold);
  const regFont   = await doc.embedFont(StandardFonts.Helvetica);
  const accent    = hexToRgb(accentColor);
  const dark      = rgb(0.1, 0.1, 0.1);
  const gray      = rgb(0.45, 0.45, 0.45);
  const lightGray = rgb(0.93, 0.93, 0.93);
  const white     = rgb(1, 1, 1);

  let y = height;

  // ── Header background ──
  const headerH = 140;
  page.drawRectangle({ x:0, y:height-headerH, width, height:headerH, color:accent });

  // ── Photo in header (top-right) ──
  if (photoImage) {
    const imgDim = photoImage.scale(1);
    const maxSide = 70;
    const scale   = Math.min(maxSide/imgDim.width, maxSide/imgDim.height);
    const pw = imgDim.width  * scale;
    const ph = imgDim.height * scale;
    page.drawImage(photoImage, {
      x: width - 40 - pw,
      y: height - 20 - ph,
      width: pw,
      height: ph,
    });
  }

  // ── Name ──
  const nameSize = Math.min(28, 560/Math.max(name.length,1)*1.8);
  page.drawText(name || "Votre Nom", {
    x:40, y:height-52,
    size:Math.min(nameSize,28), font:boldFont, color:white,
  });

  // ── Title ──
  if (title) {
    page.drawText(title, { x:40, y:height-78, size:13, font:regFont, color:rgb(0.85,0.9,1) });
  }

  // ── Contact info ──
  const contacts = [email, phone, address, website].filter(Boolean);
  if (contacts.length) {
    page.drawText(contacts.join("  ·  "), { x:40, y:height-106, size:9, font:regFont, color:rgb(0.85,0.9,1), maxWidth:width-120 });
  }

  y = height - headerH - 20;

  const drawSection = (label) => {
    y -= 8;
    drawSectionHeader(page, label, 40, y, width-80, boldFont, accent, lightGray);
    y -= 24;
  };

  // ── Summary ──
  if (summary) {
    drawSection("Profil");
    for (const line of splitLines(summary, regFont, 10, width-80)) {
      if (y < 60) break;
      page.drawText(line, { x:40, y, size:10, font:regFont, color:dark });
      y -= 14;
    }
    y -= 8;
  }

  // ── Experience ──
  if (experiences.filter(e=>e.company||e.position).length>0) {
    drawSection("Expériences professionnelles");
    for (const exp of experiences) {
      if (!exp.company && !exp.position) continue;
      if (y < 80) break;
      page.drawText(exp.position||"", { x:40, y, size:11, font:boldFont, color:dark });
      const cd = [exp.company,[exp.startDate,exp.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ");
      if (cd) { page.drawText(cd, { x:40, y:y-14, size:9, font:regFont, color:gray }); y-=14; }
      y -= 14;
      if (exp.description) {
        for (const line of splitLines(exp.description, regFont, 9.5, width-90)) {
          if (y < 60) break;
          page.drawText("• "+line, { x:46, y, size:9.5, font:regFont, color:dark });
          y -= 13;
        }
      }
      y -= 8;
    }
  }

  // ── Education ──
  if (educations.filter(e=>e.school||e.degree).length>0) {
    drawSection("Formation");
    for (const edu of educations) {
      if (!edu.school && !edu.degree) continue;
      if (y < 60) break;
      page.drawText(edu.degree||"", { x:40, y, size:11, font:boldFont, color:dark });
      const sd = [edu.school,[edu.startDate,edu.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ");
      if (sd) { page.drawText(sd, { x:40, y:y-14, size:9, font:regFont, color:gray }); y-=14; }
      y -= 16;
    }
  }

  // ── Skills ──
  const validSkills = skills.filter(Boolean);
  if (validSkills.length>0) {
    drawSection("Compétences");
    let xOff = 40;
    for (const skill of validSkills) {
      if (y < 60) break;
      const sw = regFont.widthOfTextAtSize(skill,9)+16;
      if (xOff+sw > width-40) { xOff=40; y-=20; }
      page.drawRectangle({ x:xOff, y:y-2, width:sw, height:16, color:lightGray, borderColor:accent, borderWidth:0.5 });
      page.drawText(skill, { x:xOff+8, y:y+2, size:9, font:regFont, color:accent });
      xOff += sw+8;
    }
    y -= 24;
  }

  // ── Languages ──
  const validLangs = languages.filter(l=>l.lang);
  if (validLangs.length>0) {
    drawSection("Langues");
    for (const l of validLangs) {
      if (y < 60) break;
      const label = l.level ? `${l.lang}  —  ${l.level}` : l.lang;
      page.drawText(label, { x:40, y, size:10, font:regFont, color:dark });
      y -= 16;
    }
    y -= 4;
  }

  // ── Projects ──
  const validProjs = projects.filter(p=>p.name);
  if (validProjs.length>0) {
    drawSection("Projets");
    for (const p of validProjs) {
      if (y < 60) break;
      page.drawText(p.name, { x:40, y, size:11, font:boldFont, color:dark });
      y -= 14;
      if (p.tech) {
        page.drawText(p.tech, { x:40, y, size:9, font:regFont, color:gray });
        y -= 13;
      }
      if (p.description) {
        for (const line of splitLines(p.description, regFont, 9.5, width-90)) {
          if (y < 60) break;
          page.drawText("• "+line, { x:46, y, size:9.5, font:regFont, color:dark });
          y -= 13;
        }
      }
      if (p.url) {
        page.drawText(p.url, { x:40, y, size:8.5, font:regFont, color:accent });
        y -= 13;
      }
      y -= 6;
    }
  }

  // ── Certifications ──
  const validCerts = certifications.filter(c=>c.title);
  if (validCerts.length>0) {
    drawSection("Certifications");
    for (const c of validCerts) {
      if (y < 60) break;
      const label = [c.title, c.org ? `— ${c.org}` : "", c.year ? `(${c.year})` : ""].filter(Boolean).join("  ");
      page.drawText(label, { x:40, y, size:10, font:regFont, color:dark });
      y -= 16;
    }
    y -= 4;
  }

  // ── Interests ──
  if (interests && interests.trim()) {
    drawSection("Centres d'intérêt");
    const tags = interests.split(",").map(s=>s.trim()).filter(Boolean);
    let xOff = 40;
    for (const tag of tags) {
      if (y < 60) break;
      const tw = regFont.widthOfTextAtSize(tag,9)+16;
      if (xOff+tw > width-40) { xOff=40; y-=20; }
      page.drawRectangle({ x:xOff, y:y-2, width:tw, height:16, color:lightGray });
      page.drawText(tag, { x:xOff+8, y:y+2, size:9, font:regFont, color:dark });
      xOff += tw+8;
    }
    y -= 24;
  }

  // ── Footer ──
  page.drawLine({ start:{x:40,y:30}, end:{x:width-40,y:30}, thickness:0.5, color:lightGray });
  page.drawText("Créé avec DocSwift — getdocswift.com", { x:40, y:16, size:7, font:regFont, color:gray });
}

// ─── Template: Moderne ─────────────────────────────────────────────────────
async function buildModerne(doc, data) {
  const {
    name="", title="", email="", phone="", address="", website="",
    summary="", experiences=[], educations=[], skills=[], languages=[],
    projects=[], certifications=[], interests="", accentColor="#2563EB", photoImage,
  } = data;

  const page = doc.addPage([595, 842]);
  const { width, height } = page.getSize();

  const boldFont  = await doc.embedFont(StandardFonts.HelveticaBold);
  const regFont   = await doc.embedFont(StandardFonts.Helvetica);
  const accent    = hexToRgb(accentColor);
  const dark      = rgb(0.1, 0.1, 0.1);
  const gray      = rgb(0.5, 0.5, 0.5);
  const lightGray = rgb(0.93, 0.93, 0.93);
  const white     = rgb(1, 1, 1);

  const sidebarW = 175;
  const contentX = 190;
  const contentW = width - contentX - 30;

  // ── Sidebar background ──
  page.drawRectangle({ x:0, y:0, width:sidebarW, height, color:accent });

  // ── Sidebar: Photo ──
  let sideY = height - 30;
  if (photoImage) {
    const side = 80;
    const imgDim = photoImage.scale(1);
    const scale  = Math.min(side/imgDim.width, side/imgDim.height);
    const pw = imgDim.width*scale;
    const ph = imgDim.height*scale;
    const px = (sidebarW - pw)/2;
    page.drawImage(photoImage, { x:px, y:sideY-ph, width:pw, height:ph });
    sideY -= ph+10;
  }

  // ── Sidebar: Name & Title ──
  const nameLines = splitLines(name||"Votre Nom", boldFont, 13, sidebarW-20);
  for (const line of nameLines) {
    page.drawText(line, { x:10, y:sideY, size:13, font:boldFont, color:white, maxWidth:sidebarW-20 });
    sideY -= 16;
  }
  if (title) {
    const titleLines = splitLines(title, regFont, 9, sidebarW-20);
    for (const line of titleLines) {
      page.drawText(line, { x:10, y:sideY, size:9, font:regFont, color:rgb(0.9,0.93,1), maxWidth:sidebarW-20 });
      sideY -= 12;
    }
  }

  // ── Sidebar: Separator ──
  sideY -= 6;
  page.drawLine({ start:{x:10,y:sideY}, end:{x:sidebarW-10,y:sideY}, thickness:0.5, color:rgb(1,1,1,0.3) });
  sideY -= 12;

  // ── Sidebar: Contact ──
  const contacts = [email, phone, address, website].filter(Boolean);
  for (const c of contacts) {
    const lines = splitLines("· "+c, regFont, 7.5, sidebarW-20);
    for (const line of lines) {
      if (sideY < 20) break;
      page.drawText(line, { x:10, y:sideY, size:7.5, font:regFont, color:rgb(0.88,0.92,1) });
      sideY -= 11;
    }
  }
  sideY -= 10;

  // ── Sidebar: Skills ──
  const validSkills = skills.filter(Boolean);
  if (validSkills.length>0) {
    page.drawText("COMPÉTENCES", { x:10, y:sideY, size:7.5, font:boldFont, color:rgb(1,1,1,0.65), maxWidth:sidebarW-20 });
    sideY -= 14;
    let xOff = 10;
    for (const skill of validSkills) {
      if (sideY < 80) break;
      const sw = regFont.widthOfTextAtSize(skill,8)+12;
      if (xOff+sw > sidebarW-10) { xOff=10; sideY-=16; }
      page.drawRectangle({ x:xOff, y:sideY-2, width:sw, height:14, color:rgb(1,1,1,0.18) });
      page.drawText(skill, { x:xOff+6, y:sideY+1, size:8, font:regFont, color:white });
      xOff += sw+4;
    }
    sideY -= 20;
  }

  // ── Sidebar: Languages ──
  const validLangs = languages.filter(l=>l.lang);
  if (validLangs.length>0) {
    page.drawText("LANGUES", { x:10, y:sideY, size:7.5, font:boldFont, color:rgb(1,1,1,0.65) });
    sideY -= 14;
    for (const l of validLangs) {
      if (sideY < 20) break;
      const label = l.level ? `${l.lang} — ${l.level}` : l.lang;
      const lines = splitLines(label, regFont, 8.5, sidebarW-20);
      for (const line of lines) {
        page.drawText(line, { x:10, y:sideY, size:8.5, font:regFont, color:white });
        sideY -= 12;
      }
    }
  }

  // ── Right content ──
  let y = height - 30;

  const drawRightSection = (label) => {
    y -= 8;
    page.drawRectangle({ x:contentX, y:y-2, width:4, height:18, color:accent });
    page.drawText(label.toUpperCase(), { x:contentX+10, y:y+2, size:9, font:boldFont, color:accent });
    y -= 22;
  };

  // ── Right: Summary ──
  if (summary) {
    drawRightSection("Profil");
    for (const line of splitLines(summary, regFont, 10, contentW)) {
      if (y < 60) break;
      page.drawText(line, { x:contentX, y, size:10, font:regFont, color:dark });
      y -= 14;
    }
    y -= 8;
  }

  // ── Right: Experience ──
  if (experiences.filter(e=>e.company||e.position).length>0) {
    drawRightSection("Expériences");
    for (const exp of experiences) {
      if (!exp.company && !exp.position) continue;
      if (y < 80) break;
      page.drawText(exp.position||"", { x:contentX, y, size:11, font:boldFont, color:dark });
      const cd = [exp.company,[exp.startDate,exp.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ");
      if (cd) { page.drawText(cd, { x:contentX, y:y-14, size:9, font:regFont, color:gray }); y-=14; }
      y -= 14;
      if (exp.description) {
        for (const line of splitLines(exp.description, regFont, 9.5, contentW-10)) {
          if (y < 60) break;
          page.drawText("• "+line, { x:contentX+6, y, size:9.5, font:regFont, color:dark });
          y -= 13;
        }
      }
      y -= 8;
    }
  }

  // ── Right: Education ──
  if (educations.filter(e=>e.school||e.degree).length>0) {
    drawRightSection("Formation");
    for (const edu of educations) {
      if (!edu.school && !edu.degree) continue;
      if (y < 60) break;
      page.drawText(edu.degree||"", { x:contentX, y, size:11, font:boldFont, color:dark });
      const sd = [edu.school,[edu.startDate,edu.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ");
      if (sd) { page.drawText(sd, { x:contentX, y:y-14, size:9, font:regFont, color:gray }); y-=14; }
      y -= 16;
    }
  }

  // ── Right: Projects ──
  const validProjs = projects.filter(p=>p.name);
  if (validProjs.length>0) {
    drawRightSection("Projets");
    for (const p of validProjs) {
      if (y < 60) break;
      page.drawText(p.name, { x:contentX, y, size:11, font:boldFont, color:dark });
      y -= 14;
      if (p.tech) { page.drawText(p.tech, { x:contentX, y, size:9, font:regFont, color:gray }); y-=12; }
      if (p.description) {
        for (const line of splitLines(p.description, regFont, 9.5, contentW-10)) {
          if (y < 60) break;
          page.drawText("• "+line, { x:contentX+6, y, size:9.5, font:regFont, color:dark });
          y -= 13;
        }
      }
      y -= 6;
    }
  }

  // ── Right: Certifications ──
  const validCerts = certifications.filter(c=>c.title);
  if (validCerts.length>0) {
    drawRightSection("Certifications");
    for (const c of validCerts) {
      if (y < 60) break;
      const parts = [c.title]; if(c.org) parts.push(`— ${c.org}`); if(c.year) parts.push(`(${c.year})`);
      page.drawText(parts.join("  "), { x:contentX, y, size:10, font:regFont, color:dark });
      y -= 16;
    }
  }

  // ── Footer ──
  page.drawLine({ start:{x:contentX,y:30}, end:{x:width-30,y:30}, thickness:0.5, color:lightGray });
  page.drawText("Créé avec DocSwift — getdocswift.com", { x:contentX, y:16, size:7, font:regFont, color:gray });
}

// ─── Template: Minimaliste ─────────────────────────────────────────────────
async function buildMinimaliste(doc, data) {
  const {
    name="", title="", email="", phone="", address="", website="",
    summary="", experiences=[], educations=[], skills=[], languages=[],
    projects=[], certifications=[], interests="", accentColor="#2563EB", photoImage,
  } = data;

  const page = doc.addPage([595, 842]);
  const { width, height } = page.getSize();

  const boldFont  = await doc.embedFont(StandardFonts.HelveticaBold);
  const regFont   = await doc.embedFont(StandardFonts.Helvetica);
  const accent    = hexToRgb(accentColor);
  const dark      = rgb(0.08, 0.08, 0.08);
  const gray      = rgb(0.5, 0.5, 0.5);
  const lightGray = rgb(0.88, 0.88, 0.88);
  const white     = rgb(1, 1, 1);

  // ── Photo top-right ──
  if (photoImage) {
    const side = 65;
    const imgDim = photoImage.scale(1);
    const scale  = Math.min(side/imgDim.width, side/imgDim.height);
    const pw = imgDim.width*scale;
    const ph = imgDim.height*scale;
    page.drawImage(photoImage, { x:width-40-pw, y:height-20-ph, width:pw, height:ph });
  }

  // ── Name & Title ──
  const nameSize = Math.min(32, 520/Math.max(name.length,1)*2.0);
  page.drawText(name||"Votre Nom", { x:40, y:height-55, size:Math.min(nameSize,32), font:boldFont, color:dark, maxWidth:photoImage?width-160:width-80 });
  if (title) {
    page.drawText(title, { x:40, y:height-75, size:12, font:regFont, color:gray });
  }

  // ── Colored separator line ──
  page.drawRectangle({ x:40, y:height-90, width:width-80, height:2.5, color:accent });

  // ── Contact in one line ──
  const contacts = [email, phone, address, website].filter(Boolean);
  if (contacts.length) {
    page.drawText(contacts.join("  ·  "), { x:40, y:height-106, size:8.5, font:regFont, color:gray, maxWidth:width-80 });
  }

  let y = height - 125;

  const drawSection = (label) => {
    y -= 10;
    page.drawLine({ start:{x:40,y:y+12}, end:{x:width-40,y:y+12}, thickness:0.5, color:lightGray });
    page.drawText(label.toUpperCase(), { x:40, y, size:9.5, font:boldFont, color:accent });
    y -= 18;
  };

  // ── Summary ──
  if (summary) {
    drawSection("Profil");
    for (const line of splitLines(summary, regFont, 10, width-80)) {
      if (y < 60) break;
      page.drawText(line, { x:40, y, size:10, font:regFont, color:dark });
      y -= 14;
    }
    y -= 6;
  }

  // ── Experience ──
  if (experiences.filter(e=>e.company||e.position).length>0) {
    drawSection("Expériences");
    for (const exp of experiences) {
      if (!exp.company && !exp.position) continue;
      if (y < 80) break;
      page.drawText(exp.position||"", { x:40, y, size:11, font:boldFont, color:dark });
      const cd = [exp.company,[exp.startDate,exp.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ");
      if (cd) { page.drawText(cd, { x:40, y:y-14, size:9, font:regFont, color:gray }); y-=14; }
      y -= 14;
      if (exp.description) {
        for (const line of splitLines(exp.description, regFont, 9.5, width-90)) {
          if (y < 60) break;
          page.drawText("• "+line, { x:46, y, size:9.5, font:regFont, color:dark });
          y -= 13;
        }
      }
      y -= 8;
    }
  }

  // ── Education ──
  if (educations.filter(e=>e.school||e.degree).length>0) {
    drawSection("Formation");
    for (const edu of educations) {
      if (!edu.school && !edu.degree) continue;
      if (y < 60) break;
      page.drawText(edu.degree||"", { x:40, y, size:11, font:boldFont, color:dark });
      const sd = [edu.school,[edu.startDate,edu.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ");
      if (sd) { page.drawText(sd, { x:40, y:y-14, size:9, font:regFont, color:gray }); y-=14; }
      y -= 16;
    }
  }

  // ── Skills ──
  const validSkills = skills.filter(Boolean);
  if (validSkills.length>0) {
    drawSection("Compétences");
    let xOff = 40;
    for (const skill of validSkills) {
      if (y < 60) break;
      const sw = regFont.widthOfTextAtSize(skill,9)+16;
      if (xOff+sw > width-40) { xOff=40; y-=20; }
      page.drawRectangle({ x:xOff, y:y-2, width:sw, height:16, color:white, borderColor:accent, borderWidth:0.8 });
      page.drawText(skill, { x:xOff+8, y:y+2, size:9, font:regFont, color:accent });
      xOff += sw+8;
    }
    y -= 24;
  }

  // ── Languages ──
  const validLangs = languages.filter(l=>l.lang);
  if (validLangs.length>0) {
    drawSection("Langues");
    for (const l of validLangs) {
      if (y < 60) break;
      const label = l.level ? `${l.lang}  —  ${l.level}` : l.lang;
      page.drawText(label, { x:40, y, size:10, font:regFont, color:dark });
      y -= 16;
    }
    y -= 4;
  }

  // ── Projects ──
  const validProjs = projects.filter(p=>p.name);
  if (validProjs.length>0) {
    drawSection("Projets");
    for (const p of validProjs) {
      if (y < 60) break;
      page.drawText(p.name, { x:40, y, size:11, font:boldFont, color:dark });
      y -= 14;
      if (p.tech) { page.drawText(p.tech, { x:40, y, size:9, font:regFont, color:gray }); y-=12; }
      if (p.description) {
        for (const line of splitLines(p.description, regFont, 9.5, width-90)) {
          if (y < 60) break;
          page.drawText("• "+line, { x:46, y, size:9.5, font:regFont, color:dark });
          y -= 13;
        }
      }
      y -= 6;
    }
  }

  // ── Certifications ──
  const validCerts = certifications.filter(c=>c.title);
  if (validCerts.length>0) {
    drawSection("Certifications");
    for (const c of validCerts) {
      if (y < 60) break;
      const parts = [c.title]; if(c.org) parts.push(`— ${c.org}`); if(c.year) parts.push(`(${c.year})`);
      page.drawText(parts.join("  "), { x:40, y, size:10, font:regFont, color:dark });
      y -= 16;
    }
    y -= 4;
  }

  // ── Interests ──
  if (interests && interests.trim()) {
    drawSection("Centres d'intérêt");
    const tags = interests.split(",").map(s=>s.trim()).filter(Boolean);
    let xOff = 40;
    for (const tag of tags) {
      if (y < 60) break;
      const tw = regFont.widthOfTextAtSize(tag,9)+16;
      if (xOff+tw > width-40) { xOff=40; y-=20; }
      page.drawRectangle({ x:xOff, y:y-2, width:tw, height:16, color:rgb(0.96,0.96,0.96) });
      page.drawText(tag, { x:xOff+8, y:y+2, size:9, font:regFont, color:dark });
      xOff += tw+8;
    }
    y -= 24;
  }

  // ── Footer ──
  page.drawLine({ start:{x:40,y:30}, end:{x:width-40,y:30}, thickness:0.5, color:lightGray });
  page.drawText("Créé avec DocSwift — getdocswift.com", { x:40, y:16, size:7, font:regFont, color:gray });
}

// ─── POST Handler ───────────────────────────────────────────────────────────
export async function POST(request) {
  const session    = await getServerSession(authOptions);
  const pro        = session?.user?.email ? await isPro(session.user.email) : false;
  const identifier = getIdentifier(request, session);

  if (!pro) {
    const [used, freeLimit] = await Promise.all([getUsageToday(identifier), getFreeLimit()]);
    if (used >= freeLimit) {
      return NextResponse.json({ error:"LIMIT_REACHED" }, { status:429 });
    }
  }

  const body = await request.json();
  const {
    name="", title="", email="", phone="", address="", website="",
    summary="",
    experiences=[],
    educations=[],
    skills=[],
    languages=[],
    projects=[],
    certifications=[],
    interests="",
    accentColor="#2563EB",
    template="classique",
    photo=null,
  } = body;

  const doc = await PDFDocument.create();

  // Embed photo if provided
  const photoImage = await embedPhoto(doc, photo);

  const tplData = {
    name, title, email, phone, address, website, summary,
    experiences, educations, skills, languages,
    projects, certifications, interests, accentColor, photoImage,
  };

  if (template === "moderne") {
    await buildModerne(doc, tplData);
  } else if (template === "minimaliste") {
    await buildMinimaliste(doc, tplData);
  } else {
    await buildClassique(doc, tplData);
  }

  // Consume usage for free users
  if (!pro) await incrementUsage(identifier);

  const pdfBytes = await doc.save();
  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="${(name||"cv").replace(/\s+/g,"_")}_CV.pdf"`,
    },
  });
}
