import * as sga from "../..";
import * as sss from "sounds-some-sounds";
import * as gcc from "gif-capture-canvas";
import * as letterPattern from "./letterPattern";
import * as pointer from "./pointer";
import * as keyboard from "./keyboard";
import Vector from "./vector";
import Random from "./random";

export const random = new Random();
export let ticks = 0;
export let difficulty = 1;
export let isUsingKeyboard = false;

const difficultyDoubledSecond = 30;
const enableKeyboard = false;
let beginGameFunc: Function | undefined;
let beginGameOverFunc: Function | undefined;
let beginTitleFunc: Function | undefined;
let scene: "title" | "game" | "gameOver";
let _screen: any;
let isUpdating = false;
let _isCapturing = false;
let _isUsingSSS = false;

export function init({
  title,
  game,
  gameOver,
  init,
  screen,
  actorClass,
  isDebugMode = false,
  isCapturing = false,
  isUsingSSS = false,
  onTouchStart = undefined,
  onPointerUp = undefined
}: {
  title?: Function;
  game?: Function;
  gameOver?: Function;
  init?: Function;
  screen: any;
  actorClass?: any;
  isDebugMode?: boolean;
  isCapturing?: boolean;
  isUsingSSS?: boolean;
  onTouchStart?: Function | undefined;
  onPointerUp?: Function | undefined;
}) {
  beginTitleFunc = title;
  beginGameFunc = game;
  beginGameOverFunc = gameOver;
  _isUsingSSS = isUsingSSS;
  if (_isUsingSSS) {
    sss.init();
  }
  _screen = screen;
  screen.init();
  letterPattern.init();
  pointer.init(
    screen.canvas,
    new Vector(screen.size),
    new Vector(screen.padding),
    _isUsingSSS ? sss.playEmpty : onTouchStart,
    _isUsingSSS ? sss.resumeAudioContext : onPointerUp,
    isDebugMode
  );
  if (enableKeyboard) {
    keyboard.init();
  }
  if (actorClass != null) {
    sga.setActorClass(actorClass);
  }
  sga.reset();
  _isCapturing = isCapturing;
  if (_isCapturing) {
    gcc.setOptions({ scale: 1, capturingFps: 60 });
  }
  if (init != null) {
    init();
  }
  if (isDebugMode) {
    beginGame();
  } else {
    if (beginTitleFunc != null) {
      beginTitle();
    } else {
      endGame();
    }
  }
  if (!isUpdating) {
    update();
    isUpdating = true;
  }
}

export function endGame() {
  if (scene !== "game") {
    return;
  }
  if (beginGameOverFunc != null) {
    beginGameOverFunc();
  }
  scene = "gameOver";
  ticks = 0;
}

function update() {
  requestAnimationFrame(update);
  if (_isUsingSSS) {
    sss.update();
  }
  pointer.update();
  if (enableKeyboard) {
    keyboard.update();
  }
  _screen.clear();
  sga.update();
  updateScene();
  ticks++;
  if (_isCapturing) {
    gcc.capture(_screen.canvas);
  }
}

function updateScene() {
  if (
    (scene === "title" || (scene === "gameOver" && ticks > 40)) &&
    (pointer.isPressed || (enableKeyboard && keyboard.isPressed))
  ) {
    isUsingKeyboard = enableKeyboard && keyboard.isPressed;
    beginGame();
  }
  if (scene === "gameOver" && ticks > 180) {
    beginTitle();
  }
  difficulty = scene === "game" ? 1 + ticks / 60 / difficultyDoubledSecond : 1;
}

function beginTitle() {
  if (beginTitleFunc == null) {
    return;
  }
  scene = "title";
  ticks = 0;
  beginTitleFunc();
}

function beginGame() {
  scene = "game";
  ticks = 0;
  if (beginGameFunc != null) {
    beginGameFunc();
  }
}
