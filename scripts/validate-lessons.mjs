import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import process from 'node:process';

const LESSONS_DIR = join('site', 'data', 'js');
const MAX_CODE_LEN = 78;

const EMOJI_PATTERN = /[🔴🟢✅❌⚠️🟡🟠🟣🔵⭐💡🔥🚀📌🎯❗❓]/gu;
const PAREN_LIST_PATTERN = /^\s*\d+\)\s/;
const DOUBLE_BACKTICK_PATTERN = /``/;

function validateFile(filepath) {
  const content = readFileSync(filepath, 'utf8');
  const lines = content.split(/\r?\n/);

  const issues = [];
  let inCodeBlock = false;
  let codeLang = '';
  let inBlockComment = false;
  let inTasksSection = false;

  for (let idx = 0; idx < lines.length; idx += 1) {
    const lineNo = idx + 1;
    const line = lines[idx];

    if (line.startsWith('## ')) {
      inTasksSection = /задач/i.test(line);
    }

    const emojis = line.match(EMOJI_PATTERN);
    if (emojis) {
      const unique = [...new Set(emojis)].join(' ');
      issues.push({
        lineNo,
        kind: 'EMOJI',
        msg: `Цветные эмодзи (${unique}): ${line.slice(0, 60)}`,
      });
    }

    if (!inCodeBlock && line.includes('</summary>')) {
      if (idx + 1 < lines.length && lines[idx + 1].trim() !== '') {
        issues.push({
          lineNo,
          kind: 'SUMMARY_SPACE',
          msg: 'Нет пустой строки сразу после </summary>',
        });
      }
    }

    if (!inCodeBlock && line.includes('</details>')) {
      if (idx > 0 && lines[idx - 1].trim() !== '') {
        issues.push({
          lineNo,
          kind: 'DETAILS_SPACE',
          msg: 'Нет пустой строки перед </details>',
        });
      }
    }

    const stripped = line.trim();
    if (stripped.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = stripped.slice(3).trim().toLowerCase();
        inBlockComment = false;
      } else {
        inCodeBlock = false;
        codeLang = '';
        inBlockComment = false;
      }
      continue;
    }

    if (inCodeBlock) {
      if (line.length > MAX_CODE_LEN) {
        issues.push({
          lineNo,
          kind: 'LONG_LINE',
          msg: `Длина ${line.length} > ${MAX_CODE_LEN}: ${line}`,
        });
      }

      if (codeLang === 'js' || codeLang === 'javascript' || codeLang === '') {
        let j = 0;
        let inStr = null;

        while (j < line.length) {
          const ch = line[j];
          const nxt = j + 1 < line.length ? line[j + 1] : '';

          if (inBlockComment) {
            if (ch === '*' && nxt === '/') {
              inBlockComment = false;
              j += 2;
              continue;
            }
            if (ch === '/' && nxt === '*') {
              issues.push({
                lineNo,
                kind: 'NESTED_COMMENT',
                msg: `Вложенный /* внутри комментария: ${line}`,
              });
              j += 2;
              continue;
            }
            j += 1;
          } else if (inStr) {
            if (ch === '\\') {
              j += 2;
              continue;
            }
            if (ch === inStr) {
              inStr = null;
            }
            j += 1;
          } else {
            if (ch === "'" || ch === '"' || ch === '`') {
              inStr = ch;
              j += 1;
            } else if (ch === '/' && nxt === '*') {
              inBlockComment = true;
              j += 2;
            } else if (ch === '/' && nxt === '/') {
              const prev = j > 0 ? line[j - 1] : '';
              if (prev !== ':') {
                issues.push({
                  lineNo,
                  kind: 'SINGLE_COMMENT',
                  msg: `Однострочный комментарий //: ${line}`,
                });
              }
              break;
            } else {
              j += 1;
            }
          }
        }
      }
    } else {
      if (/^Суть урока:\s+\S/.test(line)) {
        issues.push({
          lineNo,
          kind: 'SUMMARY_INLINE',
          msg: `Текст в одной строке с "Суть урока:": ${line.slice(0, 70)}`,
        });
      }

      if (DOUBLE_BACKTICK_PATTERN.test(line)) {
        issues.push({
          lineNo,
          kind: 'DOUBLE_BACKTICKS',
          msg: `Двойные бэктики в тексте: ${line.slice(0, 70)}`,
        });
      }

      if (inTasksSection && PAREN_LIST_PATTERN.test(line)) {
        issues.push({
          lineNo,
          kind: 'TASK_LIST_PAREN',
          msg: `Список со скобкой '1)' вместо '1.': ${line.slice(0, 70)}`,
        });
      }
    }
  }

  return issues;
}

function getTargetFiles(args) {
  if (args.length > 0) {
    return args.map((arg) => resolve(arg));
  }

  const dirPath = resolve(LESSONS_DIR);
  return readdirSync(dirPath)
    .filter((name) => /^lesson-.*\.md$/i.test(name))
    .sort()
    .map((name) => join(dirPath, name))
    .filter((filePath) => statSync(filePath).isFile());
}

function main() {
  const targets = getTargetFiles(process.argv.slice(2));
  let totalIssues = 0;
  let filesWithIssues = 0;
  const countsByType = new Map();

  for (const filePath of targets) {
    const issues = validateFile(filePath);
    if (issues.length > 0) {
      filesWithIssues += 1;
      totalIssues += issues.length;
      console.log(`\n=== ${basename(filePath)} (${issues.length} issues) ===`);
      for (const { lineNo, kind, msg } of issues) {
        countsByType.set(kind, (countsByType.get(kind) ?? 0) + 1);
        console.log(`  L${String(lineNo).padStart(3, '0')} [${kind}]: ${msg}`);
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(
    `Checked ${targets.length} files. Files with issues: ${filesWithIssues}. Total issues: ${totalIssues}`
  );
  for (const [kind, count] of [...countsByType.entries()].sort()) {
    console.log(`  - ${kind}: ${count}`);
  }

  if (totalIssues > 0) {
    process.exitCode = 1;
  }
}

main();
