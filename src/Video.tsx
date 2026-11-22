import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Composition,
  Easing,
  interpolate,
  Loop,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// ============================================================================
// TYPES & INTERFACES — MASTER ENGINE v6.0
// ============================================================================

export type LocationName = 'kok_tobe_almaty' | 'baiterek_astana' | 'chayhana' | 'night_city';
export type CharacterMood = 'neutral' | 'sad' | 'thinking' | 'shock' | 'happy' | 'confident';
export type CharacterRole = 'young' | 'elder' | 'woman' | 'driver';
export type SfxType = 'pop' | 'whoosh' | 'coin' | 'win';

export interface CharacterConfig {
  name?: string;
  role?: CharacterRole;
  outfitColor?: string;
  hairColor?: string;
  glasses?: boolean;
  beard?: boolean;
  ornament?: boolean;
  holdingPhone?: boolean;
  voice?: string;
  rate?: string;
  pitch?: string;
}

export interface WidgetConfig {
  type: 'versus' | 'rng' | 'rtp' | 'mini_slot' | 'push' | 'promo';
  title?: string;
  // versus
  leftLabel?: string;
  leftValue?: string;
  rightLabel?: string;
  rightValue?: string;
  // rng
  myths?: string[];
  badge?: string;
  // rtp
  percent?: number;
  leftSplit?: string;
  rightSplit?: string;
  // mini_slot
  bet?: string;
  multiplier?: string;
  winText?: string;
  // push
  bankTitle?: string;
  amount?: string;
  subText?: string;
  // promo
  code?: string;
  bonus?: string;
  cta?: string;
}

export interface CutawayConfig {
  type: 'slot_spin' | 'crash_flight' | 'money_rain' | 'phone_statement';
  title?: string;
  betAmount?: string;
  winMultiplier?: string;
  winBanner?: string;
  from?: number;
  to?: number;
  earlyExitLabel?: string;
  startAmount?: number;
  winAmount?: number;
  pushes?: Array<{ title: string; value: string; accent?: 'green' | 'gold' }>;
  headerTitle?: string;
  headerAmount?: string;
  headerSub?: string;
  rows?: Array<{ title: string; sub: string; amount: string; positive?: boolean }>;
  totalLabel?: string;
  totalAmount?: string;
}

export interface DialogueLine {
  speaker: 'left' | 'right';
  ru: string;
  kz: string;
  mood?: CharacterMood;
  otherMood?: CharacterMood;
  reaction?: string;
  widget?: WidgetConfig;
  cutaway?: CutawayConfig;
  sfx?: SfxType;
  // Populated automatically by render.yml
  audioFile?: string;
  fromFrame?: number;
  durationInFrames?: number;
}

export interface VideoProps {
  config: {
    id: number;
    location?: LocationName | string;
    singleCharacter?: boolean;
    characters?: {
      left?: CharacterConfig;
      right?: CharacterConfig;
    };
    sticker?: { code: string; label: string; showAtSec?: number };
    dialogue?: DialogueLine[];
    bgmVolume?: number;
  };
  subsKz?: string;
  hasAudio?: boolean;
  durationInFrames?: number;
  sfxFiles?: Record<string, string>;
}

// ============================================================================
// KAZAKHSTAN LOCATIONS (RICH VECTOR BACKGROUNDS)
// ============================================================================

const KazakhOrnamentFrame: React.FC = () => (
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    <rect
      x="22"
      y="22"
      width="1036"
      height="1876"
      rx="26"
      fill="none"
      stroke="rgba(250, 204, 21, 0.28)"
      strokeWidth="2.5"
    />
    {/* Subtle corner ornament accents */}
    {[
      'translate(36, 36)',
      'translate(1044, 36) scale(-1, 1)',
      'translate(36, 1884) scale(1, -1)',
      'translate(1044, 1884) scale(-1, -1)',
    ].map((tr, i) => (
      <g key={i} transform={tr} opacity="0.55">
        <path
          d="M 0 54 L 0 12 Q 0 0 12 0 L 54 0 M 14 34 Q 14 14 34 14"
          fill="none"
          stroke="#FACC15"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="14" cy="14" r="3.5" fill="#FACC15" />
      </g>
    ))}
  </svg>
);

const LocationBackground: React.FC<{ location?: string }> = ({ location }) => {
  const frame = useCurrentFrame();
  const blink = Math.sin(frame / 10) > 0;
  const twinkle = (seed: number) => 0.45 + 0.55 * Math.sin(frame / 14 + seed);

  if (location === 'baiterek_astana') {
    return (
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #071226 0%, #0F2547 52%, #1E293B 78%, #090D16 100%)' }}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          {/* Stars */}
          {Array.from({ length: 28 }).map((_, i) => (
            <circle
              key={i}
              cx={(i * 173) % 1040 + 20}
              cy={(i * 89) % 520 + 40}
              r={i % 3 === 0 ? 3 : 2}
              fill="#F8FAFC"
              opacity={twinkle(i)}
            />
          ))}
          {/* Astana Modern Towers */}
          <rect x="60" y="920" width="110" height="520" fill="#0B1930" />
          <rect x="200" y="840" width="130" height="600" fill="#0E203D" />
          <rect x="740" y="870" width="125" height="570" fill="#0E203D" />
          <rect x="895" y="940" width="115" height="500" fill="#0B1930" />
          {/* Window lights */}
          {Array.from({ length: 36 }).map((_, i) => (
            <rect
              key={i}
              x={i % 2 === 0 ? 85 + (i % 4) * 24 : 760 + (i % 4) * 24}
              y={950 + Math.floor(i / 4) * 42}
              width="12"
              height="16"
              rx="2"
              fill={i % 5 === 0 ? '#FACC15' : '#38BDF8'}
              opacity={0.35 + (i % 3) * 0.2}
            />
          ))}
          {/* Baiterek Monument Center */}
          <g transform="translate(540, 820)">
            {/* Golden sphere glow */}
            <circle cx="0" cy="-140" r="108" fill="rgba(250, 204, 21, 0.16)" />
            {/* White lattice tower */}
            <path d="M -52 540 L -24 -75 L 24 -75 L 52 540 Z" fill="none" stroke="#E2E8F0" strokeWidth="7" opacity="0.85" />
            <path d="M -68 -140 L -24 -75 M 68 -140 L 24 -75 M -42 -150 L -12 -75 M 42 -150 L 12 -75" stroke="#F8FAFC" strokeWidth="5" />
            <line x1="-38" y1="150" x2="38" y2="150" stroke="#94A3B8" strokeWidth="3" />
            <line x1="-44" y1="300" x2="44" y2="300" stroke="#94A3B8" strokeWidth="3" />
            {/* Golden Sphere */}
            <defs>
              <radialGradient id="baiterekGold" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="55%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </radialGradient>
            </defs>
            <circle cx="0" cy="-140" r="64" fill="url(#baiterekGold)" stroke="#FEF08A" strokeWidth="3" />
          </g>
          {/* Dark foreground promenade */}
          <rect x="0" y="1390" width="1080" height="530" fill="#090D16" />
          <line x1="0" y1="1390" x2="1080" y2="1390" stroke="#38BDF8" strokeWidth="4" opacity="0.45" />
        </svg>
      </AbsoluteFill>
    );
  }

  if (location === 'chayhana') {
    return (
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #1F120D 0%, #361C12 52%, #1A0E0A 80%, #0D0705 100%)' }}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          {/* Warm wooden oriental arch */}
          <path d="M 40 1420 L 40 420 Q 540 120 1040 420 L 1040 1420" fill="none" stroke="#78350F" strokeWidth="26" opacity="0.7" />
          <path d="M 85 1420 L 85 455 Q 540 185 995 455 L 995 1420" fill="none" stroke="#D97706" strokeWidth="4" opacity="0.4" />
          {/* Warm hanging lanterns */}
          {[220, 540, 860].map((lx, i) => {
            const sway = Math.sin(frame / 22 + i * 2) * 6;
            const ly = i === 1 ? 310 : 380;
            return (
              <g key={i} transform={`translate(${lx + sway}, ${ly})`}>
                <line x1="0" y1="-380" x2="0" y2="0" stroke="#92400E" strokeWidth="4" />
                <circle cx="0" cy="42" r="95" fill="rgba(251, 191, 36, 0.16)" />
                <ellipse cx="0" cy="42" rx="34" ry="44" fill="#F59E0B" stroke="#78350F" strokeWidth="4" />
                <ellipse cx="0" cy="42" rx="18" ry="30" fill="#FEF08A" opacity="0.85" />
              </g>
            );
          })}
          {/* Warm bokeh */}
          {Array.from({ length: 18 }).map((_, i) => (
            <circle
              key={i}
              cx={(i * 197) % 1000 + 40}
              cy={560 + (i * 93) % 700}
              r={12 + (i % 4) * 8}
              fill="#FBBF24"
              opacity={0.07 + 0.06 * twinkle(i)}
            />
          ))}
          {/* Dark terrace floor */}
          <rect x="0" y="1390" width="1080" height="530" fill="#120906" />
          <line x1="0" y1="1390" x2="1080" y2="1390" stroke="#D97706" strokeWidth="4" opacity="0.5" />
        </svg>
      </AbsoluteFill>
    );
  }

  if (location === 'night_city') {
    return (
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #080C18 0%, #151C36 55%, #090D16 100%)' }}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <circle
              key={i}
              cx={(i * 181) % 1020 + 30}
              cy={420 + (i * 127) % 850}
              r={18 + (i % 5) * 14}
              fill={i % 2 === 0 ? '#38BDF8' : '#FACC15'}
              opacity={0.08 + 0.06 * twinkle(i)}
            />
          ))}
          <rect x="0" y="1390" width="1080" height="530" fill="#070A12" />
          <line x1="0" y1="1390" x2="1080" y2="1390" stroke="#6366F1" strokeWidth="4" opacity="0.5" />
        </svg>
      </AbsoluteFill>
    );
  }

  // Default: kok_tobe_almaty — Iconic Almaty night terrace, mountains & Kok-Tobe TV tower
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #070B19 0%, #111D3B 46%, #1D2C4D 72%, #0A0E17 100%)' }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        {/* Night stars */}
        {Array.from({ length: 30 }).map((_, i) => (
          <circle
            key={i}
            cx={(i * 167) % 1020 + 30}
            cy={(i * 79) % 520 + 50}
            r={i % 4 === 0 ? 3.2 : 1.8}
            fill="#F8FAFC"
            opacity={twinkle(i)}
          />
        ))}

        {/* Zailiyskiy Alatau Mountains Silhouette */}
        <path
          d="M 0 1240 L 160 1020 L 340 1140 L 540 940 L 760 1120 L 940 990 L 1080 1160 L 1080 1420 L 0 1420 Z"
          fill="#0F1B33"
        />
        <path
          d="M 0 1320 L 210 1150 L 440 1240 L 680 1110 L 890 1210 L 1080 1130 L 1080 1420 L 0 1420 Z"
          fill="#0B1326"
        />

        {/* Kok-Tobe TV Tower (right-center skyline) */}
        <g transform="translate(835, 760)">
          {/* Spire */}
          <line x1="0" y1="-210" x2="0" y2="390" stroke="#CBD5E1" strokeWidth="7" opacity="0.7" />
          {/* Tower observation decks */}
          <rect x="-24" y="-50" width="48" height="22" rx="6" fill="#334155" stroke="#94A3B8" strokeWidth="2" />
          <rect x="-18" y="-110" width="36" height="18" rx="5" fill="#334155" stroke="#94A3B8" strokeWidth="2" />
          {/* Illuminated vertical light strip */}
          <line x1="0" y1="-100" x2="0" y2="340" stroke="#38BDF8" strokeWidth="3" opacity="0.75" />
          {/* Blinking red aircraft warning beacon */}
          <circle cx="0" cy="-214" r={blink ? 11 : 6} fill="#EF4444" opacity={blink ? 0.95 : 0.4} />
          {blink && <circle cx="0" cy="-214" r="26" fill="rgba(239, 68, 68, 0.28)" />}
        </g>

        {/* Distant Almaty city lights carpet */}
        {Array.from({ length: 48 }).map((_, i) => (
          <circle
            key={i}
            cx={(i * 73) % 1040 + 20}
            cy={1265 + (i * 29) % 115}
            r={2.5 + (i % 3)}
            fill={i % 3 === 0 ? '#FACC15' : i % 3 === 1 ? '#FB923C' : '#38BDF8'}
            opacity={0.4 + 0.4 * twinkle(i)}
          />
        ))}

        {/* Warm terrace fairy lights string across upper-mid */}
        <path d="M 0 770 Q 540 855 1080 765" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" />
        {Array.from({ length: 11 }).map((_, i) => {
          const u = i / 10;
          const bx = u * 1080;
          const by = 770 + Math.sin(Math.PI * u) * 44;
          return (
            <g key={i}>
              <circle cx={bx} cy={by} r="18" fill="rgba(250, 204, 21, 0.2)" opacity={twinkle(i * 2)} />
              <circle cx={bx} cy={by} r="5.5" fill="#FEF08A" />
            </g>
          );
        })}

        {/* Terrace Railing & Dark Floor (clean subtitle backdrop) */}
        <rect x="0" y="1365" width="1080" height="14" fill="#1E293B" />
        <rect x="0" y="1379" width="1080" height="541" fill="#080B14" />
        <line x1="0" y1="1365" x2="1080" y2="1365" stroke="rgba(250, 204, 21, 0.35)" strokeWidth="3" />
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// FLEXIBLE CHARACTER CONSTRUCTOR WITH LIP-SYNC
// ============================================================================

const CharacterActor: React.FC<{
  char: CharacterConfig;
  mood: CharacterMood;
  isSpeaking: boolean;
  facing: 'left' | 'right';
  scale?: number;
  reaction?: string;
}> = ({ char, mood, isSpeaking, facing, scale = 1, reaction }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const role = char.role || 'young';
  const outfit =
    char.outfitColor ||
    (role === 'elder' ? '#1E3A8A' : role === 'woman' ? '#BE185D' : role === 'driver' ? '#334155' : '#0F766E');
  const hair = char.hairColor || (role === 'elder' ? '#64748B' : '#1E293B');
  const hasGlasses = char.glasses ?? role === 'elder';
  const hasBeard = char.beard ?? role === 'elder';
  const hasOrnament = char.ornament ?? role === 'elder';

  // Alive motion: breathing, blinking, speaking head bob & lip-sync
  const breathe = Math.sin(frame / 12) * 3.5;
  const speakBob = isSpeaking ? Math.sin(frame / 4.2) * 4.5 : 0;
  const blink = (frame + (facing === 'left' ? 0 : 37)) % 105 > 100;

  // Dynamic lip-sync mouth openness (0 to 1)
  const mouthOpen = isSpeaking
    ? Math.max(0.15, Math.abs(Math.sin(frame * 0.55) * 0.65 + Math.sin(frame * 0.92) * 0.35))
    : 0;

  const gestureLift = isSpeaking ? Math.sin(frame / 6) * 16 : 0;
  const reactPop = reaction ? spring({ frame: Math.max(0, frame - 4), fps, config: { damping: 11 } }) : 0;
  const flipX = facing === 'left' ? -1 : 1;

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Optional Reaction Pill */}
      {reaction && (
        <div
          style={{
            position: 'absolute',
            top: -58,
            transform: `scale(${reactPop})`,
            background: mood === 'shock' ? '#FACC15' : mood === 'sad' ? '#EF4444' : '#4ADE80',
            color: mood === 'sad' ? '#FFFFFF' : '#0F172A',
            border: '3px solid #0F172A',
            borderRadius: 999,
            padding: '8px 22px',
            fontSize: 26,
            fontWeight: 900,
            whiteSpace: 'nowrap',
            zIndex: 5,
            boxShadow: '0 6px 18px rgba(0,0,0,0.45)',
          }}
        >
          {reaction}
        </div>
      )}

      <svg
        width={380 * scale}
        height={490 * scale}
        viewBox="0 0 380 490"
        style={{
          overflow: 'visible',
          transform: `translateY(${breathe + speakBob}px) scaleX(${flipX})`,
          filter: isSpeaking ? 'drop-shadow(0 16px 28px rgba(0,0,0,0.6))' : 'brightness(0.86) drop-shadow(0 14px 20px rgba(0,0,0,0.5))',
        }}
      >
        {/* Ground shadow */}
        <ellipse cx="190" cy="472" rx="108" ry="18" fill="rgba(0,0,0,0.48)" />

        {/* Torso / Jacket */}
        <path
          d="M 88 465 C 88 320, 114 272, 190 272 C 266 272, 292 320, 292 465 Z"
          fill={outfit}
          stroke="#0F172A"
          strokeWidth="6"
        />
        {/* Inner shirt V-neck */}
        <path d="M 158 274 L 190 342 L 222 274 Z" fill="#F8FAFC" opacity="0.92" />

        {/* Optional Kazakh golden trim on vest/collar */}
        {hasOrnament && (
          <>
            <path d="M 142 282 L 142 460" stroke="#FACC15" strokeWidth="6" strokeDasharray="14 8" opacity="0.85" />
            <path d="M 238 282 L 238 460" stroke="#FACC15" strokeWidth="6" strokeDasharray="14 8" opacity="0.85" />
          </>
        )}

        {/* Back Arm */}
        <path
          d={`M 102 320 Q 65 ${365 - gestureLift * 0.4} 84 420`}
          fill="none"
          stroke={outfit}
          strokeWidth="30"
          strokeLinecap="round"
        />

        {/* Front Speaking / Phone Arm */}
        {char.holdingPhone ? (
          <g transform={`translate(0, ${-gestureLift * 0.4})`}>
            <path d="M 276 320 Q 315 365 270 398" fill="none" stroke={outfit} strokeWidth="30" strokeLinecap="round" />
            <rect x="255" y="346" width="34" height="58" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="3" />
            <circle cx="268" cy="396" r="16" fill="#FDBA74" stroke="#0F172A" strokeWidth="4" />
          </g>
        ) : (
          <g>
            <path
              d={
                isSpeaking
                  ? `M 276 320 Q 328 ${312 - gestureLift} 314 ${248 - gestureLift}`
                  : 'M 276 320 Q 312 372 282 422'
              }
              fill="none"
              stroke={outfit}
              strokeWidth="30"
              strokeLinecap="round"
            />
            {isSpeaking && (
              <circle cx="314" cy={244 - gestureLift} r="17" fill="#FDBA74" stroke="#0F172A" strokeWidth="5" />
            )}
          </g>
        )}

        {/* Neck */}
        <rect x="166" y="232" width="48" height="50" rx="14" fill="#FDBA74" stroke="#0F172A" strokeWidth="5" />

        {/* Woman long hair back layer */}
        {role === 'woman' && (
          <path
            d="M 102 150 C 86 215, 92 275, 118 298 L 262 298 C 288 275, 294 215, 278 150 Z"
            fill={hair}
            stroke="#0F172A"
            strokeWidth="5"
          />
        )}

        {/* Head */}
        <circle cx="190" cy="158" r="88" fill="#FDBA74" stroke="#0F172A" strokeWidth="6" />

        {/* Hair Front */}
        {role === 'driver' ? (
          /* Cap */
          <g>
            <path d="M 104 136 C 110 68, 270 68, 276 136 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="5" />
            <path d="M 178 134 L 298 134 Q 290 116 250 118 Z" fill="#0F172A" />
          </g>
        ) : (
          <path
            d="M 102 146 C 106 62, 274 62, 278 146 C 254 114, 218 104, 190 108 C 154 108, 122 122, 102 146 Z"
            fill={hair}
            stroke="#0F172A"
            strokeWidth="5"
          />
        )}

        {/* Beard (optional) */}
        {hasBeard && (
          <path
            d="M 122 194 Q 190 264 258 194 Q 246 238 190 246 Q 134 238 122 194 Z"
            fill={hair}
            opacity="0.9"
          />
        )}

        {/* Eyes */}
        {blink && mood !== 'shock' ? (
          <>
            <line x1="152" y1="158" x2="178" y2="158" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
            <line x1="214" y1="158" x2="240" y2="158" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
          </>
        ) : mood === 'shock' ? (
          <>
            <circle cx="164" cy="156" r="18" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
            <circle cx="168" cy="156" r="7" fill="#0F172A" />
            <circle cx="226" cy="156" r="18" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
            <circle cx="230" cy="156" r="7" fill="#0F172A" />
          </>
        ) : (
          <>
            <circle cx="166" cy="158" r="10.5" fill="#0F172A" />
            <circle cx="170" cy="154" r="3.5" fill="#FFFFFF" />
            <circle cx="226" cy="158" r="10.5" fill="#0F172A" />
            <circle cx="230" cy="154" r="3.5" fill="#FFFFFF" />
          </>
        )}

        {/* Glasses */}
        {hasGlasses && (
          <g>
            <rect x="138" y="138" width="52" height="36" rx="10" fill="rgba(255,255,255,0.14)" stroke="#0F172A" strokeWidth="5" />
            <rect x="202" y="138" width="52" height="36" rx="10" fill="rgba(255,255,255,0.14)" stroke="#0F172A" strokeWidth="5" />
            <line x1="190" y1="154" x2="202" y2="154" stroke="#0F172A" strokeWidth="5" />
          </g>
        )}

        {/* Eyebrows */}
        {mood === 'sad' ? (
          <>
            <path d="M 144 136 L 178 128" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
            <path d="M 244 136 L 212 128" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
          </>
        ) : mood === 'shock' ? (
          <>
            <path d="M 144 124 Q 164 110 184 124" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
            <path d="M 206 124 Q 226 110 246 124" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M 146 132 Q 165 124 182 132" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
            <path d="M 208 132 Q 226 124 244 132" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
          </>
        )}

        {/* Lip-Sync Mouth */}
        {isSpeaking ? (
          <ellipse
            cx="198"
            cy="204"
            rx={15 + mouthOpen * 8}
            ry={6 + mouthOpen * 16}
            fill="#7F1D1D"
            stroke="#0F172A"
            strokeWidth="4.5"
          />
        ) : mood === 'sad' ? (
          <path d="M 172 210 Q 198 192 222 210" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
        ) : mood === 'shock' ? (
          <ellipse cx="198" cy="206" rx="15" ry="19" fill="#7F1D1D" stroke="#0F172A" strokeWidth="5" />
        ) : mood === 'happy' || mood === 'confident' ? (
          <path d="M 166 196 Q 198 228 228 196 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="5" strokeLinejoin="round" />
        ) : (
          <path d="M 176 204 Q 198 210 220 202" fill="none" stroke="#0F172A" strokeWidth="5.5" strokeLinecap="round" />
        )}
      </svg>

      {/* Clean Speaker Name Tag */}
      {char.name && (
        <div
          style={{
            marginTop: -12,
            background: isSpeaking ? '#FACC15' : 'rgba(15, 23, 42, 0.85)',
            color: isSpeaking ? '#0F172A' : '#CBD5E1',
            border: `2px solid ${isSpeaking ? '#0F172A' : 'rgba(255,255,255,0.2)'}`,
            borderRadius: 999,
            padding: '6px 22px',
            fontSize: 24,
            fontWeight: 900,
            boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
          }}
        >
          {char.name}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// TOP-THIRD MODULAR WIDGETS (CLEAN INFOGRAPHICS OVER DIALOGUE)
// ============================================================================

const BanknoteSVG: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg width="180" height="90" viewBox="0 0 210 105" style={style}>
    <rect x="4" y="4" width="202" height="97" rx="12" fill="#16A34A" stroke="#052E16" strokeWidth="4" />
    <rect x="14" y="14" width="182" height="77" rx="6" fill="none" stroke="#86EFAC" strokeWidth="2.5" strokeDasharray="6 4" />
    <circle cx="105" cy="52" r="28" fill="#15803D" stroke="#FACC15" strokeWidth="3" />
    <text x="105" y="61" textAnchor="middle" fill="#FACC15" fontSize="28" fontWeight="900">₸</text>
    <text x="24" y="34" fill="#DCFCE7" fontSize="16" fontWeight="900">20 000</text>
  </svg>
);

const CoinSVG: React.FC<{ size?: number }> = ({ size = 68 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80">
    <circle cx="40" cy="40" r="36" fill="#FACC15" stroke="#B45309" strokeWidth="5" />
    <circle cx="40" cy="40" r="27" fill="none" stroke="#FEF08A" strokeWidth="3" />
    <text x="40" y="51" textAnchor="middle" fill="#92400E" fontSize="34" fontWeight="900">₸</text>
  </svg>
);

const TopWidgetOverlay: React.FC<{ widget: WidgetConfig }> = ({ widget }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 13 } });

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 155,
    left: 58,
    right: 58,
    transform: `scale(${pop}) translateY(${interpolate(pop, [0, 1], [-30, 0])}px)`,
    background: 'rgba(10, 15, 29, 0.9)',
    border: '2.5px solid rgba(250, 204, 21, 0.45)',
    borderRadius: 32,
    padding: '32px 34px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  if (widget.type === 'versus') {
    return (
      <div style={containerStyle}>
        {widget.title && (
          <div style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, color: '#94A3B8', marginBottom: 20, letterSpacing: 1 }}>
            {widget.title}
          </div>
        )}
        <div style={{ display: 'flex', gap: 22 }}>
          <div
            style={{
              flex: 1,
              background: 'rgba(239, 68, 68, 0.14)',
              border: '2px solid #EF4444',
              borderRadius: 22,
              padding: '22px 18px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, color: '#FCA5A5' }}>{widget.leftLabel || 'СТАРТ'}</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#F87171', marginTop: 6 }}>{widget.leftValue || '5 000 ₸'}</div>
          </div>
          <div
            style={{
              flex: 1,
              background: 'rgba(74, 222, 128, 0.14)',
              border: '2px solid #4ADE80',
              borderRadius: 22,
              padding: '22px 18px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, color: '#BBF7D0' }}>{widget.rightLabel || 'РЕЗУЛЬТАТ'}</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#4ADE80', marginTop: 6 }}>{widget.rightValue || '+680 000 ₸'}</div>
          </div>
        </div>
      </div>
    );
  }

  if (widget.type === 'rng') {
    const d1 = (Math.floor(frame / 3) * 7 + 3) % 10;
    const d2 = (Math.floor(frame / 4) * 5 + 8) % 10;
    const d3 = (Math.floor(frame / 3) * 3 + 6) % 10;
    const myths = widget.myths || ['Кімсің?', 'Қанша салдың?'];
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', fontSize: 26, fontWeight: 900, color: '#38BDF8', letterSpacing: 2 }}>
          {widget.title || 'ГСЧ • СЛУЧАЙНЫЙ АЛГОРИТМ'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 22, margin: '22px 0' }}>
          {[d1, d2, d3].map((d, i) => (
            <div
              key={i}
              style={{
                width: 112,
                height: 116,
                background: '#020617',
                border: '3px solid #FACC15',
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 68,
                fontWeight: 900,
                color: '#FACC15',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {d}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, flexWrap: 'wrap' }}>
          {myths.map((m, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(239, 68, 68, 0.16)',
                border: '2px solid #EF4444',
                borderRadius: 14,
                padding: '8px 20px',
                fontSize: 26,
                fontWeight: 800,
                color: '#FCA5A5',
                textDecoration: 'line-through',
              }}
            >
              {m}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (widget.type === 'rtp') {
    const pct = widget.percent ?? 96;
    const fill = interpolate(spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 14 } }), [0, 1], [0, pct]);
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <span style={{ fontSize: 30, fontWeight: 900, color: '#F8FAFC' }}>{widget.title || 'МЕХАНИКА ОТДАЧИ'}</span>
          <span style={{ fontSize: 44, fontWeight: 900, color: '#FACC15' }}>RTP {pct}%</span>
        </div>
        <div style={{ height: 42, background: '#EF4444', borderRadius: 21, overflow: 'hidden', border: '2px solid #0F172A' }}>
          <div style={{ width: `${fill}%`, height: '100%', background: 'linear-gradient(90deg, #22C55E, #4ADE80)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 25, fontWeight: 800 }}>
          <span style={{ color: '#4ADE80' }}>{widget.leftSplit || '96% — в призовой фонд'}</span>
          <span style={{ color: '#F87171' }}>{widget.rightSplit || '4% — комиссия'}</span>
        </div>
      </div>
    );
  }

  if (widget.type === 'mini_slot') {
    const stopped = frame > 28;
    const vals = stopped ? ['7', '7', '7'] : [((frame * 3) % 9) + 1, ((frame * 5) % 9) + 1, ((frame * 7) % 9) + 1];
    return (
      <div style={{ ...containerStyle, border: stopped ? '3px solid #FACC15' : containerStyle.border }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#94A3B8' }}>СТАВКА: {widget.bet || '1 000 ₸'}</span>
          <span style={{ fontSize: 34, fontWeight: 900, color: stopped ? '#4ADE80' : '#FACC15' }}>
            {stopped ? widget.multiplier || 'x640' : 'СПИН...'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
          {vals.map((v, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 150,
                background: '#020617',
                border: `3px solid ${stopped ? '#FACC15' : '#334155'}`,
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 82,
                fontWeight: 900,
                color: stopped ? '#FACC15' : '#38BDF8',
              }}
            >
              {v}
            </div>
          ))}
        </div>
        {stopped && (
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 34, fontWeight: 900, color: '#4ADE80' }}>
            {widget.winText || 'ЗАНОС ПОЙМАН!'}
          </div>
        )}
      </div>
    );
  }

  if (widget.type === 'push') {
    return (
      <div style={{ ...containerStyle, border: '3px solid #4ADE80', display: 'flex', alignItems: 'center', gap: 24 }}>
        <CoinSVG size={78} />
        <div>
          <div style={{ fontSize: 25, fontWeight: 700, color: '#94A3B8' }}>{widget.bankTitle || 'Зачисление на карту • сейчас'}</div>
          <div style={{ fontSize: 56, fontWeight: 900, color: '#4ADE80', lineHeight: 1.1 }}>{widget.amount || '+680 000 ₸'}</div>
          {widget.subText && <div style={{ fontSize: 24, fontWeight: 700, color: '#FACC15', marginTop: 4 }}>{widget.subText}</div>}
        </div>
      </div>
    );
  }

  // promo (clean trustworthy final card)
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  return (
    <div style={{ ...containerStyle, border: '3px solid #FACC15', textAlign: 'center' }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#94A3B8', letterSpacing: 1.5 }}>
        {widget.title || 'ПРОВЕРЬ НА ПРАКТИКЕ С ЗАПАСОМ'}
      </div>
      <div
        style={{
          marginTop: 16,
          background: '#FACC15',
          color: '#0F172A',
          borderRadius: 22,
          padding: '16px 24px',
        }}
      >
        <div style={{ fontSize: 58, fontWeight: 900, letterSpacing: 2 }}>{widget.code || '1w_91444'}</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#B91C1C' }}>{widget.bonus || 'Бонус до +500% на старт'}</div>
      </div>
      <div style={{ marginTop: 16, transform: `scale(${pulse})`, fontSize: 34, fontWeight: 900, color: '#4ADE80' }}>
        {widget.cta || 'Ссылка и промокод — в профиле ↓'}
      </div>
    </div>
  );
};

// ============================================================================
// OPTIONAL FULL-SCREEN CUTAWAYS (SLOT / CRASH / MONEY RAIN / PHONE)
// ============================================================================

const CutawayRenderer: React.FC<{ cutaway: CutawayConfig }> = ({ cutaway }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  if (cutaway.type === 'money_rain') {
    const startVal = cutaway.startAmount ?? 5000;
    const endVal = cutaway.winAmount ?? 680000;
    const counter = Math.round(
      interpolate(frame, [0, Math.max(20, durationInFrames * 0.7)], [startVal, endVal], {
        easing: Easing.out(Easing.cubic),
        extrapolateRight: 'clamp',
      })
    );
    const pushes = cutaway.pushes || [{ title: 'Зачисление на карту • только что', value: `+${endVal.toLocaleString('ru-RU')} ₸`, accent: 'green' as const }];

    return (
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 40%, #064E3B 0%, #070B14 82%)', overflow: 'hidden' }}>
        {Array.from({ length: 14 }).map((_, i) => {
          const y = ((frame * (14 + (i % 4) * 3) + i * 170) % 2100) - 200;
          const x = ((i * 197) % 920) - 10;
          const rot = (frame * (i % 2 === 0 ? 2.5 : -2.5) + i * 35) % 360;
          return (
            <div key={i} style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`, opacity: 0.85 }}>
              {i % 3 === 0 ? <CoinSVG size={78} /> : <BanknoteSVG />}
            </div>
          );
        })}
        <div style={{ position: 'absolute', top: 260, left: 55, right: 55, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {pushes.map((p, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(15, 23, 42, 0.94)',
                border: `2.5px solid ${p.accent === 'gold' ? '#FACC15' : '#4ADE80'}`,
                borderRadius: 26,
                padding: '22px 28px',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
              }}
            >
              <CoinSVG size={66} />
              <div>
                <div style={{ fontSize: 25, color: '#94A3B8', fontWeight: 700 }}>{p.title}</div>
                <div style={{ fontSize: 48, fontWeight: 900, color: p.accent === 'gold' ? '#FACC15' : '#4ADE80' }}>{p.value}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', top: 760, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 112, fontWeight: 900, color: '#FACC15', textShadow: '0 8px 40px rgba(250,204,21,0.55)' }}>
            {counter.toLocaleString('ru-RU')} ₸
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  if (cutaway.type === 'crash_flight') {
    const from = cutaway.from ?? 1.0;
    const to = cutaway.to ?? 180;
    const prog = interpolate(frame, [4, Math.max(12, durationInFrames - 8)], [0, 1], {
      easing: Easing.in(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const curX = from + (to - from) * prog;
    return (
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 45%, #0F172A 0%, #020617 90%)', justifyContent: 'center', alignItems: 'center', padding: '0 50px 200px' }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: '#38BDF8', letterSpacing: 2 }}>{cutaway.title || 'РОСТ МНОЖИТЕЛЯ'}</div>
        <div style={{ fontSize: 164, fontWeight: 900, color: prog > 0.65 ? '#FACC15' : '#38BDF8', fontVariantNumeric: 'tabular-nums' }}>
          x{curX.toFixed(1)}
        </div>
        <div style={{ marginTop: 24, width: 920, background: 'rgba(15,23,42,0.85)', border: '2px solid rgba(56,189,248,0.35)', borderRadius: 32, padding: 24 }}>
          <svg width="872" height="420" viewBox="0 0 880 420">
            <path
              d="M 60 380 Q 480 360 820 38"
              fill="none"
              stroke={prog > 0.65 ? '#FACC15' : '#38BDF8'}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray="1100"
              strokeDashoffset={1100 * (1 - prog)}
            />
          </svg>
        </div>
      </AbsoluteFill>
    );
  }

  // Default cutaway: slot_spin
  const stop3 = Math.round(durationInFrames * 0.58);
  const stops = [Math.round(durationInFrames * 0.28), Math.round(durationInFrames * 0.43), stop3];
  const isWin = frame >= stop3 + 2;
  const winPop = isWin ? spring({ frame: frame - stop3 - 2, fps, config: { damping: 10 } }) : 0;

  return (
    <AbsoluteFill
      style={{
        background: isWin ? 'radial-gradient(circle at 50% 45%, #451A03 0%, #070B14 80%)' : 'radial-gradient(circle at 50% 45%, #1E1B4B 0%, #070B14 85%)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 45px 200px',
      }}
    >
      <div style={{ marginBottom: 24, background: 'rgba(15,23,42,0.9)', border: '2px solid #FACC15', borderRadius: 999, padding: '12px 32px', fontSize: 34, fontWeight: 900, color: '#FACC15' }}>
        СТАВКА: {cutaway.betAmount || '1 000 ₸'}
      </div>
      <div style={{ width: 940, background: '#0F172A', border: isWin ? '6px solid #FACC15' : '6px solid #6366F1', borderRadius: 40, padding: 30 }}>
        <div style={{ display: 'flex', gap: 20, background: '#020617', borderRadius: 24, padding: 20 }}>
          {stops.map((sf, idx) => {
            const stopped = frame >= sf;
            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: 320,
                  background: '#1E293B',
                  borderRadius: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: stopped ? '3px solid #FACC15' : '2px solid #334155',
                  fontSize: 120,
                  fontWeight: 900,
                  color: stopped ? '#FACC15' : '#38BDF8',
                }}
              >
                {stopped ? '7' : ((frame * (idx + 3)) % 9) + 1}
              </div>
            );
          })}
        </div>
      </div>
      {isWin && (
        <div style={{ marginTop: 30, transform: `scale(${winPop})`, background: '#FACC15', color: '#0F172A', padding: '16px 46px', borderRadius: 22, fontSize: 56, fontWeight: 900 }}>
          {cutaway.winBanner || `MEGA WIN ${cutaway.winMultiplier || 'x680'}!`}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// PER-LINE SYNCED KAZAKH SUBTITLES (ZERO DRIFT, HIGH CONTRAST)
// ============================================================================

const SyncedLineCaptions: React.FC<{ text: string; speakerName?: string }> = ({ text, speakerName }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const words = (text || '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;

  const activeIdx = Math.min(words.length - 1, Math.floor((frame / Math.max(1, durationInFrames)) * words.length));
  const chunkSize = 5;
  const start = Math.floor(activeIdx / chunkSize) * chunkSize;
  const visible = words.slice(start, start + chunkSize);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 155,
        left: 52,
        right: 52,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {speakerName && (
        <div style={{ fontSize: 22, fontWeight: 800, color: '#94A3B8', letterSpacing: 1.5, textTransform: 'uppercase' }}>
          {speakerName}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '8px 14px',
        }}
      >
        {visible.map((w, i) => {
          const isCur = start + i === activeIdx;
          return (
            <span
              key={`${start + i}`}
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: isCur ? '#FACC15' : '#FFFFFF',
                transform: isCur ? 'scale(1.07)' : 'scale(1)',
                display: 'inline-block',
                WebkitTextStroke: '2px #020617',
                textShadow: '0 5px 18px rgba(0,0,0,0.98)',
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// DIALOGUE SCENE SEGMENT WITH VIRTUAL CAMERA OPERATOR
// ============================================================================

const DialogueSegment: React.FC<{
  line: DialogueLine;
  lineIndex: number;
  location?: string;
  singleCharacter?: boolean;
  leftChar: CharacterConfig;
  rightChar: CharacterConfig;
  sfxFiles?: Record<string, string>;
}> = ({ line, lineIndex, location, singleCharacter, leftChar, rightChar, sfxFiles }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const isLeftSpeaking = line.speaker === 'left' || Boolean(singleCharacter);
  const sfxPath = line.sfx && sfxFiles?.[line.sfx] ? sfxFiles[line.sfx] : undefined;

  // Virtual camera: punch-in on hook (line 0), subtle pan toward active speaker
  const hookZoom = lineIndex === 0 ? interpolate(frame, [0, 14], [1.11, 1.03], { extrapolateRight: 'clamp' }) : 1.02;
  const camZoom = hookZoom + interpolate(frame, [0, durationInFrames], [0, 0.025], { extrapolateRight: 'clamp' });
  const targetPanX = singleCharacter ? 0 : isLeftSpeaking ? 26 : -26;
  const camPanX = interpolate(frame, [0, 16], [0, targetPanX], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: 'clamp',
  });

  const activeSpeakerName = isLeftSpeaking ? leftChar.name : rightChar.name;

  return (
    <AbsoluteFill>
      {/* Line voiceover */}
      {line.audioFile && <Audio src={staticFile(line.audioFile)} />}
      {/* Cue SFX */}
      {sfxPath && <Audio src={staticFile(sfxPath)} volume={0.55} />}

      {line.cutaway ? (
        <CutawayRenderer cutaway={line.cutaway} />
      ) : (
        <AbsoluteFill style={{ transform: `scale(${camZoom}) translateX(${camPanX}px)` }}>
          <LocationBackground location={location} />

          {/* Characters standing on terrace */}
          <div
            style={{
              position: 'absolute',
              bottom: 390,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: singleCharacter ? 'center' : 'space-between',
              alignItems: 'flex-end',
              padding: singleCharacter ? '0' : '0 70px',
            }}
          >
            <CharacterActor
              char={leftChar}
              mood={isLeftSpeaking ? line.mood || 'neutral' : line.otherMood || 'neutral'}
              isSpeaking={isLeftSpeaking}
              facing="right"
              scale={singleCharacter ? 1.15 : 0.96}
              reaction={isLeftSpeaking ? line.reaction : undefined}
            />

            {!singleCharacter && (
              <CharacterActor
                char={rightChar}
                mood={!isLeftSpeaking ? line.mood || 'confident' : line.otherMood || 'neutral'}
                isSpeaking={!isLeftSpeaking}
                facing="left"
                scale={0.96}
                reaction={!isLeftSpeaking ? line.reaction : undefined}
              />
            )}
          </div>
        </AbsoluteFill>
      )}

      {/* Top-third Modular Widget */}
      {!line.cutaway && line.widget && <TopWidgetOverlay widget={line.widget} />}

      {/* Subtle Kazakh Gold Frame */}
      <KazakhOrnamentFrame />

      {/* Synced Per-Line Kazakh Subtitles */}
      <SyncedLineCaptions text={line.kz} speakerName={activeSpeakerName} />
    </AbsoluteFill>
  );
};

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================

const MainVideo: React.FC<VideoProps> = ({ config, subsKz, hasAudio, sfxFiles }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const dialogue = config.dialogue || [];
  const leftChar: CharacterConfig = config.characters?.left || {
    name: 'Ерлан',
    role: 'young',
    holdingPhone: true,
    outfitColor: '#0F766E',
  };
  const rightChar: CharacterConfig = config.characters?.right || {
    name: 'Дәурен аға',
    role: 'elder',
    glasses: true,
    beard: true,
    ornament: true,
    outfitColor: '#1E3A8A',
  };

  const bgmPath = sfxFiles?.bgm;
  const bgmVol = config.bgmVolume ?? 0.12;

  const showAt = (config.sticker?.showAtSec ?? 999) * fps;
  const stickerSpring =
    config.sticker?.code && frame >= showAt
      ? spring({ frame: frame - showAt, fps, config: { damping: 12 } })
      : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#070B14', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Looping Subtle Background Beat */}
      {bgmPath && (
        <Loop durationInFrames={240}>
          <Audio src={staticFile(bgmPath)} volume={bgmVol} />
        </Loop>
      )}

      {/* Dialogue Mode (Primary v6.0) */}
      {dialogue.length > 0 ? (
        dialogue.map((line, idx) => (
          <Sequence
            key={idx}
            from={line.fromFrame ?? idx * 90}
            durationInFrames={line.durationInFrames ?? 90}
          >
            <DialogueSegment
              line={line}
              lineIndex={idx}
              location={config.location}
              singleCharacter={config.singleCharacter}
              leftChar={leftChar}
              rightChar={rightChar}
              sfxFiles={sfxFiles}
            />
          </Sequence>
        ))
      ) : (
        /* Legacy Single-Voice Fallback */
        <AbsoluteFill>
          {hasAudio && <Audio src={staticFile('voice.mp3')} />}
          <LocationBackground location={config.location} />
          <div style={{ position: 'absolute', bottom: 400, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
            <CharacterActor char={leftChar} mood="happy" isSpeaking={true} facing="right" scale={1.15} />
          </div>
          <KazakhOrnamentFrame />
          <SyncedLineCaptions text={subsKz || ''} />
        </AbsoluteFill>
      )}

      {/* Top Progress Bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: 'rgba(255,255,255,0.14)' }}>
        <div
          style={{
            width: `${(frame / durationInFrames) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #4ADE80, #FACC15)',
          }}
        />
      </div>

      {/* Optional Floating Promo Badge (appears only at showAtSec) */}
      {stickerSpring > 0 && config.sticker && (
        <div
          style={{
            position: 'absolute',
            top: 46,
            right: 42,
            transform: `scale(${stickerSpring})`,
            background: 'rgba(15, 23, 42, 0.92)',
            border: '2px solid #FACC15',
            borderRadius: 16,
            padding: '8px 18px',
            textAlign: 'right',
            boxShadow: '0 10px 26px rgba(0,0,0,0.45)',
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 900, color: '#FACC15', letterSpacing: 1 }}>{config.sticker.code}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#F8FAFC' }}>{config.sticker.label}</div>
        </div>
      )}
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
        id: 6,
        location: 'kok_tobe_almaty',
        sticker: { code: '1w_91444', label: '+500% на 4 старта', showAtSec: 18 },
        dialogue: [],
      },
      subsKz: '',
      hasAudio: false,
      durationInFrames: 900,
      sfxFiles: {},
    }}
  />
);
