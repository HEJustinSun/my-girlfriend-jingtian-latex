from pathlib import Path

from PIL import Image, ImageDraw


page_files = sorted(Path("tmp/pdfs/pages").glob("*.png"))

for group_index, start in enumerate(range(0, len(page_files), 6), 1):
    group = page_files[start : start + 6]
    sheet = Image.new("RGB", (1080, 1232), (235, 235, 232))
    draw = ImageDraw.Draw(sheet)

    for index, path in enumerate(group):
        x = (index % 3) * 360
        y = (index // 3) * 616
        page_number = int(path.stem.split("-")[1])
        draw.text((x + 12, y + 12), f"PDF {page_number}", fill=(20, 20, 20))
        image = Image.open(path).convert("RGB").resize((360, 576))
        sheet.paste(image, (x, y + 40))

    sheet.save(Path("tmp/pdfs") / f"contact-{group_index}.png")
