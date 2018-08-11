const math = {
  clamp(v: number, low = 0, high = 1) {
    return Math.max(low, Math.min(v, high));
  },

  wrap(v: number, low: number, high: number) {
    const w = high - low;
    const o = v - low;
    if (o >= 0) {
      return (o % w) + low;
    } else {
      let wv = w + (o % w) + low;
      if (wv >= high) {
        wv -= w;
      }
      return wv;
    }
  },

  isInRange(v: number, low: number, high: number) {
    return low <= v && v <= high;
  }
};

export default math;
