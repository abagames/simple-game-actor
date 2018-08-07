import * as sga from "../..";
import * as screen from "./screen";
import Vector from "./vector";

const removePaddingRatio = 0.25;

export class Actor extends sga.Actor {
  pos = new Vector();
  vel = new Vector();
  speed = 0;
  angle = 0;
  size = new Vector(5);
  color = "#000";

  updateFrame() {
    super.updateFrame();
    screen.context.fillStyle = this.color;
    screen.context.fillRect(
      Math.floor(this.pos.x - this.size.x / 2),
      Math.floor(this.pos.y - this.size.y / 2),
      this.size.x,
      this.size.y
    );
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
