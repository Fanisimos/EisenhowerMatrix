import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Path } from 'react-native-svg';

interface LogoProps {
  size?: number;
  glow?: boolean;
}

export function LogoIcon({ size = 48, glow = false }: LogoProps) {
  return (
    <View
      style={
        glow
          ? { shadowColor: '#7c5cfc', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: size * 0.4, elevation: 20 }
          : undefined
      }
    >
      <Svg viewBox="0 0 512 512" width={size} height={size}>
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#7c5cfc" />
            <Stop offset="100%" stopColor="#a78bfa" />
          </LinearGradient>
          <LinearGradient id="arrowGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <Stop offset="0%" stopColor="#ffffff" />
            <Stop offset="100%" stopColor="#e2d9ff" />
          </LinearGradient>
        </Defs>
        <Rect x="16" y="16" width="480" height="480" rx="96" ry="96" fill="url(#grad)" />
        <Path
          d="M256 108 L366 228 L316 228 L316 348 C316 364 304 376 288 376 L224 376 C208 376 196 364 196 348 L196 228 L146 228 Z"
          fill="url(#arrowGrad)"
        />
        <Rect x="176" y="392" width="160" height="14" rx="7" fill="rgba(255,255,255,0.5)" />
      </Svg>
    </View>
  );
}
