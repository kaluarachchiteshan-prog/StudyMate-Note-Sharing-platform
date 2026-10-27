from pathlib import Path
import re
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Image,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path(__file__).with_name("EG_2023_5537_StudyMate_Mini_Project_Report.md")
OUTPUT = SOURCE.with_suffix(".pdf")
PAGE_WIDTH, PAGE_HEIGHT = A4

NAVY = colors.HexColor("#0B1220")
BLUE = colors.HexColor("#1677B8")
CYAN = colors.HexColor("#37B6D7")
INK = colors.HexColor("#1D2939")
MUTED = colors.HexColor("#5B687A")
PALE = colors.HexColor("#EDF5FA")
GRID = colors.HexColor("#D6E0E9")


def register_fonts():
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont

    fonts = {
        "ReportSans": Path(r"C:\Windows\Fonts\arial.ttf"),
        "ReportSans-Bold": Path(r"C:\Windows\Fonts\arialbd.ttf"),
        "ReportSans-Italic": Path(r"C:\Windows\Fonts\ariali.ttf"),
        "ReportMono": Path(r"C:\Windows\Fonts\consola.ttf"),
    }
    for name, font_path in fonts.items():
        if font_path.exists():
            pdfmetrics.registerFont(TTFont(name, str(font_path)))

    return {
        "regular": "ReportSans" if fonts["ReportSans"].exists() else "Helvetica",
        "bold": "ReportSans-Bold" if fonts["ReportSans-Bold"].exists() else "Helvetica-Bold",
        "italic": "ReportSans-Italic" if fonts["ReportSans-Italic"].exists() else "Helvetica-Oblique",
        "mono": "ReportMono" if fonts["ReportMono"].exists() else "Courier",
    }


FONTS = register_fonts()
STYLES = getSampleStyleSheet()
STYLES.add(ParagraphStyle(
    name="ReportCoverTitle", fontName=FONTS["bold"], fontSize=28, leading=34,
    textColor=NAVY, alignment=TA_CENTER, spaceAfter=8,
))
STYLES.add(ParagraphStyle(
    name="ReportCoverSub", fontName=FONTS["regular"], fontSize=14, leading=19,
    textColor=MUTED, alignment=TA_CENTER, spaceAfter=14,
))
STYLES.add(ParagraphStyle(
    name="ReportH1", fontName=FONTS["bold"], fontSize=17, leading=21,
    textColor=NAVY, spaceAfter=8, keepWithNext=True,
))
STYLES.add(ParagraphStyle(
    name="ReportH2", fontName=FONTS["bold"], fontSize=10.5, leading=13,
    textColor=BLUE, spaceBefore=6, spaceAfter=4, keepWithNext=True,
))
STYLES.add(ParagraphStyle(
    name="ReportBody", fontName=FONTS["regular"], fontSize=8.6, leading=11.4,
    textColor=INK, spaceAfter=5,
))
STYLES.add(ParagraphStyle(
    name="ReportSmall", fontName=FONTS["regular"], fontSize=7.6, leading=9.6,
    textColor=MUTED, spaceAfter=3,
))
STYLES.add(ParagraphStyle(
    name="ReportBullet", fontName=FONTS["regular"], fontSize=8.3, leading=10.8,
    textColor=INK, leftIndent=13, firstLineIndent=-8, spaceAfter=2,
))
STYLES.add(ParagraphStyle(
    name="ReportCell", fontName=FONTS["regular"], fontSize=7.4, leading=9.2,
    textColor=INK, spaceAfter=0,
))
STYLES.add(ParagraphStyle(
    name="ReportCellHead", fontName=FONTS["bold"], fontSize=7.4, leading=9.2,
    textColor=NAVY, spaceAfter=0,
))
STYLES.add(ParagraphStyle(
    name="ReportCaption", fontName=FONTS["italic"], fontSize=7.5, leading=9.5,
    textColor=MUTED, alignment=TA_CENTER, spaceBefore=4, spaceAfter=6,
))
STYLES.add(ParagraphStyle(
    name="ReportCallout", fontName=FONTS["regular"], fontSize=8.3, leading=11,
    textColor=NAVY, backColor=PALE, borderColor=GRID, borderWidth=.6,
    borderPadding=8, spaceBefore=4, spaceAfter=7,
))
STYLES.add(ParagraphStyle(
    name="ReportCode", fontName=FONTS["mono"], fontSize=7.2, leading=9.2,
    textColor=INK, backColor=colors.HexColor("#F3F6F9"), borderColor=GRID,
    borderWidth=.5, borderPadding=7, spaceBefore=3, spaceAfter=6,
))


def inline_markup(text):
    text = escape(text.strip())
    text = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r'<link href="\2" color="#1677B8">\1</link>', text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"`([^`]+)`", r'<font name="%s">\1</font>' % FONTS["mono"], text)
    return text


def paragraph(text, style="ReportBody"):
    return Paragraph(inline_markup(text), STYLES[style])


def make_table(rows):
    wrapped = []
    for row_index, row in enumerate(rows):
        style = "ReportCellHead" if row_index == 0 else "ReportCell"
        wrapped.append([paragraph(cell, style) for cell in row])

    column_count = len(rows[0])
    available_width = PAGE_WIDTH - 36 * mm
    if column_count == 2:
        widths = [available_width * .32, available_width * .68]
    elif column_count == 3:
        widths = [available_width * .19, available_width * .32, available_width * .49]
    else:
        widths = [available_width / column_count] * column_count

    table = Table(wrapped, colWidths=widths, repeatRows=1, hAlign="LEFT")
    commands = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("GRID", (0, 0), (-1, -1), .35, GRID),
        ("BACKGROUND", (0, 0), (-1, 0), PALE),
    ]
    for row_index in range(2, len(rows), 2):
        commands.append(("BACKGROUND", (0, row_index), (-1, row_index), colors.HexColor("#F9FBFD")))
    table.setStyle(TableStyle(commands))
    return table


def footer(canvas, document):
    canvas.saveState()
    if canvas.getPageNumber() > 1:
        canvas.setStrokeColor(GRID)
        canvas.setLineWidth(.5)
        canvas.line(18 * mm, PAGE_HEIGHT - 14 * mm, PAGE_WIDTH - 18 * mm, PAGE_HEIGHT - 14 * mm)
        canvas.setFont(FONTS["bold"], 7)
        canvas.setFillColor(BLUE)
        canvas.drawString(18 * mm, PAGE_HEIGHT - 11 * mm, "STUDYMATE HUB  /  EC4307 MINI PROJECT")
        canvas.line(18 * mm, 13 * mm, PAGE_WIDTH - 18 * mm, 13 * mm)
        canvas.setFont(FONTS["regular"], 7)
        canvas.setFillColor(MUTED)
        canvas.drawString(18 * mm, 9 * mm, "Chamuditha K.D.T.  |  EG/2023/5537")
        canvas.drawRightString(PAGE_WIDTH - 18 * mm, 9 * mm, str(canvas.getPageNumber()))
    canvas.restoreState()


def build_cover(lines):
    student_rows = []
    for line in lines:
        match = re.match(r"\*\*(.+?):\*\*\s*(.*)", line)
        if match:
            student_rows.append([
                paragraph(match.group(1).upper(), "ReportCellHead"),
                paragraph(match.group(2), "ReportBody"),
            ])

    cover_table = Table(student_rows, colWidths=[42 * mm, 98 * mm], hAlign="CENTER")
    cover_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE),
        ("BOX", (0, 0), (-1, -1), .7, GRID),
        ("INNERGRID", (0, 0), (-1, -1), .35, GRID),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))

    return [
        Spacer(1, 27 * mm),
        Paragraph("EC4307  |  WEB APPLICATION DEVELOPMENT", ParagraphStyle(
            "Kicker", fontName=FONTS["bold"], fontSize=9, leading=13,
            textColor=CYAN, alignment=TA_CENTER, spaceAfter=12,
        )),
        Paragraph("STUDYMATE HUB", STYLES["ReportCoverTitle"]),
        Paragraph("Course Note-Sharing Web Application", STYLES["ReportCoverSub"]),
        Spacer(1, 9 * mm),
        cover_table,
        Spacer(1, 18 * mm),
        Paragraph(
            'Project repository<br/><link href="https://github.com/kaluarachchiteshan-prog/StudyMate-Note-Sharing-platform" color="#1677B8">github.com/kaluarachchiteshan-prog/StudyMate-Note-Sharing-platform</link>',
            STYLES["ReportCaption"],
        ),
        Spacer(1, 15 * mm),
        Paragraph(
            "A responsive browser-based application for discovering and managing course notes, with complete persistent CRUD backed by MongoDB.",
            STYLES["ReportCallout"],
        ),
        PageBreak(),
    ]


def markdown_to_story(markdown):
    lines = markdown.splitlines()
    cover_end = next((i for i, line in enumerate(lines) if line.strip() == "---"), len(lines))
    story = build_cover(lines[:cover_end])
    lines = lines[cover_end + 1:]
    index = 0

    while index < len(lines):
        current = lines[index].strip()
        if not current:
            index += 1
            continue
        if current == "---":
            story.append(PageBreak())
            index += 1
            continue
        if current.startswith("## "):
            title = current[3:]
            section = re.match(r"(\d+)\.", title)
            if section and int(section.group(1)) >= 3:
                story.append(PageBreak())
            story.append(paragraph(title, "ReportH1"))
            index += 1
            continue
        if current.startswith("### "):
            story.append(paragraph(current[4:], "ReportH2"))
            index += 1
            continue
        if current.startswith("!["):
            match = re.match(r"!\[([^\]]*)\]\(([^)]+)\)", current)
            if match:
                image_path = (SOURCE.parent / match.group(2)).resolve()
                image = Image(str(image_path))
                max_width, max_height = 174 * mm, 111 * mm
                scale = min(max_width / image.imageWidth, max_height / image.imageHeight)
                image.drawWidth = image.imageWidth * scale
                image.drawHeight = image.imageHeight * scale
                story.extend([image, paragraph(match.group(1), "ReportCaption")])
            index += 1
            continue
        if current.startswith("```"):
            index += 1
            code_lines = []
            while index < len(lines) and not lines[index].strip().startswith("```"):
                code_lines.append(lines[index])
                index += 1
            story.append(Preformatted("\n".join(code_lines), STYLES["ReportCode"], maxLineLength=100))
            index += 1
            continue
        if current.startswith("|"):
            raw_rows = []
            while index < len(lines) and lines[index].strip().startswith("|"):
                cells = [cell.strip() for cell in lines[index].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-{3,}:?", cell) for cell in cells):
                    raw_rows.append(cells)
                index += 1
            story.append(make_table(raw_rows))
            story.append(Spacer(1, 4))
            continue
        if current.startswith("- "):
            story.append(Paragraph("&bull;&nbsp; " + inline_markup(current[2:]), STYLES["ReportBullet"]))
            index += 1
            continue
        if current.startswith("**") and current.endswith("**"):
            story.append(paragraph(current[2:-2], "ReportH2"))
            index += 1
            continue

        text_lines = [current]
        index += 1
        while index < len(lines):
            following = lines[index].strip()
            if (
                not following
                or following.startswith(("#", "-", "|", "```", "!["))
                or following == "---"
            ):
                break
            text_lines.append(following)
            index += 1
        story.append(paragraph(" ".join(text_lines)))

    return story


def main():
    markdown = SOURCE.read_text(encoding="utf-8")
    document = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=20 * mm,
        bottomMargin=19 * mm,
        title="StudyMate Hub - Mini Project Report",
        author="Chamuditha K.D.T.",
        subject="EC4307 Web Application Development Mini Project",
    )
    document.build(markdown_to_story(markdown), onFirstPage=footer, onLaterPages=footer)
    print(f"Created {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size} bytes).")


if __name__ == "__main__":
    main()
