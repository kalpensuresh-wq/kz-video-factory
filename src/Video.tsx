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
// MASTER ENGINE v9.0 — STUDIO FLAT MOTION GRAPHICS (ZERO BLACK OUTLINES)
// Compatible with render.yml v8.2 (Gemini AI Male Voice + Noir SFX)
// ============================================================================

export type SceneType =
  | 'kitchen_night'
  | 'walk_rain'
  | 'closeup_face'
  | 'phone_3d'
  | 'infographic'
  | 'car_night'
  | 'cliffhanger';

export type MoodTone = 'neutral' | 'tension' | 'danger' | 'comeback';
export type SfxType = 'boom' | 'sms' | 'heartbeat' | 'whoosh' | 'pop';

export interface PhoneData {
  mode: 'chat' | 'bank' | 'call';
  // chat
  sender?: string;
  avatarLetter?: string;
  avatarColor?: string;
  showTyping?: boolean;
  messages?: Array<{ text: string; time?: string; incoming?: boolean }>;
  // bank
  bankName?: string;
  cardMask?: string;
  fromAmount?: number;
  toAmount?: number;
  statusText?: string;
  isError?: boolean;
  // call
  callerName?: string;
  callerSub?: string;
}

export interface InfographicData {
  title?: string;
  theme?: 'dark' | 'light';
  nodes: Array<{ label: string; sub?: string; color?: string }>;
  footer?: string;
}

export interface CliffhangerData {
  badge?: string;
  title?: string;
  subText?: string;
  cta?: string;
}

export interface StoryBeat {
  scene: SceneType;
  ru: string;
  kz: string;
  tone?: MoodTone;
  headline?: string;
  hudValue?: string; // Live anchor pill at top-right (e.g. "02:47" or "+240 000 ₸")
  hudColor?: string;
  phone?: PhoneData;
  infographic?: InfographicData;
  cliffhanger?: CliffhangerData;
  sfx?: SfxType;
  shake?: boolean;
  // Auto-populated by render.yml v8.2
  audioFile?: string;
  fromFrame?: number;
  durationInFrames?: number;
}

export interface VideoProps {
  config: {
    id: number;
    seriesTitle?: string;
    timestamp?: string;
    voiceName?: string;
    bgmVolume?: number;
    beats?: StoryBeat[];
  };
  durationInFrames?: number;
  sfxFiles?: Record<string, string>;
}

// ============================================================================
// COLOR PALETTE HELPER (CLEAN FLAT MOTION — NO BLACK STROKES)
// ============================================================================

const getAccent = (tone: MoodTone) => {
  if (tone === 'danger') return { main: '#EF4444', soft: '#FCA5A5', glow: 'rgba(239, 68, 68, 0.35)' };
  if (tone === 'comeback') return { main: '#10B981', soft: '#6EE7B7', glow: 'rgba(16, 185, 129, 0.35)' };
  if (tone === 'tension') return { main: '#F59E0B', soft: '#FDE68A', glow: 'rgba(245, 158, 11, 0.32)' };
  return { main: '#38BDF8', soft: '#BAE6FD', glow: 'rgba(56, 189, 248, 0.30)' };
};

// ============================================================================
// SCENE 1: KITCHEN NIGHT (WIDE CINEMATIC FLAT SCENE — 02:47 AM INSOMNIA)
// ============================================================================

const SceneKitchenNight: React.FC<{ tone: MoodTone }> = ({ tone }) => {
  const frame = useCurrentFrame();
  const accent = getAccent(tone);
  const colonOn = Math.floor(frame / 15) % 2 === 0;
  const breathe = Math.sin(frame / 16) * 4;
  const steamShift = (frame * 1.6) % 70;

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #090D1A 0%, #161E35 55%, #0A0F1D 100%)' }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="lampCone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="phoneFaceGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent.main} stopOpacity="0.45" />
            <stop offset="100%" stopColor={accent.main} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="skinFlat" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F7C59F" />
            <stop offset="100%" stopColor="#D99B72" />
          </linearGradient>
        </defs>

        {/* Distant night window on left */}
        <rect x="65" y="290" width="310" height="460" rx="18" fill="#060B18" />
        <rect x="80" y="305" width="280" height="430" rx="12" fill="#0B162C" />
        {/* Blurred city buildings in window */}
        <rect x="95" y="540" width="55" height="195" fill="#132240" />
        <rect x="165" y="470" width="70" height="265" fill="#172A4D" />
        <rect x="250" y="570" width="90" height="165" fill="#101E38" />
        {/* Moon */}
        <circle cx="145" cy="380" r="26" fill="#FEF08A" opacity="0.8" />
        {/* Window mullions */}
        <rect x="215" y="290" width="10" height="460" fill="#1E293B" />
        <rect x="65" y="510" width="310" height="10" fill="#1E293B" />

        {/* Digital Red Wall Clock */}
        <g transform="translate(650, 320)">
          <rect x="0" y="0" width="245" height="108" rx="20" fill="#070B14" />
          <rect x="6" y="6" width="233" height="96" rx="16" fill="#0F172A" />
          <text x="122" y="75" textAnchor="middle" fill="#EF4444" fontSize="60" fontWeight="900" fontFamily="monospace">
            02{colonOn ? ':' : ' '}47
          </text>
        </g>

        {/* Overhead Pendant Lamp + Volumetric Light Cone */}
        <rect x="515" y="0" width="6" height="230" fill="#334155" />
        <path d="M 445 255 L 591 255 L 555 215 L 481 215 Z" fill="#1E293B" />
        <polygon points="445,255 591,255 960,1260 80,1260" fill="url(#lampCone)" />

        {/* Stylized Flat Character Sitting at Table (ZERO black outlines) */}
        <g transform={`translate(290, ${660 + breathe})`}>
          {/* Backrest of chair */}
          <rect x="18" y="190" width="32" height="320" rx="16" fill="#1E293B" />
          {/* Torso / Hoodie in clean flat geometric layers */}
          <path d="M 55 520 C 55 310, 105 250, 195 250 C 275 250, 325 320, 340 520 Z" fill="#1E293B" />
          <path d="M 195 250 C 260 250, 305 310, 320 520 L 245 520 C 235 360, 215 280, 195 250 Z" fill="#293852" />
          {/* Hood folded behind neck */}
          <path d="M 110 255 Q 150 215 205 245 Q 175 285 110 255 Z" fill="#0F172A" />
          {/* Neck */}
          <rect x="182" y="188" width="44" height="68" rx="18" fill="#C98A63" />
          {/* Head (Clean Flat Profile/3/4) */}
          <rect x="155" y="75" width="128" height="145" rx="58" fill="url(#skinFlat)" />
          {/* Hair (Modern flat swept shape) */}
          <path d="M 148 145 C 142 75, 205 52, 268 78 C 288 86, 292 115, 278 132 C 255 110, 212 108, 185 126 C 170 136, 165 158, 152 162 Z" fill="#111827" />
          {/* Ear */}
          <circle cx="172" cy="158" r="16" fill="#E0A57D" />
          {/* Focused tired eye & eyebrow looking down at phone */}
          <path d="M 235 138 L 266 144" stroke="#111827" strokeWidth="7" strokeLinecap="round" />
          <ellipse cx="252" cy="158" rx="7" ry="5" fill="#111827" />
          {/* Arm reaching to phone on table */}
          <path d="M 180 340 Q 260 410 355 425" fill="none" stroke="#293852" strokeWidth="52" strokeLinecap="round" />
          <circle cx="368" cy="428" r="24" fill="#F7C59F" />
          {/* Phone screen glow illuminating face */}
          <circle cx="330" cy="310" r="185" fill="url(#phoneFaceGlow)" />
        </g>

        {/* Kitchen Table Foreground */}
        <rect x="0" y="1145" width="1080" height="775" fill="#0B1120" />
        <rect x="0" y="1145" width="1080" height="14" fill="#1E293B" />

        {/* Glowing Smartphone on Table */}
        <rect x="645" y="1115" width="105" height="22" rx="8" fill="#0F172A" />
        <rect x="653" y="1117" width="89" height="8" rx="4" fill={accent.main} />

        {/* Ceramic Mug with Rising Steam */}
        <g transform="translate(175, 1045)">
          <rect x="0" y="0" width="76" height="100" rx="14" fill="#334155" />
          <path d="M 76 22 Q 104 22 104 50 Q 104 78 76 78" fill="none" stroke="#334155" strokeWidth="14" />
          <path
            d={`M 24 ${-10 - steamShift} Q 10 ${-35 - steamShift} 26 ${-60 - steamShift}`}
            fill="none"
            stroke="rgba(226, 232, 240, 0.35)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity={1 - steamShift / 70}
          />
          <path
            d={`M 52 ${-20 - ((steamShift + 35) % 70)} Q 66 ${-45 - ((steamShift + 35) % 70)} 50 ${-70 - ((steamShift + 35) % 70)}`}
            fill="none"
            stroke="rgba(226, 232, 240, 0.3)"
            strokeWidth="5"
            strokeLinecap="round"
            opacity={1 - ((steamShift + 35) % 70) / 70}
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 2: WALKING IN RAIN (PARALLAX CITY + ANIMATED FLAT WALK CYCLE)
// ============================================================================

const SceneWalkRain: React.FC<{ tone: MoodTone }> = ({ tone }) => {
  const frame = useCurrentFrame();
  const accent = getAccent(tone);
  const bgScroll = (frame * 2.8) % 1080;
  const fgScroll = (frame * 6.5) % 1080;
  const step = Math.sin(frame * 0.28);
  const bob = Math.abs(Math.cos(frame * 0.28)) * 10;

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #070C18 0%, #142038 58%, #0A101E 100%)' }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        {/* Parallax City Skyline */}
        <g transform={`translate(${-bgScroll}, 0)`}>
          {[0, 1080].map((offset) => (
            <g key={offset} transform={`translate(${offset}, 0)`}>
              <rect x="40" y="540" width="160" height="680" fill="#0E172A" />
              <rect x="230" y="420" width="210" height="800" fill="#111C33" />
              <rect x="480" y="600" width="180" height="620" fill="#0D1628" />
              <rect x="700" y="470" width="240" height="750" fill="#13213D" />
              <rect x="970" y="580" width="110" height="640" fill="#0E172A" />
            </g>
          ))}
        </g>

        {/* Streetlamp Light Cones scrolling faster */}
        <g transform={`translate(${-fgScroll}, 0)`}>
          {[180, 720, 1260, 1800].map((lx, idx) => (
            <g key={idx} transform={`translate(${lx}, 290)`}>
              <rect x="-6" y="0" width="12" height="930" fill="#1E293B" />
              <circle cx="0" cy="0" r="20" fill="#FEF08A" />
              <polygon points="-18,0 18,0 240,930 -240,930" fill="#FEF08A" opacity="0.09" />
            </g>
          ))}
        </g>

        {/* Wet Pavement */}
        <rect x="0" y="1200" width="1080" height="720" fill="#080D1A" />
        <rect x="0" y="1200" width="1080" height="6" fill={accent.main} opacity="0.4" />

        {/* Stylized Flat Walking Character (Side Profile, ZERO black outlines) */}
        <g transform={`translate(360, ${700 - bob})`}>
          {/* Back Leg */}
          <line x1="120" y1="310" x2={120 - step * 58} y2="495" stroke="#0F172A" strokeWidth="36" strokeLinecap="round" />
          {/* Front Leg */}
          <line x1="120" y1="310" x2={120 + step * 58} y2="495" stroke="#1E293B" strokeWidth="38" strokeLinecap="round" />
          {/* Coat / Hoodie Body */}
          <path d="M 65 135 C 65 105, 175 105, 180 145 L 195 330 L 55 330 Z" fill="#25344F" />
          {/* Swinging Arm */}
          <line x1="122" y1="165" x2={122 - step * 48} y2="295" stroke="#33486B" strokeWidth="32" strokeLinecap="round" />
          {/* Head */}
          <circle cx="128" cy="65" r="48" fill="#F2BE96" />
          {/* Hair */}
          <path d="M 80 68 C 78 20, 145 8, 174 42 C 150 38, 118 46, 80 68 Z" fill="#0F172A" />
        </g>

        {/* Falling Diagonal Rain */}
        {Array.from({ length: 42 }).map((_, i) => {
          const rx = (i * 89) % 1060 + 10;
          const ry = ((frame * (24 + (i % 4) * 5) + i * 115) % 1350) + 20;
          return (
            <line
              key={i}
              x1={rx}
              y1={ry}
              x2={rx - 12}
              y2={ry + 48}
              stroke="rgba(186, 230, 253, 0.34)"
              strokeWidth={i % 3 === 0 ? 3 : 1.8}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 3: DRAMATIC CLOSE-UP FACE (FLAT MOTION GRAPHICS — NO BLACK OUTLINES)
// ============================================================================

const SceneCloseupFace: React.FC<{ tone: MoodTone }> = ({ tone }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const accent = getAccent(tone);
  const pushIn = interpolate(frame, [0, durationInFrames], [1.0, 1.09], { extrapolateRight: 'clamp' });
  const blink = frame % 76 > 72;
  const sweatY = (frame * 1.8) % 45;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, #1A243D 0%, #070B16 100%)` }}>
      {/* Soft atmospheric accent glow behind head */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 48%, ${accent.glow} 0%, transparent 58%)` }} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', transform: `scale(${pushIn}) translate(-35px, -70px)` }}>
        <svg width="720" height="820" viewBox="0 0 720 820">
          <defs>
            <linearGradient id="faceGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FAD0AC" />
              <stop offset="65%" stopColor="#E8AD82" />
              <stop offset="100%" stopColor="#C48259" />
            </linearGradient>
            <linearGradient id="rimLight" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={accent.main} stopOpacity="0.85" />
              <stop offset="30%" stopColor={accent.main} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Shoulders / Hoodie */}
          <path d="M 85 820 C 95 620, 175 565, 360 565 C 545 565, 625 620, 635 820 Z" fill="#1E293B" />
          <path d="M 270 565 L 360 660 L 450 565 Z" fill="#0F172A" />

          {/* Neck with chin shadow */}
          <rect x="295" y="465" width="130" height="135" rx="45" fill="#C48259" />
          <ellipse cx="360" cy="495" rx="68" ry="30" fill="#9E6340" opacity="0.55" />

          {/* Ears */}
          <ellipse cx="205" cy="340" rx="28" ry="44" fill="#DC9F74" />
          <ellipse cx="515" cy="340" rx="28" ry="44" fill="#C48259" />

          {/* Head (Clean Flat Geometry) */}
          <rect x="215" y="135" width="290" height="370" rx="135" fill="url(#faceGrad)" />
          {/* Rim Light Highlight on Left Cheek */}
          <rect x="215" y="135" width="290" height="370" rx="135" fill="url(#rimLight)" />

          {/* Hair */}
          <path d="M 205 275 C 195 135, 285 88, 375 96 C 475 104, 525 165, 515 275 C 485 210, 425 182, 360 188 C 290 195, 240 218, 205 275 Z" fill="#0F172A" />

          {/* Eyebrows based on tone */}
          {tone === 'danger' || tone === 'tension' ? (
            <>
              <path d="M 258 292 L 325 274" stroke="#0F172A" strokeWidth="14" strokeLinecap="round" />
              <path d="M 462 292 L 395 274" stroke="#0F172A" strokeWidth="14" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M 260 282 Q 292 268 326 282" fill="none" stroke="#0F172A" strokeWidth="13" strokeLinecap="round" />
              <path d="M 394 282 Q 428 268 460 282" fill="none" stroke="#0F172A" strokeWidth="13" strokeLinecap="round" />
            </>
          )}

          {/* Eyes */}
          {blink ? (
            <>
              <line x1="268" y1="325" x2="320" y2="325" stroke="#0F172A" strokeWidth="10" strokeLinecap="round" />
              <line x1="400" y1="325" x2="452" y2="325" stroke="#0F172A" strokeWidth="10" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse cx="294" cy="325" rx="22" ry="18" fill="#FFFFFF" />
              <circle cx="296" cy="325" r="11" fill="#0F172A" />
              <circle cx="301" cy="320" r="4" fill={accent.soft} />

              <ellipse cx="426" cy="325" rx="22" ry="18" fill="#FFFFFF" />
              <circle cx="428" cy="325" r="11" fill="#0F172A" />
              <circle cx="433" cy="320" r="4" fill={accent.soft} />
            </>
          )}

          {/* Minimal flat nose shadow */}
          <path d="M 360 330 L 352 385 L 372 388" fill="none" stroke="#C48259" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />

          {/* Expressive mouth */}
          {tone === 'danger' ? (
            <path d="M 318 438 Q 360 412 402 438" fill="none" stroke="#7C2D12" strokeWidth="10" strokeLinecap="round" />
          ) : tone === 'comeback' ? (
            <path d="M 318 424 Q 360 452 402 424" fill="none" stroke="#7C2D12" strokeWidth="10" strokeLinecap="round" />
          ) : (
            <line x1="325" y1="432" x2="395" y2="432" stroke="#7C2D12" strokeWidth="9" strokeLinecap="round" />
          )}

          {/* Sweat drop on danger */}
          {tone === 'danger' && (
            <path
              d={`M 475 ${245 + sweatY} Q 492 ${270 + sweatY} 475 ${282 + sweatY} Q 458 ${270 + sweatY} 475 ${245 + sweatY} Z`}
              fill="#38BDF8"
              opacity={1 - sweatY / 45}
            />
          )}
        </svg>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 4: 3D TILTED PHONE OVER BLURRED DEPTH-OF-FIELD BACKDROP
// ============================================================================

const ScenePhone3D: React.FC<{ phone: PhoneData; tone: MoodTone }> = ({ phone, tone }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const accent = getAccent(tone);
  const pop = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const floatY = Math.sin(frame / 14) * 8;

  const phoneStyle: React.CSSProperties = {
    position: 'absolute',
    top: 235,
    left: 68,
    right: 132,
    height: 975,
    transform: `perspective(1200px) rotateY(-5deg) rotateX(4deg) scale(${interpolate(pop, [0, 1], [0.9, 1])}) translateY(${floatY}px)`,
    background: '#0B111E',
    borderRadius: 52,
    border: '6px solid #26334D',
    boxShadow: `0 38px 95px rgba(0,0,0,0.85), 0 0 60px ${accent.glow}`,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const StatusBar = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 34px 14px', color: '#E2E8F0', fontSize: 22, fontWeight: 800 }}>
      <span>02:47</span>
      <div style={{ width: 126, height: 26, borderRadius: 999, background: '#020617' }} />
      <span>5G • 18%</span>
    </div>
  );

  return (
    <AbsoluteFill>
      {/* Blurred Depth-of-Field Background */}
      <AbsoluteFill style={{ filter: 'blur(16px) brightness(0.65)', transform: 'scale(1.1)' }}>
        <SceneKitchenNight tone={tone} />
      </AbsoluteFill>

      <div style={phoneStyle}>
        <StatusBar />

        {phone.mode === 'chat' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0B141A' }}>
            <div style={{ background: '#1F2C34', padding: '18px 28px', display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: phone.avatarColor || '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900, color: '#FFFFFF' }}>
                {phone.avatarLetter || 'Е'}
              </div>
              <div>
                <div style={{ fontSize: 31, fontWeight: 900, color: '#F8FAFC' }}>{phone.sender || 'Друг Ербол'}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: phone.showTyping && frame < 20 ? '#22C55E' : '#94A3B8' }}>
                  {phone.showTyping && frame < 20 ? 'печатает...' : 'в сети'}
                </div>
              </div>
            </div>
            <div style={{ flex: 1, padding: '30px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {phone.showTyping && frame < 20 ? (
                <div style={{ alignSelf: 'flex-start', background: '#202C33', borderRadius: 24, padding: '18px 28px', display: 'flex', gap: 10 }}>
                  {[0, 1, 2].map((d) => (
                    <div key={d} style={{ width: 14, height: 14, borderRadius: '50%', background: '#94A3B8', opacity: 0.35 + 0.65 * Math.abs(Math.sin(frame / 4 + d)) }} />
                  ))}
                </div>
              ) : (
                (phone.messages || []).map((m, idx) => {
                  const delay = (phone.showTyping ? 20 : 4) + idx * 14;
                  const mPop = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 13 } });
                  const inc = m.incoming !== false;
                  return (
                    <div
                      key={idx}
                      style={{
                        alignSelf: inc ? 'flex-start' : 'flex-end',
                        maxWidth: '88%',
                        transform: `scale(${mPop})`,
                        background: inc ? '#202C33' : '#005C4B',
                        color: '#F8FAFC',
                        borderRadius: 24,
                        padding: '20px 24px',
                        fontSize: 31,
                        fontWeight: 700,
                        lineHeight: 1.28,
                      }}
                    >
                      <div>{m.text}</div>
                      <div style={{ textAlign: 'right', fontSize: 18, color: '#94A3B8', marginTop: 6 }}>{m.time || '02:47'}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {phone.mode === 'bank' && (() => {
          const fromVal = phone.fromAmount ?? 5000;
          const toVal = phone.toAmount ?? 240000;
          const curVal = Math.round(
            interpolate(frame, [6, Math.max(24, durationInFrames * 0.6)], [fromVal, toVal], {
              easing: Easing.out(Easing.cubic),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          );
          const isErr = phone.isError ?? toVal < fromVal;
          const statusPop = spring({ frame: Math.max(0, frame - Math.round(durationInFrames * 0.42)), fps, config: { damping: 12 } });
          return (
            <div style={{ flex: 1, padding: '26px 32px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 30, fontWeight: 900, color: '#F8FAFC' }}>{phone.bankName || 'Мой Банк KZ'}</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#94A3B8' }}>{phone.cardMask || '•••• 4821'}</span>
              </div>
              <div
                style={{
                  marginTop: 28,
                  background: isErr ? 'linear-gradient(135deg, #450A0A 0%, #171B2E 100%)' : 'linear-gradient(135deg, #064E3B 0%, #0F172A 100%)',
                  border: `2.5px solid ${isErr ? '#EF4444' : '#10B981'}`,
                  borderRadius: 30,
                  padding: '34px 28px',
                }}
              >
                <div style={{ fontSize: 23, fontWeight: 700, color: '#94A3B8' }}>БАЛАНС НА КАРТЕ</div>
                <div style={{ fontSize: 72, fontWeight: 900, color: isErr ? '#F87171' : '#4ADE80', marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>
                  {curVal.toLocaleString('ru-RU')} ₸
                </div>
              </div>
              {phone.statusText && statusPop > 0.05 && (
                <div style={{ marginTop: 'auto', marginBottom: 20, transform: `scale(${statusPop})`, background: isErr ? '#DC2626' : '#059669', borderRadius: 24, padding: '22px 26px', textAlign: 'center', color: '#FFFFFF', fontSize: 29, fontWeight: 900 }}>
                  {phone.statusText}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 5: EDITORIAL INFOGRAPHIC BREAKDOWN (LIGHT/DARK MOTION GRAPHICS)
// ============================================================================

const SceneInfographic: React.FC<{ data: InfographicData; tone: MoodTone }> = ({ data, tone }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isLight = data.theme === 'light';
  const accent = getAccent(tone);

  return (
    <AbsoluteFill
      style={{
        background: isLight
          ? 'linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)'
          : 'linear-gradient(180deg, #090E1C 0%, #111827 100%)',
        padding: '245px 135px 560px 55px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {data.title && (
        <div
          style={{
            fontSize: 44,
            fontWeight: 900,
            color: isLight ? '#0F172A' : '#F8FAFC',
            textAlign: 'center',
            marginBottom: 34,
            letterSpacing: 0.5,
          }}
        >
          {data.title}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {(data.nodes || []).map((node, idx) => {
          const pop = spring({ frame: Math.max(0, frame - idx * 10), fps, config: { damping: 13 } });
          const nodeColor = node.color || accent.main;
          return (
            <React.Fragment key={idx}>
              <div
                style={{
                  transform: `scale(${pop}) translateX(${interpolate(pop, [0, 1], [-40, 0])}px)`,
                  background: isLight ? '#FFFFFF' : 'rgba(30, 41, 59, 0.85)',
                  borderLeft: `10px solid ${nodeColor}`,
                  borderRadius: 24,
                  padding: '24px 28px',
                  boxShadow: isLight ? '0 14px 32px rgba(15, 23, 42, 0.08)' : '0 14px 34px rgba(0, 0, 0, 0.45)',
                }}
              >
                <div style={{ fontSize: 34, fontWeight: 900, color: isLight ? '#0F172A' : '#F8FAFC' }}>{node.label}</div>
                {node.sub && (
                  <div style={{ fontSize: 24, fontWeight: 700, color: isLight ? '#475569' : '#94A3B8', marginTop: 6 }}>{node.sub}</div>
                )}
              </div>
              {idx < data.nodes.length - 1 && (
                <div style={{ textAlign: 'center', fontSize: 32, fontWeight: 900, color: nodeColor, opacity: pop }}>↓</div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {data.footer && (
        <div style={{ marginTop: 28, textAlign: 'center', fontSize: 26, fontWeight: 800, color: accent.main }}>
          {data.footer}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 6: CINEMATIC CLIFFHANGER CARD (100% TIKTOK-SAFE)
// ============================================================================

const SceneCliffhanger: React.FC<{ data: CliffhangerData; tone: MoodTone }> = ({ data, tone }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 13 } });
  const pulse = 1 + Math.sin(frame / 6) * 0.035;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: 'blur(20px) brightness(0.55)', transform: 'scale(1.12)' }}>
        <SceneKitchenNight tone={tone} />
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          top: 290,
          left: 58,
          right: 130,
          transform: `scale(${pop})`,
          background: 'rgba(11, 17, 30, 0.92)',
          border: '3px solid #FACC15',
          borderRadius: 36,
          padding: '44px 36px',
          textAlign: 'center',
          boxShadow: '0 32px 90px rgba(0,0,0,0.85)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'inline-block', background: '#EF4444', color: '#FFFFFF', padding: '8px 24px', borderRadius: 999, fontSize: 22, fontWeight: 900, letterSpacing: 1.5 }}>
          {data.badge || 'ПРОДОЛЖЕНИЕ УЖЕ ВЫШЛО'}
        </div>
        <div style={{ fontSize: 48, fontWeight: 900, color: '#F8FAFC', marginTop: 24, lineHeight: 1.15 }}>
          {data.title || 'Чем всё закончилось?'}
        </div>
        {data.subText && (
          <div style={{ fontSize: 28, fontWeight: 700, color: '#94A3B8', marginTop: 16, lineHeight: 1.3 }}>
            {data.subText}
          </div>
        )}
        <div
          style={{
            marginTop: 34,
            transform: `scale(${pulse})`,
            background: '#FACC15',
            color: '#0F172A',
            borderRadius: 22,
            padding: '20px 26px',
            fontSize: 30,
            fontWeight: 900,
          }}
        >
          {data.cta || 'Наш закрытый чат • Ссылка в профиле ↑'}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SAFE-ZONE KAZAKH SUBTITLES + PERSISTENT ANCHOR HUD
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
    <div style={{ position: 'absolute', bottom: 525, left: 44, right: 135, display: 'flex', justifyContent: 'center', zIndex: 30 }}>
      <div
        style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '6px 12px',
          background: 'rgba(6, 10, 20, 0.86)',
          border: '1.5px solid rgba(255,255,255,0.16)',
          borderRadius: 20,
          padding: '14px 22px',
          boxShadow: '0 14px 36px rgba(0,0,0,0.72)',
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

const SeriesAnchorHUD: React.FC<{ title?: string; hudValue?: string; hudColor?: string }> = ({ title, hudValue, hudColor }) => {
  const frame = useCurrentFrame();
  const recOn = Math.floor(frame / 14) % 2 === 0;
  return (
    <div style={{ position: 'absolute', top: 108, left: 46, right: 120, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 35, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(8, 12, 22, 0.88)', border: '1.5px solid rgba(255,255,255,0.16)', borderRadius: 999, padding: '10px 20px' }}>
        <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#EF4444', opacity: recOn ? 1 : 0.25, boxShadow: recOn ? '0 0 12px #EF4444' : 'none' }} />
        <span style={{ fontSize: 22, fontWeight: 900, color: '#F8FAFC', letterSpacing: 0.8 }}>{title || 'ДНЕВНИК ЛУДОМАНА • ДЕНЬ 2'}</span>
      </div>
      {hudValue && (
        <div style={{ background: 'rgba(8, 12, 22, 0.9)', border: `2px solid ${hudColor || '#38BDF8'}`, borderRadius: 999, padding: '8px 18px', fontSize: 22, fontWeight: 900, color: hudColor || '#F8FAFC', fontFamily: 'monospace' }}>
          {hudValue}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// BEAT RENDERER WITH WHIP-PAN MOTION BLUR TRANSITION
// ============================================================================

const BeatSegment: React.FC<{
  beat: StoryBeat;
  index: number;
  sfxFiles?: Record<string, string>;
}> = ({ beat, index, sfxFiles }) => {
  const frame = useCurrentFrame();
  const tone: MoodTone = beat.tone || 'neutral';
  const sfxPath = beat.sfx && sfxFiles?.[beat.sfx] ? sfxFiles[beat.sfx] : undefined;

  // Whip-Pan Motion Blur entrance on scene cuts (frames 0..7)
  const whipX = index === 0 ? 0 : interpolate(frame, [0, 7], [140, 0], { easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp' });
  const whipBlur = index === 0 ? 0 : interpolate(frame, [0, 6], [10, 0], { extrapolateRight: 'clamp' });

  const shakeX = beat.shake && frame < 16 ? Math.sin(frame * 4.2) * (16 - frame) * 0.9 : 0;
  const shakeY = beat.shake && frame < 16 ? Math.cos(frame * 4.6) * (16 - frame) * 0.7 : 0;

  return (
    <AbsoluteFill>
      {beat.audioFile && <Audio src={staticFile(beat.audioFile)} />}
      {sfxPath && <Audio src={staticFile(sfxPath)} volume={0.62} />}

      <AbsoluteFill style={{ transform: `translate(${whipX + shakeX}px, ${shakeY}px)`, filter: whipBlur > 0.2 ? `blur(${whipBlur}px)` : undefined }}>
        {beat.scene === 'kitchen_night' && <SceneKitchenNight tone={tone} />}
        {beat.scene === 'walk_rain' && <SceneWalkRain tone={tone} />}
        {beat.scene === 'closeup_face' && <SceneCloseupFace tone={tone} />}
        {beat.scene === 'phone_3d' && beat.phone && <ScenePhone3D phone={beat.phone} tone={tone} />}
        {beat.scene === 'infographic' && beat.infographic && <SceneInfographic data={beat.infographic} tone={tone} />}
        {beat.scene === 'cliffhanger' && beat.cliffhanger && <SceneCliffhanger data={beat.cliffhanger} tone={tone} />}
        {beat.scene === 'car_night' && <SceneWalkRain tone={tone} />}

        {/* Optional Bold Punchline Headline */}
        {beat.headline && (
          <div
            style={{
              position: 'absolute',
              top: 225,
              left: 52,
              right: 130,
              textAlign: 'center',
              fontSize: 52,
              fontWeight: 900,
              color: tone === 'danger' ? '#F87171' : tone === 'comeback' ? '#4ADE80' : '#F8FAFC',
              textShadow: '0 10px 32px rgba(0,0,0,0.88)',
              lineHeight: 1.15,
            }}
          >
            {beat.headline}
          </div>
        )}
      </AbsoluteFill>

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

  // Determine current active beat for live top-right anchor HUD
  const activeBeat =
    beats.find((b) => frame >= (b.fromFrame ?? 0) && frame < (b.fromFrame ?? 0) + (b.durationInFrames ?? 90)) ||
    beats[0];

  return (
    <AbsoluteFill style={{ backgroundColor: '#050812', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {bgmPath && (
        <Loop durationInFrames={240}>
          <Audio src={staticFile(bgmPath)} volume={bgmVol} />
        </Loop>
      )}

      {beats.map((beat, idx) => (
        <Sequence key={idx} from={beat.fromFrame ?? idx * 90} durationInFrames={beat.durationInFrames ?? 90}>
          <BeatSegment beat={beat} index={idx} sfxFiles={sfxFiles} />
        </Sequence>
      ))}

      {/* Subtle Cinema Vignette */}
      <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(circle, transparent 58%, rgba(0,0,0,0.48) 100%)', zIndex: 25 }} />

      <SeriesAnchorHUD title={config.seriesTitle} hudValue={activeBeat?.hudValue || config.timestamp} hudColor={activeBeat?.hudColor} />

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: 'rgba(255,255,255,0.14)', zIndex: 40 }}>
        <div style={{ width: `${(frame / durationInFrames) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #EF4444, #F59E0B, #10B981)' }} />
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
        id: 15,
        seriesTitle: 'ДНЕВНИК ЛУДОМАНА • ДЕНЬ 2',
        timestamp: '02:47',
        beats: [],
      },
      durationInFrames: 900,
      sfxFiles: {},
    }}
  />
);
