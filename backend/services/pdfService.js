import PDFParser from "pdf2json";

export async function extractQuestionsFromPDF(filePath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (err) => {
      reject(err.parserError);
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      let text = "";

      pdfData.Pages.forEach((page) => {
        page.Texts.forEach((t) => {
          t.R.forEach((r) => {
            text += decodeURIComponent(r.T) + "\n";
          });
        });
      });

      const questions = parseMCQ(text);
      resolve(questions);
    });

    pdfParser.loadPDF(filePath);
  });
}

function parseMCQ(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);

  const questions = [];
  let current = null;

  for (const line of lines) {
    if (/^\d+\./.test(line)) {
      if (current) questions.push(current);

      current = {
        question: line.replace(/^\d+\.\s*/, ""),
        options: [],
        answer: "",
      };
    }

    else if (/^[A-D]\)/.test(line)) {
      current.options.push(line.replace(/^[A-D]\)\s*/, ""));
    }

    else if (/^Answer/i.test(line)) {
      const ans = line.split(":")[1]?.trim();

      const map = {
        A: 0,
        B: 1,
        C: 2,
        D: 3,
      };

      current.answer = current.options[map[ans]];
    }
  }

  if (current) questions.push(current);

  return questions;
}