export function KWCALogo({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="KWCA Logo"
    >
      <circle cx="24" cy="24" r="24" fill="hsl(22, 85%, 57%)" />
      <circle cx="24" cy="24" r="20" fill="hsl(22, 85%, 57%)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      {/* Stylized flower / hibiscus motif */}
      <g transform="translate(24,24)">
        <ellipse cx="0" cy="-8" rx="3.5" ry="6" fill="rgba(255,255,255,0.90)" transform="rotate(0)" />
        <ellipse cx="0" cy="-8" rx="3.5" ry="6" fill="rgba(255,255,255,0.90)" transform="rotate(72)" />
        <ellipse cx="0" cy="-8" rx="3.5" ry="6" fill="rgba(255,255,255,0.90)" transform="rotate(144)" />
        <ellipse cx="0" cy="-8" rx="3.5" ry="6" fill="rgba(255,255,255,0.90)" transform="rotate(216)" />
        <ellipse cx="0" cy="-8" rx="3.5" ry="6" fill="rgba(255,255,255,0.90)" transform="rotate(288)" />
        <circle cx="0" cy="0" r="4" fill="white" />
        <circle cx="0" cy="0" r="2" fill="hsl(22, 85%, 57%)" />
      </g>
    </svg>
  );
}
