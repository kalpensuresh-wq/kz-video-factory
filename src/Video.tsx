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
// MASTER ENGINE v10.1 — CINEMA-GRADE RETENTION & RETENTION-PACING ENGINE
// Fully backward-compatible with v10.0 JSON configs & render.yml v8.2
// ============================================================================

export type SceneType =
  | 'cold_hook'
  | 'kitchen_night'
  | 'walk_rain'
  | 'closeup_face'
  | 'phone_3d'
  | 'rule_card'
  | 'cliffhanger';

export type MoodTone = 'neutral' | 'tension' | 'danger' | 'comeback';
export type EmotionState = 'anxiety' | 'shock' | 'realization' | 'relief';
export type SfxType = 'boom' | 'sms' | 'heartbeat' | 'whoosh' | 'pop' | 'click';

export interface PhoneData {
  mode: 'chat' | 'bank';
  sender?: string;
  avatarLetter?: string;
  avatarColor?: string;
  showTyping?: boolean;
  messages?: Array<{ text: string; time?: string; incoming?: boolean }>;
  bankName?: string;
  cardMask?: string;
  fromAmount?: number;
  toAmount?: number;
  statusText?: string;
  isError?: boolean;
}

export interface RuleCardData {
  tag?: string;
  bigNumber?: string;
  ruleTitle: string;
  ruleSub?: string;
  accentColor?: string;
}

export interface CliffhangerData {
  badge?: string;
  title?: string;
  subText?: string;
  cta?: string;
  loopPhrase?: string;
}

export interface StoryBeat {
  scene: SceneType;
  ru: string;
  kz: string;
  tone?: MoodTone;
  emotion?: EmotionState;
  headline?: string;
  subBadge?: string; // Mid-beat kinetic callout badge (keeps visual change every ~2s)
  hudValue?: string;
  hudColor?: string;
  phone?: PhoneData;
  ruleCard?: RuleCardData;
  cliffhanger?: CliffhangerData;
  sfx?: SfxType;
  shake?: boolean;
  zoomPunch?: boolean;
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
    voiceName?: string;
    bgmVolume?: number;
    beats?: StoryBeat[];
  };
  durationInFrames?: number;
  sfxFiles?: Record<string, string>;
}

const getPalette = (tone: MoodTone) => {
  if (tone === 'danger') {
    return {
      main: '#F87171',
      vivid: '#EF4444',
      glow: 'rgba(239, 68, 68, 0.45)',
      bgTop: '#1A0B14',
      bgMid: '#2E111E',
      bgBot: '#0B060A',
    };
  }
  if (tone === 'comeback') {
    return {
      main: '#34D399',
      vivid: '#10B981',
      glow: 'rgba(16, 185, 129, 0.44)',
      bgTop: '#071B17',
      bgMid: '#0F3028',
      bgBot: '#050C0B',
    };
  }
  if (tone === 'tension') {
    return {
      main: '#FBBF24',
      vivid: '#F59E0B',
      glow: 'rgba(245, 158, 11, 0.40)',
      bgTop: '#171108',
      bgMid: '#2B1F0E',
      bgBot: '#0A0805',
    };
  }
  return {
    main: '#38BDF8',
    vivid: '#0EA5E9',
    glow: 'rgba(56, 189, 248, 0.38)',
    bgTop: '#0C152B',
    bgMid: '#18284A',
    bgBot: '#070C17',
  };
};

// ============================================================================
// AMBIENT ATMOSPHERIC DUST & BOKEH LAYER (KEEPS EVERY FRAME ALIVE)
// ============================================================================

const AtmosphericParticles: React.FC<{ color: string; count?: number }> = ({ color, count = 16 }) => {
  const frame = useCurrentFrame();
  return (
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {Array.from({ length: count }).map((_, i) => {
        const baseX = (i * 173 + 60) % 980;
        const driftX = Math.sin(frame / (18 + (i % 5) * 4) + i) * 28;
        const speedY = 1.1 + (i % 4) * 0.45;
        const y = 1850 - (((frame * speedY + i * 145) % 1750));
        const r = 3 + (i % 4) * 2.5;
        const op = 0.14 + 0.18 * Math.sin(frame / 12 + i * 1.3);
        return <circle key={i} cx={baseX + driftX} cy={y} r={r} fill={color} opacity={Math.max(0.05, op)} />;
      })}
    </svg>
  );
};

// ============================================================================
// 1. EXPRESSIVE CHARACTER RIG (LIP-SYNC + 4 EMOTIONS + HAND/PHONE MOTION)
// ============================================================================

const ExpressiveCharacter: React.FC<{
  emotion: EmotionState;
  tone: MoodTone;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  showPhoneInHand?: boolean;
  isNarrating?: boolean;
}> = ({ emotion, tone, scale = 1, offsetX = 0, offsetY = 0, showPhoneInHand = false, isNarrating = true }) => {
  const frame = useCurrentFrame();
  const pal = getPalette(tone);

  const breath = Math.sin(frame / 8.5) * 6;
  const microTilt =
    emotion === 'shock'
      ? Math.sin(frame * 1.5) * 2.8
      : emotion === 'anxiety'
      ? Math.cos(frame / 5.5) * 2.3
      : Math.sin(frame / 13) * 1.6;

  // Natural double-blink & pupil micro-saccades (looking at phone vs camera)
  const blinkCycle = frame % 74;
  const blink = blinkCycle === 70 || blinkCycle === 71 || blinkCycle === 73;
  const pupilShiftX = showPhoneInHand ? Math.sin(frame / 22) * 3.5 + 2 : Math.sin(frame / 26) * 2.5;
  const pupilShiftY = showPhoneInHand ? (Math.sin(frame / 22) > 0.2 ? 3 : 0) : 0;

  const sweatY = (frame * 2.3) % 54;
  const handLift = emotion === 'shock' ? -22 : emotion === 'realization' ? -12 : Math.sin(frame / 7.5) * 6;

  // Subtle speech jaw/lip motion so close-ups feel alive
  const speechOpen = isNarrating ? Math.max(0, Math.sin(frame * 0.72) * 7 + Math.cos(frame * 1.15) * 4) : 0;

  let leftBrow = 'M 255 282 Q 290 266 325 282';
  let rightBrow = 'M 395 282 Q 430 266 465 282';
  let eyeRy = 19;
  let pupilR = 11.5;
  let mouthPath = `M 322 434 Q 360 ${442 + speechOpen} 398 434`;
  let mouthFill = speechOpen > 4 ? '#5C1919' : 'none';

  if (emotion === 'anxiety') {
    leftBrow = 'M 252 296 L 326 268';
    rightBrow = 'M 468 296 L 394 268';
    eyeRy = 17.5;
    pupilR = 10;
    mouthPath = `M 322 442 Q 360 ${420 + speechOpen * 0.8} 398 442`;
    mouthFill = speechOpen > 5 ? '#5C1919' : 'none';
  } else if (emotion === 'shock') {
    leftBrow = 'M 250 252 Q 290 230 326 256';
    rightBrow = 'M 394 256 Q 430 230 470 252';
    eyeRy = 26;
    pupilR = 8.5;
    mouthPath = 'M 335 426 A 25 29 0 1 0 385 426 A 25 29 0 1 0 335 426 Z';
    mouthFill = '#7F1D1D';
  } else if (emotion === 'realization') {
    leftBrow = 'M 256 270 L 326 284';
    rightBrow = 'M 464 270 L 394 284';
    eyeRy = 20.5;
    pupilR = 12;
    mouthPath = `M 322 432 Q 360 ${436 + speechOpen} 398 428`;
    mouthFill = speechOpen > 4 ? '#5C1919' : 'none';
  } else if (emotion === 'relief') {
    leftBrow = 'M 258 278 Q 290 265 324 278';
    rightBrow = 'M 396 278 Q 430 265 462 278';
    eyeRy = 16;
    pupilR = 11;
    mouthPath = `M 318 424 Q 360 ${462 + speechOpen * 0.5} 402 424 Z`;
    mouthFill = '#FFFFFF';
  }

  return (
    <div
      style={{
        transform: `translate(${offsetX}px, ${offsetY + breath}px) rotate(${microTilt}deg) scale(${scale})`,
        transformOrigin: 'center bottom',
      }}
    >
      <svg width="720" height="840" viewBox="0 0 720 840" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="skinLit" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFE2C7" />
            <stop offset="60%" stopColor="#F0B68A" />
            <stop offset="100%" stopColor="#C9855B" />
          </linearGradient>
          <linearGradient id="hoodieLit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2F4061" />
            <stop offset="100%" stopColor="#141D30" />
          </linearGradient>
          <radialGradient id="rimAura" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor={pal.vivid} stopOpacity="0.52" />
            <stop offset="100%" stopColor={pal.vivid} stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="360" cy="430" rx="350" ry="350" fill="url(#rimAura)" />

        {/* Torso & Hoodie with fabric folds */}
        <path d="M 75 840 C 85 620, 175 565, 360 565 C 545 565, 635 620, 645 840 Z" fill="url(#hoodieLit)" />
        <path d="M 215 625 Q 190 715 165 820" fill="none" stroke="#182236" strokeWidth="10" strokeLinecap="round" opacity="0.65" />
        <path d="M 505 625 Q 530 715 555 820" fill="none" stroke="#182236" strokeWidth="10" strokeLinecap="round" opacity="0.65" />
        <path d="M 265 565 L 360 665 L 455 565 Z" fill="#0F172A" />
        <line x1="305" y1="625" x2="296" y2="755" stroke="#E2E8F0" strokeWidth="7" strokeLinecap="round" opacity="0.75" />
        <line x1="415" y1="625" x2="424" y2="755" stroke="#E2E8F0" strokeWidth="7" strokeLinecap="round" opacity="0.75" />

        {/* Neck & Chin Shadow */}
        <rect x="296" y="468" width="128" height="135" rx="44" fill="#C9855B" />
        <ellipse cx="360" cy="496" rx="70" ry="28" fill="#9E5E39" opacity="0.55" />

        {/* Ears */}
        <ellipse cx="204" cy="340" rx="28" ry="44" fill="#E4A67A" />
        <ellipse cx="516" cy="340" rx="28" ry="44" fill="#C9855B" />

        {/* Head */}
        <rect x="214" y="132" width="292" height="374" rx="138" fill="url(#skinLit)" />
        <rect x="214" y="132" width="70" height="374" rx="35" fill={pal.main} opacity="0.24" />

        {/* Styled Hair */}
        <path
          d="M 204 275 C 192 132, 285 84, 376 92 C 478 102, 528 164, 516 275 C 484 206, 424 180, 360 186 C 288 194, 238 218, 204 275 Z"
          fill="#0F172A"
        />

        {/* Eyebrows */}
        <path d={leftBrow} fill="none" stroke="#0F172A" strokeWidth="14" strokeLinecap="round" />
        <path d={rightBrow} fill="none" stroke="#0F172A" strokeWidth="14" strokeLinecap="round" />

        {/* Eyes with dynamic gaze */}
        {blink ? (
          <>
            <line x1="268" y1="326" x2="320" y2="326" stroke="#0F172A" strokeWidth="10" strokeLinecap="round" />
            <line x1="400" y1="326" x2="452" y2="326" stroke="#0F172A" strokeWidth="10" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="294" cy="326" rx="23" ry={eyeRy} fill="#FFFFFF" />
            <circle cx={294 + pupilShiftX} cy={326 + pupilShiftY} r={pupilR} fill="#0F172A" />
            <circle cx={299 + pupilShiftX} cy={320 + pupilShiftY} r="4.5" fill={pal.main} />

            <ellipse cx="426" cy="326" rx="23" ry={eyeRy} fill="#FFFFFF" />
            <circle cx={426 + pupilShiftX} cy={326 + pupilShiftY} r={pupilR} fill="#0F172A" />
            <circle cx={431 + pupilShiftX} cy={320 + pupilShiftY} r="4.5" fill={pal.main} />
          </>
        )}

        {/* Nose */}
        <path d="M 360 332 L 350 388 L 374 392" fill="none" stroke="#B8744B" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Mouth */}
        <path d={mouthPath} fill={mouthFill} stroke="#7C2D12" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />

        {/* Sweat drop on anxiety / shock */}
        {(emotion === 'anxiety' || emotion === 'shock') && (
          <path
            d={`M 480 ${235 + sweatY} Q 498 ${262 + sweatY} 480 ${276 + sweatY} Q 462 ${262 + sweatY} 480 ${235 + sweatY} Z`}
            fill="#38BDF8"
            opacity={1 - sweatY / 54}
          />
        )}

        {/* Animated Hand & Glowing Smartphone */}
        {showPhoneInHand && (
          <g transform={`translate(0, ${handLift})`}>
            <path d="M 520 790 Q 505 635 455 565" fill="none" stroke="#2F4061" strokeWidth="68" strokeLinecap="round" />
            <rect x="405" y="455" width="96" height="158" rx="18" fill="#090D16" stroke={pal.main} strokeWidth="4" />
            <rect x="415" y="472" width="76" height="122" rx="10" fill={pal.vivid} opacity="0.4" />
            <circle cx="454" cy="575" r="36" fill="#F0B68A" />
          </g>
        )}
      </svg>
    </div>
  );
};

// ============================================================================
// 2. HIGH-CONTRAST SCENES (WITH CONTINUOUS MOTION & PARALLAX)
// ============================================================================

const SceneColdHook: React.FC<{ tone: MoodTone; emotion: EmotionState }> = ({ tone, emotion }) => {
  const frame = useCurrentFrame();
  const pal = getPalette(tone);
  const pulse = 0.85 + 0.15 * Math.sin(frame / 4);
  const spin = frame * 0.4;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 48% 42%, ${pal.bgMid} 0%, ${pal.bgTop} 55%, ${pal.bgBot} 100%)` }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <g transform={`rotate(${spin}, 490, 820)`}>
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (i * 18 * Math.PI) / 180;
            const x1 = 490 + Math.cos(angle) * 240;
            const y1 = 820 + Math.sin(angle) * 240;
            const x2 = 490 + Math.cos(angle) * 1200;
            const y2 = 820 + Math.sin(angle) * 1200;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={pal.main}
                strokeWidth="3.5"
                opacity={0.18 * pulse}
              />
            );
          })}
        </g>
      </svg>

      <AtmosphericParticles color={pal.main} count={18} />

      <div style={{ position: 'absolute', bottom: 560, left: 0, right: 95, display: 'flex', justifyContent: 'center' }}>
        <ExpressiveCharacter emotion={emotion} tone={tone} scale={1.1} offsetX={-25} showPhoneInHand={true} />
      </div>
    </AbsoluteFill>
  );
};

const SceneKitchenNight: React.FC<{ tone: MoodTone; emotion: EmotionState }> = ({ tone, emotion }) => {
  const frame = useCurrentFrame();
  const pal = getPalette(tone);
  const colonOn = Math.floor(frame / 14) % 2 === 0;
  const steamShift = (frame * 2.1) % 85;
  const parallaxX = Math.sin(frame / 20) * 16;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${pal.bgMid} 0%, ${pal.bgTop} 52%, ${pal.bgBot} 100%)` }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="warmCone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.36" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g transform={`translate(${parallaxX}, 0)`}>
          <rect x="65" y="280" width="315" height="450" rx="20" fill="#0B152B" />
          <rect x="82" y="298" width="281" height="414" rx="14" fill="#122242" />
          <circle cx="148" cy="375" r="28" fill="#FEF08A" opacity="0.88" />
          <rect x="105" y="545" width="58" height="185" fill="#1F3666" />
          <rect x="178" y="475" width="74" height="255" fill="#27437D" />
          <rect x="266" y="575" width="84" height="155" fill="#1B2F59" />
          <rect x="218" y="280" width="10" height="450" fill="#2B3B59" />
          <rect x="65" y="505" width="315" height="10" fill="#2B3B59" />
        </g>

        <g transform="translate(635, 305)">
          <rect x="0" y="0" width="255" height="112" rx="22" fill="#090E1A" />
          <rect x="6" y="6" width="243" height="100" rx="18" fill="#17233B" />
          <text x="127" y="78" textAnchor="middle" fill={pal.main} fontSize="62" fontWeight="900" fontFamily="monospace">
            02{colonOn ? ':' : ' '}47
          </text>
        </g>

        <rect x="505" y="0" width="6" height="225" fill="#475569" />
        <path d="M 432 250 L 584 250 L 546 210 L 470 210 Z" fill="#2B3B59" />
        <polygon points="432,250 584,250 965,1250 75,1250" fill="url(#warmCone)" />

        <rect x="0" y="1165" width="1080" height="755" fill="#10182B" />
        <rect x="0" y="1165" width="1080" height="14" fill="#2F4161" />

        <g transform="translate(155, 1060)">
          <rect x="0" y="0" width="82" height="105" rx="16" fill="#415780" />
          <path d="M 82 24 Q 112 24 112 52 Q 112 80 82 80" fill="none" stroke="#415780" strokeWidth="14" />
          <path
            d={`M 26 ${-10 - steamShift} Q 10 ${-40 - steamShift} 28 ${-70 - steamShift}`}
            fill="none"
            stroke="rgba(248, 250, 252, 0.48)"
            strokeWidth="6.5"
            strokeLinecap="round"
            opacity={1 - steamShift / 85}
          />
          <path
            d={`M 56 ${-22 - ((steamShift + 42) % 85)} Q 72 ${-52 - ((steamShift + 42) % 85)} 54 ${-82 - ((steamShift + 42) % 85)}`}
            fill="none"
            stroke="rgba(248, 250, 252, 0.40)"
            strokeWidth="5.5"
            strokeLinecap="round"
            opacity={1 - ((steamShift + 42) % 85) / 85}
          />
        </g>

        <rect x="645" y="1132" width="112" height="24" rx="8" fill="#1E293B" />
        <rect x="653" y="1134" width="96" height="9" rx="4" fill={pal.main} />
      </svg>

      <AtmosphericParticles color={pal.main} count={12} />

      <div style={{ position: 'absolute', bottom: 565, left: 0, right: 95, display: 'flex', justifyContent: 'center' }}>
        <ExpressiveCharacter emotion={emotion} tone={tone} scale={1.04} offsetX={-35} showPhoneInHand={true} />
      </div>
    </AbsoluteFill>
  );
};

const SceneWalkRain: React.FC<{ tone: MoodTone; emotion: EmotionState }> = ({ tone }) => {
  const frame = useCurrentFrame();
  const pal = getPalette(tone);
  const farScroll = (frame * 3.5) % 1080;
  const nearScroll = (frame * 8.8) % 1080;
  const stride = Math.sin(frame * 0.36);
  const bounce = Math.abs(Math.cos(frame * 0.36)) * 13;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${pal.bgMid} 0%, ${pal.bgTop} 58%, ${pal.bgBot} 100%)` }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${-farScroll}, 0)`}>
          {[0, 1080].map((off) => (
            <g key={off} transform={`translate(${off}, 0)`}>
              <rect x="30" y="520" width="170" height="700" fill="#152340" />
              <rect x="225" y="400" width="215" height="820" fill="#1B2C4F" />
              <rect x="470" y="570" width="190" height="650" fill="#131F38" />
              <rect x="690" y="450" width="235" height="770" fill="#1E3157" />
              <rect x="955" y="550" width="125" height="670" fill="#152340" />
            </g>
          ))}
        </g>

        <g transform={`translate(${-nearScroll}, 0)`}>
          {[160, 700, 1240, 1780].map((lx, idx) => (
            <g key={idx} transform={`translate(${lx}, 280)`}>
              <rect x="-6" y="0" width="12" height="940" fill="#2A3A59" />
              <circle cx="0" cy="0" r="22" fill="#FEF08A" />
              <polygon points="-20,0 20,0 260,940 -260,940" fill="#FEF08A" opacity="0.12" />
            </g>
          ))}
        </g>

        <rect x="0" y="1210" width="1080" height="710" fill="#0B1120" />
        <rect x="0" y="1210" width="1080" height="6" fill={pal.main} opacity="0.6" />

        <g transform={`translate(330, ${700 - bounce})`}>
          <line x1="125" y1="315" x2={125 - stride * 66} y2="505" stroke="#18233B" strokeWidth="38" strokeLinecap="round" />
          <line x1="125" y1="315" x2={125 + stride * 66} y2="505" stroke="#2D4066" strokeWidth="40" strokeLinecap="round" />
          <path d="M 65 130 C 65 98, 180 98, 186 142 L 202 335 L 55 335 Z" fill="#374E7A" />
          <line x1="125" y1="165" x2={125 - stride * 54} y2="300" stroke="#486499" strokeWidth="34" strokeLinecap="round" />
          <circle cx="132" cy="62" r="50" fill="#F5C49E" />
          <path d="M 80 65 C 78 16, 150 4, 180 40 C 154 36, 120 44, 80 65 Z" fill="#0F172A" />
        </g>

        {Array.from({ length: 48 }).map((_, i) => {
          const rx = (i * 87) % 1060 + 10;
          const ry = ((frame * (28 + (i % 4) * 5) + i * 110) % 1380) + 15;
          return (
            <line
              key={i}
              x1={rx}
              y1={ry}
              x2={rx - 14}
              y2={ry + 54}
              stroke="rgba(224, 242, 254, 0.42)"
              strokeWidth={i % 3 === 0 ? 3.2 : 1.8}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

const SceneCloseupFace: React.FC<{ tone: MoodTone; emotion: EmotionState }> = ({ tone, emotion }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pal = getPalette(tone);
  const pushIn = interpolate(frame, [0, durationInFrames], [1.03, 1.15], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 48% 44%, ${pal.bgMid} 0%, ${pal.bgTop} 58%, ${pal.bgBot} 100%)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 48% 48%, ${pal.glow} 0%, transparent 64%)` }} />
      <AtmosphericParticles color={pal.main} count={15} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${pushIn}) translate(-35px, -65px)`,
        }}
      >
        <ExpressiveCharacter emotion={emotion} tone={tone} scale={1.12} showPhoneInHand={true} />
      </div>
    </AbsoluteFill>
  );
};

const ScenePhone3D: React.FC<{ phone: PhoneData; tone: MoodTone; emotion: EmotionState }> = ({ phone, tone, emotion }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const pal = getPalette(tone);
  const pop = spring({ frame, fps, config: { damping: 13, stiffness: 135 } });
  const floatY = Math.sin(frame / 11) * 7;

  // Dynamic zoom-in on numbers when bank balance climbs/drops
  const bankZoom =
    phone.mode === 'bank'
      ? interpolate(frame, [6, Math.max(24, durationInFrames * 0.65)], [1.0, 1.07], { extrapolateRight: 'clamp' })
      : 1.0;

  const phoneStyle: React.CSSProperties = {
    position: 'absolute',
    top: 228,
    left: 66,
    right: 132,
    height: 985,
    transform: `perspective(1200px) rotateY(-4deg) rotateX(3deg) scale(${interpolate(pop, [0, 1], [0.88, 1]) * bankZoom}) translateY(${floatY}px)`,
    background: '#0D1426',
    borderRadius: 52,
    border: '7px solid #324469',
    boxShadow: `0 38px 95px rgba(0,0,0,0.85), 0 0 70px ${pal.glow}`,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: 'blur(15px) brightness(0.75)', transform: 'scale(1.1)' }}>
        <SceneKitchenNight tone={tone} emotion={emotion} />
      </AbsoluteFill>

      <div style={phoneStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 34px 14px', color: '#F1F5F9', fontSize: 22, fontWeight: 800 }}>
          <span>02:47</span>
          <div style={{ width: 126, height: 26, borderRadius: 999, background: '#020617' }} />
          <span>5G • 18%</span>
        </div>

        {phone.mode === 'chat' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0D171E' }}>
            <div style={{ background: '#1E2C36', padding: '18px 28px', display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 62, height: 62, borderRadius: '50%', background: phone.avatarColor || '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900, color: '#FFFFFF' }}>
                {phone.avatarLetter || 'Е'}
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#F8FAFC' }}>{phone.sender || 'Друг Ербол'}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: phone.showTyping && frame < 16 ? '#34D399' : '#94A3B8' }}>
                  {phone.showTyping && frame < 16 ? 'печатает...' : 'в сети'}
                </div>
              </div>
            </div>
            <div style={{ flex: 1, padding: '30px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {phone.showTyping && frame < 16 ? (
                <div style={{ alignSelf: 'flex-start', background: '#23313B', borderRadius: 24, padding: '18px 28px', display: 'flex', gap: 10 }}>
                  {[0, 1, 2].map((d) => (
                    <div key={d} style={{ width: 14, height: 14, borderRadius: '50%', background: '#CBD5E1', opacity: 0.35 + 0.65 * Math.abs(Math.sin(frame / 4 + d)) }} />
                  ))}
                </div>
              ) : (
                (phone.messages || []).map((m, idx) => {
                  const delay = (phone.showTyping ? 16 : 4) + idx * 12;
                  const mPop = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 13 } });
                  const inc = m.incoming !== false;
                  return (
                    <div
                      key={idx}
                      style={{
                        alignSelf: inc ? 'flex-start' : 'flex-end',
                        maxWidth: '88%',
                        transform: `scale(${mPop})`,
                        background: inc ? '#23313B' : '#047857',
                        color: '#F8FAFC',
                        borderRadius: 24,
                        padding: '22px 26px',
                        fontSize: 32,
                        fontWeight: 700,
                        lineHeight: 1.28,
                      }}
                    >
                      <div>{m.text}</div>
                      <div style={{ textAlign: 'right', fontSize: 18, color: '#CBD5E1', marginTop: 6 }}>{m.time || '02:47'}</div>
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
            interpolate(frame, [6, Math.max(24, durationInFrames * 0.56)], [fromVal, toVal], {
              easing: Easing.out(Easing.cubic),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          );
          const isErr = phone.isError ?? toVal < fromVal;
          const statusPop = spring({ frame: Math.max(0, frame - Math.round(durationInFrames * 0.38)), fps, config: { damping: 12 } });
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
                <div style={{ fontSize: 23, fontWeight: 700, color: '#CBD5E1' }}>БАЛАНС НА КАРТЕ</div>
                <div style={{ fontSize: 74, fontWeight: 900, color: isErr ? '#F87171' : '#34D399', marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>
                  {curVal.toLocaleString('ru-RU')} ₸
                </div>
              </div>
              {phone.statusText && statusPop > 0.05 && (
                <div style={{ marginTop: 'auto', marginBottom: 20, transform: `scale(${statusPop})`, background: isErr ? '#DC2626' : '#059669', borderRadius: 24, padding: '22px 26px', textAlign: 'center', color: '#FFFFFF', fontSize: 30, fontWeight: 900 }}>
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
// 3. DARK HIGH-IMPACT RULE CARD (ONE BOLD RULE, NO BLINDING FLASH)
// ============================================================================

const SceneRuleCard: React.FC<{ data: RuleCardData; tone: MoodTone }> = ({ data, tone }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pal = getPalette(tone);
  const cardPop = spring({ frame, fps, config: { damping: 12, stiffness: 125 } });
  const accentCol = data.accentColor || pal.main;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 45%, ${pal.bgMid} 0%, ${pal.bgTop} 60%, ${pal.bgBot} 100%)`,
        padding: '220px 132px 580px 54px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <AtmosphericParticles color={accentCol} count={14} />

      <div
        style={{
          width: '100%',
          transform: `scale(${interpolate(cardPop, [0, 1], [0.86, 1])})`,
          background: 'rgba(15, 23, 42, 0.94)',
          border: `3px solid ${accentCol}`,
          borderRadius: 36,
          padding: '44px 32px',
          boxShadow: `0 28px 80px rgba(0,0,0,0.75), 0 0 45px ${pal.glow}`,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            background: accentCol,
            color: '#090D16',
            padding: '8px 22px',
            borderRadius: 999,
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: 1.4,
          }}
        >
          {data.tag || 'ГЛАВНОЕ ПРАВИЛО'}
        </div>

        {data.bigNumber && (
          <div style={{ fontSize: 82, fontWeight: 900, color: accentCol, marginTop: 18, lineHeight: 1.05 }}>
            {data.bigNumber}
          </div>
        )}

        <div style={{ fontSize: 44, fontWeight: 900, color: '#F8FAFC', marginTop: 20, lineHeight: 1.18 }}>
          {data.ruleTitle}
        </div>

        {data.ruleSub && (
          <div style={{ fontSize: 28, fontWeight: 700, color: '#CBD5E1', marginTop: 14, lineHeight: 1.3 }}>
            {data.ruleSub}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// 4. CLIFFHANGER + QUESTION HOOK FOR COMMENTS & SEAMLESS LOOP
// ============================================================================

const SceneCliffhanger: React.FC<{ data: CliffhangerData; tone: MoodTone; emotion: EmotionState }> = ({ data, tone, emotion }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 13 } });
  const pulse = 1 + Math.sin(frame / 6) * 0.035;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: 'blur(18px) brightness(0.65)', transform: 'scale(1.1)' }}>
        <SceneKitchenNight tone={tone} emotion={emotion} />
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          top: 245,
          left: 56,
          right: 130,
          transform: `scale(${pop})`,
          background: 'rgba(11, 17, 30, 0.95)',
          border: '3px solid #FACC15',
          borderRadius: 36,
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 32px 90px rgba(0,0,0,0.85)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'inline-block', background: '#EF4444', color: '#FFFFFF', padding: '8px 22px', borderRadius: 999, fontSize: 22, fontWeight: 900, letterSpacing: 1.4 }}>
          {data.badge || 'ПРОДОЛЖЕНИЕ В ЧАТЕ'}
        </div>
        <div style={{ fontSize: 46, fontWeight: 900, color: '#F8FAFC', marginTop: 22, lineHeight: 1.15 }}>
          {data.title || 'Что увидела жена утром?'}
        </div>
        {data.subText && (
          <div style={{ fontSize: 28, fontWeight: 700, color: '#FACC15', marginTop: 14, lineHeight: 1.28 }}>
            {data.subText}
          </div>
        )}
        <div
          style={{
            marginTop: 30,
            transform: `scale(${pulse})`,
            background: '#FACC15',
            color: '#0F172A',
            borderRadius: 22,
            padding: '18px 24px',
            fontSize: 29,
            fontWeight: 900,
          }}
        >
          {data.cta || 'Ссылка в профиле ↑ • Напиши в комменты'}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// 5. BULLETPROOF KAZAKH SUBTITLES (EXPLICIT SPACING + SAFE ZONE) & ANCHOR HUD
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
          alignItems: 'center',
          columnGap: 14,
          rowGap: 6,
          background: 'rgba(6, 10, 20, 0.90)',
          border: '1.5px solid rgba(255,255,255,0.20)',
          borderRadius: 20,
          padding: '14px 24px',
          boxShadow: '0 14px 36px rgba(0,0,0,0.78)',
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
                padding: isCur ? '2px 10px' : '2px 2px',
                margin: isCur ? '0 2px' : '0',
                borderRadius: 10,
                background: isCur ? 'rgba(250, 204, 21, 0.18)' : 'transparent',
                display: 'inline-block',
                whiteSpace: 'nowrap',
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
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(8, 12, 22, 0.92)', border: '1.5px solid rgba(255,255,255,0.18)', borderRadius: 999, padding: '10px 20px' }}>
        <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#EF4444', opacity: recOn ? 1 : 0.25, boxShadow: recOn ? '0 0 12px #EF4444' : 'none' }} />
        <span style={{ fontSize: 22, fontWeight: 900, color: '#F8FAFC', letterSpacing: 0.8 }}>{title || 'НЕВЫДУМАННЫЕ ИСТОРИИ'}</span>
      </div>
      {hudValue && (
        <div style={{ background: 'rgba(8, 12, 22, 0.94)', border: `2px solid ${hudColor || '#38BDF8'}`, borderRadius: 999, padding: '8px 18px', fontSize: 22, fontWeight: 900, color: hudColor || '#F8FAFC', fontFamily: 'monospace' }}>
          {hudValue}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// BEAT RENDERER (WHIP-PAN + MID-BEAT ZOOM CUT + KINETIC SUB-BADGE)
// ============================================================================

const BeatSegment: React.FC<{
  beat: StoryBeat;
  index: number;
  sfxFiles?: Record<string, string>;
}> = ({ beat, index, sfxFiles }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const tone: MoodTone = beat.tone || 'neutral';
  const emotion: EmotionState =
    beat.emotion || (tone === 'danger' ? 'shock' : tone === 'comeback' ? 'relief' : tone === 'tension' ? 'anxiety' : 'realization');
  const sfxPath = beat.sfx && sfxFiles?.[beat.sfx] ? sfxFiles[beat.sfx] : undefined;

  // 1. Whip-pan entrance
  const whipX = index === 0 ? 0 : interpolate(frame, [0, 6], [150, 0], { easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp' });
  const whipBlur = index === 0 ? 0 : interpolate(frame, [0, 5], [9, 0], { extrapolateRight: 'clamp' });

  // 2. Micro-cut punch halfway through longer beats (> 3.2s) so camera angle shifts every ~2s
  const midPoint = Math.floor(durationInFrames * 0.52);
  const hasMidCut = durationInFrames > 96 && beat.scene !== 'phone_3d' && beat.scene !== 'rule_card';
  const midCutScale = hasMidCut && frame >= midPoint ? 1.07 : 1.0;

  const punchScale = beat.zoomPunch
    ? interpolate(frame, [0, 8], [1.15, 1.0], { easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp' })
    : 1.0;

  const shakeX = beat.shake && frame < 16 ? Math.sin(frame * 4.4) * (16 - frame) * 0.95 : 0;
  const shakeY = beat.shake && frame < 16 ? Math.cos(frame * 4.8) * (16 - frame) * 0.75 : 0;

  // Mid-beat kinetic callout badge (appears at ~45% of beat)
  const subBadgeStart = Math.floor(durationInFrames * 0.44);
  const subBadgePop = beat.subBadge
    ? spring({ frame: Math.max(0, frame - subBadgeStart), fps, config: { damping: 12, stiffness: 140 } })
    : 0;

  return (
    <AbsoluteFill>
      {beat.audioFile && <Audio src={staticFile(beat.audioFile)} />}
      {sfxPath && <Audio src={staticFile(sfxPath)} volume={0.65} />}

      <AbsoluteFill
        style={{
          transform: `translate(${whipX + shakeX}px, ${shakeY}px) scale(${punchScale * midCutScale})`,
          filter: whipBlur > 0.2 ? `blur(${whipBlur}px)` : undefined,
        }}
      >
        {beat.scene === 'cold_hook' && <SceneColdHook tone={tone} emotion={emotion} />}
        {beat.scene === 'kitchen_night' && <SceneKitchenNight tone={tone} emotion={emotion} />}
        {beat.scene === 'walk_rain' && <SceneWalkRain tone={tone} emotion={emotion} />}
        {beat.scene === 'closeup_face' && <SceneCloseupFace tone={tone} emotion={emotion} />}
        {beat.scene === 'phone_3d' && beat.phone && <ScenePhone3D phone={beat.phone} tone={tone} emotion={emotion} />}
        {beat.scene === 'rule_card' && beat.ruleCard && <SceneRuleCard data={beat.ruleCard} tone={tone} />}
        {beat.scene === 'cliffhanger' && beat.cliffhanger && <SceneCliffhanger data={beat.cliffhanger} tone={tone} emotion={emotion} />}

        {beat.headline && beat.scene !== 'rule_card' && (
          <div
            style={{
              position: 'absolute',
              top: 215,
              left: 52,
              right: 130,
              textAlign: 'center',
              fontSize: 54,
              fontWeight: 900,
              color: tone === 'danger' ? '#F87171' : tone === 'comeback' ? '#34D399' : '#F8FAFC',
              textShadow: '0 10px 32px rgba(0,0,0,0.92)',
              lineHeight: 1.14,
            }}
          >
            {beat.headline}
          </div>
        )}

        {beat.subBadge && frame >= subBadgeStart && (
          <div
            style={{
              position: 'absolute',
              top: beat.headline ? 360 : 240,
              left: 0,
              right: 85,
              display: 'flex',
              justifyContent: 'center',
              transform: `scale(${subBadgePop})`,
            }}
          >
            <div
              style={{
                background: tone === 'danger' ? '#DC2626' : tone === 'comeback' ? '#059669' : '#F59E0B',
                color: tone === 'tension' ? '#090D16' : '#FFFFFF',
                padding: '12px 28px',
                borderRadius: 999,
                fontSize: 32,
                fontWeight: 900,
                boxShadow: '0 14px 36px rgba(0,0,0,0.65)',
              }}
            >
              {beat.subBadge}
            </div>
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
  const bgmVol = config.bgmVolume ?? 0.16;

  const activeBeat =
    beats.find((b) => frame >= (b.fromFrame ?? 0) && frame < (b.fromFrame ?? 0) + (b.durationInFrames ?? 90)) ||
    beats[0];

  return (
    <AbsoluteFill style={{ backgroundColor: '#060914', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
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

      <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(circle, transparent 60%, rgba(0,0,0,0.40) 100%)', zIndex: 25 }} />

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
        id: 16,
        seriesTitle: 'НЕВЫДУМАННЫЕ ИСТОРИИ',
        timestamp: '02:47',
        beats: [],
      },
      durationInFrames: 900,
      sfxFiles: {},
    }}
  />
);
