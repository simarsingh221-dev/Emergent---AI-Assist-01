export default function FlowLogo({ size = 28, className = "", showWordmark = false, wordmarkClassName = "" }) {
  const gid = `flow-grad-${size}`;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size * (18 / 28)}
        viewBox="0 0 56 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="18" x2="56" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7B61FF" />
            <stop offset="50%" stopColor="#00D4FF" />
            <stop offset="100%" stopColor="#FF4FD8" />
          </linearGradient>
        </defs>
        <path
          d="M2 24 C 10 24, 14 8, 22 8 S 34 24, 42 24 S 54 8, 54 8"
          stroke={`url(#${gid})`}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M2 30 C 10 30, 14 18, 22 18 S 34 30, 42 30 S 54 18, 54 18"
          stroke={`url(#${gid})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />
      </svg>
      {showWordmark && (
        <span className={`font-heading font-bold tracking-tight ${wordmarkClassName}`}>FlowPilot</span>
      )}
    </span>
  );
}
