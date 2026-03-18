interface LogoProps {
  size?: number;
  glow?: boolean;
}

export function LogoIcon({ size = 48, glow = false }: LogoProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        position: 'relative' as const,
        filter: glow ? `drop-shadow(0 0 ${size * 0.4}px rgba(124, 92, 252, 0.45))` : undefined,
      }}
      dangerouslySetInnerHTML={{
        __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#7c5cfc"/>
              <stop offset="100%" stop-color="#a78bfa"/>
            </linearGradient>
            <linearGradient id="arrowGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="100%" stop-color="#e2d9ff"/>
            </linearGradient>
          </defs>
          <rect x="16" y="16" width="480" height="480" rx="96" ry="96" fill="url(#grad)"/>
          <path d="M256 108 L366 228 L316 228 L316 348 C316 364 304 376 288 376 L224 376 C208 376 196 364 196 348 L196 228 L146 228 Z" fill="url(#arrowGrad)"/>
          <rect x="176" y="392" width="160" height="14" rx="7" fill="rgba(255,255,255,0.5)"/>
        </svg>`,
      }}
    />
  );
}
