/**
 * iCook wordmark.
 *
 * The Figma source ships the logo as a flattened raster asset, which doesn't
 * scale and would expire from Figma's CDN. This reproduces the "iCŌŌK"
 * wordmark — the two O's carry the macron/pot-lid bar from the original — as
 * crisp, dependency-free text using the brand font.
 */
export default function Logo({ className }: { className?: string }) {
  return (
    <span
      className={`font-nunito font-extrabold tracking-tight text-brand select-none ${className ?? ""}`}
      aria-label="iCook"
      role="img"
    >
      iCŌŌK
    </span>
  );
}
