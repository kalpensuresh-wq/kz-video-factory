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
// TYPES & INTERFACES — MASTER ENGINE v7.0 (CINEMATIC STORYTELLING EDITION)
// ============================================================================

export type LocationName =
  | 'night_car'
  | 'dark_kitchen'
  | 'night_shop'
  | 'kok_tobe_almaty';

export type CharacterMood = 'neutral' | 'sad' | 'stress' | 'shock' | 'thinking' | 'happy' | 'confident';
export type CharacterRole = 'young' | 'elder' | 'woman' | 'driver';
export type SfxType = 'boom' | 'sms' | 'heartbeat' | 'whoosh' | 'pop' | 'coin' | 'win';
export type VfxType = 'none' | 'danger' | 'comeback' | 'flash';

export interface CharacterConfig {
  name?: string;
  role?: CharacterRole;
  outfitColor?: string;
  hairColor?: string;
  glasses?: boolean;
  beard?: boolean;
  holdingPhone?: boolean;
  voice?: string;
  rate?: string;
  pitch?: string;
}

export interface OverlayConfig {
  type: 'sms' | 'bank_alert' | 'balance_drop' | 'versus' | 'cliffhanger';
  // sms
  sender?: string;
  message?: string;
  time?: string;
  // bank_alert
  bankTitle?: string;
  amount?: string;
  subText?: string;
  isError?: boolean;
  // balance_drop
  label?: string;
  fromAmount?: number;
  toAmount?: number;
  // versus
  title?: string;
  leftLabel?: string;
  leftValue?: string;
  rightLabel?: string;
  rightValue?: string;
  // cliffhanger
  badge?: string;
  cta?: string;
}

export interface DialogueLine {
  speaker: 'left' | 'right';
  ru: string;
  kz: string;
  mood?: CharacterMood;
  otherMood?: CharacterMood;
  reaction?: string;
  overlay?: OverlayConfig;
  sfx?: SfxType;
  vfx?: VfxType;
  zoomToFace?: boolean;
  // Auto-populated by render.yml
  audioFile?: string;
  fromFrame?: number;
  durationInFrames?: number;
}

export interface VideoProps {
  config: {
    id: number;
    seriesTitle?: string; // e.g. "ДНЕВНИК ЛУДОМАНА • ДЕНЬ 1"
    timestamp?: string;   // e.g. "03:14 • АЛМАТЫ"
    location?: LocationName | string;
    singleCharacter?: boolean;
    characters?: {
      left?: CharacterConfig;
      right?: CharacterConfig;
    };
    dialogue?: DialogueLine[];
    bgmVolume?: number;
  };
  subsKz?: string;
  hasAudio?: boolean;
  durationInFrames?: number;
  sfxFiles?: Record<string, string>;
}

// ============================================================================
// CINEMATIC ATMOSPHERIC LOCATIONS (WITH LIGHTING & WEATHER)
// ============================================================================

const LocationBackdrop: React.FC<{ location?: string }> = ({ location }) => {
  const frame = useCurrentFrame();
  const twinkle = (seed: number) => 0.45 + 0.55 * Math.sin(frame / 14 + seed);

  // 1. NIGHT CAR (3 AM inside car, glowing dashboard, rain on windshield, city bokeh)
  if (location === 'night_car') {
    return (
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #050814 0%, #0D172E 42%, #070B14 100%)' }}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          {/* Blurred night city bokeh outside windshield */}
          {Array.from({ length: 22 }).map((_, i) => {
            const bx = ((i * 157 + frame * (0.4 + (i % 3) * 0.2)) % 1160) - 40;
            const by = 260 + (i * 73) % 520;
            const colors = ['#F59E0B', '#EF4444', '#38BDF8', '#FACC15'];
            return (
              <circle
                key={i}
                cx={bx}
                cy={by}
                r={18 + (i % 4) * 14}
                fill={colors[i % colors.length]}
                opacity={0.14 + 0.08 * twinkle(i)}
              />
            );
          })}

          {/* Raindrops streaking down windshield */}
          {Array.from({ length: 34 }).map((_, i) => {
            const rx = (i * 97) % 1060 + 10;
            const ry = ((frame * (16 + (i % 5) * 4) + i * 130) % 1100) + 80;
            return (
              <line
                key={i}
                x1={rx}
                y1={ry}
                x2={rx - 6}
                y2={ry + 36}
                stroke="rgba(186, 230, 253, 0.32)"
                strokeWidth={i % 3 === 0 ? 3 : 1.8}
                strokeLinecap="round"
              />
            );
          })}

          {/* Car roof / windshield pillars */}
          <path d="M 0 0 L 1080 0 L 1080 260 Q 540 205 0 260 Z" fill="#060911" />
          <path d="M 0 220 L 95 250 L 45 1040 L 0 1040 Z" fill="#080C16" />
          <path d="M 1080 220 L 985 250 L 1035 1040 L 1080 1040 Z" fill="#080C16" />

          {/* Rear-view mirror */}
          <rect x="420" y="218" width="240" height="58" rx="14" fill="#0F172A" stroke="#1E293B" strokeWidth="4" />

          {/* Dashboard silhouette & subtle neon glow */}
          <path d="M 0 1120 Q 540 1040 1080 1120 L 1080 1920 L 0 1920 Z" fill="#070B14" />
          <path d="M 0 1120 Q 540 1040 1080 1120" fill="none" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="4" />

          {/* Glowing speedometer dials on lower-left */}
          <g transform="translate(210, 1210)" opacity="0.55">
            <circle cx="0" cy="0" r="62" fill="none" stroke="#38BDF8" strokeWidth="4" strokeDasharray="12 6" />
            <circle cx="135" cy="0" r="62" fill="none" stroke="#EF4444" strokeWidth="4" strokeDasharray="10 8" />
          </g>
        </svg>
      </AbsoluteFill>
    );
  }

  // 2. DARK KITCHEN (Dimly lit apartment at 3 AM, glowing clock, warm lamp)
  if (location === 'dark_kitchen') {
    const colonOn = Math.floor(frame / 15) % 2 === 0;
    return (
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0D0B12 0%, #1C1624 52%, #09080D 100%)' }}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          {/* Night window on left */}
          <rect x="75" y="290" width="290" height="440" rx="14" fill="#071022" stroke="#1E293B" strokeWidth="10" />
          <line x1="220" y1="290" x2="220" y2="730" stroke="#1E293B" strokeWidth="8" />
          <line x1="75" y1="510" x2="365" y2="510" stroke="#1E293B" strokeWidth="8" />
          {/* Moon & distant lights in window */}
          <circle cx="150" cy="375" r="24" fill="#FEF08A" opacity="0.75" />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x={100 + (i % 4) * 60} y={620 + Math.floor(i / 4) * 40} width="16" height="22" fill="#F59E0B" opacity={0.35 + 0.25 * twinkle(i)} />
          ))}

          {/* Warm overhead pendant lamp */}
          <line x1="540" y1="0" x2="540" y2="255" stroke="#334155" strokeWidth="6" />
          <path d="M 465 255 L 615 255 L 580 215 L 500 215 Z" fill="#1E293B" />
          <polygon points="465,255 615,255 920,1260 160,1260" fill="url(#warmLampCone)" opacity="0.22" />
          <defs>
            <linearGradient id="warmLampCone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* Digital Red Wall Clock */}
          <g transform="translate(690, 340)">
            <rect x="0" y="0" width="240" height="104" rx="16" fill="#090D16" stroke="#334155" strokeWidth="5" />
            <text x="120" y="72" textAnchor="middle" fill="#EF4444" fontSize="62" fontWeight="900" fontFamily="monospace">
              03{colonOn ? ':' : ' '}14
            </text>
          </g>

          {/* Dark kitchen table foreground */}
          <rect x="0" y="1230" width="1080" height="690" fill="#0B090E" />
          <line x1="0" y1="1230" x2="1080" y2="1230" stroke="rgba(251, 191, 36, 0.28)" strokeWidth="4" />
        </svg>
      </AbsoluteFill>
    );
  }

  // 3. NIGHT SHOP 24/7 (Neon store sign, streetlamp glow, falling rain)
  if (location === 'night_shop') {
    const flicker = frame % 85 === 0 || frame % 87 === 0 ? 0.45 : 1;
    return (
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #070B16 0%, #111827 55%, #060910 100%)' }}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          {/* Shop facade */}
          <rect x="65" y="340" width="950" height="840" rx="18" fill="#0F172A" stroke="#1E293B" strokeWidth="6" />
          {/* Glowing shop window */}
          <rect x="125" y="540" width="520" height="460" rx="12" fill="rgba(254, 240, 138, 0.14)" stroke="#334155" strokeWidth="6" />
          {/* Neon 24/7 Sign */}
          <g transform="translate(700, 390)" opacity={flicker}>
            <rect x="0" y="0" width="250" height="110" rx="18" fill="#090D16" stroke="#38BDF8" strokeWidth="5" />
            <text x="125" y="74" textAnchor="middle" fill="#38BDF8" fontSize="64" fontWeight="900" fontFamily="sans-serif">
              24/7
            </text>
          </g>
          {/* Warm streetlamp halo */}
          <circle cx="160" cy="240" r="190" fill="rgba(251, 191, 36, 0.15)" />
          <circle cx="160" cy="240" r="22" fill="#FEF08A" />

          {/* Falling rain */}
          {Array.from({ length: 30 }).map((_, i) => {
            const rx = (i * 103) % 1060 + 10;
            const ry = ((frame * (18 + (i % 4) * 3) + i * 145) % 1300) + 40;
            return (
              <line key={i} x1={rx} y1={ry} x2={rx - 5} y2={ry + 32} stroke="rgba(148, 163, 184, 0.35)" strokeWidth="2" />
            );
          })}

          {/* Wet dark pavement */}
          <rect x="0" y="1210" width="1080" height="710" fill="#070A12" />
          <line x1="0" y1="1210" x2="1080" y2="1210" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="4" />
        </svg>
      </AbsoluteFill>
    );
  }

  // Fallback: kok_tobe_almaty
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #070B19 0%, #111D3B 46%, #1D2C4D 72%, #080B14 100%)' }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 28 }).map((_, i) => (
          <circle key={i} cx={(i * 167) % 1020 + 30} cy={(i * 79) % 480 + 50} r={2.2} fill="#F8FAFC" opacity={twinkle(i)} />
        ))}
        <path d="M 0 1160 L 180 940 L 390 1080 L 580 880 L 820 1060 L 1080 940 L 1080 1280 L 0 1280 Z" fill="#0E1A32" />
        <rect x="0" y="1240" width="1080" height="680" fill="#070A12" />
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// UPGRADED CHARACTER ACTOR (SHADING, PHONE RIM-LIGHT, SWEAT, LIP-SYNC)
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
  const hair = char.hairColor || (role === 'elder' ? '#64748B' : '#111827');
  const hasGlasses = char.glasses ?? role === 'elder';
  const hasBeard = char.beard ?? role === 'elder';

  const breathe = Math.sin(frame / 11) * 4;
  const speakBob = isSpeaking ? Math.sin(frame / 4) * 5 : 0;
  const blink = (frame + (facing === 'left' ? 0 : 41)) % 98 > 93;
  const mouthOpen = isSpeaking
    ? Math.max(0.16, Math.abs(Math.sin(frame * 0.56) * 0.65 + Math.sin(frame * 0.94) * 0.35))
    : 0;

  const sweatY = (frame * 1.4) % 28;
  const reactPop = reaction ? spring({ frame: Math.max(0, frame - 4), fps, config: { damping: 11 } }) : 0;
  const flipX = facing === 'left' ? -1 : 1;
  const phoneGlow = mood === 'happy' || mood === 'confident' ? 'rgba(250, 204, 21, 0.25)' : 'rgba(56, 189, 248, 0.28)';

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {reaction && (
        <div
          style={{
            position: 'absolute',
            top: -64,
            transform: `scale(${reactPop})`,
            background: mood === 'stress' || mood === 'sad' ? '#EF4444' : mood === 'shock' ? '#FACC15' : '#4ADE80',
            color: mood === 'stress' || mood === 'sad' ? '#FFFFFF' : '#0F172A',
            border: '3px solid #0F172A',
            borderRadius: 999,
            padding: '8px 24px',
            fontSize: 28,
            fontWeight: 900,
            whiteSpace: 'nowrap',
            zIndex: 5,
            boxShadow: '0 8px 22px rgba(0,0,0,0.5)',
          }}
        >
          {reaction}
        </div>
      )}

      <svg
        width={400 * scale}
        height={500 * scale}
        viewBox="0 0 380 490"
        style={{
          overflow: 'visible',
          transform: `translateY(${breathe + speakBob}px) scaleX(${flipX})`,
          filter: isSpeaking ? 'drop-shadow(0 18px 34px rgba(0,0,0,0.7))' : 'brightness(0.84) drop-shadow(0 14px 22px rgba(0,0,0,0.55))',
        }}
      >
        <defs>
          <radialGradient id="skinShade" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="65%" stopColor="#FDBA74" />
            <stop offset="100%" stopColor="#D97706" />
          </radialGradient>
          <linearGradient id="hoodieShade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={outfit} />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>

        {/* Ambient rim glow from phone screen */}
        {char.holdingPhone && <circle cx="240" cy="240" r="145" fill={phoneGlow} />}

        {/* Torso / Hoodie with shading */}
        <path
          d="M 82 470 C 82 320, 112 270, 190 270 C 268 270, 298 320, 298 470 Z"
          fill="url(#hoodieShade)"
          stroke="#090D16"
          strokeWidth="6"
        />
        <line x1="162" y1="286" x2="156" y2="352" stroke="#E2E8F0" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
        <line x1="218" y1="286" x2="224" y2="352" stroke="#E2E8F0" strokeWidth="5" strokeLinecap="round" opacity="0.85" />

        {/* Arms */}
        <path d="M 98 324 Q 62 372 86 426" fill="none" stroke={outfit} strokeWidth="30" strokeLinecap="round" />
        {char.holdingPhone ? (
          <g>
            <path d="M 278 324 Q 318 368 268 398" fill="none" stroke={outfit} strokeWidth="30" strokeLinecap="round" />
            <rect x="252" y="340" width="38" height="64" rx="7" fill="#0F172A" stroke="#38BDF8" strokeWidth="3.5" />
            <circle cx="268" cy="396" r="16" fill="#FDBA74" stroke="#090D16" strokeWidth="4" />
          </g>
        ) : (
          <path d="M 278 324 Q 316 372 284 426" fill="none" stroke={outfit} strokeWidth="30" strokeLinecap="round" />
        )}

        {/* Neck */}
        <rect x="166" y="232" width="48" height="50" rx="14" fill="#EA9B5A" stroke="#090D16" strokeWidth="5" />

        {/* Head with 3D radial shading */}
        <circle cx="190" cy="158" r="90" fill="url(#skinShade)" stroke="#090D16" strokeWidth="6" />

        {/* Hair */}
        {role === 'driver' ? (
          <g>
            <path d="M 102 136 C 108 66, 272 66, 278 136 Z" fill="#1E293B" stroke="#090D16" strokeWidth="5" />
            <path d="M 178 134 L 302 134 Q 292 114 250 118 Z" fill="#090D16" />
          </g>
        ) : (
          <path
            d="M 100 148 C 104 60, 276 60, 280 148 C 254 114, 218 102, 190 106 C 154 106, 120 120, 100 148 Z"
            fill={hair}
            stroke="#090D16"
            strokeWidth="5"
          />
        )}

        {hasBeard && (
          <path d="M 122 194 Q 190 266 258 194 Q 246 240 190 248 Q 134 240 122 194 Z" fill={hair} opacity="0.9" />
        )}

        {/* Eyes */}
        {blink && mood !== 'shock' && mood !== 'stress' ? (
          <>
            <line x1="152" y1="158" x2="178" y2="158" stroke="#090D16" strokeWidth="6" strokeLinecap="round" />
            <line x1="214" y1="158" x2="240" y2="158" stroke="#090D16" strokeWidth="6" strokeLinecap="round" />
          </>
        ) : mood === 'shock' || mood === 'stress' ? (
          <>
            <circle cx="164" cy="156" r="19" fill="#FFFFFF" stroke="#090D16" strokeWidth="4" />
            <circle cx="168" cy="156" r="7.5" fill="#090D16" />
            <circle cx="226" cy="156" r="19" fill="#FFFFFF" stroke="#090D16" strokeWidth="4" />
            <circle cx="230" cy="156" r="7.5" fill="#090D16" />
          </>
        ) : (
          <>
            <circle cx="166" cy="158" r="11" fill="#090D16" />
            <circle cx="170" cy="154" r="3.5" fill="#FFFFFF" />
            <circle cx="226" cy="158" r="11" fill="#090D16" />
            <circle cx="230" cy="154" r="3.5" fill="#FFFFFF" />
          </>
        )}

        {/* Animated stress sweat drop */}
        {(mood === 'stress' || mood === 'sad') && (
          <path
            d={`M 262 ${120 + sweatY} Q 274 ${138 + sweatY} 262 ${146 + sweatY} Q 250 ${138 + sweatY} 262 ${120 + sweatY} Z`}
            fill="#38BDF8"
            opacity={1 - sweatY / 28}
          />
        )}

        {hasGlasses && (
          <g>
            <rect x="138" y="138" width="52" height="36" rx="10" fill="rgba(255,255,255,0.14)" stroke="#090D16" strokeWidth="5" />
            <rect x="202" y="138" width="52" height="36" rx="10" fill="rgba(255,255,255,0.14)" stroke="#090D16" strokeWidth="5" />
            <line x1="190" y1="154" x2="202" y2="154" stroke="#090D16" strokeWidth="5" />
          </g>
        )}

        {/* Eyebrows */}
        {mood === 'sad' || mood === 'stress' ? (
          <>
            <path d="M 142 136 L 178 124" stroke="#090D16" strokeWidth="6.5" strokeLinecap="round" />
            <path d="M 248 136 L 212 124" stroke="#090D16" strokeWidth="6.5" strokeLinecap="round" />
          </>
        ) : mood === 'shock' ? (
          <>
            <path d="M 144 122 Q 164 108 184 122" fill="none" stroke="#090D16" strokeWidth="6.5" strokeLinecap="round" />
            <path d="M 206 122 Q 226 108 246 122" fill="none" stroke="#090D16" strokeWidth="6.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M 146 132 Q 165 124 182 132" fill="none" stroke="#090D16" strokeWidth="6" strokeLinecap="round" />
            <path d="M 208 132 Q 226 124 244 132" fill="none" stroke="#090D16" strokeWidth="6" strokeLinecap="round" />
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
            stroke="#090D16"
            strokeWidth="4.5"
          />
        ) : mood === 'sad' || mood === 'stress' ? (
          <path d="M 172 212 Q 198 192 224 212" fill="none" stroke="#090D16" strokeWidth="6" strokeLinecap="round" />
        ) : mood === 'happy' || mood === 'confident' ? (
          <path d="M 166 196 Q 198 228 228 196 Z" fill="#FFFFFF" stroke="#090D16" strokeWidth="5" strokeLinejoin="round" />
        ) : (
          <path d="M 176 204 Q 198 210 220 202" fill="none" stroke="#090D16" strokeWidth="5.5" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
};

// ============================================================================
// REALISTIC STORYTELLING OVERLAYS (SMS, BANK ALERT, BALANCE DROP, CLIFFHANGER)
// ============================================================================

const StoryOverlay: React.FC<{ overlay: OverlayConfig }> = ({ overlay }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 13 } });

  // Safe top zone: below series HUD (top: 230px), right margin 120px to avoid TikTok icons
  const wrapStyle: React.CSSProperties = {
    position: 'absolute',
    top: 235,
    left: 52,
    right: 120,
    transform: `scale(${pop}) translateY(${interpolate(pop, [0, 1], [-35, 0])}px)`,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    zIndex: 10,
  };

  if (overlay.type === 'sms') {
    return (
      <div style={wrapStyle}>
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.94)',
            border: '2px solid rgba(56, 189, 248, 0.5)',
            borderRadius: 28,
            padding: '24px 28px',
            boxShadow: '0 22px 55px rgba(0,0,0,0.7)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#22C55E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 900,
                  color: '#FFFFFF',
                }}
              >
                W
              </div>
              <span style={{ fontSize: 30, fontWeight: 900, color: '#F8FAFC' }}>{overlay.sender || 'Жена'}</span>
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#94A3B8' }}>{overlay.time || 'сейчас'}</span>
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, color: '#E2E8F0', lineHeight: 1.28 }}>
            {overlay.message || 'Купи хлеб и молоко по дороге домой'}
          </div>
        </div>
      </div>
    );
  }

  if (overlay.type === 'bank_alert') {
    const isErr = overlay.isError ?? true;
    return (
      <div style={wrapStyle}>
        <div
          style={{
            background: isErr ? 'rgba(69, 10, 10, 0.94)' : 'rgba(6, 78, 59, 0.94)',
            border: `2.5px solid ${isErr ? '#EF4444' : '#4ADE80'}`,
            borderRadius: 28,
            padding: '24px 28px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 800, color: isErr ? '#FCA5A5' : '#BBF7D0', letterSpacing: 1 }}>
            {overlay.bankTitle || 'УВЕДОМЛЕНИЕ БАНКА'}
          </div>
          <div style={{ fontSize: 56, fontWeight: 900, color: isErr ? '#F87171' : '#4ADE80', marginTop: 4 }}>
            {overlay.amount || '0 ₸'}
          </div>
          {overlay.subText && (
            <div style={{ fontSize: 28, fontWeight: 700, color: '#F8FAFC', marginTop: 6 }}>{overlay.subText}</div>
          )}
        </div>
      </div>
    );
  }

  if (overlay.type === 'balance_drop') {
    const fromVal = overlay.fromAmount ?? 180000;
    const toVal = overlay.toAmount ?? 0;
    const cur = Math.round(
      interpolate(frame, [6, Math.max(24, durationInFrames * 0.65)], [fromVal, toVal], {
        easing: Easing.out(Easing.cubic),
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    );
    const isDrop = toVal < fromVal;
    return (
      <div style={wrapStyle}>
        <div
          style={{
            background: 'rgba(10, 14, 26, 0.92)',
            border: `2.5px solid ${isDrop ? '#EF4444' : '#4ADE80'}`,
            borderRadius: 30,
            padding: '28px 32px',
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(0,0,0,0.75)',
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 800, color: '#94A3B8', letterSpacing: 1.5 }}>
            {overlay.label || 'БАЛАНС НА КАРТЕ'}
          </div>
          <div
            style={{
              fontSize: 82,
              fontWeight: 900,
              color: cur === 0 ? '#EF4444' : isDrop ? '#F87171' : '#4ADE80',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.1,
              marginTop: 6,
            }}
          >
            {cur.toLocaleString('ru-RU')} ₸
          </div>
        </div>
      </div>
    );
  }

  if (overlay.type === 'versus') {
    return (
      <div style={wrapStyle}>
        <div
          style={{
            background: 'rgba(10, 15, 29, 0.92)',
            border: '2px solid rgba(250, 204, 21, 0.45)',
            borderRadius: 28,
            padding: '24px 26px',
          }}
        >
          {overlay.title && (
            <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, color: '#94A3B8', marginBottom: 16 }}>
              {overlay.title}
            </div>
          )}
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, background: 'rgba(239,68,68,0.16)', border: '2px solid #EF4444', borderRadius: 20, padding: '18px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#FCA5A5' }}>{overlay.leftLabel || 'БЫЛО'}</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: '#F87171', marginTop: 4 }}>{overlay.leftValue || '180 000 ₸'}</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(74,222,128,0.16)', border: '2px solid #4ADE80', borderRadius: 20, padding: '18px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#BBF7D0' }}>{overlay.rightLabel || 'СТАЛО'}</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: '#4ADE80', marginTop: 4 }}>{overlay.rightValue || '0 ₸'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // cliffhanger (100% TikTok-safe end card)
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  return (
    <div style={wrapStyle}>
      <div
        style={{
          background: 'rgba(10, 15, 29, 0.94)',
          border: '3px solid #FACC15',
          borderRadius: 30,
          padding: '28px 30px',
          textAlign: 'center',
          boxShadow: '0 24px 65px rgba(0,0,0,0.75)',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            background: '#EF4444',
            color: '#FFFFFF',
            padding: '6px 20px',
            borderRadius: 999,
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: 1.5,
          }}
        >
          {overlay.badge || 'ПРОДОЛЖЕНИЕ УЖЕ ВЫШЛО'}
        </div>
        <div style={{ fontSize: 42, fontWeight: 900, color: '#F8FAFC', marginTop: 14, lineHeight: 1.18 }}>
          {overlay.title || 'Чем закончилась та ночь?'}
        </div>
        <div
          style={{
            marginTop: 18,
            transform: `scale(${pulse})`,
            background: '#FACC15',
            color: '#0F172A',
            borderRadius: 18,
            padding: '14px 20px',
            fontSize: 30,
            fontWeight: 900,
          }}
        >
          {overlay.cta || 'Смотри в нашем чате • Ссылка в профиле ↑'}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TIKTOK-SAFE KAZAKH SUBTITLES (RAISED TO BOTTOM: 525px, RIGHT MARGIN 135px)
// ============================================================================

const SafeZoneCaptions: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const words = (text || '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;

  const activeIdx = Math.min(words.length - 1, Math.floor((frame / Math.max(1, durationInFrames)) * words.length));
  const chunkSize = 4;
  const start = Math.floor(activeIdx / chunkSize) * chunkSize;
  const visible = words.slice(start, start + chunkSize);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 525, // Safely above TikTok/Reels description, account name & action buttons
        left: 44,
        right: 135, // Safely clear of right-side Like/Comment/Share column
        display: 'flex',
        justifyContent: 'center',
        zIndex: 20,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '6px 12px',
          background: 'rgba(6, 9, 18, 0.78)',
          border: '1.5px solid rgba(255, 255, 255, 0.14)',
          borderRadius: 20,
          padding: '14px 22px',
          boxShadow: '0 14px 35px rgba(0, 0, 0, 0.65)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {visible.map((w, i) => {
          const isCur = start + i === activeIdx;
          return (
            <span
              key={`${start + i}`}
              style={{
                fontSize: 44,
                fontWeight: 900,
                color: isCur ? '#FACC15' : '#FFFFFF',
                transform: isCur ? 'scale(1.07)' : 'scale(1)',
                display: 'inline-block',
                textShadow: '0 3px 12px rgba(0,0,0,0.95)',
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
// SERIES HUD HEADER (● REC | ДНЕВНИК ЛУДОМАНА • ДЕНЬ 1)
// ============================================================================

const SeriesHUD: React.FC<{ title?: string; timestamp?: string }> = ({ title, timestamp }) => {
  const frame = useCurrentFrame();
  const recOn = Math.floor(frame / 14) % 2 === 0;

  return (
    <div
      style={{
        position: 'absolute',
        top: 112, // Safely below phone status bar & TikTok top icons
        left: 48,
        right: 120,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 15,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          background: 'rgba(9, 13, 24, 0.85)',
          border: '1.5px solid rgba(255, 255, 255, 0.18)',
          borderRadius: 999,
          padding: '10px 22px',
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#EF4444',
            opacity: recOn ? 1 : 0.25,
            boxShadow: recOn ? '0 0 12px #EF4444' : 'none',
          }}
        />
        <span style={{ fontSize: 24, fontWeight: 900, color: '#F8FAFC', letterSpacing: 1 }}>
          {title || 'ДНЕВНИК ЛУДОМАНА • ДЕНЬ 1'}
        </span>
      </div>

      {timestamp && (
        <div
          style={{
            background: 'rgba(9, 13, 24, 0.78)',
            borderRadius: 12,
            padding: '8px 14px',
            fontSize: 20,
            fontWeight: 800,
            color: '#94A3B8',
            fontFamily: 'monospace',
          }}
        >
          {timestamp}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DIALOGUE SEGMENT WITH VIRTUAL CAMERA & DRAMATIC VFX
// ============================================================================

const StorySegment: React.FC<{
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

  // Virtual camera: hook punch-in, slow dramatic push-in, optional zoomToFace
  const baseZoom = line.zoomToFace ? 1.14 : lineIndex === 0 ? interpolate(frame, [0, 14], [1.12, 1.03], { extrapolateRight: 'clamp' }) : 1.02;
  const camZoom = baseZoom + interpolate(frame, [0, durationInFrames], [0, 0.035], { extrapolateRight: 'clamp' });
  const targetPanX = singleCharacter ? -28 : isLeftSpeaking ? 24 : -48;
  const camPanX = interpolate(frame, [0, 14], [0, targetPanX], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: 'clamp',
  });

  // Dramatic camera shake on danger VFX
  const shakeActive = line.vfx === 'danger' && frame < 18;
  const shakeX = shakeActive ? Math.sin(frame * 3.8) * (18 - frame) * 0.9 : 0;
  const shakeY = shakeActive ? Math.cos(frame * 4.2) * (18 - frame) * 0.7 : 0;

  const dangerPulse = line.vfx === 'danger' ? 0.25 + 0.18 * Math.sin(frame / 4) : 0;
  const flashOp = line.vfx === 'flash' || line.vfx === 'comeback'
    ? interpolate(frame, [0, 10], [0.45, 0], { extrapolateRight: 'clamp' })
    : 0;

  return (
    <AbsoluteFill>
      {line.audioFile && <Audio src={staticFile(line.audioFile)} />}
      {sfxPath && <Audio src={staticFile(sfxPath)} volume={0.62} />}

      <AbsoluteFill style={{ transform: `scale(${camZoom}) translate(${camPanX + shakeX}px, ${shakeY}px)` }}>
        <LocationBackdrop location={location} />

        {/* Characters positioned in the upper-mid/lower-mid safe area (above subtitles & UI) */}
        <div
          style={{
            position: 'absolute',
            bottom: 650, // Above the 525px subtitle bar so faces are 100% unobstructed
            left: 0,
            right: 90, // Clear of TikTok right-side buttons
            display: 'flex',
            justifyContent: singleCharacter ? 'center' : 'space-between',
            alignItems: 'flex-end',
            padding: singleCharacter ? '0' : '0 55px',
          }}
        >
          <CharacterActor
            char={leftChar}
            mood={isLeftSpeaking ? line.mood || 'neutral' : line.otherMood || 'neutral'}
            isSpeaking={isLeftSpeaking}
            facing="right"
            scale={singleCharacter ? 1.16 : 0.9}
            reaction={isLeftSpeaking ? line.reaction : undefined}
          />

          {!singleCharacter && (
            <CharacterActor
              char={rightChar}
              mood={!isLeftSpeaking ? line.mood || 'confident' : line.otherMood || 'neutral'}
              isSpeaking={!isLeftSpeaking}
              facing="left"
              scale={0.9}
              reaction={!isLeftSpeaking ? line.reaction : undefined}
            />
          )}
        </div>
      </AbsoluteFill>

      {/* Dramatic Red Vignette on Danger */}
      {dangerPulse > 0 && (
        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            background: `radial-gradient(circle, transparent 42%, rgba(220, 38, 38, ${dangerPulse}) 100%)`,
          }}
        />
      )}

      {/* Golden / White Impact Flash */}
      {flashOp > 0 && (
        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            backgroundColor: line.vfx === 'comeback' ? '#FEF08A' : '#FFFFFF',
            opacity: flashOp,
          }}
        />
      )}

      {/* Realistic Storytelling Overlay */}
      {line.overlay && <StoryOverlay overlay={line.overlay} />}

      {/* TikTok-Safe Kazakh Subtitles */}
      <SafeZoneCaptions text={line.kz} />
    </AbsoluteFill>
  );
};

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================

const MainVideo: React.FC<VideoProps> = ({ config, subsKz, hasAudio, sfxFiles }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const dialogue = config.dialogue || [];
  const leftChar: CharacterConfig = config.characters?.left || {
    name: 'Арман',
    role: 'young',
    holdingPhone: true,
    outfitColor: '#1E293B',
  };
  const rightChar: CharacterConfig = config.characters?.right || {
    name: 'Данияр',
    role: 'driver',
    beard: true,
    outfitColor: '#0F766E',
  };

  const bgmPath = sfxFiles?.bgm;
  const bgmVol = config.bgmVolume ?? 0.14;

  return (
    <AbsoluteFill style={{ backgroundColor: '#050811', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Atmospheric Late-Night Background Pulse */}
      {bgmPath && (
        <Loop durationInFrames={240}>
          <Audio src={staticFile(bgmPath)} volume={bgmVol} />
        </Loop>
      )}

      {dialogue.length > 0 ? (
        dialogue.map((line, idx) => (
          <Sequence
            key={idx}
            from={line.fromFrame ?? idx * 90}
            durationInFrames={line.durationInFrames ?? 90}
          >
            <StorySegment
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
        <AbsoluteFill>
          {hasAudio && <Audio src={staticFile('voice.mp3')} />}
          <LocationBackdrop location={config.location} />
          <div style={{ position: 'absolute', bottom: 660, left: 0, right: 90, display: 'flex', justifyContent: 'center' }}>
            <CharacterActor char={leftChar} mood="stress" isSpeaking={true} facing="right" scale={1.16} />
          </div>
          <SafeZoneCaptions text={subsKz || ''} />
        </AbsoluteFill>
      )}

      {/* Series Header HUD */}
      <SeriesHUD title={config.seriesTitle} timestamp={config.timestamp} />

      {/* Top Progress Bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: 'rgba(255,255,255,0.14)', zIndex: 30 }}>
        <div
          style={{
            width: `${(frame / durationInFrames) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #EF4444, #FACC15)',
          }}
        />
      </div>
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
        id: 12,
        seriesTitle: 'ДНЕВНИК ЛУДОМАНА • ДЕНЬ 1',
        timestamp: '03:14 • АЛМАТЫ',
        location: 'night_car',
        singleCharacter: true,
        dialogue: [],
      },
      subsKz: '',
      hasAudio: false,
      durationInFrames: 900,
      sfxFiles: {},
    }}
  />
);
