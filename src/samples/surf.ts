import { spawn, update } from "..";
import * as sss from "sounds-some-sounds";
import { Actor, Rect } from "./util/actor";
import { init, endGame, random, ticks, difficulty } from "./util/game";
import * as pointer from "./util/pointer";
import * as screen from "./util/screen";
import * as text from "./util/text";
import Vector from "./util/vector";
import math from "./util/math";

let score = 0;

init(
  () => {
    score = 0;
    sss.playBgm();
    update(() => {
      text.draw(`${score}`, 1, 1, { align: "left" });
    });
    spawn(wall, 50, 80, 0, 0.1, 99);
    spawn(player);
    update(u => {
      u.setInterval(20 / difficulty);
      spawn(
        wall,
        random.get(99),
        -5,
        random.get(difficulty - 1) * random.getPlusOrMinus(),
        random.get(0.1, difficulty),
        random.get(20, 70)
      );
    });
  },
  () => {
    update(() => {
      text.draw("BOARD\nSURF", 50, 32, { scale: 2 });
      if (ticks % 60 < 30) {
        text.draw("CLICK OR TAP\nTO START", 50, 75);
      }
    });
  },
  () => {
    sss.setSeed(2);
  }
);

function player(a: Actor & { wallOn: boolean | Actor; isDead: boolean }) {
  a.setRect(5, 5);
  a.addRect(new Rect(3, 3, { offset: { y: -4 } }));
  a.addRect(new Rect(3, 3, { offset: { x: -4, y: -6 }, springRatio: 0.2 }));
  a.addRect(new Rect(3, 3, { offset: { x: 4, y: -6 }, springRatio: 0.2 }));
  a.pos.set(50, 20);
  a.wallOn = false;
  a.isDead = false;
  const sb = new Vector(0, -1);
  a.update(() => {
    if (a.isDead) {
      a.angle += 0.1;
      a.vel.y += 0.2;
      return;
    } else {
      a.pos.x = math.clamp(pointer.pos.x, 0, 99);
      a.vel.y += pointer.isPressed ? 0.03 : 0.1;
    }
    if (a.pos.y > 120) {
      a.vel.y = -6;
      a.angle += 1;
      a.isDead = true;
      sss.playJingle("l_d", true);
      sss.stopBgm();
      endGame();
    }
    if (a.pos.y < 0) {
      a.pos.y = 0;
      if (a.vel.y < 0) {
        a.vel.y *= -0.5;
      }
    }
    if (a.wallOn) {
      if (pointer.isPressed) {
        sss.play("j_p1");
        a.vel.y = -2;
        (a.wallOn as Actor).vel.y += 2;
      } else {
        a.pos.y += 1;
        if (a.stepBack(a.wallOn as Actor, sb)) {
          a.vel.y = 0;
        }
      }
      if (a.vel.length > 1) {
        a.wallOn = false;
      }
    } else {
      const wo = a.getColliding(wall);
      if (a.vel.y > 0 && wo) {
        a.stepBack(wo, sb);
        a.vel.y = 0;
        a.wallOn = wo;
        const ws = (wo as any).score;
        sss.play("h_w");
        if (ws != null) {
          spawn(scoreBoard, wo.pos, ws);
          (wo as any).score = null;
          sss.play("c_ow");
        }
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
  a.score = Math.floor((vxs * vxs * vys * vys * 100) / width + 1) * 10;
  a.update(u => {
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
  a.update(() => {
    a.vel.y *= 0.9;
    text.draw(`${_score}`, a.pos.x, a.pos.y - 3);
    if (a.ticks > 60) {
      a.remove();
    }
  });
}
