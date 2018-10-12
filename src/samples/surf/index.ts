import * as sss from "sounds-some-sounds";
import { spawn, addUpdater, reset } from "../..";
import { Actor, Rect } from "../util/canvas/actor";
import {
  init,
  endGame,
  random,
  ticks,
  difficulty,
  isUsingKeyboard
} from "../util/game";
import * as screen from "../util/canvas/screen";
import * as text from "../util/canvas/text";
import * as pointer from "../util/pointer";
import * as keyboard from "../util/keyboard";
import Vector from "../util/vector";
import * as math from "../util/math";

let score = 0;
let gameOverUpdater;

init({
  game: () => {
    reset();
    score = 0;
    sss.playBgm();
    addUpdater(() => {
      text.draw(`${score}`, 1, 1, { align: "left" });
    });
    spawn(wall, 50, 80, 0, 0.1, 99);
    spawn(player);
    addUpdater(u => {
      u.setInterval(20 / difficulty);
      spawn(
        wall,
        random.get(99),
        -5,
        random.get(difficulty - 1) * random.getPlusOrMinus() * 2,
        random.get(0.1, difficulty) * 2,
        random.get(20, 70)
      );
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
      text.draw("BOARD\nSURF", 50, 32, { scale: 2 });
      if (ticks % 60 < 30) {
        text.draw("CLICK OR TAP\nTO START", 50, 75);
      }
    });
  },
  init: () => {
    sss.setSeed(2);
    document.title = "BOARD SURF";
  },
  screen: screen,
  actorClass: Actor
  //isDebugMode: true
});

function player(
  a: Actor & { wallOn: boolean | Actor; onWallCount: number; isDead: boolean }
) {
  a.setRect(5, 5);
  a.addRect(new Rect(3, 3, { offset: { y: -4 } }));
  a.addRect(new Rect(3, 3, { offset: { x: -4, y: -6 }, springRatio: 0.2 }));
  a.addRect(new Rect(3, 3, { offset: { x: 4, y: -6 }, springRatio: 0.2 }));
  a.pos.set(50, 20);
  a.setPriority(0.5);
  a.wallOn = false;
  a.onWallCount = 0;
  a.isDead = false;
  const sb = new Vector(0, -1);
  a.addUpdater(() => {
    if (a.isDead) {
      a.angle += 0.2;
      a.vel.y += 0.4;
      return;
    }
    if (a.pos.y > 120) {
      a.vel.y = -10;
      a.angle += 2;
      a.isDead = true;
      sss.playJingle("l_d", true);
      sss.stopBgm();
      endGame();
    }
    if (isUsingKeyboard) {
      a.pos.x += keyboard.stick.x * 4;
    } else {
      a.pos.x = pointer.pos.x;
    }
    a.pos.x = math.clamp(a.pos.x, 0, 99);
    const isPressed = isUsingKeyboard ? keyboard.isPressed : pointer.isPressed;
    a.vel.y += isPressed ? 0.06 : 0.24;
    if (a.pos.y < 0) {
      a.pos.y = 0;
      if (a.vel.y < 0) {
        a.vel.y *= -0.5;
      }
    }
    if (a.wallOn) {
      a.pos.y += 3;
      if (a.stepBack(a.wallOn as Actor, sb)) {
        a.vel.y = 0;
        a.onWallCount = 10;
      }
      if (a.vel.length > 0.3) {
        a.wallOn = false;
      }
    } else {
      const wo = a.getColliding(wall);
      if (a.vel.y > 0 && wo) {
        a.stepBack(wo, sb);
        a.vel.y = 0;
        a.wallOn = wo;
        a.onWallCount = 10;
        const ws = (wo as any).score;
        sss.play("h_w");
        if (ws != null) {
          spawn(scoreBoard, wo.pos, ws);
          (wo as any).score = null;
          sss.play("c_ow");
        }
      }
    }
    if (a.onWallCount > 0) {
      a.onWallCount--;
      const isJustPressed = isUsingKeyboard
        ? keyboard.isJustPressed
        : pointer.isJustPressed;
      if (isJustPressed) {
        sss.play("j_p1");
        a.vel.y = -3;
        if (a.wallOn) {
          (a.wallOn as Actor).vel.y += 3;
        }
        a.wallOn = false;
        a.onWallCount = 0;
      }
    }
  });
}

function wall(a: Actor & { score: number }, x, y, vx, vy, width) {
  a.setRect(width, 8);
  a.pos.set(x, y);
  a.vel.set(vx, vy);
  const vxs = Math.abs(vx) + 1;
  const vys = Math.abs(vy) + 1;
  a.score = Math.floor((vxs * vxs * vys * vys * 50) / width + 1) * 10;
  a.addUpdater(u => {
    if (a.score == null) {
      u.remove();
      return;
    }
    screen.fillRect(a.pos.x - 8, a.pos.y - 3, 16, 5, screen.background);
    text.draw(`${a.score}`, a.pos.x, a.pos.y - 3);
  });
}

function scoreBoard(a: Actor, pos, _score) {
  score += _score;
  a.pos.set(pos);
  a.vel.y = -1;
  a.addUpdater(() => {
    a.vel.y *= 0.9;
    text.draw(`${_score}`, a.pos.x, a.pos.y - 3);
    if (a.ticks > 60) {
      a.remove();
    }
  });
}
