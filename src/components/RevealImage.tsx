import React, { useEffect, useRef, useState } from 'react';
import { publicAsset } from '../lib/publicAsset';

interface RevealImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  variant?: 'hero' | 'product' | 'lifestyle' | 'detail';
  revealDelay?: number;
}

/** Reveal only after decoding and entering view, including cached and lazy images. */
export function RevealImage({ src, className = '', variant = 'product', revealDelay = 0, style, fetchPriority, ...props }: RevealImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [readySrc, setReadySrc] = useState<string | null>(null);
  const [visibleSrc, setVisibleSrc] = useState<string | null>(null);

  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    let active = true;
    let frame = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const markReady = async () => {
      if (img.naturalWidth > 0) {
        try { await img.decode(); } catch { /* A loaded image can still be displayed. */ }
      }
      // Keep the initial state painted so cached images also reveal smoothly.
      if (active) frame = requestAnimationFrame(() => { if (active) setReadySrc(src); });
    };
    const showForReducedMotion = () => { if (reducedMotion.matches) setVisibleSrc(src); };
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisibleSrc(src);
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    if (reducedMotion.matches) setVisibleSrc(src);
    else observer.observe(img);
    img.addEventListener('load', markReady);
    img.addEventListener('error', markReady);
    reducedMotion.addEventListener('change', showForReducedMotion);
    if (img.complete) void markReady();
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      img.removeEventListener('load', markReady);
      img.removeEventListener('error', markReady);
      reducedMotion.removeEventListener('change', showForReducedMotion);
    };
  }, [src]);

  const ready = readySrc === src && visibleSrc === src;
  return <img {...props} {...(fetchPriority ? { fetchpriority: fetchPriority } : {})} src={publicAsset(src)} ref={ref}
    className={`image-reveal image-reveal-${variant} ${ready ? 'is-ready' : ''} ${className}`}
    style={{ ...style, '--image-delay': `${revealDelay}ms` } as React.CSSProperties} />;
}
