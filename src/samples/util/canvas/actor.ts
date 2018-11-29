import * as sga from "../../..";
import * as screen from "./screen";
import Vector from "../vector";
import { range } from "../math";

const removePaddingRatio = 0.5;

export class Actor extends sga.Actor {
  pos = new Vector();
  prevPos = new Vector();
  vel = new Vector();
  speed = 0;
  angle = 0;
  speedVel = new Vector();
  rects: Rect[] = [];
  stepBackVector = new Vector();

  setRect(
    width = 5,
    height = 5,
    {
      color = "black",
      offset = { x: 0, y: 0 }
    }: {
      color?: string;
      offset?: { x?: number; y?: number };
    } = {}
  ) {
    return this.addRect(new Rect(width, height, { color, offset }));
  }

  addRect(rect: Rect) {
    this.rects.push(rect);
    return rect;
  }

  addRectWithSquares(
    width = 5,
    height = 5,
    {
      color = "black",
      offset = { x: 0, y: 0 }
    }: {
      color?: string;
      offset?: { x?: number; y?: number };
    } = {}
  ) {
    let sn: number;
    let ss: number;
    let sx = 0;
    let sy = 0;
    let svx = 0;
    let svy = 0;
    if (width > height) {
      sn = Math.ceil(width / height);
      ss = height;
      sx = -width / 2 + ss / 2;
      svx = (width - ss) / (sn - 1);
    } else {
      sn = Math.ceil(height / width);
      ss = width;
      sx = -height / 2 + ss / 2;
      svx = (height - ss) / (sn - 1);
    }
    range(sn).forEach(() => {
      this.addRect(
        new Rect(ss, ss, {
          color,
          offset: { x: sx + (offset.x || 0), y: sy + (offset.y || 0) }
        })
      );
      sx += svx;
      sy += svy;
    });
  }

  clearRects() {
    this.rects = [];
  }

  testColliding(other: Actor) {
    return this.rects.some(r => other.rects.some(or => r.testColliding(or)));
  }

  getCollidings(func?: Function) {
    const actors = this.pool.get(func) as Actor[];
    return actors.filter(a => this.testColliding(a));
  }

  getColliding(func?: Function) {
    const actors = this.pool.get(func) as Actor[];
    for (let a of actors) {
      if (this.testColliding(a)) {
        return a;
      }
    }
    return false;
  }

  stepBack(funcOrActor: Function | Actor, angleVector?: Vector) {
    if (angleVector == null) {
      this.stepBackVector.set(this.prevPos).sub(this.pos);
    } else {
      this.stepBackVector.set(angleVector);
    }
    this.stepBackVector.normalize().div(2);
    let isColliding = false;
    for (let i = 0; i < 99; i++) {
      this.rects.forEach(r => {
        r.updatePos(this.pos);
      });
      if (funcOrActor instanceof Function) {
        if (!this.getColliding(funcOrActor)) {
          break;
        }
      } else {
        if (!this.testColliding(funcOrActor)) {
          break;
        }
      }
      isColliding = true;
      this.pos.add(this.stepBackVector);
    }
    return isColliding;
  }

  update() {
    this.prevPos.set(this.pos);
    this.pos.add(this.vel);
    this.speedVel.set(this.speed, 0).rotate(this.angle);
    this.pos.add(this.speedVel);
    this.updateRects();
    super.update();
    if (
      this.pos.x < -screen.size * removePaddingRatio ||
      this.pos.x > screen.size * (1 + removePaddingRatio) ||
      this.pos.y < -screen.size * removePaddingRatio ||
      this.pos.y > screen.size * (1 + removePaddingRatio)
    ) {
      this.remove();
    }
  }

  updateRects() {
    this.rects.forEach(r => {
      r.update(this.pos, this.angle);
    });
  }
}

export class Rect {
  pos = new Vector();
  size = new Vector(5);
  color = "black";
  offset = new Vector();
  springRatio: number | undefined;
  springAnchor = new Vector();
  vel = new Vector();
  currentOffset = new Vector();
  partOffset = new Vector();
  springOffset = new Vector();
  isFirstFrame = true;

  constructor(
    width = 5,
    height = 5,
    {
      color = "black",
      offset = { x: 0, y: 0 },
      springRatio
    }: {
      color?: string;
      offset?: { x?: number; y?: number };
      springRatio?: number;
    } = {}
  ) {
    this.size.set(width, height);
    this.color = color;
    this.offset.set(offset.x || 0, offset.y || 0);
    this.springRatio = springRatio;
  }

  testColliding(other: Rect) {
    const ox = Math.abs(this.pos.x - other.pos.x);
    const oy = Math.abs(this.pos.y - other.pos.y);
    return (
      ox < (this.size.x + other.size.x) / 2 &&
      oy < (this.size.y + other.size.y) / 2
    );
  }

  update(pos: Vector, angle: number = 0) {
    if (this.springRatio != null) {
      if (this.isFirstFrame) {
        this.isFirstFrame = false;
        this.pos
          .set(this.offset)
          .rotate(angle)
          .add(pos);
      }
      this.partOffset
        .set(this.offset)
        .rotate(angle)
        .add(pos)
        .sub(this.pos);
      this.springOffset.set(this.partOffset).mul(this.springRatio);
      this.partOffset.mul(1 - this.springRatio);
      this.pos.add(this.partOffset);
      this.vel.add(this.springOffset.mul(0.1));
      this.vel.mul(0.9);
      this.pos.add(this.vel);
      this.currentOffset.set(this.pos).sub(pos);
    } else {
      this.currentOffset.set(this.offset).rotate(angle);
      this.updatePos(pos);
    }
    screen.fillRect(
      this.pos.x - this.size.x / 2,
      this.pos.y - this.size.y / 2,
      this.size.x,
      this.size.y,
      this.color
    );
  }

  updatePos(pos: Vector) {
    this.pos.set(pos);
    this.pos.add(this.currentOffset);
  }
}
