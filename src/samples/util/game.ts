import * as sga from "../..";
import * as screen from "./screen";
import * as pointer from "./pointer";
import { Actor } from "./actor";
import Vector from "./vector";
import Random from "./random";

export const random = new Random();
export let ticks = 0;
export let difficulty = 1;

const difficultyDoubledSecond = 30;

export function init() {
  screen.init();
  pointer.init(screen.canvas, new Vector(screen.size), new Vector());
  sga.setActorClass(Actor);
  update();
}

function update() {
  requestAnimationFrame(update);
  pointer.update();
  screen.clear();
  sga.updateFrame();
  ticks++;
  difficulty = 1 + ticks / 60 / difficultyDoubledSecond;
}
