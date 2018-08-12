import * as sss from "sounds-some-sounds";
import * as sga from "../..";
import * as screen from "./screen";
import * as text from "./text";
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
let title = "UNDEFINED";

export function init(
  _title: string,
  _beginFunc: Function,
  _initFunc: Function = null
) {
  title = _title;
  beginFunc = _beginFunc;
  sss.init();
  screen.init();
  text.init();
  pointer.init(
    screen.canvas,
    new Vector(screen.size),
    new Vector(),
    sss.playEmpty,
    sss.resumeAudioContext
  );
  sga.setActorClass(Actor);
  if (_initFunc != null) {
    _initFunc();
  }
  beginTitle();
  update();
}

export function endGame() {
  scene = "gameOver";
  gameOverTicks = 0;
}

function update() {
  requestAnimationFrame(update);
  sss.update();
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
  if (scene === "title") {
    text.draw(title, 50, 40, { scale: 2 });
  } else if (scene === "gameOver") {
    text.draw("GAME OVER", 50, 45);
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
