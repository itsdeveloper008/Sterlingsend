/**
 * Generate fixture files for PDF tool smoke tests.
 * Run: npx tsx scripts/tool-fixtures.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { PDFDocument, StandardFonts, rgb } from "@cantoo/pdf-lib";
import JSZip from "jszip";

const outDir = join(process.cwd(), ".tmp-tool-test", "fixtures");
mkdirSync(outDir, { recursive: true });

async function makePdf(
  name: string,
  pages: { title: string; body: string }[],
) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  for (const page of pages) {
    const p = doc.addPage([595, 842]);
    p.drawText(page.title, {
      x: 50,
      y: 780,
      size: 22,
      font: bold,
      color: rgb(0.1, 0.1, 0.1),
    });
    const lines = page.body.split("\n");
    let y = 740;
    for (const line of lines) {
      p.drawText(line, {
        x: 50,
        y,
        size: 12,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= 18;
    }
  }

  const bytes = await doc.save();
  writeFileSync(join(outDir, name), bytes);
  return bytes;
}

async function makeProtectedPdf() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([595, 842]);
  page.drawText("Secret document", {
    x: 50,
    y: 750,
    size: 20,
    font,
  });
  page.drawText("Password is: test123", {
    x: 50,
    y: 720,
    size: 12,
    font,
  });

  // @cantoo/pdf-lib supports encrypt
  await (doc as unknown as { encrypt: (opts: Record<string, unknown>) => Promise<void> }).encrypt({
    userPassword: "test123",
    ownerPassword: "owner123",
  });

  const bytes = await doc.save();
  writeFileSync(join(outDir, "protected.pdf"), bytes);
}

async function makeJpg() {
  // Minimal valid 1x1 JPEG
  const jpeg = Buffer.from(
    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGfAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z",
    "base64",
  );
  // Better: make a proper small PNG and also a larger JPEG via canvas in browser.
  // For jpg-to-pdf, pdf-lib needs real image. Create a tiny valid JPEG properly.
  writeFileSync(join(outDir, "sample.jpg"), jpeg);
}

async function makePng() {
  // 2x2 red PNG
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mP8z8BQz0AEYBxVSF+FAP5FDvcfRYWgAAAAAElFTkSuQmCC",
    "base64",
  );
  writeFileSync(join(outDir, "sample.png"), png);
}

async function makeDocx() {
  const zip = new JSZip();
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Hello from Word fixture for SterlingSend tests.</w:t></w:r></w:p><w:sectPr><w:pgSz w:w="11906" w:h="16838"/></w:sectPr></w:body></w:document>`;
  zip.file("[Content_Types].xml", contentTypes);
  zip.file("_rels/.rels", rels);
  zip.file("word/document.xml", document);
  const bytes = await zip.generateAsync({ type: "nodebuffer" });
  writeFileSync(join(outDir, "sample.docx"), bytes);
}

async function makeHtml() {
  writeFileSync(
    join(outDir, "sample.html"),
    `<!DOCTYPE html><html><body><h1>HTML Fixture</h1><p>SterlingSend HTML to PDF test.</p></body></html>`,
  );
}

async function main() {
  await makePdf("sample-a.pdf", [
    {
      title: "Sample Document A",
      body: "Page 1 of A\nLine two with numbers 12345\nTable-ish  Name    Value\nAlice     10\nBob       20",
    },
    {
      title: "Sample Document A - Page 2",
      body: "Second page content\nMore text for extraction tests.",
    },
    {
      title: "Sample Document A - Page 3",
      body: "Third page\nFinal paragraph.",
    },
  ]);

  await makePdf("sample-b.pdf", [
    {
      title: "Sample Document B",
      body: "Alternate document for merge and compare.\nChanged line here.",
    },
  ]);

  await makeProtectedPdf();
  await makeJpg();
  await makePng();
  await makeDocx();
  await makeHtml();

  // Tiny signature PNG data URL saved as file for reference
  writeFileSync(
    join(outDir, "signature.png"),
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADvcGqiPAAAAAElFTkSuQmCC",
      "base64",
    ),
  );

  console.log("Fixtures written to", outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
