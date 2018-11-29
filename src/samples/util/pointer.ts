import Vector from "./vector";
import Random from "./random";
import { isInRange } from "./math";

export let pos = new Vector();
export let move = new Vector();
export let pressedPos = new Vector();
export let targetPos = new Vector();
export let isPressed = false;
export let isJustPressed = false;

let cursorPos = new Vector();
let isDown = false;
let isClicked = false;
let screen: HTMLElement;
let pixelSize: Vector;
let isInitialized = false;
let padding: Vector;
let prevPos = new Vector();
let isResettingTargetPos = false;
let onPointerUp: Function;
let isDebugMode = false;
let debugRandom = new Random();
let debugPos = new Vector();
let debugMoveVel = new Vector();
let debugIsDown = false;

export function init(
  _screen: HTMLElement,
  _pixelSize: Vector,
  _padding: Vector = new Vector(),
  onTouchStart: Function = null,
  _onPointerUp: Function = null,
  _isDebugMode = false
) {
  screen = _screen;
  pixelSize = new Vector(
    _pixelSize.x + _padding.x * 2,
    _pixelSize.y + _padding.y * 2
  );
  if (isInitialized) {
    return;
  }
  padding = _padding;
  onPointerUp = _onPointerUp;
  isDebugMode = _isDebugMode;
  if (isDebugMode) {
    debugPos.set(pixelSize.x / 2, pixelSize.y / 2);
  }
  document.addEventListener("mousedown", e => {
    onDown(e.pageX, e.pageY);
  });
  document.addEventListener("touchstart", e => {
    if (onTouchStart != null) {
      onTouchStart();
    }
    onDown(e.touches[0].pageX, e.touches[0].pageY);
  });
  document.addEventListener("mousemove", e => {
    onMove(e.pageX, e.pageY);
  });
  document.addEventListener(
    "touchmove",
    e => {
      e.preventDefault();
      onMove(e.touches[0].pageX, e.touches[0].pageY);
    },
    { passive: false }
  );
  document.addEventListener("mouseup", e => {
    onUp(e);
  });
  document.addEventListener(
    "touchend",
    e => {
      e.preventDefault();
      (e.target as any).click();
      onUp(e);
    },
    { passive: false }
  );
  isInitialized = true;
}

export function update() {
  if (!isInitialized) {
    return;
  }
  calcPointerPos(cursorPos.x, cursorPos.y, pos);
  const pp = isPressed;
  if (isDebugMode && !pos.isInRect(0, 0, pixelSize.x, pixelSize.y)) {
    updateDebug();
    pos.set(debugPos);
    isDown = debugIsDown;
    if (!pp && isDown) {
      isClicked = true;
    }
  }
  isPressed = isDown;
  isJustPressed = !pp && isClicked;
  isClicked = false;
  if (isJustPressed) {
    pressedPos.set(pos);
    prevPos.set(pos);
  }
  move.set(pos.x - prevPos.x, pos.y - prevPos.y);
  prevPos.set(pos);
  if (isResettingTargetPos) {
    targetPos.set(pos);
    isResettingTargetPos = false;
  } else {
    targetPos.add(move);
  }
}

export function clearJustPressed() {
  isJustPressed = false;
  isPressed = true;
}

export function resetPressedPointerPos(ratio = 1) {
  pressedPos.x += (pos.x - pressedPos.x) * ratio;
  pressedPos.y += (pos.y - pressedPos.y) * ratio;
}

export function setTargetPos(v: Vector) {
  targetPos.set(v);
}

function calcPointerPos(x, y, v) {
  v.x =
    ((x - screen.offsetLeft) / screen.clientWidth + 0.5) * pixelSize.x -
    padding.x;
  v.y =
    ((y - screen.offsetTop) / screen.clientHeight + 0.5) * pixelSize.y -
    padding.y;
}

function onDown(x, y) {
  cursorPos.set(x, y);
  isDown = isClicked = true;
}

function onMove(x, y) {
  cursorPos.set(x, y);
  if (!isDown) {
    isResettingTargetPos = true;
  }
}

function onUp(e) {
  isDown = false;
  if (onPointerUp != null) {
    onPointerUp();
  }
}

function updateDebug() {
  if (debugMoveVel.length > 0) {
    debugPos.add(debugMoveVel);
    if (
      !isInRange(debugPos.x, -pixelSize.x * 0.1, pixelSize.x * 1.1) &&
      debugPos.x * debugMoveVel.x > 0
    ) {
      debugMoveVel.x *= -1;
    }
    if (
      !isInRange(debugPos.y, -pixelSize.y * 0.1, pixelSize.y * 1.1) &&
      debugPos.y * debugMoveVel.y > 0
    ) {
      debugMoveVel.y *= -1;
    }
    if (debugRandom.get() < 0.05) {
      debugMoveVel.set(0);
    }
  } else {
    if (debugRandom.get() < 0.1) {
      debugMoveVel.set(0);
      debugMoveVel.addAngle(
        debugRandom.get(Math.PI * 2),
        (pixelSize.x + pixelSize.y) * debugRandom.get(0.01, 0.03)
      );
    }
  }
  if (debugRandom.get() < 0.05) {
    debugIsDown = !debugIsDown;
  }
}
