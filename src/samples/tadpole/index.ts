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
let introTicks = 300;

init({
  game: () => {
    reset();
    score = 0;
    math.range(5).map(_ => spawn(player));
    math.range(10).map(_ => spawn(enemy));
    addUpdater(() => {
      text.draw(`${score}`, 1, 1, { align: "left" });
      if (introTicks > 0) {
        text.draw("[CLICK][TAP]\nMOVE FORWARD", 5, 10, { align: "left" });
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
      text.draw("TADPOLE", 50, 32, { scale: 2 });
      if (ticks % 60 < 30) {
        text.draw("CLICK OR TAP\nTO START", 50, 75);
      }
    });
  },
  init: () => {
    document.title = "TADPOLE";
    //sound.loadInstrument("kalimba");
  },
  screen: screen,
  actorClass: Actor,
  onPointerUp: sound.resumeAudioContext,
  isDebugMode: true
});

function player(a: Actor) {
  tadpole(a, "black");
}

function enemy(a: Actor) {
  tadpole(a, "coral");
}

function tadpole(a: Actor, color: string) {
  a.setRect(5, 5, { color });
  a.addRectWithSquares(10, 3, { offset: { x: -4 }, color });
  a.pos.set(random.get(20, 80), random.get(20, 80));
  a.angle = random.get(Math.PI * 2);
  let forwardTicks = 0;
  a.addUpdater(() => {
    a.angle += 0.02;
    if (forwardTicks <= 0 && pointer.isJustPressed) {
      forwardTicks = 30;
      a.speed += 2;
    }
    if (forwardTicks > 0) {
      a.speed *= 0.9;
      forwardTicks--;
      if (forwardTicks <= 0) {
        a.speed = 0;
      }
    }
  });
}
