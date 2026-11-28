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
// TYPES & INTERFACES — MASTER ENGINE v8.0 (NOIR SILHOUETTE + LIVE PHONE UI)
// ============================================================================

export type LocationName = 'night_car' | 'dark_kitchen' | 'night_shop';
export type NoirTone = 'neutral' | 'danger' | 'comeback' | 'tension';
export type SfxType = 'boom' | 'sms' | 'heartbeat' | 'whoosh' | 'pop';

export interface PhoneScreenConfig {
  mode: 'bank' | 'chat' | 'cliffhanger';
  // bank mode
  bankName?: string;
  cardMask?: string;
  fromAmount?: number;
  toAmount?: number;
  statusText?: string;
  isError?: boolean;
  // chat mode
  sender?: string;
  avatarLetter?: string;
  messages?: Array<{ text: string; time?: string; incoming?: boolean }>;
  showTyping?: boolean;
  // cliffhanger mode
  badge?: string;
  title?: string;
  subText?: string;
  cta?: string;
}

export interface StoryBeat {
  view: 'noir' | 'phone';
  ru: string;
  kz: string;
  tone?: NoirTone;
  headline?: string; // Short dramatic punchline above silhouette
  phone?: PhoneScreenConfig;
  sfx?: SfxType;
  shake?: boolean;
  // Auto-populated by render.yml
  audioFile?: string;
  fromFrame?: number;
  durationInFrames?: number;
}

export interface VideoProps {
  config: {
    id: number;
    seriesTitle?: string;
    timestamp?: string;
    location?: LocationName | string;
    beats?: StoryBeat[];
    bgmVolume?: number;
  };
  subsKz?: string;
  hasAudio?: boolean;
  durationInFrames?: number;
  sfxFiles?: Record<string, string>;
}

// ============================================================================
// 1. CINEMATIC NOIR BACKGROUNDS (RAIN, BOKEH, DEPTH)
// ============================================================================

const NoirBackdrop: React.FC<{ location?: string; tone: NoirTone }> = ({ location, tone }) => {
  const frame = useCurrentFrame();
  const twinkle = (seed: number) => 0.4 + 0.6 * Math.sin(frame / 13 + seed);

  const accentColor =
    tone === 'danger' ? '#EF4444' : tone === 'comeback' ? '#10B981' : tone === 'tension' ? '#F59E0B' : '#38BDF8';

  if (location === 'dark_kitchen') {
    const colonOn = Math.floor(frame / 15) % 2 === 0;
    return (
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #07080F 0%, #14121F 55%, #05060A 100%)' }}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <rect x="70" y="270" width="280" height="420" rx="14" fill="#060D1D" stroke="#1E293B" strokeWidth="8" />
          <line x1="210" y1="270" x2="210" y2="690" stroke="#1E293B" strokeWidth="6" />
          <line x1="70" y1="480" x2="350" y2="480" stroke="#1E293B" strokeWidth="6" />
          <circle cx="145" cy="350" r="22" fill="#FEF08A" opacity="0.6" />
          <g transform="translate(650, 310)">
            <rect x="0" y="0" width="230" height="96" rx="16" fill="#080B14" stroke="#334155" strokeWidth="4" />
            <text x="115" y="66" textAnchor="middle" fill="#EF4444" fontSize="58" fontWeight="900" fontFamily="monospace">
              03{colonOn ? ':' : ' '}14
            </text>
          </g>
          <circle cx="510" cy="860" r="420" fill={accentColor} opacity="0.1" />
        </svg>
      </AbsoluteFill>
    );
  }

  if (location === 'night_shop') {
    const flicker = frame % 78 === 0 || frame % 81 === 0 ? 0.35 : 1;
    return (
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #050812 0%, #0E1526 55%, #04060C 100%)' }}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <g transform="translate(650, 290)" opacity={flicker}>
            <rect x="0" y="0" width="240" height="104" rx="18" fill="#070B14" stroke={accentColor} strokeWidth="5" />
            <text x="120" y="70" textAnchor="middle" fill={accentColor} fontSize="60" fontWeight="900" fontFamily="sans-serif">
              24/7
            </text>
          </g>
          {Array.from({ length: 36 }).map((_, i) => {
            const rx = (i * 101) % 1060 + 10;
            const ry = ((frame * (20 + (i % 4) * 4) + i * 140) % 1500) + 20;
            return <line key={i} x1={rx} y1={ry} x2={rx - 6} y2={ry + 38} stroke="rgba(186, 230, 253, 0.25)" strokeWidth="2" />;
          })}
          <circle cx="500" cy="880" r="440" fill={accentColor} opacity="0.11" />
        </svg>
      </AbsoluteFill>
    );
  }

  // Default: night_car — Rainy midnight windshield & moving city bokeh
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #040711 0%, #0C1428 48%, #05070E 100%)' }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        {/* Moving blurred city lights */}
        {Array.from({ length: 24 }).map((_, i) => {
          const bx = ((i * 163 + frame * (0.6 + (i % 3) * 0.3)) % 1160) - 40;
          const by = 220 + (i * 79) % 620;
          const palette = ['#EF4444', '#F59E0B', '#10B981', '#38BDF8'];
          return (
            <circle
              key={i}
              cx={bx}
              cy={by}
              r={16 + (i % 4) * 14}
              fill={palette[i % palette.length]}
              opacity={0.13 + 0.08 * twinkle(i)}
            />
          );
        })}

        {/* Rain streaks on glass */}
        {Array.from({ length: 38 }).map((_, i) => {
          const rx = (i * 93) % 1060 + 10;
          const ry = ((frame * (18 + (i % 5) * 4) + i * 125) % 1250) + 60;
          return (
            <line
              key={i}
              x1={rx}
              y1={ry}
              x2={rx - 7}
              y2={ry + 42}
              stroke="rgba(186, 230, 253, 0.26)"
              strokeWidth={i % 3 === 0 ? 2.6 : 1.5}
              strokeLinecap="round"
            />
          );
        })}

        {/* Atmospheric rim halo behind silhouette */}
        <circle cx="495" cy="920" r="420" fill={accentColor} opacity="0.14" />
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// 2. SLEEK NEO-NOIR HOODED SILHOUETTE (NO CARTOON FACES!) + LIVE WAVEFORM
// ============================================================================

const NoirSilhouette: React.FC<{ tone: NoirTone }> = ({ tone }) => {
  const frame = useCurrentFrame();
  const breathe = Math.sin(frame / 14) * 5;

  const leftRim = tone === 'comeback' ? '#10B981' : '#EF4444';
  const rightRim = tone === 'danger' ? '#F97316' : '#10B981';

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 580,
        left: 0,
        right: 90,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `translateY(${breathe}px)`,
      }}
    >
      <svg width="560" height="620" viewBox="0 0 560 620" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="rimGrad" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0%" stopColor={leftRim} />
            <stop offset="50%" stopColor="#1E293B" />
            <stop offset="100%" stopColor={rightRim} />
          </linearGradient>
          <radialGradient id="phoneScreenLight" cx="50%" cy="85%" r="55%">
            <stop offset="0%" stopColor={rightRim} stopOpacity="0.42" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft glow cast upward from phone below */}
        <ellipse cx="280" cy="430" rx="220" ry="180" fill="url(#phoneScreenLight)" />

        {/* Broad Shoulders & Hooded Coat Silhouette */}
        <path
          d="M 55 610 C 65 440, 120 355, 200 330 L 175 235 C 168 125, 215 65, 280 65 C 345 65, 392 125, 385 235 L 360 330 C 440 355, 495 440, 505 610 Z"
          fill="#070A12"
          stroke="url(#rimGrad)"
          strokeWidth="6"
        />

        {/* Deep Inner Hood Shadow */}
        <path
          d="M 205 245 C 205 148, 238 106, 280 106 C 322 106, 355 148, 355 245 C 335 288, 312 315, 280 315 C 248 315, 225 288, 205 245 Z"
          fill="#03050A"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="2.5"
        />

        {/* Subtle glowing eyes glint inside shadow (mysterious, not cartoon) */}
        <path d="M 244 218 L 266 221" stroke={leftRim} strokeWidth="4" strokeLinecap="round" opacity="0.85" />
        <path d="M 316 218 L 294 221" stroke={rightRim} strokeWidth="4" strokeLinecap="round" opacity="0.85" />

        {/* Hoodie drawstrings */}
        <line x1="248" y1="335" x2="242" y2="435" stroke="rgba(226, 232, 240, 0.35)" strokeWidth="4" strokeLinecap="round" />
        <line x1="312" y1="335" x2="318" y2="435" stroke="rgba(226, 232, 240, 0.35)" strokeWidth="4" strokeLinecap="round" />
      </svg>

      {/* Live Reactive Voice Waveform */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: -38, height: 56 }}>
        {Array.from({ length: 15 }).map((_, i) => {
          const distFromCenter = Math.abs(i - 7);
          const base = Math.max(0.25, 1 - distFromCenter * 0.11);
          const wave = 0.35 + 0.65 * Math.abs(Math.sin(frame * 0.38 + i * 0.85));
          const h = Math.round(14 + 42 * base * wave);
          return (
            <div
              key={i}
              style={{
                width: 8,
                height: h,
                borderRadius: 999,
                background: i < 7 ? leftRim : rightRim,
                opacity: 0.9,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// 3. LIVE REALISTIC SMARTPHONE SCREEN (BANK / WHATSAPP CHAT / CLIFFHANGER)
// ============================================================================

const PhoneScreenView: React.FC<{ phone: PhoneScreenConfig; tone: NoirTone }> = ({ phone, tone }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14 } });

  const phoneFrameStyle: React.CSSProperties = {
    position: 'absolute',
    top: 235,
    left: 64,
    right: 130, // Clear of TikTok right icons
    height: 980,
    transform: `scale(${interpolate(enter, [0, 1], [0.92, 1])}) translateY(${interpolate(enter, [0, 1], [40, 0])}px)`,
    background: '#0B101E',
    borderRadius: 52,
    border: '7px solid #1E293B',
    boxShadow: '0 32px 90px rgba(0,0,0,0.85)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  // Top iPhone-style status bar inside phone mockup
  const StatusBar = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 34px 16px', color: '#E2E8F0', fontSize: 22, fontWeight: 800 }}>
      <span>03:14</span>
      <div style={{ width: 130, height: 26, borderRadius: 999, background: '#020617' }} />
      <span>5G • 14%</span>
    </div>
  );

  // MODE A: LIVE BANKING SCREEN (Animated Balance Drop / Error Modal)
  if (phone.mode === 'bank') {
    const fromVal = phone.fromAmount ?? 180000;
    const toVal = phone.toAmount ?? 0;
    const curVal = Math.round(
      interpolate(frame, [8, Math.max(26, durationInFrames * 0.62)], [fromVal, toVal], {
        easing: Easing.out(Easing.cubic),
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    );
    const isErr = phone.isError ?? toVal === 0;
    const modalPop = spring({ frame: Math.max(0, frame - Math.round(durationInFrames * 0.45)), fps, config: { damping: 12 } });

    return (
      <div style={phoneFrameStyle}>
        <StatusBar />
        <div style={{ padding: '24px 34px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 30, fontWeight: 900, color: '#F8FAFC' }}>{phone.bankName || 'Мой Банк KZ'}</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#94A3B8' }}>{phone.cardMask || '•••• 4821'}</span>
          </div>

          {/* Bank Card */}
          <div
            style={{
              marginTop: 28,
              background: isErr ? 'linear-gradient(135deg, #450A0A 0%, #1E1B2E 100%)' : 'linear-gradient(135deg, #064E3B 0%, #0F172A 100%)',
              border: `2.5px solid ${isErr ? '#EF4444' : '#10B981'}`,
              borderRadius: 30,
              padding: '34px 30px',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, color: '#94A3B8' }}>ДОСТУПНЫЙ БАЛАНС</div>
            <div
              style={{
                fontSize: 74,
                fontWeight: 900,
                color: curVal === 0 ? '#EF4444' : isErr ? '#F87171' : '#4ADE80',
                marginTop: 8,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {curVal.toLocaleString('ru-RU')} ₸
            </div>
          </div>

          {/* Live Transaction Rows */}
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: '18px 22px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 24, color: '#CBD5E1', fontWeight: 700 }}>Пополнение • Аванс</span>
              <span style={{ fontSize: 26, color: '#4ADE80', fontWeight: 900 }}>+{fromVal.toLocaleString('ru-RU')} ₸</span>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 20, padding: '18px 22px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 24, color: '#FCA5A5', fontWeight: 700 }}>Списание • 7 минут</span>
              <span style={{ fontSize: 26, color: '#F87171', fontWeight: 900 }}>-{Math.max(0, fromVal - toVal).toLocaleString('ru-RU')} ₸</span>
            </div>
          </div>

          {/* Error / Status Popup */}
          {phone.statusText && modalPop > 0.05 && (
            <div
              style={{
                marginTop: 'auto',
                marginBottom: 16,
                transform: `scale(${modalPop})`,
                background: isErr ? '#DC2626' : '#059669',
                borderRadius: 24,
                padding: '22px 26px',
                textAlign: 'center',
                color: '#FFFFFF',
                fontSize: 30,
                fontWeight: 900,
                boxShadow: '0 14px 36px rgba(0,0,0,0.6)',
              }}
            >
              {phone.statusText}
            </div>
          )}
        </div>
      </div>
    );
  }

  // MODE B: LIVE WHATSAPP CHAT (Typing indicator -> Message Pops In)
  if (phone.mode === 'chat') {
    const msgs = phone.messages || [{ text: 'Купи хлеб и молоко по дороге домой', time: '03:14', incoming: true }];
    const typingUntil = phone.showTyping === false ? 0 : 22;
    const isTyping = frame < typingUntil;

    return (
      <div style={{ ...phoneFrameStyle, background: '#0B141A' }}>
        <StatusBar />
        {/* WhatsApp Header */}
        <div style={{ background: '#1F2C34', padding: '18px 28px', display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 62,
              height: 62,
              borderRadius: '50%',
              background: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              fontWeight: 900,
              color: '#FFFFFF',
            }}
          >
            {phone.avatarLetter || 'Ж'}
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#F8FAFC' }}>{phone.sender || 'Жена'}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: isTyping ? '#22C55E' : '#94A3B8' }}>
              {isTyping ? 'печатает...' : 'в сети'}
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div style={{ flex: 1, padding: '32px 26px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {isTyping ? (
            <div
              style={{
                alignSelf: 'flex-start',
                background: '#202C33',
                borderRadius: 24,
                padding: '18px 28px',
                display: 'flex',
                gap: 10,
              }}
            >
              {[0, 1, 2].map((dot) => (
                <div
                  key={dot}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: '#94A3B8',
                    opacity: 0.35 + 0.65 * Math.abs(Math.sin(frame / 4 + dot)),
                  }}
                />
              ))}
            </div>
          ) : (
            msgs.map((m, idx) => {
              const mPop = spring({ frame: Math.max(0, frame - typingUntil - idx * 14), fps, config: { damping: 13 } });
              const incoming = m.incoming !== false;
              return (
                <div
                  key={idx}
                  style={{
                    alignSelf: incoming ? 'flex-start' : 'flex-end',
                    maxWidth: '88%',
                    transform: `scale(${mPop})`,
                    background: incoming ? '#202C33' : '#005C4B',
                    color: '#F8FAFC',
                    borderRadius: 24,
                    padding: '22px 26px',
                    fontSize: 32,
                    fontWeight: 700,
                    lineHeight: 1.28,
                    boxShadow: '0 8px 22px rgba(0,0,0,0.4)',
                  }}
                >
                  <div>{m.text}</div>
                  <div style={{ textAlign: 'right', fontSize: 19, color: '#94A3B8', marginTop: 8 }}>{m.time || '03:14'}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // MODE C: CLIFFHANGER PHONE NOTIFICATION (100% TikTok-Safe)
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  return (
    <div style={phoneFrameStyle}>
      <StatusBar />
      <div style={{ flex: 1, padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ background: '#EF4444', color: '#FFFFFF', padding: '8px 24px', borderRadius: 999, fontSize: 22, fontWeight: 900, letterSpacing: 1.5 }}>
          {phone.badge || 'ПРОДОЛЖЕНИЕ УЖЕ ВЫШЛО'}
        </div>
        <div style={{ fontSize: 48, fontWeight: 900, color: '#F8FAFC', marginTop: 26, lineHeight: 1.15 }}>
          {phone.title || 'Чем закончилась та ночь?'}
        </div>
        {phone.subText && (
          <div style={{ fontSize: 28, fontWeight: 700, color: '#94A3B8', marginTop: 18, lineHeight: 1.3 }}>
            {phone.subText}
          </div>
        )}
        <div
          style={{
            marginTop: 38,
            transform: `scale(${pulse})`,
            background: '#FACC15',
            color: '#0F172A',
            borderRadius: 22,
            padding: '20px 28px',
            fontSize: 30,
            fontWeight: 900,
            width: '100%',
          }}
        >
          {phone.cta || 'Смотри в нашем чате • Ссылка в профиле ↑'}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. TIKTOK-SAFE KAZAKH SUBTITLES & SERIES HUD
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
        bottom: 525,
        left: 44,
        right: 135,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 25,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '6px 12px',
          background: 'rgba(5, 8, 16, 0.84)',
          border: '1.5px solid rgba(255,255,255,0.16)',
          borderRadius: 20,
          padding: '14px 22px',
          boxShadow: '0 14px 35px rgba(0,0,0,0.7)',
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

const SeriesHUD: React.FC<{ title?: string; timestamp?: string }> = ({ title, timestamp }) => {
  const frame = useCurrentFrame();
  const recOn = Math.floor(frame / 14) % 2 === 0;
  return (
    <div
      style={{
        position: 'absolute',
        top: 110,
        left: 48,
        right: 120,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 25,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          background: 'rgba(8, 11, 20, 0.88)',
          border: '1.5px solid rgba(255,255,255,0.18)',
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
        <span style={{ fontSize: 23, fontWeight: 900, color: '#F8FAFC', letterSpacing: 1 }}>
          {title || 'ДНЕВНИК ЛУДОМАНА • ДЕНЬ 1'}
        </span>
      </div>
      {timestamp && (
        <div style={{ background: 'rgba(8,11,20,0.8)', borderRadius: 12, padding: '8px 14px', fontSize: 20, fontWeight: 800, color: '#94A3B8', fontFamily: 'monospace' }}>
          {timestamp}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 5. STORY BEAT RENDERER (FAST ALTERNATION BETWEEN NOIR SVG & LIVE PHONE)
// ============================================================================

const BeatSegment: React.FC<{
  beat: StoryBeat;
  location?: string;
  sfxFiles?: Record<string, string>;
}> = ({ beat, location, sfxFiles }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const tone: NoirTone = beat.tone || 'neutral';
  const sfxPath = beat.sfx && sfxFiles?.[beat.sfx] ? sfxFiles[beat.sfx] : undefined;

  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.05], { extrapolateRight: 'clamp' });
  const shakeX = beat.shake && frame < 16 ? Math.sin(frame * 4.1) * (16 - frame) * 0.9 : 0;
  const shakeY = beat.shake && frame < 16 ? Math.cos(frame * 4.5) * (16 - frame) * 0.7 : 0;
  const dangerPulse = tone === 'danger' ? 0.24 + 0.16 * Math.sin(frame / 4) : 0;

  return (
    <AbsoluteFill>
      {beat.audioFile && <Audio src={staticFile(beat.audioFile)} />}
      {sfxPath && <Audio src={staticFile(sfxPath)} volume={0.62} />}

      <AbsoluteFill style={{ transform: `scale(${zoom}) translate(${shakeX}px, ${shakeY}px)` }}>
        <NoirBackdrop location={location} tone={tone} />

        {beat.view === 'phone' && beat.phone ? (
          <PhoneScreenView phone={beat.phone} tone={tone} />
        ) : (
          <>
            {beat.headline && (
              <div
                style={{
                  position: 'absolute',
                  top: 250,
                  left: 52,
                  right: 130,
                  textAlign: 'center',
                  fontSize: 54,
                  fontWeight: 900,
                  color: tone === 'danger' ? '#F87171' : tone === 'comeback' ? '#4ADE80' : '#F8FAFC',
                  textShadow: '0 8px 30px rgba(0,0,0,0.9)',
                  lineHeight: 1.15,
                }}
              >
                {beat.headline}
              </div>
            )}
            <NoirSilhouette tone={tone} />
          </>
        )}
      </AbsoluteFill>

      {dangerPulse > 0 && (
        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            background: `radial-gradient(circle, transparent 42%, rgba(220, 38, 38, ${dangerPulse}) 100%)`,
          }}
        />
      )}

      <SafeZoneCaptions text={beat.kz} />
    </AbsoluteFill>
  );
};

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================

const MainVideo: React.FC<VideoProps> = ({ config, sfxFiles }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const beats = config.beats || [];
  const bgmPath = sfxFiles?.bgm;
  const bgmVol = config.bgmVolume ?? 0.14;

  return (
    <AbsoluteFill style={{ backgroundColor: '#04060C', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {bgmPath && (
        <Loop durationInFrames={240}>
          <Audio src={staticFile(bgmPath)} volume={bgmVol} />
        </Loop>
      )}

      {beats.map((beat, idx) => (
        <Sequence key={idx} from={beat.fromFrame ?? idx * 90} durationInFrames={beat.durationInFrames ?? 90}>
          <BeatSegment beat={beat} location={config.location} sfxFiles={sfxFiles} />
        </Sequence>
      ))}

      <SeriesHUD title={config.seriesTitle} timestamp={config.timestamp} />

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: 'rgba(255,255,255,0.14)', zIndex: 30 }}>
        <div style={{ width: `${(frame / durationInFrames) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #EF4444, #10B981)' }} />
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
        id: 13,
        seriesTitle: 'ДНЕВНИК ЛУДОМАНА • ДЕНЬ 1',
        timestamp: '03:14 • АЛМАТЫ',
        location: 'night_car',
        beats: [],
      },
      durationInFrames: 900,
      sfxFiles: {},
    }}
  />
);
