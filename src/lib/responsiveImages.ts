import { publicAsset } from './publicAsset';

/** Variants are generated from the original product photos by scripts/optimize_images.py. */
export function productImageProps(src: string, sizes: string) {
  const square = /^\/assets\/images\/products\/[\w-]+-square\.webp$/.test(src);
  if (!square && src !== '/assets/images/products/vanity-kit.webp') return {};
  // The original lifestyle vanity photo is 800px; never advertise an upscaled 1024px source.
  const widths = square ? [320, 480, 768, 1024] : [320, 480, 768];
  const file = (width: number) => publicAsset(src.replace(/\.webp$/, `-${width}.webp`));
  return { srcSet: widths.map(width => `${file(width)} ${width}w`).join(', '), sizes };
}
export const catalogueImageSizes = '(max-width: 560px) calc((86vw - 15px) / 2), (max-width: 768px) 210px, (max-width: 800px) calc((86vw - 20px) / 2), (max-width: 992px) calc((86vw - 24px) / 2), (max-width: 1600px) calc((86vw - 48px) / 3), 443px';
export const detailImageSizes = '(max-width: 800px) 86vw, (max-width: 1600px) 40vw, 663px';
export const heroDesktopSrcSet = [960, 1280, 1672].map(width => `${publicAsset(`/assets/images/hero-hospitality-v2-${width}.webp`)} ${width}w`).join(', ');
export const heroMobileSrcSet = [360, 564].map(width => `${publicAsset(`/assets/images/hero-hospitality-v2-mobile-${width}.webp`)} ${width}w`).join(', ');
