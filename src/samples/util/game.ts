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
let beginFunc: Function;
let scene: "title" | "game" | "gameOver";
let gameOverTicks = 0;

export function init(_beginFunc: Function) {
  beginFunc = _beginFunc;
  screen.init();
  pointer.init(screen.canvas, new Vector(screen.size), new Vector());
  sga.setActorClass(Actor);
  beginTitle();
  update();
}

export function endGame() {
  scene = "gameOver";
  gameOverTicks = 0;
}

function update() {
  requestAnimationFrame(update);
  pointer.update();
  screen.clear();
  sga.updateFrame();
  updateScene();
  ticks++;
  difficulty = 1 + ticks / 60 / difficultyDoubledSecond;
}

function updateScene() {
  if (
    (scene === "title" || (scene === "gameOver" && gameOverTicks > 40)) &&
    pointer.isPressed
  ) {
    beginGame();
  }
  if (scene === "gameOver" && gameOverTicks > 180) {
    beginTitle();
  }
  gameOverTicks++;
}

function beginTitle() {
  scene = "title";
}

function beginGame() {
  scene = "game";
  ticks = 0;
  sga.reset();
  beginFunc();
}
