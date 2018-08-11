const math = {
  clamp(v: number, min = 0, max = 1) {
    return Math.max(min, Math.min(v, max));
  }
};

export default math;
