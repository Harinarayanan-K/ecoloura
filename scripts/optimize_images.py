"""Create responsive WebP copies from existing photos; keep every original.

Regeneration only: python3 -m pip install Pillow && python3 scripts/optimize_images.py
The normal Node/Vercel build uses the checked-in outputs and does not need Pillow.
"""
from pathlib import Path
import re
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / 'public'
paths = set(re.findall(r'"(/assets/images/products/[^\"]+\.webp)"', (ROOT / 'src/data/productsData.ts').read_text()))
paths.add('/assets/images/products/vanity-kit.webp')
original_bytes = variant_bytes = 0
for url in sorted(paths):
    source = PUBLIC / url.lstrip('/')
    original_bytes += source.stat().st_size
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image).convert('RGB')
        for width in (320, 480, 768, 1024):
            if width > image.width:
                continue
            copy = image.copy()
            copy.thumbnail((width, width), Image.Resampling.LANCZOS)
            output = source.with_name(f'{source.stem}-{width}.webp')
            # The small dental card was still flagged for compression by PSI.
            # Regenerate from the original photo, never from a lossy derivative.
            quality = 74 if source.stem == 'dental-kit-square' and width == 320 else 80
            copy.save(output, 'WEBP', quality=quality, method=6)
            if width == 320:
                variant_bytes += output.stat().st_size

hero = PUBLIC / 'assets/images/hero-hospitality-v2.webp'
with Image.open(hero) as image:
    for width in (960, 1280, 1672):
        copy = image.copy()
        copy.thumbnail((width, width), Image.Resampling.LANCZOS)
        copy.save(hero.with_name(f'{hero.stem}-{width}.webp'), 'WEBP', quality=80, method=6)
    # Match the existing mobile object-position:62% center before resizing.
    for width in (360, 564):
        portrait = ImageOps.fit(image, (width, round(width * 5 / 3)), Image.Resampling.LANCZOS, centering=(.62, .5))
        portrait.save(hero.with_name(f'{hero.stem}-mobile-{width}.webp'), 'WEBP', quality=80, method=6)

print(f'Catalogue source photos: {original_bytes:,} bytes; 320px copies: {variant_bytes:,} bytes ({100*(1-variant_bytes/original_bytes):.1f}% smaller).')
