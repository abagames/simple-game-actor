import * as sga from "../..";
import * as screen from "./screen";
import * as pointer from "./pointer";
import { Actor } from "./actor";
import Vector from "./vector";

export function init() {
  screen.init();
  pointer.init(screen.canvas, new Vector(screen.size), new Vector());
  sga.setActorClass(Actor);
  update();
}

function update() {
  requestAnimationFrame(update);
  screen.clear();
  sga.updateFrame();
}
