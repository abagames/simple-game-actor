export default class Vector {
  x = 0;
  y = 0;

  constructor(x: number | Vector = 0, y: number = null) {
    this.set(x, y);
  }

  set(x: number | Vector, y: number = null) {
    if (x instanceof Vector) {
      this.x = x.x;
      this.y = x.y;
      return;
    }
    this.x = x;
    this.y = y == null ? x : y;
    return this;
  }

  add(v: Vector) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v: Vector) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  mul(v: number) {
    this.x *= v;
    this.y *= v;
    return this;
  }

  div(v: number) {
    this.x /= v;
    this.y /= v;
    return this;
  }

  clamp(xMin: number, xMax: number, yMin: number, yMax: number) {
    this.x = Math.max(xMin, Math.min(this.x, xMax));
    this.y = Math.max(yMin, Math.min(this.y, yMax));
    return this;
  }

  normalize() {
    this.div(this.length);
    return this;
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}
