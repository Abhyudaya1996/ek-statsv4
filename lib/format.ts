const inr0 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmt = {
  rupees0: (n: number) => inr0.format(Math.round(n || 0)),
  rupees2: (n: number) => inr2.format(Number.isFinite(n) ? n : 0),
  pct2num: (ratio: number) => Number(((Number.isFinite(ratio) ? ratio : 0) * 100).toFixed(2)),
};
