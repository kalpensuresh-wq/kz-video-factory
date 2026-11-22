import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Composition,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export interface VideoProps {
  config: {
    id: number;
    sticker: { code: string; label: string; showAtSec: number };
    scenes?: any[];
  };
  subsKz: string;
  hasAudio?: boolean;
  durationInFrames?: number;
}

// 1. Фон с глубиной: движущаяся сетка + мягкие неоновые пятна
const AmbientBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const gridOffset = (frame * 0.8) % 80;
  const glowX = interpolate(Math.sin(frame / 45), [-1, 1], [15, 85]);
  const glowY = interpolate(Math.cos(frame / 60), [-1, 1], [20, 75]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#070B14', overflow: 'hidden' }}>
      {/* Мягкое световое пятно */}
      <div
        style={{
          position: 'absolute',
          left: `${glowX}%`,
          top: `${glowY}%`,
          width: 900,
          height: 900,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(7,11,20,0) 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '-10%',
          bottom: '10%',
          width: 750,
          height: 750,
          background: 'radial-gradient(circle, rgba(250,204,21,0.12) 0%, rgba(7,11,20,0) 70%)',
          filter: 'blur(50px)',
        }}
      />
      {/* Тонкая инженерная сетка */}
      <svg width="1080" height="1920" style={{ opacity: 0.14 }}>
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform={`translate(0, ${gridOffset})`}>
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#grid)" />
      </svg>
    </AbsoluteFill>
  );
};

// 2. Сцена 1 (0% – 28%): Ловушка 96% RTP + механический счётчик + рукописная обводка
const ActHook: React.FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = interpolate(spring({ frame, fps, config: { damping: 14 } }), [0, 1], [60, 0]);
  const titleOp = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });

  const rtpVal = Math.round(
    interpolate(frame, [8, 42], [12, 96], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  // Анимация зачёркивания "96 000 ₸"
  const strikeProgress = interpolate(frame, [55, 75], [460, 0], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const exitY = interpolate(progress, [0.85, 1], [0, -140], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exitOp = interpolate(progress, [0.85, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: 70,
        opacity: exitOp,
        transform: `translateY(${exitY}px)`,
      }}
    >
      <div style={{ textAlign: 'center', transform: `translateY(${titleY}px)`, opacity: titleOp }}>
        <div
          style={{
            display: 'inline-block',
            padding: '10px 26px',
            borderRadius: 999,
            border: '1.5px solid rgba(56,189,248,0.45)',
            background: 'rgba(56,189,248,0.12)',
            color: '#38BDF8',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 2,
            marginBottom: 28,
          }}
        >
          МАТЕМАТИКА СЛОТОВ
        </div>

        <div style={{ fontSize: 64, fontWeight: 900, color: '#F8FAFC', lineHeight: 1.15 }}>
          Ловушка отдачи
        </div>

        {/* Гигантский одометр RTP */}
        <div
          style={{
            fontSize: 220,
            fontWeight: 900,
            color: '#FACC15',
            lineHeight: 1,
            marginTop: 24,
            letterSpacing: -6,
            textShadow: '0 0 60px rgba(250,204,21,0.35)',
          }}
        >
          {rtpVal}%
        </div>

        {/* Карточка сравнения 100 000 -> 96 000 (перечёркнуто красным маркером) */}
        <div
          style={{
            marginTop: 48,
            background: 'rgba(15, 23, 42, 0.78)',
            border: '1.5px solid rgba(255,255,255,0.12)',
            borderRadius: 28,
            padding: '34px 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
            position: 'relative',
          }}
        >
          <div style={{ fontSize: 44, fontWeight: 800, color: '#CBD5E1' }}>100 000 ₸</div>
          <div style={{ fontSize: 40, color: '#64748B' }}>→</div>
          <div style={{ position: 'relative', fontSize: 48, fontWeight: 900, color: '#F8FAFC' }}>
            96 000 ₸
            <svg
              width="250"
              height="60"
              viewBox="0 0 250 60"
              style={{ position: 'absolute', left: -12, top: 2, overflow: 'visible' }}
            >
              <path
                d="M 5 48 Q 125 18 245 10"
                fill="none"
                stroke="#EF4444"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="460"
                strokeDashoffset={strikeProgress}
              />
            </svg>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 3. Сцена 2 (28% – 72%): Живой SVG-график дисперсии с просадкой и выстрелом +300 000 ₸
const ActVarianceGraph: React.FC<{ localFrame: number; progress: number }> = ({ localFrame, progress }) => {
  const { fps } = useVideoConfig();
  const enterOp = interpolate(localFrame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  const exitOp = interpolate(progress, [0.88, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Прорисовка кривой графика
  const pathLength = 1500;
  const drawProgress = interpolate(localFrame, [10, 135], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const dashOffset = pathLength * (1 - drawProgress);

  // Живой счётчик баланса синхронно с графиком
  const balance =
    drawProgress < 0.55
      ? Math.round(interpolate(drawProgress, [0, 0.55], [100000, 38000]))
      : Math.round(interpolate(drawProgress, [0.55, 1], [38000, 340000], { easing: Easing.out(Easing.exp) }));

  const isProfit = balance >= 100000;
  const badgeScale =
    drawProgress > 0.78 ? spring({ frame: Math.max(0, localFrame - 105), fps, config: { damping: 10 } }) : 0;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: 55,
        opacity: enterOp * exitOp,
      }}
    >
      <div style={{ width: '100%', maxWidth: 940 }}>
        {/* Верхняя панель баланса */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 28,
            padding: '0 10px',
          }}
        >
          <div>
            <div style={{ fontSize: 28, color: '#94A3B8', fontWeight: 700, letterSpacing: 1.5 }}>
              ДИСПЕРСИЯ СЕССИИ
            </div>
            <div
              style={{
                fontSize: 82,
                fontWeight: 900,
                color: isProfit ? '#4ADE80' : '#F87171',
                marginTop: 6,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {balance.toLocaleString('ru-RU')} ₸
            </div>
          </div>

          {badgeScale > 0 && (
            <div
              style={{
                transform: `scale(${badgeScale})`,
                background: 'rgba(74, 222, 128, 0.16)',
                border: '2px solid #4ADE80',
                color: '#4ADE80',
                padding: '12px 24px',
                borderRadius: 18,
                fontSize: 34,
                fontWeight: 900,
              }}
            >
              +300 000 ₸
            </div>
          )}
        </div>

        {/* Карточка с векторным графиком */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1.5px solid rgba(255,255,255,0.12)',
            borderRadius: 32,
            padding: '40px 30px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
          }}
        >
          <svg width="880" height="480" viewBox="0 0 880 480">
            {/* Базовая линия старта (100 000 ₸) */}
            <line x1="20" y1="300" x2="860" y2="300" stroke="#475569" strokeWidth="2" strokeDasharray="10 10" />
            <text x="26" y="286" fill="#64748B" fontSize="22" fontWeight="700">
              СТАРТ 100 000 ₸
            </text>

            {/* Главная кривая: сначала просадка, потом резкий пробой вверх */}
            <path
              d="M 20 300 C 120 310, 170 370, 260 390 C 350 410, 420 430, 500 415 C 580 400, 620 260, 700 140 C 750 65, 810 45, 855 35"
              fill="none"
              stroke={isProfit ? '#38BDF8' : '#F87171'}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={pathLength}
              strokeDashoffset={dashOffset}
              style={{ filter: `drop-shadow(0 0 18px ${isProfit ? 'rgba(56,189,248,0.75)' : 'rgba(248,113,113,0.6)'})` }}
            />
          </svg>

          {/* Нижние метки */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, color: '#64748B', fontSize: 24, fontWeight: 700 }}>
            <span>10 спинов</span>
            <span>50 спинов</span>
            <span>120 спинов</span>
            <span style={{ color: '#FACC15' }}>МНОЖИТЕЛЬ</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 4. Сцена 3 (72% – 100%): Сравнение дистанции + чистый CTA
const ActDistanceOutro: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const { fps } = useVideoConfig();
  const enter = spring({ frame: localFrame, fps, config: { damping: 14 } });

  const bar1 = interpolate(spring({ frame: Math.max(0, localFrame - 6), fps, config: { damping: 15 } }), [0, 1], [0, 28]);
  const bar2 = interpolate(spring({ frame: Math.max(0, localFrame - 16), fps, config: { damping: 15 } }), [0, 1], [0, 96]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: 65,
        opacity: enter,
        transform: `scale(${interpolate(enter, [0, 1], [0.92, 1])})`,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 920,
          background: 'rgba(15, 23, 42, 0.85)',
          border: '2px solid rgba(250, 204, 21, 0.45)',
          borderRadius: 34,
          padding: '48px 44px',
          boxShadow: '0 25px 70px rgba(0,0,0,0.55)',
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 900, color: '#F8FAFC', marginBottom: 38 }}>
          Решает запас на дистанцию
        </div>

        {/* Полоска 1 */}
        <div style={{ marginBottom: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 28, color: '#94A3B8', fontWeight: 700, marginBottom: 10 }}>
            <span>Короткий банк</span>
            <span>Высокий риск</span>
          </div>
          <div style={{ height: 28, background: 'rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ width: `${bar1}%`, height: '100%', background: '#EF4444', borderRadius: 14 }} />
          </div>
        </div>

        {/* Полоска 2 */}
        <div style={{ marginBottom: 44 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 28, color: '#FACC15', fontWeight: 800, marginBottom: 10 }}>
            <span>Банк с бонусом +500%</span>
            <span>Запас на икс</span>
          </div>
          <div style={{ height: 28, background: 'rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
            <div
              style={{
                width: `${bar2}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #38BDF8, #FACC15)',
                borderRadius: 14,
              }}
            />
          </div>
        </div>

        {/* Финальный CTA */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: 32,
            textAlign: 'center',
            fontSize: 40,
            fontWeight: 900,
            color: '#FFFFFF',
          }}
        >
          Всё для уверенного старта — <span style={{ color: '#FACC15' }}>в профиле</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 5. Караоке-субтитры на казахском (без чёрных плашек, стабильная вёрстка, подсветка слов)
const KaraokeCaptions: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;

  const activeWordIdx = Math.min(words.length - 1, Math.floor((frame / durationInFrames) * words.length));
  const chunkSize = 5;
  const chunkIdx = Math.floor(activeWordIdx / chunkSize);
  const start = chunkIdx * chunkSize;
  const visibleWords = words.slice(start, start + chunkSize);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 165,
        left: 60,
        right: 60,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '10px 14px',
        fontFamily: 'sans-serif',
      }}
    >
      {visibleWords.map((word, i) => {
        const isCurrent = start + i === activeWordIdx;
        return (
          <span
            key={`${start + i}`}
            style={{
              fontSize: 44,
              fontWeight: 900,
              color: isCurrent ? '#FACC15' : '#F8FAFC',
              textShadow: '0 4px 18px rgba(0,0,0,0.95)',
              transform: isCurrent ? 'scale(1.08)' : 'scale(1)',
              display: 'inline-block',
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

const MainVideo: React.FC<VideoProps> = ({ config, subsKz, hasAudio }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const t = frame / durationInFrames;
  const act1End = Math.round(durationInFrames * 0.28);
  const act2End = Math.round(durationInFrames * 0.72);

  // Лёгкий зум камеры на протяжении всего ролика
  const cameraScale = interpolate(frame, [0, durationInFrames], [1, 1.05]);

  // Аккуратный бейдж промокода сверху
  const showAt = (config.sticker?.showAtSec ?? 3.5) * fps;
  const stickerSpring = frame >= showAt ? spring({ frame: frame - showAt, fps, config: { damping: 12 } }) : 0;

  return (
    <AbsoluteFill style={{ fontFamily: 'sans-serif', backgroundColor: '#070B14' }}>
      {hasAudio && <Audio src={staticFile('voice.mp3')} />}

      <AbsoluteFill style={{ transform: `scale(${cameraScale})` }}>
        <AmbientBackground />

        {frame < act1End && <ActHook progress={frame / act1End} />}

        {frame >= act1End && frame < act2End && (
          <ActVarianceGraph localFrame={frame - act1End} progress={(frame - act1End) / (act2End - act1End)} />
        )}

        {frame >= act2End && <ActDistanceOutro localFrame={frame - act2End} />}
      </AbsoluteFill>

      {/* Полоска прогресса сверху */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: 'rgba(255,255,255,0.1)' }}>
        <div style={{ width: `${t * 100}%`, height: '100%', background: 'linear-gradient(90deg, #38BDF8, #FACC15)' }} />
      </div>

      {/* Стильный бейдж промокода */}
      {stickerSpring > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 85,
            right: 45,
            transform: `scale(${stickerSpring})`,
            background: 'rgba(15, 23, 42, 0.9)',
            border: '2px solid #FACC15',
            borderRadius: 16,
            padding: '12px 22px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
            textAlign: 'right',
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 900, color: '#FACC15', letterSpacing: 1 }}>
            {config.sticker.code}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#E2E8F0', marginTop: 2 }}>
            {config.sticker.label}
          </div>
        </div>
      )}

      {/* Караоке-субтитры на казахском */}
      <KaraokeCaptions text={subsKz} />
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
      config: { id: 3, sticker: { code: '1w_91444', label: '+500% на 4 старта', showAtSec: 3.5 } },
      subsKz: '',
      hasAudio: false,
      durationInFrames: 900,
    }}
  />
);
        
