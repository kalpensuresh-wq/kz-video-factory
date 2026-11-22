import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Composition,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ThemeName = 'dark_luxe' | 'editorial_cream' | 'kinetic_yellow' | 'fintech_purple';
export type CharacterMood = 'sad' | 'thinking' | 'shock' | 'happy' | 'confident';

export interface SceneItem {
  type:
    | 'story_hook'
    | 'phone_statement'
    | 'slot_spin'
    | 'crash_flight'
    | 'money_rain'
    | 'compare_bars'
    | 'kinetic_statement'
    | 'outro_cta';
  duration?: number; // weight in seconds (auto-scaled to exact voiceover duration)
  // Common / Hook
  badge?: string;
  title?: string;
  subtitle?: string;
  highlight?: string;
  strikeText?: string;
  mood?: CharacterMood;
  reaction?: string;
  outfitColor?: string;
  // Phone statement
  headerTitle?: string;
  headerAmount?: string;
  headerSub?: string;
  rows?: Array<{ title: string; sub: string; amount: string; positive?: boolean }>;
  totalLabel?: string;
  totalAmount?: string;
  // Slot spin
  betAmount?: string;
  winMultiplier?: string;
  symbol?: '7' | 'diamond' | 'coin';
  winBanner?: string;
  // Crash flight
  from?: number;
  to?: number;
  earlyExitAt?: number;
  earlyExitLabel?: string;
  // Money rain
  startAmount?: number;
  winAmount?: number;
  pushes?: Array<{ title: string; value: string; accent?: 'green' | 'gold' }>;
  // Compare bars
  items?: Array<{ label: string; valueText: string; percent: number; color?: string; winner?: boolean }>;
  // Kinetic statement
  lines?: string[];
  stamp?: string;
  footer?: string;
  // Outro
  cta?: string;
}

export interface VideoProps {
  config: {
    id: number;
    theme?: ThemeName | string;
    sticker: { code: string; label: string; showAtSec?: number };
    scenes?: SceneItem[];
    story?: any; // backward compatibility
  };
  subsKz: string;
  hasAudio?: boolean;
  durationInFrames?: number;
}

// ============================================================================
// THEME PALETTES
// ============================================================================

interface ThemePalette {
  isLight: boolean;
  bg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textMuted: string;
  accent: string;
  accentSecondary: string;
  danger: string;
  success: string;
  gridColor: string;
}

const getTheme = (name?: string): ThemePalette => {
  switch (name) {
    case 'editorial_cream':
      return {
        isLight: true,
        bg: '#F6F1E7',
        cardBg: '#FFFFFF',
        cardBorder: '#111827',
        textPrimary: '#111827',
        textMuted: '#4B5563',
        accent: '#EAB308',
        accentSecondary: '#0D9488',
        danger: '#DC2626',
        success: '#16A34A',
        gridColor: 'rgba(17, 24, 39, 0.08)',
      };
    case 'kinetic_yellow':
      return {
        isLight: true,
        bg: '#FACC15',
        cardBg: '#111827',
        cardBorder: '#111827',
        textPrimary: '#111827',
        textMuted: '#1F2937',
        accent: '#EC4899',
        accentSecondary: '#2563EB',
        danger: '#DC2626',
        success: '#16A34A',
        gridColor: 'rgba(17, 24, 39, 0.09)',
      };
    case 'fintech_purple':
      return {
        isLight: false,
        bg: 'linear-gradient(160deg, #1E1B4B 0%, #31104F 52%, #090D1A 100%)',
        cardBg: 'rgba(30, 27, 75, 0.72)',
        cardBorder: 'rgba(216, 180, 254, 0.28)',
        textPrimary: '#F8FAFC',
        textMuted: '#CBD5E1',
        accent: '#F472B6',
        accentSecondary: '#38BDF8',
        danger: '#F87171',
        success: '#4ADE80',
        gridColor: 'rgba(216, 180, 254, 0.1)',
      };
    default:
      return {
        isLight: false,
        bg: 'radial-gradient(circle at 50% 25%, #131C31 0%, #060913 100%)',
        cardBg: 'rgba(15, 23, 42, 0.82)',
        cardBorder: 'rgba(255, 255, 255, 0.14)',
        textPrimary: '#F8FAFC',
        textMuted: '#94A3B8',
        accent: '#FACC15',
        accentSecondary: '#38BDF8',
        danger: '#EF4444',
        success: '#4ADE80',
        gridColor: 'rgba(148, 163, 184, 0.12)',
      };
  }
};

// ============================================================================
// AMBIENT LAYER & CAMERA RIG
// ============================================================================

const SceneCanvas: React.FC<{
  theme: ThemePalette;
  shake?: boolean;
  shakeAt?: number;
  flashAt?: number;
  bgOverride?: string;
  children: React.ReactNode;
}> = ({ theme, shake = false, shakeAt = 0, flashAt, bgOverride, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.045], { extrapolateRight: 'clamp' });
  const gridShift = (frame * 0.7) % 72;

  const inShake = shake && frame >= shakeAt && frame < shakeAt + 20;
  const sFactor = inShake ? 20 - (frame - shakeAt) : 0;
  const shakeX = inShake ? Math.sin(frame * 3.4) * sFactor * 1.15 : 0;
  const shakeY = inShake ? Math.cos(frame * 4.1) * sFactor * 0.85 : 0;

  const enterFlash = interpolate(frame, [0, 7], [0.22, 0], { extrapolateRight: 'clamp' });
  const climaxFlash =
    flashAt !== undefined && frame >= flashAt
      ? interpolate(frame, [flashAt, flashAt + 12], [0.6, 0], { extrapolateRight: 'clamp' })
      : 0;

  return (
    <AbsoluteFill
      style={{
        background: bgOverride || theme.bg,
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Subtle moving background grid */}
      <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, opacity: 0.9 }}>
        <defs>
          <pattern
            id="masterGrid"
            width="72"
            height="72"
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(0, ${gridShift})`}
          >
            <path d="M 72 0 L 0 0 0 72" fill="none" stroke={theme.gridColor} strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#masterGrid)" />
      </svg>

      {/* Ambient glow orbs for dark themes */}
      {!theme.isLight && (
        <>
          <div
            style={{
              position: 'absolute',
              left: `${50 + Math.sin(frame / 38) * 24}%`,
              top: '22%',
              width: 780,
              height: 780,
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${theme.accentSecondary}26 0%, transparent 70%)`,
              filter: 'blur(45px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: '-15%',
              bottom: '12%',
              width: 680,
              height: 680,
              background: `radial-gradient(circle, ${theme.accent}1F 0%, transparent 70%)`,
              filter: 'blur(50px)',
            }}
          />
        </>
      )}

      {/* Main Camera-controlled content */}
      <AbsoluteFill style={{ transform: `scale(${zoom}) translate(${shakeX}px, ${shakeY}px)` }}>
        {children}
      </AbsoluteFill>

      {/* Soft vignette */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background: theme.isLight
            ? 'radial-gradient(circle, transparent 58%, rgba(17,24,39,0.12) 100%)'
            : 'radial-gradient(circle, transparent 48%, rgba(2,6,23,0.62) 100%)',
        }}
      />

      {enterFlash > 0 && (
        <AbsoluteFill style={{ backgroundColor: theme.isLight ? '#FFFFFF' : theme.accentSecondary, opacity: enterFlash }} />
      )}
      {climaxFlash > 0 && (
        <AbsoluteFill style={{ backgroundColor: '#FEF08A', opacity: climaxFlash }} />
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// VECTOR PRIMITIVES (ZERO EMOJIS)
// ============================================================================

const CharacterSVG: React.FC<{
  mood: CharacterMood;
  scale?: number;
  outfitColor?: string;
  reaction?: string;
}> = ({ mood, scale = 1, outfitColor, reaction }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const breathe = Math.sin(frame / 11) * 4;
  const blink = frame % 95 > 90;
  const armWave = mood === 'happy' || mood === 'confident' ? Math.sin(frame / 5) * 14 : 0;
  const hoodie =
    outfitColor ||
    (mood === 'sad' ? '#475569' : mood === 'shock' ? '#DC2626' : mood === 'thinking' ? '#6366F1' : '#2563EB');

  const bubbleScale = reaction ? spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 11 } }) : 0;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      {reaction && (
        <div
          style={{
            transform: `scale(${bubbleScale}) rotate(-2deg)`,
            marginBottom: -12,
            zIndex: 2,
            background: mood === 'sad' ? '#EF4444' : mood === 'shock' ? '#FACC15' : '#4ADE80',
            color: mood === 'sad' ? '#FFFFFF' : '#0F172A',
            border: '4px solid #0F172A',
            borderRadius: 999,
            padding: '10px 26px',
            fontSize: 30,
            fontWeight: 900,
            boxShadow: '0 8px 0 #0F172A',
            whiteSpace: 'nowrap',
          }}
        >
          {reaction}
        </div>
      )}

      <svg
        width={330 * scale}
        height={365 * scale}
        viewBox="0 0 340 380"
        style={{ overflow: 'visible', transform: `translateY(${breathe}px)` }}
      >
        <ellipse cx="170" cy="360" rx="96" ry="18" fill="rgba(0,0,0,0.35)" />

        {/* Hoodie / Torso */}
        <path
          d="M 85 350 C 85 245, 108 215, 170 215 C 232 215, 255 245, 255 350 Z"
          fill={hoodie}
          stroke="#0F172A"
          strokeWidth="6"
        />
        <line x1="152" y1="232" x2="148" y2="282" stroke="#F8FAFC" strokeWidth="5" strokeLinecap="round" />
        <line x1="188" y1="232" x2="192" y2="282" stroke="#F8FAFC" strokeWidth="5" strokeLinecap="round" />

        {/* Arms */}
        {mood === 'sad' && (
          <>
            <path d="M 95 255 Q 60 302 92 336" fill="none" stroke={hoodie} strokeWidth="26" strokeLinecap="round" />
            <path d="M 245 255 Q 280 302 248 336" fill="none" stroke={hoodie} strokeWidth="26" strokeLinecap="round" />
          </>
        )}
        {mood === 'thinking' && (
          <>
            <path d="M 95 255 Q 62 300 94 332" fill="none" stroke={hoodie} strokeWidth="26" strokeLinecap="round" />
            <path d="M 245 255 Q 272 225 210 188" fill="none" stroke={hoodie} strokeWidth="24" strokeLinecap="round" />
            <circle cx="206" cy="186" r="16" fill="#FDBA74" stroke="#0F172A" strokeWidth="5" />
          </>
        )}
        {(mood === 'shock' || mood === 'happy' || mood === 'confident') && (
          <>
            <path
              d={`M 95 255 Q 45 ${202 - armWave} 55 ${142 - armWave}`}
              fill="none"
              stroke={hoodie}
              strokeWidth="26"
              strokeLinecap="round"
            />
            <circle cx="55" cy={136 - armWave} r="17" fill="#FDBA74" stroke="#0F172A" strokeWidth="5" />
            <path
              d={`M 245 255 Q 295 ${202 + armWave} 285 ${142 + armWave}`}
              fill="none"
              stroke={hoodie}
              strokeWidth="26"
              strokeLinecap="round"
            />
            <circle cx="285" cy={136 + armWave} r="17" fill="#FDBA74" stroke="#0F172A" strokeWidth="5" />
          </>
        )}

        {/* Head */}
        <circle cx="170" cy="130" r="82" fill="#FDBA74" stroke="#0F172A" strokeWidth="6" />
        {/* Hair */}
        <path
          d="M 88 122 C 92 48, 248 48, 252 122 C 232 95, 195 85, 170 88 C 135 88, 108 100, 88 122 Z"
          fill="#1E293B"
          stroke="#0F172A"
          strokeWidth="5"
        />

        {/* Eyes */}
        {blink && mood !== 'shock' ? (
          <>
            <line x1="126" y1="130" x2="150" y2="130" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
            <line x1="190" y1="130" x2="214" y2="130" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
          </>
        ) : mood === 'shock' ? (
          <>
            <circle cx="138" cy="128" r="18" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
            <circle cx="138" cy="128" r="7" fill="#0F172A" />
            <circle cx="202" cy="128" r="18" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
            <circle cx="202" cy="128" r="7" fill="#0F172A" />
          </>
        ) : mood === 'confident' ? (
          <>
            {/* Sunglasses */}
            <rect x="108" y="112" width="54" height="34" rx="10" fill="#0F172A" stroke="#FACC15" strokeWidth="3" />
            <rect x="178" y="112" width="54" height="34" rx="10" fill="#0F172A" stroke="#FACC15" strokeWidth="3" />
            <line x1="162" y1="126" x2="178" y2="126" stroke="#FACC15" strokeWidth="4" />
          </>
        ) : (
          <>
            <circle cx="138" cy="130" r="11" fill="#0F172A" />
            <circle cx="142" cy="126" r="3.5" fill="#FFFFFF" />
            <circle cx="202" cy="130" r="11" fill="#0F172A" />
            <circle cx="206" cy="126" r="3.5" fill="#FFFFFF" />
          </>
        )}

        {/* Brows */}
        {mood === 'sad' && (
          <>
            <path d="M 118 112 L 152 104" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
            <path d="M 222 112 L 188 104" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
            <path d="M 236 112 Q 248 130 236 138 Q 224 130 236 112 Z" fill="#38BDF8" />
          </>
        )}
        {mood === 'thinking' && (
          <>
            <path d="M 120 108 L 154 108" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
            <path d="M 186 102 Q 204 92 222 104" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
          </>
        )}
        {mood === 'shock' && (
          <>
            <path d="M 118 96 Q 138 82 156 96" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
            <path d="M 184 96 Q 202 82 222 96" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
          </>
        )}
        {(mood === 'happy' || mood === 'confident') && (
          <>
            <path d="M 120 104 Q 138 95 155 104" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
            <path d="M 185 104 Q 202 95 220 104" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
          </>
        )}

        {/* Mouth */}
        {mood === 'sad' && (
          <path d="M 145 178 Q 170 158 195 178" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
        )}
        {mood === 'thinking' && (
          <path d="M 150 172 Q 170 168 190 174" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
        )}
        {mood === 'shock' && (
          <ellipse cx="170" cy="175" rx="18" ry="22" fill="#991B1B" stroke="#0F172A" strokeWidth="5" />
        )}
        {(mood === 'happy' || mood === 'confident') && (
          <path
            d="M 136 162 Q 170 202 204 162 Z"
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth="5"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
};

const BanknoteSVG: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg width="210" height="105" viewBox="0 0 210 105" style={style}>
    <rect x="4" y="4" width="202" height="97" rx="12" fill="#16A34A" stroke="#052E16" strokeWidth="4" />
    <rect x="14" y="14" width="182" height="77" rx="6" fill="none" stroke="#86EFAC" strokeWidth="2.5" strokeDasharray="6 4" />
    <circle cx="105" cy="52" r="28" fill="#15803D" stroke="#FACC15" strokeWidth="3" />
    <text x="105" y="61" textAnchor="middle" fill="#FACC15" fontSize="28" fontWeight="900">
      ₸
    </text>
    <text x="24" y="34" fill="#DCFCE7" fontSize="16" fontWeight="900">
      20 000
    </text>
    <text x="186" y="84" textAnchor="end" fill="#DCFCE7" fontSize="16" fontWeight="900">
      20 000
    </text>
  </svg>
);

const CoinSVG: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 78, style }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" style={style}>
    <circle cx="40" cy="40" r="36" fill="#FACC15" stroke="#B45309" strokeWidth="5" />
    <circle cx="40" cy="40" r="27" fill="none" stroke="#FEF08A" strokeWidth="3" />
    <text x="40" y="51" textAnchor="middle" fill="#92400E" fontSize="34" fontWeight="900">
      ₸
    </text>
  </svg>
);

const SlotSymbol: React.FC<{ kind: '7' | 'diamond' | 'bar' | 'coin' }> = ({ kind }) => {
  if (kind === '7') {
    return (
      <svg width="110" height="110" viewBox="0 0 110 110">
        <defs>
          <linearGradient id="sevenGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
        </defs>
        <text x="55" y="88" textAnchor="middle" fontSize="94" fontWeight="900" fill="url(#sevenGrad)" stroke="#FFFFFF" strokeWidth="4">
          7
        </text>
      </svg>
    );
  }
  if (kind === 'diamond') {
    return (
      <svg width="96" height="96" viewBox="0 0 100 100">
        <polygon points="50,10 88,38 50,90 12,38" fill="#38BDF8" stroke="#E0F2FE" strokeWidth="4" />
        <polygon points="50,10 70,38 50,90 30,38" fill="#0284C7" opacity="0.6" />
      </svg>
    );
  }
  if (kind === 'coin') {
    return <CoinSVG size={86} />;
  }
  return (
    <div
      style={{
        background: '#7C3AED',
        border: '4px solid #DDD6FE',
        borderRadius: 14,
        padding: '10px 18px',
        color: '#FFFFFF',
        fontSize: 34,
        fontWeight: 900,
      }}
    >
      x100
    </div>
  );
};

// ============================================================================
// 8 MODULAR SCENE COMPONENTS
// ============================================================================

// 1. STORY HOOK (Point A / Pain / Big Stat + Character)
const SceneStoryHook: React.FC<{ scene: SceneItem; theme: ThemePalette }> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop1 = spring({ frame, fps, config: { damping: 14 } });
  const pop2 = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 12 } });
  const strikeDash = interpolate(frame, [26, 46], [420, 0], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <SceneCanvas theme={theme}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '120px 60px 260px',
          textAlign: 'center',
        }}
      >
        {scene.badge && (
          <div
            style={{
              transform: `scale(${pop1})`,
              background: theme.isLight ? '#111827' : `${theme.danger}24`,
              border: `2.5px solid ${theme.isLight ? '#111827' : theme.danger}`,
              color: theme.isLight ? '#FACC15' : '#FCA5A5',
              padding: '10px 28px',
              borderRadius: 999,
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: 1.5,
              marginBottom: 24,
            }}
          >
            {scene.badge}
          </div>
        )}

        <div
          style={{
            transform: `translateY(${interpolate(pop1, [0, 1], [35, 0])}px)`,
            fontSize: 60,
            fontWeight: 900,
            color: theme.textPrimary,
            lineHeight: 1.15,
            maxWidth: 940,
          }}
        >
          {scene.title || 'Смена 12 часов. До зарплаты неделя.'}
        </div>

        {(scene.highlight || scene.strikeText) && (
          <div
            style={{
              marginTop: 32,
              transform: `scale(${pop2})`,
              background: theme.cardBg,
              border: `3px solid ${theme.isLight ? '#111827' : theme.danger}`,
              borderRadius: 30,
              padding: '26px 48px',
              boxShadow: theme.isLight ? '0 12px 0 #111827' : '0 22px 55px rgba(0,0,0,0.55)',
              position: 'relative',
            }}
          >
            {scene.subtitle && (
              <div style={{ fontSize: 26, color: theme.textMuted, fontWeight: 700, marginBottom: 6 }}>
                {scene.subtitle}
              </div>
            )}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <span
                style={{
                  fontSize: 92,
                  fontWeight: 900,
                  color: scene.strikeText ? theme.textPrimary : theme.danger,
                  lineHeight: 1.05,
                }}
              >
                {scene.highlight || scene.strikeText}
              </span>
              {scene.strikeText && (
                <svg
                  width="100%"
                  height="80"
                  viewBox="0 0 360 80"
                  preserveAspectRatio="none"
                  style={{ position: 'absolute', left: -10, top: 10, width: '108%' }}
                >
                  <path
                    d="M 8 66 Q 180 28 352 12"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray="420"
                    strokeDashoffset={strikeDash}
                  />
                </svg>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: 30 }}>
          <CharacterSVG
            mood={scene.mood || 'sad'}
            scale={1.04}
            outfitColor={scene.outfitColor}
            reaction={scene.reaction}
          />
        </div>
      </div>
    </SceneCanvas>
  );
};

// 2. PHONE STATEMENT (Banking App Feed + Marker Circle + Arrow to Total)
const ScenePhoneStatement: React.FC<{ scene: SceneItem; theme: ThemePalette }> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phonePop = spring({ frame, fps, config: { damping: 14 } });
  const circleDash = interpolate(frame, [28, 52], [900, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const totalPop = spring({ frame: Math.max(0, frame - 42), fps, config: { damping: 11 } });

  const rows = scene.rows || [
    { title: 'Пополнение карты', sub: 'Сегодня, 22:14', amount: '+350 000 ₸', positive: true },
    { title: 'Пополнение карты', sub: 'Сегодня, 22:09', amount: '+220 000 ₸', positive: true },
    { title: 'Пополнение карты', sub: 'Сегодня, 21:58', amount: '+180 000 ₸', positive: true },
    { title: 'Ставка старт', sub: 'Сегодня, 21:45', amount: '-5 000 ₸', positive: false },
  ];

  return (
    <SceneCanvas theme={theme}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '90px 50px 240px',
        }}
      >
        {scene.title && (
          <div
            style={{
              background: '#FFFFFF',
              color: '#0F172A',
              border: '4px solid #0F172A',
              borderRadius: 24,
              padding: '18px 34px',
              fontSize: 44,
              fontWeight: 900,
              textAlign: 'center',
              marginBottom: 28,
              boxShadow: '0 10px 0 rgba(0,0,0,0.28)',
              maxWidth: 920,
            }}
          >
            {scene.title}
          </div>
        )}

        {/* Smartphone Frame */}
        <div
          style={{
            width: 740,
            background: '#FFFFFF',
            borderRadius: 52,
            border: '14px solid #0F172A',
            overflow: 'hidden',
            transform: `scale(${phonePop}) rotate(-2deg)`,
            boxShadow: '0 32px 70px rgba(0,0,0,0.55)',
            position: 'relative',
          }}
        >
          {/* App Header */}
          <div style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', padding: '34px 36px 28px', color: '#FFFFFF' }}>
            <div style={{ width: 140, height: 18, background: '#0F172A', borderRadius: 99, margin: '0 auto 18px' }} />
            <div style={{ fontSize: 24, opacity: 0.9, fontWeight: 700 }}>{scene.headerTitle || 'Выписка по счёту'}</div>
            <div style={{ fontSize: 64, fontWeight: 900, marginTop: 4 }}>{scene.headerAmount || '+750 000 ₸'}</div>
            <div style={{ fontSize: 22, opacity: 0.85, marginTop: 2 }}>{scene.headerSub || 'За последние 30 минут'}</div>
          </div>

          {/* Transaction rows */}
          <div style={{ padding: '20px 26px', background: '#F8FAFC', position: 'relative' }}>
            {rows.slice(0, 4).map((r, i) => {
              const rowEnter = spring({ frame: Math.max(0, frame - 8 - i * 6), fps, config: { damping: 14 } });
              return (
                <div
                  key={i}
                  style={{
                    transform: `translateX(${interpolate(rowEnter, [0, 1], [-40, 0])}px)`,
                    opacity: rowEnter,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '18px 18px',
                    marginBottom: 12,
                    borderRadius: 18,
                    background: i < 3 ? '#FEF9C3' : '#FFFFFF',
                    border: '2px solid #E2E8F0',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{r.title}</div>
                    <div style={{ fontSize: 20, color: '#64748B', fontWeight: 600 }}>{r.sub}</div>
                  </div>
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 900,
                      color: r.positive ? '#16A34A' : '#DC2626',
                    }}
                  >
                    {r.amount}
                  </div>
                </div>
              );
            })}

            {/* Animated hand-drawn red marker oval around amounts */}
            <svg
              width="290"
              height="340"
              viewBox="0 0 290 340"
              style={{ position: 'absolute', right: 16, top: 10, pointerEvents: 'none' }}
            >
              <ellipse
                cx="145"
                cy="160"
                rx="126"
                ry="142"
                fill="none"
                stroke="#EF4444"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray="900"
                strokeDashoffset={circleDash}
              />
            </svg>
          </div>
        </div>

        {/* Bottom total pill */}
        <div
          style={{
            marginTop: -24,
            zIndex: 4,
            transform: `scale(${totalPop}) rotate(1.5deg)`,
            background: '#EF4444',
            color: '#FFFFFF',
            border: '5px solid #FFFFFF',
            borderRadius: 28,
            padding: '18px 46px',
            textAlign: 'center',
            boxShadow: '0 20px 45px rgba(239,68,68,0.55)',
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 800, opacity: 0.92 }}>{scene.totalLabel || 'ИТОГО ЗА ВЕЧЕР'}</div>
          <div style={{ fontSize: 68, fontWeight: 900, lineHeight: 1.05 }}>{scene.totalAmount || '+750 000 ₸'}</div>
        </div>
      </div>
    </SceneCanvas>
  );
};

// 3. SLOT SPIN (3-Reel Animated Slot + Win Line + Screen Shake + MEGA WIN)
const SceneSlotSpin: React.FC<{ scene: SceneItem; theme: ThemePalette }> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const stop1 = Math.round(durationInFrames * 0.34);
  const stop2 = Math.round(durationInFrames * 0.50);
  const stop3 = Math.round(durationInFrames * 0.66);
  const stopFrames = [stop1, stop2, stop3];
  const isWin = frame >= stop3 + 2;

  const winPop = isWin ? spring({ frame: frame - stop3 - 2, fps, config: { damping: 10 } }) : 0;
  const winSymbol = scene.symbol || '7';
  const reelStrip: Array<'7' | 'diamond' | 'bar' | 'coin'> = ['diamond', 'bar', 'coin', '7', 'diamond', 'coin', 'bar', '7'];

  return (
    <SceneCanvas
      theme={theme}
      shake={true}
      shakeAt={stop3 + 2}
      flashAt={stop3 + 2}
      bgOverride={
        isWin
          ? 'radial-gradient(circle at 50% 45%, #451A03 0%, #070B14 80%)'
          : 'radial-gradient(circle at 50% 45%, #1E1B4B 0%, #070B14 85%)'
      }
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '80px 45px 240px',
        }}
      >
        <div
          style={{
            marginBottom: 28,
            background: 'rgba(15, 23, 42, 0.88)',
            border: '2.5px solid #FACC15',
            borderRadius: 999,
            padding: '12px 34px',
            fontSize: 34,
            fontWeight: 900,
            color: '#FACC15',
          }}
        >
          СТАВКА: {scene.betAmount || '1 000 ₸'}
        </div>

        <div
          style={{
            width: 940,
            background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
            border: isWin ? '6px solid #FACC15' : '6px solid #6366F1',
            borderRadius: 42,
            padding: '34px 30px',
            boxShadow: isWin ? '0 0 90px rgba(250, 204, 21, 0.55)' : '0 30px 70px rgba(0,0,0,0.65)',
          }}
        >
          {/* Marquee Bulbs */}
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 24 }}>
            {Array.from({ length: 9 }).map((_, i) => {
              const lit = (Math.floor(frame / 4) + i) % 2 === 0;
              return (
                <div
                  key={i}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: lit ? '#FACC15' : '#475569',
                    boxShadow: lit ? '0 0 18px #FACC15' : 'none',
                  }}
                />
              );
            })}
          </div>

          {/* 3 Reels */}
          <div
            style={{
              display: 'flex',
              gap: 20,
              background: '#020617',
              borderRadius: 26,
              padding: 20,
              border: '4px solid #334155',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {stopFrames.map((stopF, idx) => {
              const stopped = frame >= stopF;
              const spinY = (frame * (46 + idx * 7)) % 420;
              const bounce = stopped
                ? interpolate(spring({ frame: frame - stopF, fps, config: { damping: 8 } }), [0, 1], [28, 0])
                : 0;

              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: 350,
                    background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
                    borderRadius: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    border: stopped ? '3px solid #FACC15' : '2px solid #334155',
                  }}
                >
                  {stopped ? (
                    <div style={{ transform: `translateY(${bounce}px) scale(1.25)` }}>
                      <SlotSymbol kind={winSymbol} />
                    </div>
                  ) : (
                    <div style={{ transform: `translateY(${spinY - 210}px)`, filter: 'blur(3px)' }}>
                      {reelStrip.map((s, k) => (
                        <div key={k} style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <SlotSymbol kind={s} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isWin && (
              <div
                style={{
                  position: 'absolute',
                  left: 14,
                  right: 14,
                  top: '50%',
                  height: 10,
                  transform: 'translateY(-50%)',
                  background: '#FACC15',
                  boxShadow: '0 0 25px #FACC15',
                  borderRadius: 6,
                }}
              />
            )}
          </div>

          <div
            style={{
              marginTop: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 26px',
              background: '#020617',
              borderRadius: 18,
            }}
          >
            <div style={{ fontSize: 30, fontWeight: 800, color: '#94A3B8' }}>МНОЖИТЕЛЬ</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: isWin ? '#4ADE80' : '#F8FAFC' }}>
              {isWin ? scene.winMultiplier || 'x850' : 'x1.0'}
            </div>
          </div>
        </div>

        {isWin && (
          <div
            style={{
              marginTop: 32,
              transform: `scale(${winPop})`,
              background: 'linear-gradient(90deg, #F59E0B, #FACC15, #F59E0B)',
              color: '#0F172A',
              padding: '18px 50px',
              borderRadius: 24,
              fontSize: 60,
              fontWeight: 900,
              boxShadow: '0 0 50px rgba(250, 204, 21, 0.8)',
            }}
          >
            {scene.winBanner || `MEGA WIN ${scene.winMultiplier || 'x850'}!`}
          </div>
        )}
      </div>
    </SceneCanvas>
  );
};

// 4. CRASH FLIGHT (Live Multiplier + Rising Neon Curve + Vector Rocket)
const SceneCrashFlight: React.FC<{ scene: SceneItem; theme: ThemePalette }> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const from = scene.from ?? 1.0;
  const to = scene.to ?? 180;
  const progress = interpolate(frame, [6, durationInFrames - 12], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const currentX = from + (to - from) * progress;
  const pathLen = 1100;
  const tipX = interpolate(progress, [0, 1], [60, 820]);
  const tipY = interpolate(progress, [0, 1], [420, 42]);

  return (
    <SceneCanvas
      theme={theme}
      shake={true}
      shakeAt={Math.round(durationInFrames * 0.78)}
      bgOverride="radial-gradient(circle at 50% 45%, #0F172A 0%, #020617 90%)"
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '80px 50px 240px',
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 800, color: '#38BDF8', letterSpacing: 2 }}>
          {scene.title || 'КОЭФФИЦИЕНТ РАСТЁТ'}
        </div>

        <div
          style={{
            fontSize: 168,
            fontWeight: 900,
            color: progress > 0.7 ? '#FACC15' : '#38BDF8',
            textShadow: `0 0 55px ${progress > 0.7 ? 'rgba(250,204,21,0.75)' : 'rgba(56,189,248,0.75)'}`,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1.05,
            marginTop: 10,
          }}
        >
          x{currentX.toFixed(1)}
        </div>

        <div
          style={{
            marginTop: 28,
            width: 920,
            background: 'rgba(15, 23, 42, 0.84)',
            border: '2px solid rgba(56, 189, 248, 0.35)',
            borderRadius: 34,
            padding: '28px 24px',
            boxShadow: '0 25px 65px rgba(0,0,0,0.6)',
          }}
        >
          <svg width="872" height="460" viewBox="0 0 880 460">
            {/* Horizontal grid lines */}
            {[110, 210, 310, 410].map((y) => (
              <line key={y} x1="40" y1={y} x2="840" y2={y} stroke="rgba(148,163,184,0.16)" strokeWidth="2" />
            ))}

            {/* Glowing curve */}
            <path
              d="M 60 420 Q 480 400 820 42"
              fill="none"
              stroke={progress > 0.7 ? '#FACC15' : '#38BDF8'}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={pathLen}
              strokeDashoffset={pathLen * (1 - progress)}
              style={{ filter: 'drop-shadow(0 0 18px rgba(56,189,248,0.85))' }}
            />

            {/* Early exit marker */}
            {scene.earlyExitLabel && progress > 0.25 && (
              <g>
                <circle cx="240" cy="396" r="11" fill="#EF4444" stroke="#FFFFFF" strokeWidth="3" />
                <rect x="130" y="328" width="230" height="48" rx="12" fill="rgba(239,68,68,0.9)" />
                <text x="245" y="360" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="800">
                  {scene.earlyExitLabel}
                </text>
              </g>
            )}

            {/* Vector Rocket Tip */}
            <g transform={`translate(${tipX}, ${tipY}) rotate(-38)`}>
              <polygon points="0,-24 18,16 0,6 -18,16" fill="#FACC15" stroke="#FFFFFF" strokeWidth="3" />
              <circle cx="0" cy="-2" r="5" fill="#0F172A" />
            </g>
          </svg>
        </div>
      </div>
    </SceneCanvas>
  );
};

// 5. MONEY RAIN (Banknotes + Coins + Staggered Bank Pushes + Rolling Counter + Character)
const SceneMoneyRain: React.FC<{ scene: SceneItem; theme: ThemePalette }> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const startVal = scene.startAmount ?? 5000;
  const endVal = scene.winAmount ?? 850000;
  const counter = Math.round(
    interpolate(frame, [0, Math.max(25, durationInFrames * 0.65)], [startVal, endVal], {
      easing: Easing.out(Easing.cubic),
      extrapolateRight: 'clamp',
    })
  );

  const pushes = scene.pushes || [
    { title: 'Зачисление на карту • сейчас', value: `+${endVal.toLocaleString('ru-RU')} ₸`, accent: 'green' as const },
    { title: 'Вывод одобрен мгновенно', value: 'ГОТОВО', accent: 'gold' as const },
  ];

  return (
    <SceneCanvas
      theme={theme}
      shake={true}
      shakeAt={0}
      bgOverride="radial-gradient(circle at 50% 35%, #064E3B 0%, #070B14 82%)"
    >
      {/* Falling Banknotes & Coins */}
      {Array.from({ length: 14 }).map((_, i) => {
        const speed = 13 + (i % 5) * 3;
        const y = ((frame * speed + i * 175) % 2150) - 220;
        const x = ((i * 197) % 920) - 20;
        const rot = (frame * (i % 2 === 0 ? 2.5 : -2.5) + i * 35) % 360;
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`, opacity: 0.85 }}>
            {i % 3 === 0 ? <CoinSVG size={82} /> : <BanknoteSVG />}
          </div>
        );
      })}

      {/* Bank Push Notifications */}
      <div style={{ position: 'absolute', top: 185, left: 55, right: 55, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {pushes.slice(0, 3).map((p, idx) => {
          const delay = 6 + idx * 24;
          if (frame < delay) return null;
          const slideY = interpolate(spring({ frame: frame - delay, fps, config: { damping: 12 } }), [0, 1], [-180, 0]);
          const isGold = p.accent === 'gold';
          return (
            <div
              key={idx}
              style={{
                transform: `translateY(${slideY}px)`,
                background: 'rgba(15, 23, 42, 0.94)',
                border: `2.5px solid ${isGold ? '#FACC15' : '#4ADE80'}`,
                borderRadius: 26,
                padding: '22px 30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20,
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
                <CoinSVG size={66} />
                <div>
                  <div style={{ fontSize: 25, color: '#94A3B8', fontWeight: 700 }}>{p.title}</div>
                  <div style={{ fontSize: 48, fontWeight: 900, color: isGold ? '#FACC15' : '#4ADE80' }}>{p.value}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Center Balance & Character */}
      <div
        style={{
          position: 'absolute',
          top: 560,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontSize: 106,
            fontWeight: 900,
            color: '#FACC15',
            textShadow: '0 8px 40px rgba(250, 204, 21, 0.55)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {counter.toLocaleString('ru-RU')} ₸
        </div>

        <div style={{ marginTop: 18 }}>
          <CharacterSVG
            mood={frame < durationInFrames * 0.4 ? 'shock' : scene.mood || 'happy'}
            scale={1.12}
            reaction={scene.reaction}
          />
        </div>
      </div>
    </SceneCanvas>
  );
};

// 6. COMPARE BARS (Editorial Rating Board + Character — inspired by reference video)
const SceneCompareBars: React.FC<{ scene: SceneItem; theme: ThemePalette }> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const items = scene.items || [
    { label: 'Без стратегии', valueText: 'x1.5', percent: 24, color: '#EF4444' },
    { label: 'С запасом банка', valueText: 'x45', percent: 62, color: '#38BDF8' },
    { label: 'С бонусом +500%', valueText: 'x500', percent: 96, color: '#4ADE80', winner: true },
  ];

  return (
    <SceneCanvas theme={theme}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '100px 55px 250px',
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: theme.textPrimary,
            textAlign: 'center',
            marginBottom: 28,
            lineHeight: 1.15,
          }}
        >
          {scene.title || 'В чём реальная разница?'}
        </div>

        {/* Comparison Board */}
        <div
          style={{
            width: '100%',
            maxWidth: 940,
            background: theme.cardBg,
            border: `3.5px solid ${theme.cardBorder}`,
            borderRadius: 34,
            padding: '38px 36px',
            boxShadow: theme.isLight ? '0 14px 0 #111827' : '0 26px 65px rgba(0,0,0,0.55)',
          }}
        >
          {items.map((item, idx) => {
            const fill = interpolate(
              spring({ frame: Math.max(0, frame - 8 - idx * 10), fps, config: { damping: 14 } }),
              [0, 1],
              [0, item.percent]
            );
            return (
              <div key={idx} style={{ marginBottom: idx === items.length - 1 ? 0 : 28 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 32, fontWeight: 900, color: theme.textPrimary }}>{item.label}</span>
                    {item.winner && (
                      <span
                        style={{
                          background: '#FACC15',
                          color: '#0F172A',
                          padding: '4px 14px',
                          borderRadius: 999,
                          fontSize: 20,
                          fontWeight: 900,
                        }}
                      >
                        ЛИДЕР
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 36, fontWeight: 900, color: item.color || theme.accent }}>
                    {item.valueText}
                  </span>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: 36,
                    background: theme.isLight ? '#E5E7EB' : 'rgba(255,255,255,0.1)',
                    borderRadius: 18,
                    overflow: 'hidden',
                    border: theme.isLight ? '2px solid #111827' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: `${fill}%`,
                      height: '100%',
                      background: item.color || theme.accent,
                      borderRadius: 18,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 26 }}>
          <CharacterSVG mood={scene.mood || 'thinking'} scale={0.86} reaction={scene.reaction} />
        </div>
      </div>
    </SceneCanvas>
  );
};

// 7. KINETIC STATEMENT (Bold Tilted Ribbons + Giant Stamp)
const SceneKineticStatement: React.FC<{ scene: SceneItem; theme: ThemePalette }> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lines = scene.lines || ['НЕ ЖДИ', 'ЧУДА', 'ЛОВИ ИКС!'];
  const stampPop = spring({ frame: Math.max(0, frame - 16), fps, config: { damping: 9 } });
  const ribbonColors = ['#111827', '#EC4899', '#2563EB'];

  return (
    <SceneCanvas theme={theme} bgOverride="#FACC15">
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '100px 40px 260px',
          gap: 26,
          position: 'relative',
        }}
      >
        {lines.slice(0, 3).map((line, idx) => {
          const slide = spring({ frame: Math.max(0, frame - idx * 7), fps, config: { damping: 12 } });
          const fromX = idx % 2 === 0 ? -420 : 420;
          const tx = interpolate(slide, [0, 1], [fromX, 0]);
          const rot = idx % 2 === 0 ? -3 : 2.5;
          return (
            <div
              key={idx}
              style={{
                width: '108%',
                transform: `translateX(${tx}px) rotate(${rot}deg)`,
                background: ribbonColors[idx % ribbonColors.length],
                color: idx === 2 ? '#FACC15' : '#FFFFFF',
                padding: '28px 40px',
                textAlign: 'center',
                fontSize: 94,
                fontWeight: 900,
                letterSpacing: -2,
                boxShadow: '0 16px 0 rgba(0,0,0,0.22)',
              }}
            >
              {line}
            </div>
          );
        })}

        {scene.stamp && (
          <div
            style={{
              position: 'absolute',
              top: 250,
              right: 55,
              width: 190,
              height: 190,
              borderRadius: '50%',
              background: '#2563EB',
              border: '6px solid #FFFFFF',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 52,
              fontWeight: 900,
              transform: `scale(${stampPop}) rotate(12deg)`,
              boxShadow: '0 14px 0 #0F172A',
            }}
          >
            {scene.stamp}
          </div>
        )}

        {scene.footer && (
          <div style={{ marginTop: 24, fontSize: 40, fontWeight: 900, color: '#0F172A', textAlign: 'center' }}>
            {scene.footer}
          </div>
        )}
      </div>
    </SceneCanvas>
  );
};

// 8. OUTRO CTA (Point B + Promo Card + Pulsing CTA)
const SceneOutroCTA: React.FC<{
  scene: SceneItem;
  theme: ThemePalette;
  sticker: { code: string; label: string };
}> = ({ scene, theme, sticker }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 12 } });
  const pulse = 1 + Math.sin(frame / 6) * 0.035;

  return (
    <SceneCanvas theme={theme}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '80px 55px 250px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 920,
            transform: `scale(${pop})`,
            background: theme.cardBg,
            border: `4px solid ${theme.isLight ? '#111827' : '#FACC15'}`,
            borderRadius: 38,
            padding: '42px 40px',
            textAlign: 'center',
            boxShadow: theme.isLight ? '0 16px 0 #111827' : '0 30px 80px rgba(0,0,0,0.65)',
          }}
        >
          <div style={{ marginBottom: 14 }}>
            <CharacterSVG mood={scene.mood || 'confident'} scale={0.76} reaction={scene.reaction} />
          </div>

          <div style={{ fontSize: 50, fontWeight: 900, color: theme.textPrimary, lineHeight: 1.18 }}>
            {scene.title || 'Один вечер может изменить месяц'}
          </div>

          <div
            style={{
              marginTop: 26,
              background: '#FACC15',
              color: '#0F172A',
              borderRadius: 24,
              border: '3px solid #0F172A',
              padding: '20px 28px',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800 }}>ПРОМОКОД НА СТАРТ</div>
            <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: 2, marginTop: 2 }}>{sticker.code}</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#B91C1C', marginTop: 2 }}>{sticker.label}</div>
          </div>

          <div
            style={{
              marginTop: 28,
              transform: `scale(${pulse})`,
              fontSize: 38,
              fontWeight: 900,
              color: theme.success,
            }}
          >
            {scene.cta || 'Всё для старта — по ссылке в профиле ↓'}
          </div>
        </div>
      </div>
    </SceneCanvas>
  );
};

// ============================================================================
// KARAOKE CAPTIONS (ADAPTIVE TO LIGHT / DARK THEMES)
// ============================================================================

const KaraokeCaptions: React.FC<{ text: string; isLight: boolean }> = ({ text, isLight }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;

  const activeWordIdx = Math.min(words.length - 1, Math.floor((frame / durationInFrames) * words.length));
  const chunkSize = 5;
  const start = Math.floor(activeWordIdx / chunkSize) * chunkSize;
  const visibleWords = words.slice(start, start + chunkSize);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 145,
        left: 48,
        right: 48,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '8px 13px',
          background: isLight ? 'rgba(15, 23, 42, 0.92)' : 'rgba(7, 11, 20, 0.62)',
          padding: '14px 26px',
          borderRadius: 22,
          border: isLight ? '3px solid #0F172A' : '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
        }}
      >
        {visibleWords.map((word, i) => {
          const isCurrent = start + i === activeWordIdx;
          return (
            <span
              key={`${start + i}`}
              style={{
                fontSize: 42,
                fontWeight: 900,
                color: isCurrent ? '#FACC15' : '#FFFFFF',
                transform: isCurrent ? 'scale(1.08)' : 'scale(1)',
                display: 'inline-block',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================

const buildFallbackScenes = (story: any): SceneItem[] => [
  {
    type: 'story_hook',
    duration: 6,
    badge: story?.badge || 'РЕАЛЬНАЯ ИСТОРИЯ',
    title: story?.pointATitle || 'Смена 12 часов. До зарплаты неделя.',
    subtitle: story?.pointASub || 'Остаток на карте',
    highlight: story?.pointABalance || '5 000 ₸',
    mood: 'sad',
  },
  {
    type: 'slot_spin',
    duration: 8,
    betAmount: story?.betAmount || '1 000 ₸',
    winMultiplier: story?.winMultiplier || 'x850',
  },
  {
    type: 'money_rain',
    duration: 7,
    winAmount: story?.winAmount || 850000,
    pushes: [
      {
        title: story?.pushBank || 'Зачисление на карту • только что',
        value: `+${(story?.winAmount || 850000).toLocaleString('ru-RU')} ₸`,
        accent: 'green',
      },
      { title: story?.pushText || 'Вывод одобрен мгновенно', value: 'ГОТОВО', accent: 'gold' },
    ],
  },
  {
    type: 'outro_cta',
    duration: 5,
    title: story?.pointBTitle || 'Один вечер изменил весь месяц',
    cta: story?.cta || 'Всё для старта — по ссылке в профиле ↓',
    mood: 'confident',
  },
];

const MainVideo: React.FC<VideoProps> = ({ config, subsKz, hasAudio }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const theme = getTheme(config.theme);
  const scenes: SceneItem[] =
    config.scenes && config.scenes.length > 0 ? config.scenes : buildFallbackScenes(config.story);

  const totalWeight = scenes.reduce((acc, s) => acc + (s.duration || 5), 0) || 25;

  // Pre-compute scene frame ranges
  let cursor = 0;
  const scheduled = scenes.map((scene, idx) => {
    const isLast = idx === scenes.length - 1;
    const dur = isLast
      ? Math.max(1, durationInFrames - cursor)
      : Math.max(1, Math.round(((scene.duration || 5) / totalWeight) * durationInFrames));
    const from = cursor;
    cursor += dur;
    return { scene, from, dur };
  });

  const lastSceneStart = scheduled[scheduled.length - 1]?.from ?? durationInFrames;
  const lastIsOutro = scheduled[scheduled.length - 1]?.scene.type === 'outro_cta';

  const showAt = (config.sticker?.showAtSec ?? 3.0) * fps;
  const hideSticker = lastIsOutro && frame >= lastSceneStart;
  const stickerSpring =
    frame >= showAt && !hideSticker ? spring({ frame: frame - showAt, fps, config: { damping: 12 } }) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#060913' }}>
      {hasAudio && <Audio src={staticFile('voice.mp3')} />}

      {scheduled.map(({ scene, from, dur }, idx) => (
        <Sequence key={idx} from={from} durationInFrames={dur}>
          {scene.type === 'story_hook' && <SceneStoryHook scene={scene} theme={theme} />}
          {scene.type === 'phone_statement' && <ScenePhoneStatement scene={scene} theme={theme} />}
          {scene.type === 'slot_spin' && <SceneSlotSpin scene={scene} theme={theme} />}
          {scene.type === 'crash_flight' && <SceneCrashFlight scene={scene} theme={theme} />}
          {scene.type === 'money_rain' && <SceneMoneyRain scene={scene} theme={theme} />}
          {scene.type === 'compare_bars' && <SceneCompareBars scene={scene} theme={theme} />}
          {scene.type === 'kinetic_statement' && <SceneKineticStatement scene={scene} theme={theme} />}
          {scene.type === 'outro_cta' && (
            <SceneOutroCTA scene={scene} theme={theme} sticker={config.sticker} />
          )}
        </Sequence>
      ))}

      {/* Top Progress Bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: 'rgba(255,255,255,0.16)' }}>
        <div
          style={{
            width: `${(frame / durationInFrames) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #4ADE80, #FACC15)',
          }}
        />
      </div>

      {/* Floating Promo Badge */}
      {stickerSpring > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 68,
            right: 38,
            transform: `scale(${stickerSpring})`,
            background: 'rgba(15, 23, 42, 0.94)',
            border: '2.5px solid #FACC15',
            borderRadius: 18,
            padding: '10px 22px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
            textAlign: 'right',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 900, color: '#FACC15', letterSpacing: 1 }}>
            {config.sticker.code}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC' }}>{config.sticker.label}</div>
        </div>
      )}

      {/* Adaptive Karaoke Captions */}
      <KaraokeCaptions text={subsKz} isLight={theme.isLight} />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MainVideo"
    component={MainVideo}
    durationInFrames={900}
    fps={30}
    width={1080}
    height={1920}
    calculateMetadata={({ props }) => ({
      durationInFrames: props.durationInFrames || 900,
    })}
    defaultProps={{
      config: {
        id: 1,
        theme: 'dark_luxe',
        sticker: { code: '1w_91444', label: '+500% на 4 старта', showAtSec: 3.0 },
        scenes: [],
      },
      subsKz: '',
      hasAudio: false,
      durationInFrames: 900,
    }}
  />
);
