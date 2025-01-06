import fs from "node:fs";
import path from "node:path";

const libsDir = path.resolve(import.meta.dirname, "public/libs");
const versions = fs.readdirSync(libsDir);
const versionsSorted = versions.sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));

const list = [];
for (const version of versionsSorted) {
  const filesContent = fs.readFileSync(path.join(libsDir, version, "index.json"), "utf8");
  const filesJson = JSON.parse(filesContent);
  const files = Object.keys(filesJson).sort((a, b) => {
    const x = a.toLocaleLowerCase();
    const y = b.toLocaleLowerCase();
    return x > y ? 1 : x < y ? -1 : 0;
  });
  const link = [];
  for (const file of files) {
    link.push(`<li><a download="${file}" href="libs/${filesJson[file]}">${file}</a></li>`);
  }
  list.push(`<details><summary>${version}</summary><ul>${link.join("")}</ul></details>`);
}

const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>UniApp SDK</title></head><body>${list.join(
  ""
)}</body></html>`;

const htmlPath = path.resolve(import.meta.dirname, "public/index.html");

fs.writeFileSync(htmlPath, html, "utf8");
