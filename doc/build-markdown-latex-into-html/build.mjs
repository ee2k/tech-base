import fs from "node:fs";
import path from "node:path";
import MarkdownIt from "markdown-it";
import texmath from "markdown-it-texmath";
import katex from "katex";

const sourceDir = "../../math/src/";
const outputDir = "../../math/";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

md.use(texmath, {
  engine: katex,
  delimiters: "dollars",
  katexOptions: {
    throwOnError: false,
    strict: "ignore"
  }
});

function convertDirectory(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, {
    withFileTypes: true
  })) {
    const inputPath = path.join(src, entry.name);

    if (entry.isDirectory()) {
      convertDirectory(
        inputPath,
        path.join(dest, entry.name)
      );
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const outputName = entry.name.replace(/\.md$/, ".html");
      const outputPath = path.join(dest, outputName);

      const content = fs.readFileSync(inputPath, "utf8");

      fs.mkdirSync(path.dirname(outputPath), {
        recursive: true
      });

      // const html = md.render(content);
      // fs.writeFileSync(outputPath, html, "utf8");
const body = md.render(content);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>${path.basename(outputPath, ".html")}</title>

  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css"
  >

  <style>
    body {
      max-width: 900px;
      margin: 40px auto;
      padding: 0 24px;
      font-family: system-ui, sans-serif;
      line-height: 1.7;
      color: #333;
    }

    h1, h2, h3 {
      line-height: 1.3;
      margin-top: 2em;
    }

    pre {
      padding: 16px;
      overflow-x: auto;
      background: #f5f5f5;
      border-radius: 6px;
    }

    code {
      font-family: monospace;
    }

    img {
      max-width: 100%;
    }

    .katex-display {
      overflow-x: auto;
      overflow-y: hidden;
      padding: 8px 0;
    }
  </style>
</head>
<body>
  <main>
    ${body}
  </main>
</body>
</html>`;

fs.writeFileSync(outputPath, html, "utf8");
      console.log(`${inputPath} -> ${outputPath}`);
    }
  }
}

convertDirectory(sourceDir, outputDir);

console.log("Markdown conversion complete!");
