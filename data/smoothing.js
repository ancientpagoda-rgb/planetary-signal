// Simple exponential smoothing as specified:
// smoothed = previous + (current - previous) * factor

export function createSmoother(initial = 0, factor = 0.05) {
  let value = initial;
  return {
    next(sample) {
      value = value + (sample - value) * factor;
      return value;
    },
    get() {
      return value;
    },
  };
}
