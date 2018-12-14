import { spawn, addUpdater, reset, Updater, pool } from "../..";
import { Actor } from "../util/canvas/actor";
import { init, endGame, random, ticks } from "../util/game";
import * as screen from "../util/canvas/screen";
import * as text from "../util/canvas/text";
import * as pointer from "../util/pointer";
import * as sound from "../util/sound";

let score = 0;
let gameOverUpdater: Updater;
let introTicks = 300;

init({
  game: () => {
    reset();
    score = 0;
    spawn(player, 50, 50);
    spawn(bonus);
    addUpdater(() => {
      text.draw(`${score}`, 1, 1, { align: "left" });
      if (introTicks > 0) {
        text.draw("[CLICK][TAP]\nMOVE FORWARD", 5, 10, { align: "left" });
        introTicks--;
      }
      const plc = pool.get(player).length;
      if (plc <= 0) {
        endGame();
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
  },
  screen: screen,
  actorClass: Actor,
  onPointerUp: sound.resumeAudioContext
  //isDebugMode: true
});

function player(a: Actor, x: number, y: number) {
  tadpole(a, "black", 0.04, x, y);
  a.addUpdater(() => {
    a.getCollidings(bonus).forEach(c => {
      c.remove();
      const plc = a.pool.get(player).length;
      score += plc;
      for (let i = 0; i < Math.min(plc, 3); i++) {
        spawn(bonus);
      }
      spawn(player, a.pos.x, a.pos.y);
      spawn(enemy);
    });
  });
}

function enemy(a: Actor) {
  tadpole(a, "coral", 0.02);
  a.addUpdater(() => {
    a.getCollidings(player).forEach(c => {
      c.remove();
    });
  });
}

function tadpole(a: Actor, color: string, angleVel: number, x = -1, y = -1) {
  a.setRect(5, 5, { color });
  a.addRectWithSquares(10, 3, { offset: { x: -4 }, color });
  if (x >= 0) {
    a.pos.set(x, y);
  } else {
    let isValid = false;
    for (let i = 0; i < 9; i++) {
      a.pos.set(random.get(99), random.get(99));
      const p = a.getNearest(player);
      if (p === false || p.pos.distanceTo(a.pos) > 30) {
        isValid = true;
        break;
      }
    }
    if (!isValid) {
      a.remove();
      return;
    }
  }
  a.angle = random.get(Math.PI * 2);
  a.addUpdater(() => {
    a.angle += angleVel;
    a.speed += (0.1 - a.speed) * 0.07;
    if (pointer.isJustPressed) {
      a.speed = 2;
    }
    a.pos.wrap(0, 99, 0, 99);
  });
}

function bonus(a: Actor) {
  a.addRectWithSquares(10, 5, { color: "GreenYellow" });
  a.addRectWithSquares(5, 10, { color: "GreenYellow" });
  let isValid = false;
  for (let i = 0; i < 9; i++) {
    a.pos.set(random.get(99), random.get(99));
    const p = a.getNearest(player);
    if (p === false || p.pos.distanceTo(a.pos) > 30) {
      isValid = true;
      break;
    }
  }
  if (!isValid) {
    a.remove();
    return;
  }
  a.addUpdater(() => {
    a.angle += 0.1;
  });
}
