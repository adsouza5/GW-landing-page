#!/usr/bin/env python3
"""Render a self-contained motion concept and static previews with Pillow."""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
PREVIEW = ROOT / "preview"
FRAMES = PREVIEW / "frames"

PAPER = (231, 227, 218)
INK = (11, 11, 11)
RED = (214, 32, 32)
CYAN = (75, 202, 206)

NARROW = "/usr/share/fonts/opentype/urw-base35/NimbusSansNarrow-Bold.otf"
SANS = "/usr/share/fonts/opentype/urw-base35/NimbusSans-Bold.otf"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def cover(image: Image.Image, size: tuple[int, int], focus_x=.5, focus_y=.5) -> Image.Image:
    w, h = size
    scale = max(w / image.width, h / image.height)
    nw, nh = round(image.width * scale), round(image.height * scale)
    image = image.resize((nw, nh), Image.Resampling.LANCZOS)
    left = int((nw - w) * focus_x)
    top = int((nh - h) * focus_y)
    left = max(0, min(left, nw - w))
    top = max(0, min(top, nh - h))
    return image.crop((left, top, left + w, top + h))


def ease_out_cubic(x: float) -> float:
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3


def alpha_paste(canvas: Image.Image, layer: Image.Image, xy=(0, 0), alpha=1.0) -> None:
    if alpha < 1:
        layer = layer.copy()
        a = layer.getchannel("A").point(lambda p: round(p * alpha))
        layer.putalpha(a)
    canvas.alpha_composite(layer, xy)


def tinted_logo(size: tuple[int, int], color: tuple[int, int, int]) -> Image.Image:
    source = Image.open(ASSETS / "gw-mark.png").convert("RGBA")
    source.thumbnail(size, Image.Resampling.LANCZOS)
    layer = Image.new("RGBA", source.size, (*color, 0))
    layer.putalpha(source.getchannel("A"))
    return layer


def gradient_overlay(size: tuple[int, int], mobile=False) -> Image.Image:
    w, h = size
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    px = layer.load()
    if mobile:
        for y in range(h):
            p = y / h
            alpha = int(245 * max(0, min(1, (p - .38) / .43)) ** 1.7)
            for x in range(w):
                px[x, y] = (*PAPER, alpha)
    else:
        for x in range(w):
            p = x / w
            alpha = int(190 * max(0, 1 - p / .58) ** 1.55)
            for y in range(h):
                px[x, y] = (*PAPER, alpha)
    return layer


def tracking_text(draw: ImageDraw.ImageDraw, xy, text, face, fill, tracking=0):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=face, fill=fill)
        box = draw.textbbox((x, y), ch, font=face)
        x += box[2] - box[0] + tracking


def render_landing(size=(1600, 900), progress=1.0, mobile=False) -> Image.Image:
    w, h = size
    hero = Image.open(ASSETS / "gw-editorial-hero.png").convert("RGB")
    bg = cover(hero, size, focus_x=.74 if mobile else .50, focus_y=.48).convert("RGBA")
    bg = ImageEnhance.Color(bg).enhance(.83)
    bg.alpha_composite(gradient_overlay(size, mobile))
    draw = ImageDraw.Draw(bg)

    # faint editorial grain
    rng = random.Random(118)
    grain = Image.new("RGBA", size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(grain)
    for _ in range((w * h) // 900):
        x, y = rng.randrange(w), rng.randrange(h)
        v = rng.choice((0, 255))
        gd.point((x, y), fill=(v, v, v, 18))
    bg.alpha_composite(grain)

    nav_h = 92 if not mobile else 70
    pad = 58 if not mobile else 20
    draw.line((0, nav_h, w, nav_h), fill=(11, 11, 11, 55), width=1)
    small_logo = tinted_logo((40 if not mobile else 29, 48 if not mobile else 36), INK)
    alpha_paste(bg, small_logo, (pad, (nav_h - small_logo.height) // 2), progress)

    mono = font(MONO, 12 if not mobile else 10)
    if not mobile:
        nav = ["DROP 001", "LOOKBOOK", "MANIFESTO"]
        centers = [w // 2 - 115, w // 2, w // 2 + 125]
        for label, cx in zip(nav, centers):
            box = draw.textbbox((0, 0), label, font=mono)
            draw.text((cx - (box[2]-box[0])/2, 39), label, font=mono, fill=INK)
        draw.ellipse((w-262, 43, w-256, 49), fill=RED)
        draw.text((w-246, 38), "SOUND", font=mono, fill=INK)
        draw.text((w-117, 38), "BAG  0", font=mono, fill=INK)
    else:
        for yy in (29, 39):
            draw.line((w-47, yy, w-20, yy), fill=INK, width=1)

    if mobile:
        content_x = 20
        title_y = int(h * .57)
        ew = w - 40
        title_size = max(58, int(w * .164))
        line_h = int(title_size * .76)
    else:
        content_x = int(w * .075)
        title_y = int(h * .315)
        ew = int(w * .35)
        title_size = int(w * .078)
        line_h = int(title_size * .78)

    enter = ease_out_cubic(progress)
    offset = round((1-enter) * (42 if mobile else 65))
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    eyebrow_y = title_y - (35 if not mobile else 27)
    ld.line((content_x, eyebrow_y, content_x + ew, eyebrow_y), fill=INK, width=1)
    ld.rectangle((content_x, eyebrow_y + 10, content_x + 6, eyebrow_y + 16), fill=RED)
    tracking_text(ld, (content_x + 14, eyebrow_y + 5), "NEW TRANSMISSION", mono, INK, 1)
    right_label = "DROP 001"
    rb = ld.textbbox((0, 0), right_label, font=mono)
    ld.text((content_x + ew - (rb[2]-rb[0]), eyebrow_y + 5), right_label, font=mono, fill=INK)

    headline = font(NARROW, title_size)
    ld.text((content_x, title_y), "NO SIGNAL.", font=headline, fill=INK, stroke_width=1)
    ld.text((content_x, title_y + line_h), "NEW FORM.", font=headline, fill=PAPER, stroke_width=max(1, title_size//60), stroke_fill=INK)

    body_font = font(SANS, 20 if not mobile else 13)
    body_y = title_y + line_h * 2 + (31 if not mobile else 24)
    body = "Limited-run garments for people who\nrefuse the default setting."
    ld.multiline_text((content_x, body_y), body, font=body_font, fill=INK, spacing=7)

    button_y = body_y + (82 if not mobile else 62)
    bw, bh = (220, 56) if not mobile else (181, 49)
    ld.rectangle((content_x, button_y, content_x+bw, button_y+bh), fill=INK)
    ld.text((content_x+17, button_y+(20 if not mobile else 17)), "ENTER THE DROP", font=mono, fill=PAPER)
    ld.text((content_x+bw-31, button_y+(17 if not mobile else 14)), "↗", font=font(SANS, 19), fill=RED)
    if not mobile:
        ld.text((content_x+bw+31, button_y+20), "VIEW EDITORIAL  →", font=mono, fill=INK)
    alpha_paste(bg, layer, (0, offset), enter)

    # Right-side index and bottom metadata.
    if not mobile:
        ix = w - 58
        draw.text((ix-5, h//2-72), "01", font=font(MONO, 10), fill=INK)
        draw.line((ix, h//2-50, ix, h//2+35), fill=(11,11,11,70), width=1)
        draw.line((ix, h//2-50, ix, h//2-28), fill=RED, width=2)
        draw.text((ix-5, h//2+46), "04", font=font(MONO, 10), fill=INK)

    ticker_h = 40 if not mobile else 34
    draw.rectangle((0, h-ticker_h, w, h), fill=INK)
    ticker = "GW / OUTSIDE THE PATTERN     ✳     DROP 001 / NOW TRANSMITTING     ✳     "
    tracking_text(draw, (18, h-ticker_h+13), ticker * 3, font(MONO, 10), PAPER, 1)
    if not mobile:
        meta_y = h - ticker_h - 26
        draw.text((pad, meta_y), "GW / SS–26", font=font(MONO, 9), fill=INK)
        draw.text((w//2-83, meta_y), "40.7128° N / 74.0060° W", font=font(MONO, 9), fill=INK)
        draw.text((w-230, meta_y), "EDITION 001 / 120 UNITS", font=font(MONO, 9), fill=INK)

    return bg.convert("RGB")


def render_boot(size, t, landing):
    w, h = size
    frame = Image.new("RGBA", size, (*PAPER, 255))
    draw = ImageDraw.Draw(frame)
    mono9 = font(MONO, max(9, round(w/160)))
    draw.text((30, 26), "GW.OS // VISUAL SIGNAL 001", font=mono9, fill=INK)
    draw.text((30, h-40), "HANDSHAKE / 01      SIGNAL / UNSTABLE", font=mono9, fill=INK)
    draw.line((w-142, 30, w-31, 30), fill=INK, width=1)
    draw.text((w-139, 36), "SKIP INTRO", font=mono9, fill=INK)

    logo = tinted_logo((int(w*.21), int(h*.39)), INK)
    x = (w-logo.width)//2
    y = (h-logo.height)//2
    alpha_paste(frame, logo, (x, y), min(1, t/.28))

    if 1.02 <= t < 1.70:
        rng = random.Random(round(t*1000))
        red = tinted_logo((logo.width, logo.height), RED)
        cyan = tinted_logo((logo.width, logo.height), CYAN)
        alpha_paste(frame, red, (x+rng.randint(-24, 14), y+rng.randint(-3, 3)), .72)
        alpha_paste(frame, cyan, (x+rng.randint(-13, 25), y+rng.randint(-3, 3)), .44)
        # destructive horizontal logo displacement
        for _ in range(5):
            sy = rng.randint(y, y+logo.height-18)
            sh = rng.randint(4, 22)
            strip = frame.crop((0, sy, w, min(h, sy+sh)))
            frame.alpha_composite(strip, (rng.randint(-32, 32), sy))

    if 1.42 <= t < 2.18:
        p = (t-1.42)/.76
        rng = random.Random(round(t*400))
        bands = 2 + int(p*9)
        for i in range(bands):
            bh = rng.randint(8, max(12, int(h*.09)))
            by = rng.randint(0, h-bh)
            strip = landing.crop((0, by, w, by+bh)).convert("RGBA")
            alpha_paste(frame, strip, (rng.randint(-36, 36), by), min(1, .35+p*.8))
        scan_y = int(h * min(1, (t-1.42)/.52))
        draw = ImageDraw.Draw(frame)
        draw.rectangle((0, scan_y, w, scan_y+2), fill=(*RED, 255))

    return frame.convert("RGB")


def render_all():
    PREVIEW.mkdir(exist_ok=True)
    FRAMES.mkdir(exist_ok=True)
    desktop_size = (1600, 900)
    mobile_size = (390, 844)
    landing = render_landing(desktop_size, 1.0)
    landing.save(PREVIEW / "gw-landing-desktop.png", quality=95)
    render_landing(mobile_size, 1.0, mobile=True).save(PREVIEW / "gw-landing-mobile.png", quality=95)

    fps, seconds = 30, 7
    for n in range(fps * seconds):
        t = n / fps
        if t < 2.15:
            image = render_boot(desktop_size, t, landing)
        else:
            p = ease_out_cubic((t-2.15)/.78)
            image = render_landing(desktop_size, p)
            if t < 2.34:
                rng = random.Random(n)
                for _ in range(3):
                    y = rng.randint(0, desktop_size[1]-20)
                    hh = rng.randint(3, 16)
                    strip = image.crop((0, y, desktop_size[0], y+hh))
                    image.paste(strip, (rng.randint(-28, 28), y))
        image.save(FRAMES / f"frame-{n:04d}.jpg", quality=91, subsampling=0)


if __name__ == "__main__":
    render_all()

