#!/usr/bin/env python3
"""Render store-ready Hush screenshots at exact Pebble display sizes."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "screenshots"

THEMES = {
    "ink": {
        "bg": (0, 0, 0),
        "fg": (245, 245, 240),
        "dim": (90, 90, 88),
        "accent": (85, 170, 170),
        "rail": (40, 40, 40),
    },
    "paper": {
        "bg": (236, 232, 220),
        "fg": (28, 28, 26),
        "dim": (140, 136, 128),
        "accent": (180, 70, 50),
        "rail": (200, 196, 184),
    },
    "night": {
        "bg": (8, 10, 18),
        "fg": (200, 210, 230),
        "dim": (70, 78, 96),
        "accent": (100, 140, 220),
        "rail": (24, 28, 40),
    },
    "coral": {
        "bg": (28, 18, 22),
        "fg": (255, 236, 228),
        "dim": (110, 80, 85),
        "accent": (255, 110, 90),
        "rail": (50, 32, 36),
    },
}

PIP = {
    "calendar": (85, 170, 255),
    "weather": (90, 190, 120),
    "health": (255, 140, 70),
    "system": (255, 80, 80),
}


def font(size: int, bold: bool = False):
    candidates = [
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def center_text(draw, text, y, fnt, fill, width):
    bbox = draw.textbbox((0, 0), text, font=fnt)
    tw = bbox[2] - bbox[0]
    draw.text(((width - tw) // 2, y), text, font=fnt, fill=fill)


def draw_face(
    size,
    *,
    theme="ink",
    hours="14",
    minutes="32",
    always_on="Nov 7",
    pips=None,
    detail=None,
    minute=32,
    round_mask=False,
):
    w, h = size
    t = THEMES[theme]
    img = Image.new("RGB", size, t["bg"])
    draw = ImageDraw.Draw(img)

    time_font = font(42 if w >= 240 else 36, bold=True)
    small_font = font(14)
    detail_font = font(16, bold=True)

    # Day progress
    day_pct = (14 * 60 + minute) / (24 * 60)
    bar_w = int(w * 0.55) if round_mask else w - 32
    bar_x = (w - bar_w) // 2
    bar_y = 22 if round_mask else 10
    draw.rectangle([bar_x, bar_y, bar_x + bar_w, bar_y + 1], fill=t["rail"])
    draw.rectangle(
        [bar_x, bar_y, bar_x + max(2, int(bar_w * day_pct)), bar_y + 1],
        fill=t["accent"],
    )

    if theme == "paper":
        draw.rectangle([10, 8, 11, h - 8], fill=t["accent"])
    elif theme in ("ink", "night", "custom"):
        L = 10
        for x, y in [(8, 8), (w - 8 - L, 8), (8, h - 9), (w - 8 - L, h - 9)]:
            draw.rectangle([x, y, x + L, y], fill=t["dim"])
        for x, y in [(8, 8), (w - 9, 8), (8, h - 8 - L), (w - 9, h - 8 - L)]:
            draw.rectangle([x, y, x, y + L], fill=t["dim"])

    gap = 2
    rule_h = 2
    always_h = 22 if always_on else 0
    block = 42 * 2 + gap + rule_h + 6 + always_h
    top = (h - block) // 2 - (6 if round_mask else 0)

    center_text(draw, hours, top, time_font, t["fg"], w)
    center_text(draw, minutes, top + 44, time_font, t["accent"], w)

    hw = draw.textbbox((0, 0), hours, font=time_font)
    mw = draw.textbbox((0, 0), minutes, font=time_font)
    rule_w = max(hw[2] - hw[0], mw[2] - mw[0]) - 8
    rule_x = (w - rule_w) // 2
    rule_y = top + 44 + 42 + 4
    draw.rectangle([rule_x, rule_y, rule_x + rule_w, rule_y + rule_h - 1], fill=t["rail"])
    draw.rectangle(
        [rule_x, rule_y, rule_x + max(2, int(rule_w * minute / 60)), rule_y + rule_h - 1],
        fill=t["accent"],
    )

    if always_on:
        center_text(draw, always_on, rule_y + rule_h + 6, small_font, t["dim"], w)

    margin = 34 if round_mask else 16
    rail_h = 8
    rail_y = h - rail_h - (26 if round_mask else 14)
    rail_x = margin
    rail_w = w - margin * 2
    draw.rectangle([rail_x, rail_y, rail_x + rail_w, rail_y + rail_h], fill=t["rail"])

    if pips:
        gap_p = 4
        pip_w = max(12, (rail_w - gap_p * 3) // 4)
        x = rail_x
        for i, name in enumerate(pips[:4]):
            color = PIP.get(name, t["accent"])
            draw.rectangle([x, rail_y, x + pip_w, rail_y + rail_h], fill=color)
            if detail and i == 0:
                draw.rectangle([x, rail_y - 3, x + pip_w, rail_y - 1], fill=t["fg"])
            x += pip_w + gap_p
    else:
        fill = max(2, int(rail_w * minute / 60))
        draw.rectangle([rail_x, rail_y, rail_x + fill, rail_y + rail_h], fill=t["accent"])
        draw.rectangle([rail_x, rail_y, rail_x + 1, rail_y + rail_h], fill=t["fg"])

    if detail:
        title, line = detail
        card_y = int(h * (0.68 if round_mask else 0.64))
        draw.rectangle([8, card_y - 2, w - 8, card_y + 40], fill=t["bg"])
        draw.rectangle([12, card_y, 15, card_y + 36], fill=t["accent"])
        draw.text((22, card_y), title, font=detail_font, fill=t["fg"])
        draw.text((22, card_y + 20), line, font=small_font, fill=t["dim"])

    if round_mask:
        mask = Image.new("L", size, 0)
        ImageDraw.Draw(mask).ellipse([0, 0, w - 1, h - 1], fill=255)
        rounded = Image.new("RGB", size, (0, 0, 0))
        rounded.paste(img, mask=mask)
        return rounded

    return img


def save(img, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, format="PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)} ({img.size[0]}x{img.size[1]})")


def main():
    shots = [
        dict(name="01_calm", theme="ink", hours="14", minutes="32", always_on="Nov 7", minute=32),
        dict(
            name="02_signals",
            theme="ink",
            hours="14",
            minutes="32",
            always_on="Nov 7",
            pips=["calendar", "weather"],
            minute=32,
        ),
        dict(
            name="03_detail",
            theme="ink",
            hours="14",
            minutes="32",
            always_on="Nov 7",
            pips=["calendar", "weather", "health"],
            detail=("Standup", "in 12m"),
            minute=32,
        ),
        dict(
            name="04_paper",
            theme="paper",
            hours="09",
            minutes="15",
            always_on="8420",
            pips=["weather", "health"],
            minute=15,
        ),
        dict(
            name="05_night",
            theme="night",
            hours="22",
            minutes="04",
            always_on="",
            minute=4,
        ),
    ]

    for shot in shots:
        name = shot.pop("name")
        save(draw_face((200, 228), round_mask=False, **shot), OUT / "emery" / f"{name}.png")
        save(draw_face((260, 260), round_mask=True, **shot), OUT / "gabbro" / f"{name}.png")


if __name__ == "__main__":
    main()
