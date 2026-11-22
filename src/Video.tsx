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

export interface StoryConfig {
  badge?: string;
  pointATitle?: string;
  pointABalance?: string;
  pointASub?: string;
  betAmount?: string;
  winMultiplier?: string;
  winAmount?: number;
  pushBank?: string;
  pushText?: string;
  pointBTitle?: string;
  cta?: string;
}

export interface VideoProps {
  config: {
    id: number;
    sticker: { code: string; label: string; showAtSec: number };
    story?: StoryConfig;
    scenes?: any[];
  };
  subsKz: string;
  hasAudio?: boolean;
  durationInFrames?: number;
}

// Векторный персонаж с 3 эмоциями: sad | shock | happy
const CharacterSVG: React.FC<{ mood: 'sad' | 'shock' | 'happy'; scale?: number }> = ({ mood, scale = 1 }) => {
  const frame = useCurrentFrame();
  const breathe = Math.sin(frame / 12) * 4;
  const armWave = mood === 'happy' ? Math.sin(frame / 5) * 14 : 0;

  return (
    <svg
      width={340 * scale}
      height={380 * scale}
      viewBox="0 0 340 380"
      style={{ overflow: 'visible', transform: `translateY(${breathe}px)` }}
    >
      {/* Тень под персонажем */}
      <ellipse cx="170" cy="360" rx="95" ry="18" fill="rgba(0,0,0,0.45)" />

      {/* Тело / худи */}
      <path
        d="M 85 350 C 85 245, 105 215, 170 215 C 235 215, 255 245, 255 350 Z"
        fill={mood === 'sad' ? '#334155' : '#2563EB'}
        stroke="#0F172A"
        strokeWidth="6"
      />
      {/* Завязки худи */}
      <line x1="152" y1="230" x2="148" y2="280" stroke="#E2E8F0" strokeWidth="5" strokeLinecap="round" />
      <line x1="188" y1="230" x2="192" y2="280" stroke="#E2E8F0" strokeWidth="5" strokeLinecap="round" />

      {/* Руки */}
      {mood === 'sad' ? (
        <>
          <path d="M 95 255 Q 60 300 92 335" fill="none" stroke="#334155" strokeWidth="26" strokeLinecap="round" />
          <path d="M 245 255 Q 280 300 248 335" fill="none" stroke="#334155" strokeWidth="26" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path
            d={`M 95 255 Q 45 ${200 - armWave} 55 ${140 - armWave}`}
            fill="none"
            stroke="#2563EB"
            strokeWidth="26"
            strokeLinecap="round"
          />
          <circle cx="55" cy={135 - armWave} r="17" fill="#FDBA74" stroke="#0F172A" strokeWidth="5" />
          <path
            d={`M 245 255 Q 295 ${200 + armWave} 285 ${140 + armWave}`}
            fill="none"
            stroke="#2563EB"
            strokeWidth="26"
            strokeLinecap="round"
          />
          <circle cx="285" cy={135 + armWave} r="17" fill="#FDBA74" stroke="#0F172A" strokeWidth="5" />
        </>
      )}

      {/* Голова */}
      <circle cx="170" cy="130" r="82" fill="#FDBA74" stroke="#0F172A" strokeWidth="6" />

      {/* Волосы */}
      <path
        d="M 88 122 C 92 50, 248 50, 252 122 C 232 95, 195 85, 170 88 C 135 88, 108 100, 88 122 Z"
        fill="#1E293B"
        stroke="#0F172A"
        strokeWidth="5"
      />

      {/* Глаза */}
      {mood === 'shock' ? (
        <>
          <circle cx="138" cy="128" r="18" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
          <circle cx="138" cy="128" r="7" fill="#0F172A" />
          <circle cx="202" cy="128" r="18" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
          <circle cx="202" cy="128" r="7" fill="#0F172A" />
        </>
      ) : (
        <>
          <circle cx="138" cy="130" r="11" fill="#0F172A" />
          <circle cx="142" cy="126" r="3.5" fill="#FFFFFF" />
          <circle cx="202" cy="130" r="11" fill="#0F172A" />
          <circle cx="206" cy="126" r="3.5" fill="#FFFFFF" />
        </>
      )}

      {/* Брови */}
      {mood === 'sad' && (
        <>
          <path d="M 118 112 L 152 104" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
          <path d="M 222 112 L 188 104" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
          {/* Капля пота */}
          <path d="M 235 110 Q 246 128 235 136 Q 224 128 235 110 Z" fill="#38BDF8" />
        </>
      )}
      {mood === 'shock' && (
        <>
          <path d="M 118 96 Q 138 82 156 96" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
          <path d="M 184 96 Q 202 82 222 96" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
        </>
      )}
      {mood === 'happy' && (
        <>
          <path d="M 120 105 Q 138 96 155 105" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
          <path d="M 185 105 Q 202 96 220 105" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
        </>
      )}

      {/* Рот */}
      {mood === 'sad' && (
        <path d="M 145 178 Q 170 158 195 178" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
      )}
      {mood === 'shock' && (
        <ellipse cx="170" cy="175" rx="18" ry="22" fill="#991B1B" stroke="#0F172A" strokeWidth="5" />
      )}
      {mood === 'happy' && (
        <path
          d="M 136 162 Q 170 202 204 162 Z"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="5"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
};

// Векторная купюра 20 000 ₸
const BanknoteSVG: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg width="210" height="105" viewBox="0 0 210 105" style={style}>
    <rect x="4" y="4" width="202" height="97" rx="12" fill="#16A34A" stroke="#052E16" strokeWidth="4" />
    <rect x="14" y="14" width="182" height="77" rx="6" fill="none" stroke="#86EFAC" strokeWidth="2.5" strokeDasharray="6 4" />
    <circle cx="105" cy="52" r="28" fill="#15803D" stroke="#FACC15" strokeWidth="3" />
    <text x="105" y="61" textAnchor="middle" fill="#FACC15" fontSize="28" fontWeight="900" fontFamily="sans-serif">
      ₸
    </text>
    <text x="24" y="34" fill="#DCFCE7" fontSize="16" fontWeight="900" fontFamily="sans-serif">
      20 000
    </text>
    <text x="186" y="84" textAnchor="end" fill="#DCFCE7" fontSize="16" fontWeight="900" fontFamily="sans-serif">
      20 000
    </text>
  </svg>
);

// Векторная золотая монета ₸
const CoinSVG: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 78, style }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" style={style}>
    <circle cx="40" cy="40" r="36" fill="#FACC15" stroke="#B45309" strokeWidth="5" />
    <circle cx="40" cy="40" r="27" fill="none" stroke="#FEF08A" strokeWidth="3" />
    <text x="40" y="51" textAnchor="middle" fill="#92400E" fontSize="34" fontWeight="900" fontFamily="sans-serif">
      ₸
    </text>
  </svg>
);

// Символ слота (чистый вектор без эмодзи)
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
        <text
          x="55"
          y="88"
          textAnchor="middle"
          fontSize="94"
          fontWeight="900"
          fill="url(#sevenGrad)"
          stroke="#FFFFFF"
          strokeWidth="4"
          fontFamily="sans-serif"
        >
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

// АКТ 1: Точка А — Обычный человек, последний баланс до зарплаты
const ActPointA: React.FC<{ localFrame: number; progress: number; story: StoryConfig }> = ({
  localFrame,
  progress,
  story,
}) => {
  const { fps } = useVideoConfig();
  const pop = spring({ frame: localFrame, fps, config: { damping: 14 } });
  const exitOp = interpolate(progress, [0.85, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 50% 25%, #1E293B 0%, #090D16 100%)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 60,
        opacity: exitOp,
      }}
    >
      <div style={{ textAlign: 'center', transform: `scale(${pop})` }}>
        <div
          style={{
            display: 'inline-block',
            background: 'rgba(239, 68, 68, 0.16)',
            border: '2px solid #EF4444',
            color: '#FCA5A5',
            padding: '10px 26px',
            borderRadius: 999,
            fontSize: 30,
            fontWeight: 800,
            marginBottom: 24,
          }}
        >
          {story.badge || 'РЕАЛЬНАЯ ИСТОРИЯ'}
        </div>

        <div style={{ fontSize: 58, fontWeight: 900, color: '#F8FAFC', lineHeight: 1.15, maxWidth: 920 }}>
          {story.pointATitle || 'Смена 12 часов. До зарплаты неделя.'}
        </div>

        {/* Карточка остатка на карте */}
        <div
          style={{
            marginTop: 34,
            background: '#111827',
            border: '2px solid rgba(239, 68, 68, 0.5)',
            borderRadius: 28,
            padding: '28px 46px',
            display: 'inline-block',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ fontSize: 26, color: '#94A3B8', fontWeight: 700, textAlign: 'left' }}>
            {story.pointASub || 'Остаток на карте'}
          </div>
          <div style={{ fontSize: 92, fontWeight: 900, color: '#F87171', lineHeight: 1.1, marginTop: 6 }}>
            {story.pointABalance || '5 000 ₸'}
          </div>
        </div>

        {/* Грустный персонаж */}
        <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}>
          <CharacterSVG mood="sad" scale={1.08} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// АКТ 2: Живой крутящийся слот 7-7-7 и MEGA WIN
const ActSlotMachine: React.FC<{ localFrame: number; progress: number; story: StoryConfig }> = ({
  localFrame,
  progress,
  story,
}) => {
  const { fps } = useVideoConfig();
  const enter = spring({ frame: localFrame, fps, config: { damping: 14 } });
  const exitOp = interpolate(progress, [0.9, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // 3 барабана останавливаются по очереди: кадр 55, 78, 102
  const stopFrames = [55, 78, 102];
  const isWin = localFrame >= 104;

  // Тряска экрана в момент заноса
  const shakeX = isWin && localFrame < 126 ? Math.sin(localFrame * 3.5) * (126 - localFrame) * 1.1 : 0;
  const shakeY = isWin && localFrame < 126 ? Math.cos(localFrame * 4) * (126 - localFrame) * 0.9 : 0;

  const winPop = isWin ? spring({ frame: localFrame - 104, fps, config: { damping: 10 } }) : 0;
  const flash = isWin ? interpolate(localFrame, [104, 114], [0.65, 0], { extrapolateRight: 'clamp' }) : 0;

  const symbols: Array<'7' | 'diamond' | 'bar' | 'coin'> = ['diamond', 'bar', 'coin', '7', 'diamond', 'coin', 'bar', '7'];

  return (
    <AbsoluteFill
      style={{
        background: isWin
          ? 'radial-gradient(circle at 50% 45%, #451A03 0%, #090D16 80%)'
          : 'radial-gradient(circle at 50% 45%, #1E1B4B 0%, #090D16 85%)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 45,
        opacity: enter * exitOp,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* Верхний бейдж ставки */}
      <div
        style={{
          marginBottom: 30,
          background: 'rgba(15, 23, 42, 0.85)',
          border: '2px solid rgba(250, 204, 21, 0.5)',
          borderRadius: 999,
          padding: '12px 32px',
          fontSize: 34,
          fontWeight: 900,
          color: '#FACC15',
        }}
      >
        СТАВКА: {story.betAmount || '1 000 ₸'}
      </div>

      {/* Корпус слот-машины */}
      <div
        style={{
          width: 940,
          background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
          border: isWin ? '6px solid #FACC15' : '6px solid #6366F1',
          borderRadius: 42,
          padding: '38px 34px',
          boxShadow: isWin
            ? '0 0 90px rgba(250, 204, 21, 0.55)'
            : '0 30px 70px rgba(0, 0, 0, 0.65)',
          position: 'relative',
        }}
      >
        {/* Неоновые лампочки сверху */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 26 }}>
          {Array.from({ length: 9 }).map((_, i) => {
            const lit = (Math.floor(localFrame / 4) + i) % 2 === 0;
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

        {/* Окно с 3 барабанами */}
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
          {stopFrames.map((stopF, reelIdx) => {
            const stopped = localFrame >= stopF;
            const spinY = stopped
              ? spring({ frame: localFrame - stopF, fps, config: { damping: 9, stiffness: 180 } }) * 0
              : ((localFrame * (46 + reelIdx * 6)) % 420);
            const bounce = stopped
              ? interpolate(
                  spring({ frame: localFrame - stopF, fps, config: { damping: 8 } }),
                  [0, 1],
                  [26, 0]
                )
              : 0;

            return (
              <div
                key={reelIdx}
                style={{
                  flex: 1,
                  height: 360,
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
                    <SlotSymbol kind="7" />
                  </div>
                ) : (
                  <div style={{ transform: `translateY(${spinY - 210}px)`, filter: 'blur(3px)' }}>
                    {symbols.map((s, k) => (
                      <div key={k} style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SlotSymbol kind={s} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Выигрышная линия по центру */}
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
                opacity: 0.9,
              }}
            />
          )}
        </div>

        {/* Нижняя панель слота */}
        <div
          style={{
            marginTop: 26,
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
            {isWin ? story.winMultiplier || 'x850' : 'x1.0'}
          </div>
        </div>
      </div>

      {/* Взрывная плашка MEGA WIN */}
      {isWin && (
        <div
          style={{
            marginTop: 34,
            transform: `scale(${winPop})`,
            background: 'linear-gradient(90deg, #F59E0B, #FACC15, #F59E0B)',
            color: '#0F172A',
            padding: '18px 52px',
            borderRadius: 24,
            fontSize: 64,
            fontWeight: 900,
            boxShadow: '0 0 50px rgba(250, 204, 21, 0.8)',
          }}
        >
          MEGA WIN {story.winMultiplier || 'x850'}!
        </div>
      )}

      {flash > 0 && <AbsoluteFill style={{ backgroundColor: '#FEF08A', opacity: flash }} />}
    </AbsoluteFill>
  );
};

// АКТ 3: Деньги — дождь купюр 20 000 ₸, банковские пуши и шокированный/радостный герой
const ActMoneyRain: React.FC<{ localFrame: number; progress: number; story: StoryConfig }> = ({
  localFrame,
  progress,
  story,
}) => {
  const { fps } = useVideoConfig();
  const winAmount = story.winAmount || 850000;
  const counter = Math.round(
    interpolate(localFrame, [0, 65], [5000, winAmount], {
      easing: Easing.out(Easing.cubic),
      extrapolateRight: 'clamp',
    })
  );

  const push1Y = interpolate(spring({ frame: Math.max(0, localFrame - 8), fps, config: { damping: 12 } }), [0, 1], [-220, 0]);
  const push2Y = interpolate(spring({ frame: Math.max(0, localFrame - 34), fps, config: { damping: 12 } }), [0, 1], [-220, 0]);
  const exitOp = interpolate(progress, [0.9, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 50% 35%, #064E3B 0%, #070B14 82%)',
        overflow: 'hidden',
        opacity: exitOp,
      }}
    >
      {/* Дождь из векторных купюр 20 000 ₸ и монет */}
      {Array.from({ length: 14 }).map((_, i) => {
        const speed = 13 + (i % 5) * 3;
        const y = ((localFrame * speed + i * 170) % 2150) - 220;
        const x = ((i * 197) % 920) - 20;
        const rot = (localFrame * (i % 2 === 0 ? 2.5 : -2.5) + i * 35) % 360;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `rotate(${rot}deg)`,
              opacity: 0.85,
            }}
          >
            {i % 3 === 0 ? <CoinSVG size={82} /> : <BanknoteSVG />}
          </div>
        );
      })}

      {/* Каскад реалистичных банковских пуш-уведомлений сверху */}
      <div style={{ position: 'absolute', top: 195, left: 55, right: 55, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div
          style={{
            transform: `translateY(${push1Y}px)`,
            background: 'rgba(15, 23, 42, 0.92)',
            border: '2px solid #4ADE80',
            borderRadius: 26,
            padding: '24px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          }}
        >
          <CoinSVG size={72} />
          <div>
            <div style={{ fontSize: 26, color: '#94A3B8', fontWeight: 700 }}>
              {story.pushBank || 'Зачисление на карту • только что'}
            </div>
            <div style={{ fontSize: 52, fontWeight: 900, color: '#4ADE80' }}>
              +{winAmount.toLocaleString('ru-RU')} ₸
            </div>
          </div>
        </div>

        {localFrame >= 34 && (
          <div
            style={{
              transform: `translateY(${push2Y}px)`,
              background: 'rgba(15, 23, 42, 0.9)',
              border: '2px solid rgba(250, 204, 21, 0.6)',
              borderRadius: 24,
              padding: '20px 32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ fontSize: 30, fontWeight: 800, color: '#F8FAFC' }}>
              {story.pushText || 'Вывод одобрен мгновенно'}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#FACC15' }}>ГОТОВО ✓</div>
          </div>
        )}
      </div>

      {/* Центр: растущий счётчик баланса + шокированный/счастливый герой */}
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
            fontSize: 108,
            fontWeight: 900,
            color: '#FACC15',
            textShadow: '0 8px 40px rgba(250, 204, 21, 0.5)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {counter.toLocaleString('ru-RU')} ₸
        </div>

        <div style={{ marginTop: 20 }}>
          <CharacterSVG mood={localFrame < 45 ? 'shock' : 'happy'} scale={1.15} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// АКТ 4: Финал — Точка Б + бонус и призыв
const ActOutro: React.FC<{ localFrame: number; story: StoryConfig; sticker: { code: string; label: string } }> = ({
  localFrame,
  story,
  sticker,
}) => {
  const { fps } = useVideoConfig();
  const pop = spring({ frame: localFrame, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 50% 35%, #1E293B 0%, #070B14 100%)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 60,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 920,
          transform: `scale(${pop})`,
          background: 'rgba(15, 23, 42, 0.9)',
          border: '3px solid #FACC15',
          borderRadius: 38,
          padding: '46px 44px',
          textAlign: 'center',
          boxShadow: '0 30px 80px rgba(0,0,0,0.65)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <CharacterSVG mood="happy" scale={0.78} />
        </div>

        <div style={{ fontSize: 52, fontWeight: 900, color: '#F8FAFC', lineHeight: 1.2 }}>
          {story.pointBTitle || 'Твой икс ждёт тебя'}
        </div>

        <div
          style={{
            marginTop: 28,
            background: '#FACC15',
            color: '#0F172A',
            borderRadius: 24,
            padding: '22px 30px',
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 800 }}>ПРОМОКОД НА СТАРТ</div>
          <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: 2, marginTop: 4 }}>{sticker.code}</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#B91C1C', marginTop: 4 }}>{sticker.label}</div>
        </div>

        <div style={{ marginTop: 32, fontSize: 40, fontWeight: 900, color: '#4ADE80' }}>
          {story.cta || 'Всё для старта — по ссылке в профиле ↓'}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Караоке-субтитры на казахском
const KaraokeCaptions: React.FC<{ text: string }> = ({ text }) => {
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
        bottom: 155,
        left: 55,
        right: 55,
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
              color: isCurrent ? '#FACC15' : '#FFFFFF',
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

  const story = config.story || {};
  const t = frame / durationInFrames;

  const act1End = Math.round(durationInFrames * 0.24);
  const act2End = Math.round(durationInFrames * 0.56);
  const act3End = Math.round(durationInFrames * 0.82);

  const showAt = (config.sticker?.showAtSec ?? 3.5) * fps;
  const stickerSpring = frame >= showAt && frame < act3End
    ? spring({ frame: frame - showAt, fps, config: { damping: 12 } })
    : 0;

  return (
    <AbsoluteFill style={{ fontFamily: 'sans-serif', backgroundColor: '#070B14' }}>
      {hasAudio && <Audio src={staticFile('voice.mp3')} />}

      {frame < act1End && <ActPointA localFrame={frame} progress={frame / act1End} story={story} />}
      {frame >= act1End && frame < act2End && (
        <ActSlotMachine localFrame={frame - act1End} progress={(frame - act1End) / (act2End - act1End)} story={story} />
      )}
      {frame >= act2End && frame < act3End && (
        <ActMoneyRain localFrame={frame - act2End} progress={(frame - act2End) / (act3End - act2End)} story={story} />
      )}
      {frame >= act3End && (
        <ActOutro localFrame={frame - act3End} story={story} sticker={config.sticker} />
      )}

      {/* Полоска прогресса сверху */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: 'rgba(255,255,255,0.12)' }}>
        <div style={{ width: `${t * 100}%`, height: '100%', background: 'linear-gradient(90deg, #4ADE80, #FACC15)' }} />
      </div>

      {/* Верхний стикер промокода */}
      {stickerSpring > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 72,
            right: 40,
            transform: `scale(${stickerSpring})`,
            background: 'rgba(15, 23, 42, 0.92)',
            border: '2px solid #FACC15',
            borderRadius: 16,
            padding: '10px 20px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
            textAlign: 'right',
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 900, color: '#FACC15', letterSpacing: 1 }}>
            {config.sticker.code}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#E2E8F0' }}>{config.sticker.label}</div>
        </div>
      )}

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
      config: {
        id: 4,
        sticker: { code: '1w_91444', label: '+500% на 4 старта', showAtSec: 3.5 },
        story: {},
      },
      subsKz: '',
      hasAudio: false,
      durationInFrames: 900,
    }}
  />
);
