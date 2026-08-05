"use client";

/**
 * Minimal WordprocessingML writer.
 *
 * The `docx` npm package cannot be used here: its published bundle breaks when
 * SWC lowers class fields, producing a chunk that fails to parse in the browser.
 */

export type DocxBlock = {
  text: string;
  /** 0 = body text, 1 = title, 2 = section heading. */
  level?: 0 | 1 | 2;
};

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;

const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;

const SECTION = `<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>`;

function escapeXml(value: string) {
  // Control characters other than tab/newline are illegal in XML 1.0.
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function paragraph({ text, level = 0 }: DocxBlock) {
  const halfPoints = level === 1 ? 40 : level === 2 ? 28 : 22;
  const before = level === 2 ? 240 : level === 1 ? 0 : 0;
  const after = level === 0 ? 80 : 120;
  const runProps = `<w:rPr>${level > 0 ? "<w:b/>" : ""}<w:sz w:val="${halfPoints}"/><w:szCs w:val="${halfPoints}"/></w:rPr>`;
  const outline = level > 0 ? `<w:outlineLvl w:val="${level - 1}"/>` : "";

  return (
    `<w:p><w:pPr><w:spacing w:before="${before}" w:after="${after}"/>${outline}</w:pPr>` +
    `<w:r>${runProps}<w:t xml:space="preserve">${escapeXml(text || " ")}</w:t></w:r></w:p>`
  );
}

export async function buildDocx(blocks: DocxBlock[]): Promise<Uint8Array> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  const document =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>` +
    blocks.map(paragraph).join("") +
    SECTION +
    `</w:body></w:document>`;

  zip.file("[Content_Types].xml", CONTENT_TYPES);
  zip.file("_rels/.rels", ROOT_RELS);
  zip.file("word/document.xml", document);

  return zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}
