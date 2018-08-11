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
  size = new Vector(6);
  color = "#000";

  testColliding(other: Actor) {
    const ox = Math.abs(this.pos.x - other.pos.x);
    const oy = Math.abs(this.pos.y - other.pos.y);
    return (
      ox < (this.size.x + other.size.x) / 2 &&
      oy < (this.size.y + other.size.y) / 2
    );
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
    }
  }

  updateFrame() {
    this.prevPos.set(this.pos);
    this.pos.add(this.vel);
    super.updateFrame();
    if (
      this.pos.x < -screen.size * removePaddingRatio ||
      this.pos.x > screen.size * (1 + removePaddingRatio) ||
      this.pos.y < -screen.size * removePaddingRatio ||
      this.pos.y > screen.size * (1 + removePaddingRatio)
    ) {
      this.remove();
    }
    screen.context.fillStyle = this.color;
    screen.context.fillRect(
      Math.floor(this.pos.x - this.size.x / 2),
      Math.floor(this.pos.y - this.size.y / 2),
      this.size.x,
      this.size.y
    );
  }
}
