import { clamp, isInRange } from "./math";

export default class Vector {
  x = 0;
  y = 0;

  constructor(x: number | Vector = 0, y?: number) {
    this.set(x, y);
  }

  set(x: number | Vector, y?: number) {
    if (x instanceof Vector) {
      this.x = x.x;
      this.y = x.y;
      return this;
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

  clamp(xLow: number, xHigh: number, yLow: number, yHigh: number) {
    this.x = clamp(this.x, xLow, xHigh);
    this.y = clamp(this.y, yLow, yHigh);
    return this;
  }

  addAngle(angle: number, value: number) {
    this.x += Math.cos(angle) * value;
    this.y += Math.sin(angle) * value;
    return this;
  }

  swapXy() {
    const t = this.x;
    this.x = this.y;
    this.y = t;
    return this;
  }

  normalize() {
    this.div(this.length);
    return this;
  }

  rotate(angle: number) {
    if (angle === 0) {
      return this;
    }
    const tx = this.x;
    this.x = tx * Math.cos(angle) - this.y * Math.sin(angle);
    this.y = tx * Math.sin(angle) + this.y * Math.cos(angle);
    return this;
  }

  getAngle(to?: Vector) {
    return to == null
      ? Math.atan2(this.y, this.x)
      : Math.atan2(to.y - this.y, to.x - this.x);
  }

  distanceTo(to: Vector) {
    const ox = this.x - to.x;
    const oy = this.y - to.y;
    return Math.sqrt(ox * ox + oy * oy);
  }

  isInRect(x: number, y: number, width: number, height: number) {
    return isInRange(this.x, x, x + width) && isInRange(this.y, y, y + height);
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}
