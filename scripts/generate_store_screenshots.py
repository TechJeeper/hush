#!/usr/bin/env python3
"""Render store-ready Hush screenshots — poster layout."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "screenshots"

THEMES = {
    "ink": {"bg": (0, 0, 0), "fg": (245, 245, 240), "dim": (90, 90, 88), "rail": (40, 40, 40)},
    "paper": {"bg": (236, 232, 220), "fg": (28, 28, 26), "dim": (140, 136, 128), "rail": (200, 196, 184)},
    "night": {"bg": (8, 10, 18), "fg": (200, 210, 230), "dim": (70, 78, 96), "rail": (24, 28, 40)},
}

PIP = {
    "calendar": (85, 170, 255),
    "weather": (90, 190, 120),
    "health": (255, 140, 70),
}


def living(hour: int):
    if hour < 6:
        return (110, 130, 220)
    if hour < 9:
        return (255, 150, 70)
    if hour < 12:
        return (70, 200, 170)
    if hour < 15:
        return (70, 170, 230)
    if hour < 18:
        return (255, 120, 90)
    if hour < 21:
        return (200, 110, 220)
    return (120, 140, 230)


def moment(hour: int) -> str:
    if hour < 5:
        return "LATE"
    if hour < 7:
        return "DAWN"
    if hour < 11:
        return "MORNING"
    if hour < 13:
        return "MIDDAY"
    if hour < 17:
        return "AFTERNOON"
    if hour < 19:
        return "GOLDEN"
    if hour < 22:
        return "EVENING"
    return "NIGHT"


def font(size: int, bold: bool = False):
    for path in (
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
    ):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_face(
    size,
    *,
    theme="ink",
    hour=14,
    minute=32,
    weekday="FRI",
    always_on="Nov 7",
    pips=None,
    detail=None,
    round_mask=False,
):
    w, h = size
    t = THEMES[theme]
    live = living(hour)
    img = Image.new("RGB", size, t["bg"])
    draw = ImageDraw.Draw(img)
    time_font = font(42 if w >= 240 else 36, bold=True)
    detail_font = font(16, bold=True)
    small_font = font(13)

    pad = 28 if round_mask else 12
    stripe_w = 5 if round_mask else 7
    day_pct = (hour * 60 + minute) / (24 * 60)
    stripe_h = max(24, int((h - 40) * day_pct))
    draw.rectangle([pad, 18, pad + stripe_w - 1, h - 22], fill=t["rail"])
    draw.rectangle(
        [pad, 18 + (h - 40 - stripe_h), pad + stripe_w - 1, 18 + (h - 40 - stripe_h) + stripe_h],
        fill=live,
    )

    word = moment(hour)
    bbox = draw.textbbox((0, 0), word, font=detail_font)
    draw.text((w - pad - (bbox[2] - bbox[0]), 28 if round_mask else 14), word, font=detail_font, fill=live)
    draw.text((pad + stripe_w + 8, 30 if round_mask else 16), weekday, font=small_font, fill=t["dim"])

    hours = f"{hour:02d}"
    mins = f"{minute:02d}"
    hour_x = pad + stripe_w + 6
    hour_y = (h - 42) // 2 - 18 if round_mask else 52
    draw.text((hour_x, hour_y), hours, font=time_font, fill=t["fg"])

    mb = draw.textbbox((0, 0), mins, font=time_font)
    min_w = mb[2] - mb[0]
    chip_pad = 6
    chip_w = min_w + chip_pad * 2
    chip_h = 46
    chip_x = w - pad - chip_w
    chip_y = hour_y + (42 - 8 if round_mask else 28)
    draw.rectangle([chip_x, chip_y, chip_x + chip_w, chip_y + chip_h], fill=live)
    draw.text((chip_x + chip_pad, chip_y + 2), mins, font=time_font, fill=t["bg"])

    if always_on:
        draw.text((hour_x, hour_y + 46), always_on, font=small_font, fill=t["dim"])

    margin = 36 if round_mask else 14
    rail_h = 12
    rail_y = h - rail_h - (24 if round_mask else 12)
    rail_x = margin
    rail_w = w - margin * 2
    draw.rectangle([rail_x, rail_y, rail_x + rail_w, rail_y + rail_h], fill=t["rail"])

    if pips:
        gap = 3
        pip_w = max(14, (rail_w - gap * 3) // 4)
        x = rail_x
        for i, name in enumerate(pips[:4]):
            draw.rectangle([x, rail_y, x + pip_w, rail_y + rail_h], fill=PIP.get(name, live))
            if detail and i == 0:
                draw.rectangle([x, rail_y - 4, x + pip_w, rail_y - 1], fill=t["fg"])
            x += pip_w + gap
    else:
        fill = max(3, int(rail_w * minute / 60))
        draw.rectangle([rail_x, rail_y, rail_x + fill, rail_y + rail_h], fill=live)
        draw.rectangle([rail_x + fill - 2, rail_y - 2, rail_x + fill + 1, rail_y + rail_h + 2], fill=t["fg"])

    if detail:
        title, line = detail
        card_y = int(h * (0.58 if round_mask else 0.55))
        draw.rectangle([10, card_y - 2, w - 10, card_y + 42], fill=t["bg"])
        draw.rectangle([10, card_y - 2, w - 10, card_y + 1], fill=live)
        draw.text((16, card_y + 6), title, font=detail_font, fill=t["fg"])
        draw.text((16, card_y + 26), line, font=small_font, fill=t["dim"])

    if round_mask:
        mask = Image.new("L", size, 0)
        ImageDraw.Draw(mask).ellipse([0, 0, w - 1, h - 1], fill=255)
        out = Image.new("RGB", size, (0, 0, 0))
        out.paste(img, mask=mask)
        return out
    return img


def save(img, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, format="PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)}")


def main():
    shots = [
        dict(name="01_calm", theme="ink", hour=14, minute=32, weekday="FRI", always_on="Nov 7"),
        dict(name="02_signals", theme="ink", hour=14, minute=32, pips=["calendar", "weather"]),
        dict(
            name="03_detail",
            theme="ink",
            hour=14,
            minute=32,
            pips=["calendar", "weather", "health"],
            detail=("Standup", "in 12m"),
        ),
        dict(name="04_paper", theme="paper", hour=9, minute=15, weekday="SAT", always_on="8420", pips=["weather", "health"]),
        dict(name="05_night", theme="night", hour=22, minute=4, weekday="FRI", always_on=""),
    ]
    for shot in shots:
        name = shot.pop("name")
        save(draw_face((200, 228), round_mask=False, **shot), OUT / "emery" / f"{name}.png")
        save(draw_face((260, 260), round_mask=True, **shot), OUT / "gabbro" / f"{name}.png")


if __name__ == "__main__":
    main()
