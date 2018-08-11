import * as sga from "../..";
import * as screen from "./screen";
import Vector from "./vector";

const removePaddingRatio = 0.25;

export class Actor extends sga.Actor {
  pos = new Vector();
  prevPos = new Vector();
  vel = new Vector();
  speed = 0;
  angle = 0;
  rects: Rect[] = [];

  setRect(width = 5, height = 5, color = "black", offsetX = 0, offsetY = 0) {
    this.addRect(new Rect(width, height, color, offsetX, offsetY));
  }

  addRect(rect: Rect) {
    this.rects.push(rect);
  }

  testColliding(other: Actor) {
    return this.rects.some(r => other.rects.some(or => r.testColliding(or)));
  }

  getCollidings(name: string = null) {
    const actors = this.pool.get(name) as Actor[];
    return actors.filter(a => this.testColliding(a));
  }

  getColliding(name: string = null) {
    const actors = this.pool.get(name) as Actor[];
    for (let a of actors) {
      if (this.testColliding(a)) {
        return a;
      }
    }
    return false;
  }

  stepBack(name: string = null, angleVector: Vector = null) {
    if (angleVector == null) {
      angleVector = new Vector().set(this.prevPos).sub(this.pos);
    }
    angleVector.normalize().div(2);
    for (let i = 0; i < 99; i++) {
      if (!this.getColliding(name)) {
        break;
      }
      this.pos.add(angleVector);
      this.rects.forEach(r => {
        r.updatePos(this.pos);
      });
    }
  }

  updateFrame() {
    this.prevPos.set(this.pos);
    this.pos.add(this.vel);
    this.rects.forEach(r => {
      r.updateFrame(this.pos, this.angle);
    });
    super.updateFrame();
    if (
      this.pos.x < -screen.size * removePaddingRatio ||
      this.pos.x > screen.size * (1 + removePaddingRatio) ||
      this.pos.y < -screen.size * removePaddingRatio ||
      this.pos.y > screen.size * (1 + removePaddingRatio)
    ) {
      this.remove();
    }
  }
}

export class Rect {
  pos = new Vector();
  size = new Vector(5);
  color = "black";
  offset = new Vector();
  springRatio: number = null;
  springAnchor = new Vector();
  vel = new Vector();
  currentOffset = new Vector();
  springOffset = new Vector();
  isFirstFrame = true;

  constructor(
    width = 5,
    height = 5,
    color = "black",
    offsetX = 0,
    offsetY = 0,
    springRatio = null
  ) {
    this.size.set(width, height);
    this.offset.set(offsetX, offsetY);
    this.color = color;
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

  updateFrame(pos: Vector, angle: number = 0) {
    if (this.springRatio != null) {
      if (this.isFirstFrame) {
        this.isFirstFrame = false;
        this.pos
          .set(this.offset)
          .rotate(angle)
          .add(pos);
      }
      this.springOffset
        .set(this.offset)
        .rotate(angle)
        .add(pos)
        .sub(this.pos);
      this.vel.add(this.springOffset.mul(this.springRatio));
      this.vel.mul(0.9);
      this.pos.add(this.vel);
      this.currentOffset.set(this.pos).sub(pos);
    } else {
      this.currentOffset.set(this.offset).rotate(angle);
      this.updatePos(pos);
    }
    screen.context.fillStyle = this.color;
    screen.context.fillRect(
      Math.floor(this.pos.x - this.size.x / 2),
      Math.floor(this.pos.y - this.size.y / 2),
      this.size.x,
      this.size.y
    );
  }

  updatePos(pos: Vector) {
    this.pos.set(pos);
    this.pos.add(this.currentOffset);
  }
}
