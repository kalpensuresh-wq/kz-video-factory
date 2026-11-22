import React from 'react';
import {
  AbsoluteFill, Audio, Composition, Img, interpolate, Sequence,
  spring, staticFile, useCurrentFrame, useVideoConfig
} from 'remotion';

export interface SceneItem {
  type: string;
  duration: number;
  title?: string;
  highlight?: string;
  label?: string;
  from?: number;
  to?: number;
  notification?: string;
  cta?: string;
  prompt?: string;
  image?: string;
}

export interface VideoProps {
  config: {
    id: number;
    sticker: { code: string; label: string; showAtSec: number };
    scenes: SceneItem[];
  };
  subsKz: string;
  hasAudio?: boolean;
  durationInFrames?: number;
}

// Фон с 3D ИИ-картинкой + живая камера (зум, панорама, лёгкий наклон) + виньетка
const DynamicBackdrop: React.FC<{ image?: string; shake?: boolean; children: React.ReactNode }> = ({
  image,
  shake,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [1.04, 1.18], { extrapolateRight: 'clamp' });
  const panX = interpolate(frame, [0, durationInFrames], [-18, 18]);
  const shakeX = shake && frame < 14 ? Math.sin(frame * 2.5) * (14 - frame) * 1.2 : 0;
  const shakeY = shake && frame < 14 ? Math.cos(frame * 3) * (14 - frame) * 0.8 : 0;
  const flash = interpolate(frame, [0, 6], [0.45, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#020617', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      {image ? (
        <Img
          src={staticFile(image)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale}) translate(${panX + shakeX}px, ${shakeY}px)`,
            filter: 'brightness(0.62) contrast(1.08)',
          }}
        />
      ) : (
        <AbsoluteFill
          style={{
            background: 'radial-gradient(circle at 50% 30%, #1e293b 0%, #020617 100%)',
          }}
        />
      )}

      {/* Киношная виньетка */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle, rgba(2,6,23,0.15) 35%, rgba(2,6,23,0.82) 100%)',
        }}
      />

      {/* Контент сцены */}
      <AbsoluteFill style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}>
        {children}
      </AbsoluteFill>

      {/* Лёгкая вспышка на переходе */}
      {flash > 0 && (
        <AbsoluteFill style={{ backgroundColor: '#ffffff', opacity: flash }} />
      )}
    </AbsoluteFill>
  );
};

// Стеклянная карточка (стекломорфизм)
const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      background: 'rgba(15, 23, 42, 0.58)',
      backdropFilter: 'blur(16px)',
      border: '2px solid rgba(255, 255, 255, 0.18)',
      borderRadius: 32,
      padding: '36px 44px',
      boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
      ...style,
    }}
  >
    {children}
  </div>
);

const SceneHook: React.FC<{ scene: SceneItem }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 11 } });

  return (
    <DynamicBackdrop image={scene.image} shake>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 60, textAlign: 'center' }}>
        <GlassCard style={{ transform: `scale(${pop})`, maxWidth: 920 }}>
          <div style={{ fontSize: 56, fontWeight: 900, color: '#f8fafc', lineHeight: 1.2 }}>
            {scene.title || 'Почему все жмут СТОП?'}
          </div>
          {scene.highlight && (
            <div
              style={{
                marginTop: 28,
                fontSize: 124,
                fontWeight: 900,
                color: '#facc15',
                textShadow: '0 0 35px rgba(250, 204, 21, 0.7)',
              }}
            >
              {scene.highlight}
            </div>
          )}
        </GlassCard>
      </div>
    </DynamicBackdrop>
  );
};

const SceneBar: React.FC<{ scene: SceneItem }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames - 10], [15, 95], { extrapolateRight: 'clamp' });

  return (
    <DynamicBackdrop image={scene.image}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 60 }}>
        <GlassCard style={{ width: 860 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 40, fontWeight: 800, color: '#e2e8f0', marginBottom: 24 }}>
            <span>{scene.label || 'НАПРЯЖЕНИЕ'}</span>
            <span style={{ color: '#ef4444' }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ width: '100%', height: 42, background: 'rgba(255,255,255,0.12)', borderRadius: 21, overflow: 'hidden' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #facc15, #ef4444)',
                borderRadius: 21,
              }}
            />
          </div>
        </GlassCard>
      </div>
    </DynamicBackdrop>
  );
};

const SceneNeonCrash: React.FC<{ scene: SceneItem }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const from = scene.from ?? 1.5;
  const to = scene.to ?? 180;
  const val = interpolate(frame, [0, durationInFrames - 8], [from, to], { extrapolateRight: 'clamp' });
  const endX = interpolate(frame, [0, durationInFrames], [120, 840]);
  const endY = interpolate(frame, [0, durationInFrames], [330, 45]);

  return (
    <DynamicBackdrop image={scene.image} shake>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 50 }}>
        <div
          style={{
            fontSize: 165,
            fontWeight: 900,
            color: '#22d3ee',
            textShadow: '0 0 45px rgba(34, 211, 238, 0.85)',
          }}
        >
          x{val.toFixed(1)}
        </div>
        <GlassCard style={{ marginTop: 30, padding: 24 }}>
          <svg width="860" height="360" viewBox="0 0 900 380">
            <path
              d={`M 50 340 Q 450 310 ${endX} ${endY}`}
              stroke="#facc15"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx={endX} cy={endY} r="18" fill="#22d3ee" />
          </svg>
        </GlassCard>
      </div>
    </DynamicBackdrop>
  );
};

const ScenePushCoins: React.FC<{ scene: SceneItem }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slideY = interpolate(spring({ frame, fps, config: { damping: 12 } }), [0, 1], [-260, 220]);

  return (
    <DynamicBackdrop image={scene.image} shake>
      {/* Реалистичный пуш сверху */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 60,
          right: 60,
          transform: `translateY(${slideY}px)`,
        }}
      >
        <GlassCard style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '28px 36px', background: 'rgba(15, 23, 42, 0.85)' }}>
          <div style={{ fontSize: 64 }}>💰</div>
          <div>
            <div style={{ fontSize: 28, color: '#94a3b8', fontWeight: 600 }}>Зачисление • сейчас</div>
            <div style={{ fontSize: 60, fontWeight: 900, color: '#4ade80' }}>
              {scene.notification || '+1 000 000 ₸'}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Разлетающиеся частицы-монеты */}
      {Array.from({ length: 12 }).map((_, i) => {
        const y = interpolate(frame, [0, 90], [1800, -100 - i * 80]);
        const x = 90 + (i * 82) % 900;
        const rot = frame * (4 + (i % 5));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              fontSize: 54,
              transform: `rotate(${rot}deg)`,
              opacity: 0.85,
            }}
          >
            🪙
          </div>
        );
      })}
    </DynamicBackdrop>
  );
};

const SceneOutro: React.FC<{ scene: SceneItem }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12 } });

  return (
    <DynamicBackdrop image={scene.image}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 70, textAlign: 'center' }}>
        <GlassCard style={{ transform: `scale(${scale})`, border: '3px solid #facc15' }}>
          <div style={{ fontSize: 60, fontWeight: 900, color: '#ffffff', lineHeight: 1.25 }}>
            {scene.cta || 'Всё для уверенного старта — в профиле'}
          </div>
          <div style={{ fontSize: 96, marginTop: 24 }}>👇</div>
        </GlassCard>
      </div>
    </DynamicBackdrop>
  );
};

const MainVideo: React.FC<VideoProps> = ({ config, subsKz, hasAudio }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Прогресс-бар сверху
  const progressPct = (frame / durationInFrames) * 100;

  // Разбивка казахских субтитров по фразам
  const chunks = subsKz.split(/(?<=[.!?])\s+/).filter(Boolean);
  const chunkIndex = Math.min(chunks.length - 1, Math.floor((frame / durationInFrames) * chunks.length));

  // Стикер-заметка в правом верхнем углу
  const showAt = (config.sticker?.showAtSec ?? 3.5) * fps;
  const showSticker = frame >= showAt;
  const stickerScale = showSticker ? spring({ frame: frame - showAt, fps, config: { damping: 10 } }) : 0;

  // Пропорциональное распределение сцен под точную длину озвучки
  const totalDefined = config.scenes.reduce((acc, s) => acc + (s.duration || 5), 0) || 30;
  let offset = 0;

  return (
    <AbsoluteFill>
      {hasAudio && <Audio src={staticFile('voice.mp3')} />}

      {config.scenes.map((scene, idx) => {
        const isLast = idx === config.scenes.length - 1;
        const dur = isLast
          ? Math.max(1, durationInFrames - offset)
          : Math.max(1, Math.round(((scene.duration || 5) / totalDefined) * durationInFrames));
        const from = offset;
        offset += dur;

        return (
          <Sequence key={idx} from={from} durationInFrames={dur}>
            {scene.type === 'notebook_stickman' && <SceneHook scene={scene} />}
            {scene.type === 'pixel_bar' && <SceneBar scene={scene} />}
            {scene.type === 'neon_crash' && <SceneNeonCrash scene={scene} />}
            {scene.type === 'phone_coins' && <ScenePushCoins scene={scene} />}
            {scene.type === 'notebook_outro' && <SceneOutro scene={scene} />}
          </Sequence>
        );
      })}

      {/* Неоновая полоска прогресса сверху */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: 'rgba(255,255,255,0.15)' }}>
        <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, #22d3ee, #facc15)' }} />
      </div>

      {/* Бумажный стикер с промокодом */}
      {showSticker && (
        <div
          style={{
            position: 'absolute',
            top: 95,
            right: 40,
            background: '#fef08a',
            color: '#0f172a',
            padding: '16px 24px',
            borderRadius: 10,
            boxShadow: '0 14px 30px rgba(0,0,0,0.45)',
            transform: `rotate(3deg) scale(${stickerScale})`,
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: 1 }}>{config.sticker.code}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#dc2626', marginTop: 4 }}>{config.sticker.label}</div>
        </div>
      )}

      {/* Аккуратные субтитры на казахском внизу */}
      <div style={{ position: 'absolute', bottom: 155, left: 55, right: 55, textAlign: 'center', fontFamily: 'sans-serif' }}>
        <span
          style={{
            background: 'rgba(2, 6, 23, 0.82)',
            color: '#ffffff',
            fontSize: 34,
            fontWeight: 700,
            padding: '12px 24px',
            borderRadius: 14,
            lineHeight: 1.35,
            display: 'inline-block',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          {chunks[chunkIndex] || ''}
        </span>
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
      config: { id: 1, sticker: { code: '1w_91444', label: '+500% на 4 старта', showAtSec: 3.5 }, scenes: [] },
      subsKz: '',
      hasAudio: false,
      durationInFrames: 900,
    }}
  />
);
    
