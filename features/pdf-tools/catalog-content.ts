export type PrivacyTag =
  | "Runs in your browser"
  | "Sends text to a translation service"
  | "Downloads language data on first use";

export type ToolFaq = { question: string; answer: string };

export type ToolContent = {
  privacyTag: PrivacyTag;
  seoTitle: string;
  seoDescription: string;
  steps: [string, string, string];
  faq: ToolFaq[];
};

type Accept = "pdf" | "image" | "pdf-or-image" | "word" | "html";

function acceptLabel(accept: Accept) {
  if (accept === "image") return "JPG or PNG images";
  if (accept === "word") return "DOCX files";
  if (accept === "html") return "HTML files or pasted markup";
  if (accept === "pdf-or-image") return "PDF, JPG, or PNG files";
  return "PDF files";
}

function fileLimitSentence(minFiles: number, maxFiles: number) {
  if (maxFiles <= 0) {
    return minFiles <= 1
      ? "You can add as many files as you need."
      : `Add at least ${minFiles} files.`;
  }
  if (minFiles === maxFiles) {
    return `Uses ${minFiles} file${minFiles === 1 ? "" : "s"}.`;
  }
  if (minFiles === 0) {
    return `Uses up to ${maxFiles} file${maxFiles === 1 ? "" : "s"}.`;
  }
  return `Accepts ${minFiles} to ${maxFiles} files.`;
}

/** Search snippets show roughly 140-160 characters. */
const META_MIN = 140;
const META_MAX = 160;

/**
 * Join sentences, adding extras until the text reaches META_MIN without
 * passing META_MAX; if still too long, cut at a word boundary.
 */
function fitMetaDescription(parts: string[], extras: string[]) {
  let text = parts.filter(Boolean).join(" ");
  for (const extra of extras) {
    if (text.length >= META_MIN) break;
    const next = `${text} ${extra}`;
    if (next.length <= META_MAX) text = next;
  }
  if (text.length <= META_MAX) return text;
  const cut = text.slice(0, META_MAX - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export function buildToolContent(input: {
  slug: string;
  title: string;
  description: string;
  accept: Accept;
  minFiles: number;
  maxFiles: number;
}): ToolContent {
  const accept = acceptLabel(input.accept);
  const limits = fileLimitSentence(input.minFiles, input.maxFiles);
  let privacyTag: PrivacyTag = "Runs in your browser";
  if (input.slug === "translate-pdf") {
    privacyTag = "Sends text to a translation service";
  } else if (input.slug === "ocr-pdf") {
    privacyTag = "Downloads language data on first use";
  }

  const seoTitle =
    input.title.length <= 50 ? input.title : input.title.slice(0, 50);
  const seoDescription = (() => {
    const privacyNote =
      privacyTag === "Sends text to a translation service"
        ? "Extracted text is sent to a translation service."
        : privacyTag === "Downloads language data on first use"
          ? "Runs in your browser; language data may download on first use."
          : "Runs in your browser.";
    return fitMetaDescription(
      [input.description, limits, privacyNote],
      [
        "Free, no sign-up needed.",
        "Download the result when finished.",
        "Works on any device.",
      ],
    );
  })();

  const steps: [string, string, string] = [
    `Choose your ${accept}. ${limits}`,
    "Set any options the tool shows, then start processing.",
    "Download the finished file from this page.",
  ];

  const faq: ToolFaq[] = [
    {
      question: "What files can I use?",
      answer: `This tool accepts ${accept}. ${limits}`,
    },
    {
      question: "Where is my file processed?",
      answer:
        privacyTag === "Sends text to a translation service"
          ? "Text extracted from your PDF is sent to a translation service. The file itself is not stored on SterlingSend servers."
          : privacyTag === "Downloads language data on first use"
            ? "OCR runs in your browser. Language data may download on first use for the language you pick."
            : "Processing runs in your browser. SterlingSend does not upload the file for this tool.",
    },
  ];

  if (input.slug === "translate-pdf") {
    faq.push({
      question: "Will you keep my document?",
      answer:
        "No. Extracted text is sent for translation. Confirm on the tool page before processing starts.",
    });
  }

  if (input.maxFiles > 1) {
    faq.push({
      question: "Can I use more than one file?",
      answer: limits,
    });
  }

  return {
    privacyTag,
    seoTitle,
    seoDescription,
    steps,
    faq: faq.slice(0, 4),
  };
}
