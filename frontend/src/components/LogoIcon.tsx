export default function LogoIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="icy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id="wolfFur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="innerEar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>

      {/* Outer icy circle */}
      <circle cx="24" cy="24" r="23" fill="url(#icy)" opacity="0.12" />
      <circle
        cx="24"
        cy="24"
        r="23"
        stroke="url(#icy)"
        strokeWidth="1.5"
        opacity="0.5"
      />

      {/* Snowflakes around */}
      <g opacity="0.5">
        <line x1="6" y1="8" x2="10" y2="12" stroke="#7dd3fc" strokeWidth="1" strokeLinecap="round" />
        <line x1="10" y1="8" x2="6" y2="12" stroke="#7dd3fc" strokeWidth="1" strokeLinecap="round" />
        <line x1="8" y1="6" x2="8" y2="14" stroke="#7dd3fc" strokeWidth="1" strokeLinecap="round" />
        <line x1="4" y1="10" x2="12" y2="10" stroke="#7dd3fc" strokeWidth="1" strokeLinecap="round" />
      </g>
      <g opacity="0.4">
        <line x1="38" y1="7" x2="42" y2="11" stroke="#7dd3fc" strokeWidth="1" strokeLinecap="round" />
        <line x1="42" y1="7" x2="38" y2="11" stroke="#7dd3fc" strokeWidth="1" strokeLinecap="round" />
        <line x1="40" y1="5" x2="40" y2="13" stroke="#7dd3fc" strokeWidth="1" strokeLinecap="round" />
        <line x1="36" y1="9" x2="44" y2="9" stroke="#7dd3fc" strokeWidth="1" strokeLinecap="round" />
      </g>
      <g opacity="0.5">
        <line x1="7" y1="36" x2="11" y2="40" stroke="#7dd3fc" strokeWidth="1" strokeLinecap="round" />
        <line x1="11" y1="36" x2="7" y2="40" stroke="#7dd3fc" strokeWidth="1" strokeLinecap="round" />
        <line x1="9" y1="34" x2="9" y2="42" stroke="#7dd3fc" strokeWidth="1" strokeLinecap="round" />
        <line x1="5" y1="38" x2="13" y2="38" stroke="#7dd3fc" strokeWidth="1" strokeLinecap="round" />
      </g>
      <g opacity="0.4">
        <line x1="37" y1="35" x2="41" y2="39" stroke="#7dd3fc" strokeWidth="1" strokeLinecap="round" />
        <line x1="41" y1="35" x2="37" y2="39" stroke="#7dd3fc" strokeWidth="1" strokeLinecap="round" />
        <line x1="39" y1="33" x2="39" y2="41" stroke="#7dd3fc" strokeWidth="1" strokeLinecap="round" />
        <line x1="35" y1="37" x2="43" y2="37" stroke="#7dd3fc" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* Wolf head */}
      <g transform="translate(24,24)">
        {/* Ears */}
        <path
          d="M-9 -14 L-13 -21 L-6 -17Z"
          fill="url(#wolfFur)"
          stroke="#94a3b8"
          strokeWidth="0.8"
        />
        <path
          d="M9 -14 L13 -21 L6 -17Z"
          fill="url(#wolfFur)"
          stroke="#94a3b8"
          strokeWidth="0.8"
        />
        {/* Inner ears */}
        <path
          d="M-9 -14 L-11.5 -19 L-7.5 -16.5Z"
          fill="url(#innerEar)"
        />
        <path
          d="M9 -14 L11.5 -19 L7.5 -16.5Z"
          fill="url(#innerEar)"
        />

        {/* Head */}
        <path
          d="M-11 -13 C-11 -13 -13 -6 -11 0 C-9 5 -5.5 9 -3.5 11 L-1.5 13 C-0.5 14 0.5 14 1.5 13 L3.5 11 C5.5 9 9 5 11 0 C13 -6 11 -13 11 -13 C11 -17 -11 -17 -11 -13Z"
          fill="url(#wolfFur)"
          stroke="#94a3b8"
          strokeWidth="0.8"
        />

        {/* Cheek fluff */}
        <path
          d="M-11 0 C-13 2 -16 4 -17 2 C-18 0 -16 -2 -13 -3"
          fill="url(#wolfFur)"
          stroke="#94a3b8"
          strokeWidth="0.6"
        />
        <path
          d="M11 0 C13 2 16 4 17 2 C18 0 16 -2 13 -3"
          fill="url(#wolfFur)"
          stroke="#94a3b8"
          strokeWidth="0.6"
        />

        {/* Eyes */}
        <ellipse cx="-4.5" cy="-3.5" rx="2.2" ry="2.5" fill="#0c4a6e" />
        <ellipse cx="4.5" cy="-3.5" rx="2.2" ry="2.5" fill="#0c4a6e" />
        <ellipse cx="-4.5" cy="-3.5" rx="1" ry="1.6" fill="#7dd3fc" />
        <ellipse cx="4.5" cy="-3.5" rx="1" ry="1.6" fill="#7dd3fc" />
        <circle cx="-4" cy="-4.2" r="0.5" fill="white" opacity="0.8" />
        <circle cx="5" cy="-4.2" r="0.5" fill="white" opacity="0.8" />

        {/* Eyebrows */}
        <path d="M-7 -6 C-6 -7.5 -4 -7.5 -2.5 -6.5" stroke="#94a3b8" strokeWidth="0.6" strokeLinecap="round" fill="none" />
        <path d="M7 -6 C6 -7.5 4 -7.5 2.5 -6.5" stroke="#94a3b8" strokeWidth="0.6" strokeLinecap="round" fill="none" />

        {/* Snout */}
        <path
          d="M-3.5 1.5 C-3.5 3.5 -1.5 6 0 7 C1.5 6 3.5 3.5 3.5 1.5Z"
          fill="#e2e8f0"
          stroke="#94a3b8"
          strokeWidth="0.6"
        />

        {/* Nose */}
        <ellipse cx="0" cy="2.5" rx="1.8" ry="1.3" fill="#1e293b" />
        <ellipse cx="-0.5" cy="2" rx="0.4" ry="0.3" fill="#475569" opacity="0.5" />
        <ellipse cx="0.5" cy="2" rx="0.4" ry="0.3" fill="#475569" opacity="0.5" />

        {/* Mouth */}
        <path d="M0 3.8 C-1 4.8 -2 5.3 -3 5.3" stroke="#475569" strokeWidth="0.6" strokeLinecap="round" fill="none" />
        <path d="M0 3.8 C1 4.8 2 5.3 3 5.3" stroke="#475569" strokeWidth="0.6" strokeLinecap="round" fill="none" />

        {/* Snow on head */}
        <path
          d="M-7 -13 C-5 -14 -3 -14 -1 -13 C1 -14 3 -14 5 -13 C7 -14 9 -13 9 -13"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        {/* Snow dots */}
        <circle cx="-3" cy="-14.5" r="0.8" fill="white" opacity="0.8" />
        <circle cx="1" cy="-15" r="1" fill="white" opacity="0.7" />
        <circle cx="5" cy="-14.5" r="0.8" fill="white" opacity="0.8" />
      </g>
    </svg>
  )
}
