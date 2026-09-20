const STAR_COUNT = 90;
const SNOW_COUNT = 22;

interface Star {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
}

interface Snowflake {
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
}

/** 골든 앵글 기반 의사난수 분포 — 서버/클라이언트 렌더 결과가 항상 동일하다. */
function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

const STARS: Star[] = Array.from({ length: STAR_COUNT }, (_, i) => ({
  left: pseudoRandom(i * 1.37) * 100,
  top: pseudoRandom(i * 2.71 + 5) * 100,
  size: 1 + pseudoRandom(i * 3.14 + 11) * 1.6,
  delay: pseudoRandom(i * 4.62 + 3) * 6,
  duration: 3 + pseudoRandom(i * 5.19 + 7) * 4,
}));

const SNOWFLAKES: Snowflake[] = Array.from({ length: SNOW_COUNT }, (_, i) => ({
  left: pseudoRandom(i * 6.51 + 2) * 100,
  size: 2 + pseudoRandom(i * 7.23 + 9) * 2,
  delay: pseudoRandom(i * 8.34 + 4) * 12,
  duration: 12 + pseudoRandom(i * 9.45 + 1) * 10,
  drift: (pseudoRandom(i * 10.11 + 6) - 0.5) * 60,
}));

export default function StarField() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(255,230,167,0.08),transparent_60%)]" />
      {STARS.map((star, i) => (
        <span
          key={`star-${i}`}
          className="absolute rounded-full bg-star motion-safe:animate-[star-twinkle_var(--d)_ease-in-out_infinite]"
          style={
            {
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              animationDelay: `${star.delay}s`,
              "--d": `${star.duration}s`,
            } as React.CSSProperties
          }
        />
      ))}
      {SNOWFLAKES.map((flake, i) => (
        <span
          key={`snow-${i}`}
          className="absolute top-0 rounded-full bg-white/70 motion-safe:animate-[snow-fall_var(--d)_linear_infinite]"
          style={
            {
              left: `${flake.left}%`,
              width: flake.size,
              height: flake.size,
              animationDelay: `${flake.delay}s`,
              "--d": `${flake.duration}s`,
              "--drift": `${flake.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
