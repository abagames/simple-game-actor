import * as sga from "../../..";
import * as screen from "./screen";
import Vector from "../vector";

const removePaddingRatio = 0.5;

export class Actor extends sga.Actor {
  pos = new Vector();
  prevPos = new Vector();
  vel = new Vector();
  speed = 0;
  angle = 0;
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
    this.addRect(new Rect(width, height, { color, offset }));
  }

  addRect(rect: Rect) {
    this.rects.push(rect);
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

  stepBack(funcOrActor?: Function | Actor, angleVector?: Vector) {
    if (angleVector == null) {
      this.stepBackVector.set(this.prevPos).sub(this.pos);
    } else {
      this.stepBackVector.set(angleVector);
    }
    this.stepBackVector.normalize().div(2);
    let isColliding = false;
    for (let i = 0; i < 9; i++) {
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
    this.rects.forEach(r => {
      r.update(this.pos, this.angle);
    });
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
