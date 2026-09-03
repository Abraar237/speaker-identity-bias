export type Pt = { x: number; y: number };

export type Cubic = { p0: Pt; p1: Pt; p2: Pt; p3: Pt };

const at = (c: Cubic, t: number): Pt => {
  const u = 1 - t;
  const x =
    u * u * u * c.p0.x +
    3 * u * u * t * c.p1.x +
    3 * u * t * t * c.p2.x +
    t * t * t * c.p3.x;
  const y =
    u * u * u * c.p0.y +
    3 * u * u * t * c.p1.y +
    3 * u * t * t * c.p2.y +
    t * t * t * c.p3.y;
  return { x, y };
};

const SAMPLES = 64;

// Arc-length lookup so dots travel at constant speed.
const buildTable = (c: Cubic): number[] => {
  const table: number[] = [0];
  let prev = at(c, 0);
  let acc = 0;
  for (let i = 1; i <= SAMPLES; i++) {
    const p = at(c, i / SAMPLES);
    acc += Math.hypot(p.x - prev.x, p.y - prev.y);
    table.push(acc);
    prev = p;
  }
  return table;
};

export const pointAtLength = (c: Cubic, frac: number): Pt => {
  const table = buildTable(c);
  const target = frac * table[SAMPLES];
  let lo = 0;
  for (let i = 1; i <= SAMPLES; i++) {
    if (table[i] >= target) {
      lo = i - 1;
      break;
    }
    lo = i - 1;
  }
  const seg = table[lo + 1] - table[lo];
  const t =
    seg === 0 ? lo / SAMPLES : (lo + (target - table[lo]) / seg) / SAMPLES;
  return at(c, Math.min(1, Math.max(0, t)));
};

export const cubicD = (c: Cubic): string =>
  `M ${c.p0.x} ${c.p0.y} C ${c.p1.x} ${c.p1.y}, ${c.p2.x} ${c.p2.y}, ${c.p3.x} ${c.p3.y}`;
