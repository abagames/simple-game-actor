import { spawn, addUpdater, reset, pool, Updater } from "../..";
import { Actor, Rect } from "../util/canvas/actor";
import { init, endGame, random, ticks, difficulty } from "../util/game";
import * as screen from "../util/canvas/screen";
import * as text from "../util/canvas/text";
import * as pointer from "../util/pointer";
import Vector from "../util/vector";
import * as math from "../util/math";
import * as sound from "../util/sound";

let score = 0;
let gameOverUpdater: Updater;
let wallY = 0;
let targetScrollY = 0;
let _player: any;
let introTicks = 300;

init({
  game: () => {
    reset();
    score = 0;
    spawn(targetPointer);
    _player = spawn(player) as Actor;
    spawn(wall, 20);
    spawn(wall, 80);
    wallY = targetScrollY = 0;
    addUpdater(() => {
      text.draw(`${score}`, 1, 1, { align: "left" });
      if (introTicks > 0) {
        text.draw("[MOUSE][SLIDE]\nMOVE UP/DOWN", 5, 10, { align: "left" });
        introTicks--;
      }
    });
  },
  gameOver: () => {
    gameOverUpdater = addUpdater(() => {
      text.draw("GAME OVER", 50, 45);
    });
  },
  title: () => {
    if (gameOverUpdater != null) {
      gameOverUpdater.remove();
    }
    addUpdater(() => {
      text.draw("SPIKE\nSIDE", 50, 32, { scale: 2 });
      if (ticks % 60 < 30) {
        text.draw("CLICK OR TAP\nTO START", 50, 75);
      }
    });
  },
  init: () => {
    document.title = "SPIKE SIDE";
    sound.loadInstrument("kalimba");
  },
  screen: screen,
  actorClass: Actor,
  onPointerUp: sound.resumeAudioContext
  //isDebugMode: true
});

function player(a: Actor & { targetAngle: number }) {
  a.setRect(5, 5);
  a.addRect(new Rect(4, 4, { offset: { y: -3 }, springRatio: 0.2 }));
  a.addRect(new Rect(3, 3, { offset: { x: -4, y: -6 }, springRatio: 0.5 }));
  a.addRect(new Rect(3, 3, { offset: { x: 4, y: -6 }, springRatio: 0.5 }));
  a.pos.set(50, 50);
  a.angle = a.targetAngle = Math.PI / 2;
  const sv = new Vector();
  let isDead = false;
  const kickNotes = sound.getNotes("major pentatonic", "A", 3, 7);
  const deadNotes = sound.getNotes("minor pentatonic", "B", 2, 4);
  a.addUpdater(() => {
    if (isDead) {
      a.angle += 0.2;
      a.vel.y += 0.4;
      return;
    }
    if (pointer.isJustPressed) {
      pointer.setTargetPos(a.pos);
    }
    a.pos.y = math.clamp(pointer.targetPos.y, 0, 99);
    a.vel.x += 0.01 * difficulty * difficulty * (a.targetAngle > 0 ? -1 : 1);
    a.angle += (a.targetAngle - a.angle) * 0.05;
    sv.x = a.pos.x > 50 ? -1 : 1;
    if (a.stepBack(wall, sv)) {
      a.targetAngle = (a.pos.x < 50 ? -1 : 1) * (Math.PI / 2);
      a.vel.x = a.targetAngle > 0 ? -1 : 1;
      targetScrollY = 99 - a.pos.y;
      spawn(spike, a.pos.x, a.pos.y);
      const sc = Math.floor(100 - a.pos.y);
      score += sc;
      sound.play("kalimba", kickNotes, Math.floor(sc / 10), 3);
      spawn(scoreBoard, sc, a.pos);
    }
    scroll(targetScrollY * 0.1);
    targetScrollY *= 0.9;
    a.getCollidings(spike).forEach((s: any) => {
      if (s.isValid) {
        a.vel.x = a.targetAngle;
        a.vel.y = -5;
        isDead = true;
        sound.play("kalimba", deadNotes, 0, 7);
        endGame();
      }
    });
  });
}

function wall(a: Actor, x: number, y = 100, height = 99) {
  if (x < 50) {
    a.setRect(x, height, { color: "gray" });
    a.pos.set(x / 2, y - height / 2);
  } else {
    a.setRect(100 - x, height, { color: "gray" });
    a.pos.set(x + (100 - x) / 2, y - height / 2);
  }
  a.updateRects();
}

function spike(a: Actor & { isValid: boolean }, x: number, y: number) {
  a.setRect(6, 3, { color: "red" });
  const ox = x < 50 ? -3 : 3;
  a.addRect(new Rect(3, 2, { color: "red", offset: { x: ox, y: -2.5 } }));
  a.addRect(new Rect(3, 2, { color: "red", offset: { x: ox, y: 2.5 } }));
  a.pos.set(x, y);
  a.updateRects();
  const sv = new Vector(x < 50 ? 1 : -1, 0);
  a.stepBack(wall, sv);
  a.addUpdater(() => {
    if (_player != null) {
      a.isValid = _player.targetAngle * (a.pos.x - 50) < 0;
      const color = a.isValid ? "red" : "coral";
      a.rects.forEach(r => {
        r.color = color;
      });
    }
  });
}

function scoreBoard(a: Actor, sc: number, p: Vector) {
  a.pos.set(p);
  a.vel.y = -2;
  a.setPriority(0.5);
  a.addUpdater(() => {
    text.draw(`+${sc}`, a.pos.x, a.pos.y);
    a.vel.y *= 0.95;
    if (a.ticks > 60) {
      a.remove();
    }
  });
}

function targetPointer(a: Actor) {
  a.setRect(5, 5, { color: "pink" });
  a.addUpdater(() => {
    a.pos.set(pointer.targetPos);
  });
}

function scroll(y: number) {
  pool.get().forEach((a: any) => {
    a.pos.y += y;
  });
  wallY += y;
  while (wallY > 0) {
    wallY = addWall();
  }
}

function addWall() {
  const h = random.get(30, 70);
  spawn(wall, random.get(10, 30), wallY, h - 1);
  spawn(wall, random.get(70, 90), wallY, h - 1);
  if (random.get() < 0.5) {
    spawn(spike, 0, random.get(wallY - h + 5, wallY - 5));
  }
  if (random.get() < 0.5) {
    spawn(spike, 99, random.get(wallY - h + 5, wallY - 5));
  }
  return wallY - h;
}
