"""Конвертер конспектов .docx из папки conspects/ в читаемые .md и индекс lessons.json."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import docx

ROOT_DIR = Path(__file__).resolve().parents[2]
CONSPECTS_DIR = ROOT_DIR / "conspects"
OUT_DATA_DIR = ROOT_DIR / "site" / "data" / "js"

# Модули курса (соответствуют структуре LEARNING_LOG.md)
MODULES = [
    (1, 9, "Блок 1. Фундамент языка"),
    (10, 14, "Блок 2. Объекты и примитивы"),
    (15, 19, "Блок 3. Структуры данных и ООП"),
    (20, 23, "Блок 4. Асинхронность и модули"),
    (24, 31, "Блок 5. DOM, размеры и элементы"),
    (32, 36, "Блок 6. События браузера"),
    (37, 42, "Блок 7. Формы, сеть и хранилище"),
]

TAG_PATTERN = re.compile(r"(</?[a-zA-Z][^>\n]*>)")


def detect_module(lesson_num: int) -> str:
    for start, end, title in MODULES:
        if start <= lesson_num <= end:
            return title
    return "Дополнительно"


def escape_inline_tags(text: str) -> str:
    """Оборачивает HTML-теги вроде <script> в обратные кавычки вне блоков кода."""
    if "`" in text:
        parts = text.split("`")
        for idx in range(0, len(parts), 2):
            parts[idx] = TAG_PATTERN.sub(r"`\1`", parts[idx])
        return "`".join(parts)
    return TAG_PATTERN.sub(r"`\1`", text)


def detect_code_lang(lines: list[str]) -> str:
    non_empty = [line.strip() for line in lines if line.strip()]
    if not non_empty:
        return "js"
    html_markers = ("<!DOCTYPE", "<html", "<head", "<body", "<script", "<div", "<form", "<input", "<!--")
    html_hits = sum(1 for line in non_empty if line.startswith(html_markers))
    return "html" if html_hits >= max(1, len(non_empty) // 2) else "js"


def is_code_paragraph(paragraph: docx.text.paragraph.Paragraph) -> bool:
    for run in paragraph.runs:
        if run.font.name == "Consolas":
            return True
    return False


def is_heading_paragraph(paragraph: docx.text.paragraph.Paragraph) -> tuple[bool, int]:
    """Определяет уровень заголовка по размеру шрифта и подчёркиванию."""
    for run in paragraph.runs:
        if run.font.size:
            pt = run.font.size.pt
            if pt >= 13.0:
                return True, 1
            if pt >= 11.5 and run.underline:
                return True, 2
    return False, 0


def extract_existing_practice_tail(md_path: Path) -> str:
    """Сохраняет уже написанные разделы вопросов и задач при переконвертации .docx."""
    if not md_path.exists():
        return ""
    text = md_path.read_text(encoding="utf-8")
    match = re.search(r"(^## (?:Вопросы для закрепления|Задачи)\b.*)", text, flags=re.MULTILINE | re.DOTALL)
    return match.group(1).strip() if match else ""


def build_all_lessons_bundle(lessons_index: list[dict]) -> Path:
    """Собирает единый Markdown-файл со всеми уроками раздела для загрузки в ИИ."""
    toc = ["# Полный конспект курса JavaScript", "", "## Оглавление"]
    for item in lessons_index:
        toc.append(f"- {item['title']}")

    parts = ["\n".join(toc)]
    for item in lessons_index:
        md_path = OUT_DATA_DIR / item["file"]
        if md_path.exists():
            parts.append(md_path.read_text(encoding="utf-8").strip())

    bundle_path = OUT_DATA_DIR / "all-lessons.md"
    bundle_path.write_text("\n\n---\n\n".join(parts) + "\n", encoding="utf-8")
    return bundle_path


def convert_file(docx_path: Path) -> dict:
    doc = docx.Document(docx_path)
    md_lines: list[str] = []
    code_buffer: list[str] = []

    lesson_title = ""
    tldr_text = ""
    traps: list[str] = []
    in_traps_section = False

    def flush_code() -> None:
        nonlocal code_buffer
        while code_buffer and not code_buffer[0].strip():
            code_buffer.pop(0)
        while code_buffer and not code_buffer[-1].strip():
            code_buffer.pop()
        if code_buffer:
            lang = detect_code_lang(code_buffer)
            md_lines.append(f"```{lang}")
            md_lines.extend(code_buffer)
            md_lines.append("```")
            md_lines.append("")
        code_buffer = []

    for paragraph in doc.paragraphs:
        raw_text = paragraph.text.rstrip()
        if is_code_paragraph(paragraph):
            code_buffer.append(raw_text)
            continue

        flush_code()
        clean_text = raw_text.strip()
        if not clean_text:
            continue

        is_heading, level = is_heading_paragraph(paragraph)
        if is_heading and level == 1:
            lesson_title = clean_text
            md_lines.append(f"# {escape_inline_tags(clean_text)}")
            md_lines.append("")
            in_traps_section = False
            continue

        if is_heading and level == 2:
            in_traps_section = "ловушки урока" in clean_text.lower()
            md_lines.append(f"## {escape_inline_tags(clean_text)}")
            md_lines.append("")
            continue

        if clean_text.startswith("Суть урока:"):
            tldr_text = clean_text.removeprefix("Суть урока:").strip()
        elif clean_text.startswith("Суть (TL;DR):"):
            tldr_text = clean_text.removeprefix("Суть (TL;DR):").strip()
            clean_text = f"Суть урока: {tldr_text}"

        if in_traps_section:
            traps.append(clean_text)

        md_lines.append(escape_inline_tags(clean_text))
        md_lines.append("")

    flush_code()

    match = re.match(r"lesson-(\d+)-", docx_path.name)
    lesson_num = int(match.group(1)) if match else 0
    md_filename = f"lesson-{lesson_num:02d}.md"
    OUT_DATA_DIR.mkdir(parents=True, exist_ok=True)
    md_path = OUT_DATA_DIR / md_filename

    practice_tail = extract_existing_practice_tail(md_path)
    body_text = "\n".join(md_lines).rstrip()
    if practice_tail:
        body_text = f"{body_text}\n\n{practice_tail}"
    md_path.write_text(body_text + "\n", encoding="utf-8")

    return {
        "id": f"lesson-{lesson_num:02d}",
        "number": lesson_num,
        "title": lesson_title or docx_path.stem,
        "module": detect_module(lesson_num),
        "file": md_filename,
        "sourceDocx": f"../conspects/{docx_path.name}",
        "tldr": tldr_text,
        "traps": traps,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Конвертация .docx конспектов в .md + lessons.json")
    parser.add_argument("--lesson", type=int, help="Номер конкретного урока (например, 25)")
    parser.add_argument("--all", action="store_true", help="Конвертировать все .docx из conspects/")
    args = parser.parse_args()

    files = sorted(CONSPECTS_DIR.glob("lesson-*.docx"))
    if args.lesson is not None:
        prefix = f"lesson-{args.lesson:02d}-"
        files = [f for f in files if f.name.startswith(prefix)]
    elif not args.all:
        raise SystemExit("Укажи --lesson N или --all")

    if not files:
        raise SystemExit("Подходящие .docx файлы не найдены.")

    lessons_index = [convert_file(f) for f in files]
    lessons_index.sort(key=lambda item: item["number"])

    index_path = OUT_DATA_DIR / "lessons.json"
    index_path.write_text(json.dumps(lessons_index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    bundle_path = build_all_lessons_bundle(lessons_index)
    print(f"Готово: сконвертировано уроков: {len(lessons_index)} -> {OUT_DATA_DIR}")
    print(f"Собран общий файл для ИИ: {bundle_path}")


if __name__ == "__main__":
    main()
