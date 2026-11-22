import React from 'react';
import {
  AbsoluteFill, Audio, Composition, interpolate, Sequence,
  spring, staticFile, useCurrentFrame, useVideoConfig
} from 'remotion';

export interface VideoProps {
  config: {
    id: number;
    sticker: { code: string; label: string; showAtSec: number };
    scenes: Array<{
      type: string;
      duration: number;
      title?: string;
      highlight?: string;
      label?: string;
      from?: number;
      to?: number;
      notification?: string;
      cta?: string;
    }>;
  };
  subsKz: string;
  hasAudio?: boolean;
}

const NotebookBg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      backgroundColor: '#fdfbf7',
      backgroundImage:
        'linear-gradient(#e5e7eb 2px, transparent 2px), linear-gradient(90deg, transparent 90px, #fca5a5 90px, #fca5a5 93px, transparent 93px)',
      backgroundSize: '100% 56px, 100% 100%',
      fontFamily: 'sans-serif',
      color: '#1e293b',
    }}
  >
    {children}
  </AbsoluteFill>
);

const SceneStickman: React.FC<{ title?: string; highlight?: string }> = ({ title, highlight }) => {
  const frame = useCurrentFrame();
  const bounce = Math.sin(frame / 6) * 8;
  return (
    <NotebookBg>
      <div style={{ padding: '140px 60px 0 120px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 64, fontWeight: 900, background: '#fef08a', display: 'inline', padding: '4px 16px' }}>
          {title || 'Почему все жмут СТОП?'}
        </h1>
        <div style={{ marginTop: 70, fontSize: 110, fontWeight: 900, color: '#dc2626', border: '6px solid #dc2626', borderRadius: '50%', width: 320, height: 180, lineHeight: '168px', margin: '60px auto' }}>
          {highlight || 'x1.5'}
        </div>
        <svg width="300" height="420" viewBox="0 0 200 300" style={{ marginTop: 20, transform: `translateY(${bounce}px)` }}>
          <circle cx="100" cy="60" r="35" stroke="#0f172a" strokeWidth="8" fill="none" />
          <line x1="100" y1="95" x2="100" y2="195" stroke="#0f172a" strokeWidth="8" />
          <line x1="100" y1="125" x2="45" y2="165" stroke="#0f172a" strokeWidth="8" />
          <line x1="100" y1="125" x2="155" y2="95" stroke="#0f172a" strokeWidth="8" />
          <line x1="100" y1="195" x2="60" y2="275" stroke="#0f172a" strokeWidth="8" />
          <line x1="100" y1="195" x2="140" y2="275" stroke="#0f172a" strokeWidth="8" />
        </svg>
      </div>
    </NotebookBg>
  );
};

const ScenePixel: React.FC<{ label?: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  const blocks = Math.min(10, Math.floor(frame / 12) + 1);
  return (
    <AbsoluteFill style={{ backgroundColor: '#1e1b4b', color: '#facc15', fontFamily: 'monospace', justifyContent: 'center', alignItems: 'center', padding: 60 }}>
      <div style={{ fontSize: 54, fontWeight: 900, marginBottom: 40 }}>{label || 'НЕРВЫ'}</div>
      <div style={{ display: 'flex', gap: 10, border: '6px solid #fff', padding: 14, background: '#0f172a' }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{ width: 56, height: 70, background: i < blocks ? '#ef4444' : '#334155' }} />
        ))}
      </div>
      <div style={{ fontSize: 90, marginTop: 90, transform: `translateY(${-frame * 2.5}px)` }}>🚀</div>
    </AbsoluteFill>
  );
};

const SceneNeon: React.FC<{ from?: number; to?: number }> = ({ from = 1.5, to = 180 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const val = interpolate(frame, [0, durationInFrames - 10], [from, to], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(circle, #1e1b4b 0%, #020617 100%)', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: 150, fontWeight: 900, color: '#22d3ee', textShadow: '0 0 40px #22d3ee' }}>
        x{val.toFixed(1)}
      </div>
      <svg width="900" height="400" viewBox="0 0 900 400" style={{ marginTop: 40 }}>
        <path
          d={`M 50 350 Q 450 320 ${interpolate(frame, [0, durationInFrames], [120, 850])} ${interpolate(frame, [0, durationInFrames], [320, 40])}`}
          stroke="#facc15"
          strokeWidth="12"
          fill="none"
        />
      </svg>
    </AbsoluteFill>
  );
};

const ScenePhone: React.FC<{ notification?: string }> = ({ notification }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12 } });
  return (
    <NotebookBg>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', transform: `scale(${scale})` }}>
        <div style={{ width: 640, background: '#0f172a', borderRadius: 48, padding: 48, border: '10px solid #334155', color: '#fff', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ fontSize: 32, color: '#94a3b8', marginBottom: 20 }}>Уведомление • сейчас</div>
          <div style={{ fontSize: 74, fontWeight: 900, color: '#4ade80' }}>{notification || '+1 000 000 ₸'}</div>
        </div>
      </div>
    </NotebookBg>
  );
};

const SceneOutro: React.FC<{ cta?: string }> = ({ cta }) => (
  <NotebookBg>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 80, textAlign: 'center' }}>
      <div style={{ fontSize: 68, fontWeight: 900, background: '#fef08a', padding: '24px 36px', borderRadius: 16 }}>
        {cta || 'Всё для уверенного старта — в профиле'}
      </div>
      <div style={{ fontSize: 110, marginTop: 40 }}>👇</div>
    </div>
  </NotebookBg>
);

const MainVideo: React.FC<VideoProps> = ({ config, subsKz, hasAudio }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Разбивка казахских субтитров по фразам
  const chunks = subsKz.split(/(?<=[.!?])\s+/).filter(Boolean);
  const chunkIndex = Math.min(chunks.length - 1, Math.floor((frame / durationInFrames) * chunks.length));

  // Стикер-заметка (появляется на showAtSec)
  const showSticker = frame >= (config.sticker?.showAtSec || 3.5) * fps;
  const stickerScale = showSticker ? spring({ frame: frame - (config.sticker?.showAtSec || 3.5) * fps, fps }) : 0;

  let offset = 0;

  return (
    <AbsoluteFill>
      {hasAudio && <Audio src={staticFile('voice.mp3')} />}

      {config.scenes.map((scene, idx) => {
        const dur = scene.duration * fps;
        const from = offset;
        offset += dur;
        return (
          <Sequence key={idx} from={from} durationInFrames={dur}>
            {scene.type === 'notebook_stickman' && <SceneStickman title={scene.title} highlight={scene.highlight} />}
            {scene.type === 'pixel_bar' && <ScenePixel label={scene.label} />}
            {scene.type === 'neon_crash' && <SceneNeon from={scene.from} to={scene.to} />}
            {scene.type === 'phone_coins' && <ScenePhone notification={scene.notification} />}
            {scene.type === 'notebook_outro' && <SceneOutro cta={scene.cta} />}
          </Sequence>
        );
      })}

      {/* Бумажный стикер в правом верхнем углу */}
      {showSticker && (
        <div
          style={{
            position: 'absolute',
            top: 110,
            right: 45,
            background: '#fef08a',
            color: '#0f172a',
            padding: '18px 24px',
            borderRadius: 8,
            boxShadow: '0 12px 25px rgba(0,0,0,0.25)',
            transform: `rotate(3deg) scale(${stickerScale})`,
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: 1 }}>{config.sticker.code}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#dc2626', marginTop: 4 }}>{config.sticker.label}</div>
        </div>
      )}

      {/* Аккуратные субтитры на казахском внизу */}
      <div
        style={{
          position: 'absolute',
          bottom: 150,
          left: 60,
          right: 60,
          textAlign: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <span
          style={{
            background: 'rgba(15, 23, 42, 0.78)',
            color: '#ffffff',
            fontSize: 34,
            fontWeight: 600,
            padding: '10px 22px',
            borderRadius: 12,
            lineHeight: 1.35,
            display: 'inline-block',
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
    defaultProps={{
      config: { id: 1, sticker: { code: '1w_91444', label: '+500% на 4 старта', showAtSec: 3.5 }, scenes: [] },
      subsKz: '',
      hasAudio: false,
    }}
  />
);
                   
