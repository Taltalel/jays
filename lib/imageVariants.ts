/**
 * Generated responsive-image manifest. Maps an original /venues image to the
 * widths available as pre-generated variants (e.g. foo.webp -> foo-640w.webp)
 * plus the intrinsic width of the original, so srcset descriptors are honest.
 */
export const IMAGE_VARIANTS: Record<string, { widths: number[]; full: number }> = {
  "/venues/engraving-riviera.webp": {
    "widths": [
      640
    ],
    "full": 700
  },
  "/venues/highbar-hero.webp": {
    "widths": [
      640
    ],
    "full": 705
  },
  "/venues/jays-bar.webp": {
    "widths": [
      640
    ],
    "full": 683
  },
  "/venues/jays-cocktail.webp": {
    "widths": [
      640,
      1024
    ],
    "full": 1400
  },
  "/venues/jays-hero.webp": {
    "widths": [
      640,
      1024
    ],
    "full": 1700
  },
  "/venues/jays-interior.webp": {
    "widths": [
      640,
      1024
    ],
    "full": 1700
  },
  "/venues/jays-lobster.webp": {
    "widths": [
      640,
      1024
    ],
    "full": 1400
  },
  "/venues/jays-rawbar.webp": {
    "widths": [
      640,
      1024
    ],
    "full": 1400
  },
  "/venues/jays-seafood.webp": {
    "widths": [
      640,
      1024
    ],
    "full": 1400
  },
  "/venues/jays-tomahawk.webp": {
    "widths": [
      640,
      1024
    ],
    "full": 1500
  },
  "/venues/naked-taco-hero.webp": {
    "widths": [
      640
    ],
    "full": 705
  },
  "/venues/riviera-hero.webp": {
    "widths": [
      640
    ],
    "full": 705
  }
};

/** Build a srcset for an image when variants exist; undefined otherwise. */
export function srcSetFor(src: string): string | undefined {
  const entry = IMAGE_VARIANTS[src];
  if (!entry || entry.widths.length === 0) return undefined;
  const stem = src.replace(/\.webp$/, "");
  const parts = entry.widths.map((w) => stem + '-' + w + 'w.webp ' + w + 'w');
  parts.push(src + ' ' + entry.full + 'w');
  return parts.join(", ");
}
