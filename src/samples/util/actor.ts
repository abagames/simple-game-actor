import * as sga from "../..";
import * as screen from "./screen";
import Vector from "./vector";

const removePaddingRatio = 0.5;

export class Actor extends sga.Actor {
  pos = new Vector();
  prevPos = new Vector();
  vel = new Vector();
  speed = 0;
  angle = 0;
  rects: Rect[] = [];

  setRect(
    width = 5,
    height = 5,
    options: {
      color?: string;
      offset?: { x?: number; y?: number };
    } = {
      color: "black",
      offset: { x: 0, y: 0 }
    }
  ) {
    this.addRect(
      new Rect(width, height, { color: options.color, offset: options.offset })
    );
  }

  addRect(rect: Rect) {
    this.rects.push(rect);
  }

  testColliding(other: Actor) {
    return this.rects.some(r => other.rects.some(or => r.testColliding(or)));
  }

  getCollidings(name?: string) {
    const actors = this.pool.get(name) as Actor[];
    return actors.filter(a => this.testColliding(a));
  }

  getColliding(name?: string) {
    const actors = this.pool.get(name) as Actor[];
    for (let a of actors) {
      if (this.testColliding(a)) {
        return a;
      }
    }
    return false;
  }

  stepBack(name?: string | Actor, angleVector?: Vector) {
    if (angleVector == null) {
      angleVector = new Vector().set(this.prevPos).sub(this.pos);
    }
    angleVector.normalize().div(2);
    for (let i = 0; i < 99; i++) {
      if (
        (typeof name === "string" && !this.getColliding(name)) ||
        (name instanceof Actor && !this.testColliding(name))
      ) {
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
    options: {
      color?: string;
      offset?: { x?: number; y?: number };
      springRatio?: number;
    } = {
      color: "black",
      offset: { x: 0, y: 0 },
      springRatio: undefined
    }
  ) {
    this.size.set(width, height);
    this.offset.set(options.offset.x, options.offset.y);
    this.color = options.color;
    this.springRatio = options.springRatio;
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
