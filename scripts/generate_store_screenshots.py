#!/usr/bin/env python3
"""Store screenshots — staggered hours + minute chip, no overlap."""

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


def moment(hour: int, round_mask: bool = False) -> str:
    if round_mask:
        if hour < 5:
            return "LATE"
        if hour < 7:
            return "DAWN"
        if hour < 11:
            return "AM"
        if hour < 13:
            return "NOON"
        if hour < 17:
            return "PM"
        if hour < 19:
            return "GOLD"
        if hour < 22:
            return "EVE"
        return "NIGHT"
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
    time_font = font(52 if w >= 240 else 48, bold=True)
    small_font = font(13)
    detail_font = font(15, bold=True)

    pad = 40 if round_mask else 8
    margin = 44 if round_mask else 14
    rail_h = 12
    rail_y = h - rail_h - (32 if round_mask else 12)
    rail_x = margin
    rail_w = w - margin * 2

    gap = 10
    stripe_w = 4 if round_mask else 5
    stripe_top = 56 if round_mask else 24
    stripe_bot = rail_y - 6
    day_pct = (hour * 60 + minute) / (24 * 60)
    span = max(8, stripe_bot - stripe_top)
    stripe_h = max(16, int(span * day_pct))
    draw.rectangle([pad, stripe_top, pad + stripe_w - 1, stripe_bot], fill=t["rail"])
    draw.rectangle([pad, stripe_bot - stripe_h, pad + stripe_w - 1, stripe_bot], fill=live)

    header_y = 44 if round_mask else 4
    day_x = pad + stripe_w + 6
    word = moment(hour, round_mask)
    wb = draw.textbbox((0, 0), word, font=small_font)
    mom_w = wb[2] - wb[0]
    day_bb = draw.textbbox((0, 0), weekday, font=small_font)
    day_w = day_bb[2] - day_bb[0]
    mom_x = w - pad - mom_w
    mom_y = header_y
    if mom_x < day_x + day_w + gap:
        mom_x = w - pad - mom_w
        mom_y = header_y + 14
    draw.text((day_x, header_y), weekday, font=small_font, fill=t["dim"])
    draw.text((mom_x, mom_y), word, font=small_font, fill=live)

    hours = f"{hour:02d}"
    mins = f"{minute:02d}"
    ascent, descent = time_font.getmetrics()
    th = ascent + descent
    hb = draw.textbbox((0, 0), hours, font=time_font)
    mb = draw.textbbox((0, 0), mins, font=time_font)
    hour_w = hb[2] - hb[0]
    min_w = mb[2] - mb[0]
    chip_pad_x, chip_pad_y = 6, 3
    chip_w = min_w + chip_pad_x * 2
    chip_h = th + chip_pad_y * 2
    show_always = bool(always_on) and not detail
    meta_h = 16 if show_always else 0
    detail_reserve = 40 + gap if detail else 0

    top_bound = max(header_y, mom_y) + 14 + gap
    bot_bound = rail_y - gap - detail_reserve
    hour_x = pad + stripe_w + 4
    right_limit = w - pad
    stagger = int(th * (0.35 if round_mask else 0.45))

    avail_h = max(0, bot_bound - top_bound)
    stagger_block_h = max(th, stagger + chip_h) + meta_h
    stack_block_h = th + gap + chip_h + meta_h
    side_by_side = (
        hour_x + hour_w + gap + chip_w <= right_limit and stagger_block_h <= avail_h
    )
    if side_by_side:
        chip_x = right_limit - chip_w
        hour_y = top_bound + max(0, (avail_h - stagger_block_h) // 2)
        chip_y = hour_y + stagger
    else:
        hour_y = top_bound + max(0, (avail_h - stack_block_h) // 2)
        chip_y = hour_y + th + gap
        chip_x = right_limit - chip_w

    hour_right = hour_x + hour_w
    hour_bottom = hour_y + th
    if not (chip_x >= hour_right + gap or chip_y >= hour_bottom + gap):
        chip_y = hour_bottom + gap
        chip_x = right_limit - chip_w

    draw.text((hour_x, hour_y), hours, font=time_font, fill=t["fg"])
    draw.rectangle([chip_x, chip_y, chip_x + chip_w - 1, chip_y + chip_h - 1], fill=live)
    draw.text((chip_x + chip_pad_x, chip_y + chip_pad_y), mins, font=time_font, fill=t["bg"])

    if show_always:
        aw = draw.textbbox((0, 0), always_on, font=small_font)
        always_w = aw[2] - aw[0]
        ay = hour_y + th + 4
        ax = hour_x
        pocket_ok = ay + 14 <= bot_bound and (
            ay >= chip_y + chip_h + gap or ax + always_w <= chip_x - gap
        )
        if not pocket_ok:
            ay = max(hour_y + th, chip_y + chip_h) + 4
            if ay + 14 > bot_bound or (ay < chip_y + chip_h and ax + always_w > chip_x - gap):
                ay = None
        if ay is not None:
            draw.text((ax, ay), always_on, font=small_font, fill=t["dim"])

    draw.rectangle([rail_x, rail_y, rail_x + rail_w, rail_y + rail_h], fill=t["rail"])
    if pips:
        gap_p = 3
        pip_w = max(14, (rail_w - gap_p * 3) // 4)
        x = rail_x
        for i, name in enumerate(pips[:4]):
            draw.rectangle([x, rail_y, x + pip_w, rail_y + rail_h], fill=PIP.get(name, live))
            if detail and i == 0:
                draw.rectangle([x, rail_y - 3, x + pip_w, rail_y - 1], fill=t["fg"])
            x += pip_w + gap_p
    else:
        fill = max(3, int(rail_w * minute / 60))
        draw.rectangle([rail_x, rail_y, rail_x + fill, rail_y + rail_h], fill=live)
        mx = min(rail_x + rail_w - 3, max(rail_x, rail_x + fill - 2))
        draw.rectangle([mx, rail_y, mx + 3, rail_y + rail_h], fill=t["fg"])

    if detail:
        title, line = detail
        card_h = 40
        card_y = rail_y - card_h - 4
        draw.rectangle([10, card_y, w - 10, card_y + card_h], fill=t["bg"])
        draw.rectangle([10, card_y, w - 10, card_y + 3], fill=live)
        draw.text((16, card_y + 6), title, font=detail_font, fill=t["fg"])
        draw.text((16, card_y + 24), line, font=small_font, fill=t["dim"])

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
