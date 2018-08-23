import * as pag from "pixel-art-gen";
import * as ppe from "particle-pattern-emitter";
import * as sss from "sounds-some-sounds";
import { spawn, addUpdater, reset, AnyActor, pool } from "..";
import { Actor } from "./util/pixi/actor";
import { init, endGame, random } from "./util/game";
import * as screen from "./util/pixi/screen";
import * as particle from "./util/pixi/particle";
import { text } from "./util/pixi/text";
import * as pointer from "./util/pointer";
import Vector from "./util/vector";
import { range } from "./util/math";

let wind = new Vector();
let topShip: AnyActor;
let score: number;
let scoreText: AnyActor;
const startFuel = 360;
let fuel: number;
let fuelText: AnyActor;
let gameOverText: AnyActor;

init({
  title: () => {
    if (gameOverText != null) {
      gameOverText.remove();
    } else {
      range(50).forEach(() => spawn(star));
    }
    spawn(text, "CLICK/TAP TO START").pos.set(50, 60);
    spawn(titleBoard);
  },
  game: () => {
    reset();
    addUpdater(() => {
      particle.update();
    });
    spawn(ship, 0, true);
    topShip = spawn(ship, 1);
    score = 0;
    scoreText = spawn(text, "0");
    scoreText.pos.set(2, 2);
    fuel = startFuel;
    fuelText = spawn(text, "");
    fuelText.pos.set(98, 2);
    range(50).forEach(() => spawn(star));
    addUpdater(() => {
      wind.x += random.get(-0.02, 0.02);
      wind.y += random.get(-0.01, 0.01);
      wind.mul(0.9);
    });
    sss.playBgm();
  },
  gameOver: () => {
    fuelText.remove();
    gameOverText = spawn(text, "GAME OVER");
    gameOverText.pos.set(50, 40);
  },
  init: () => {
    pag.setSeed(7);
    ppe.setSeed(2);
    sss.setSeed(234);
  },
  screen: screen,
  actorClass: Actor
});

async function ship(
  a: Actor & { isPlayer: boolean; targetPos: Vector; targetMoveTicks: number },
  size = 0,
  isPlayer = false
) {
  let dockedShip: AnyActor = null;
  a.pos.set(50, 120);
  a.targetPos = new Vector(50, isPlayer ? 20 : 90);
  a.targetMoveTicks = 30;
  const shipStr = range(4 + (size % 2)).map(
    i =>
      `${range(size + 3 - i)
        .map(() => " ")
        .join("")}${range(i + 2 + (size + (size % 2)) * 2)
        .map(() => "-")
        .join("")}`
  );
  const images = await pag.generateImagesPromise(shipStr, {
    isMirrorX: true,
    scale: Math.floor(size * 0.5) + 1
  });
  a.setImage(images[0]);
  a.isPlayer = isPlayer;
  a.onRemove = () => {
    particle.emit(`e_s_${size}`, a.pos.x, a.pos.y, 0, {
      sizeScale: size * 0.5 + 1
    });
  };
  a.addUpdater(() => {
    if (dockedShip != null) {
      a.pos.set(dockedShip.pos.x, dockedShip.pos.y - dockedShip.size.y * 0.7);
      return;
    }
    particle.emit(
      `j_s_${size}`,
      a.pos.x,
      a.pos.y + a.size.y / 2,
      Math.PI / 2 + a.vel.x * 0.05,
      {
        sizeScale: 0.5 + size * (0.5 - a.vel.y),
        countScale: 1 - a.vel.y
      }
    );
    if (a.targetMoveTicks > 0) {
      a.pos.x += (a.targetPos.x - a.pos.x) / a.targetMoveTicks;
      a.pos.y += (a.targetPos.y - a.pos.y) / a.targetMoveTicks;
      a.targetMoveTicks--;
      return;
    }
    if (!a.isPlayer) {
      return;
    }
    a.vel.x += ((pointer.pos.x - a.pos.x) * 0.005) / Math.sqrt(size + 1);
    a.vel.y += ((pointer.pos.y - a.pos.y) * 0.001) / Math.sqrt(size + 1);
    a.vel.add(wind);
    a.vel.mul(1 - 0.1 / Math.sqrt(size + 1));
    fuelText.setText(`${fuel}`, { align: "right" });
    fuel--;
    if (!a.pos.isInRect(-10, 10, 120, 120) || fuel < 0) {
      removeAllShips();
      return;
    }
    if (a.getColliding(ship)) {
      if (Math.abs(a.pos.x - 50) < 5) {
        addScore(a.pos, fuel, size + 1);
        dockedShip = topShip;
        a.isPlayer = false;
        a.collider = null;
        topShip.isPlayer = true;
        topShip.targetPos.set(50, size < 15 ? 20 : -50);
        topShip.targetMoveTicks = 30;
        topShip = size < 15 ? spawn(ship, size + 2) : null;
        fuel = startFuel;
        sss.playJingle("l_sdk", false, undefined, 4);
      } else {
        removeAllShips();
      }
    }
  });
}

function removeAllShips() {
  sss.playJingle("h_r", true);
  sss.stopBgm();
  pool.get(ship).forEach(s => {
    s.remove();
  });
  endGame();
}

function star(a: Actor) {
  a.pos.set(random.get(99), random.get(99));
  a.vel.set(0, random.get(0.1, 0.5));
  const g = new PIXI.Graphics();
  g.beginFill(
    (random.getInt(100, 250) << 16) |
      (random.getInt(100, 250) << 8) |
      random.getInt(100, 250)
  );
  g.drawRect(0, 0, 1, 1);
  g.endFill();
  a.setGraphics(g);
  a.addUpdater(() => {
    if (a.pos.y > 99) {
      a.pos.y -= 99;
    }
  });
}

function addScore(pos: Vector, _score, multiplier = 1) {
  score += _score * multiplier;
  scoreText.setText(`${score}`, { align: "left" });
  const a = spawn(
    text,
    multiplier === 1 ? `${_score}` : `${_score}X${multiplier}`
  );
  a.pos.set(pos);
  a.vel.y = -1;
  a.addUpdater(() => {
    a.vel.y *= 0.9;
    if (a.ticks > 60) {
      a.remove();
    }
  });
}

async function titleBoard(a: Actor) {
  a.pos.set(50, 25);
  const images = await pag.generateImagesPromise("DOCKING", {
    isUsingLetterForm: true,
    letterWidthRatio: 0.6,
    colorLighting: 0.3,
    isAddingEdgeFirst: true,
    letterFormChar: "*"
  });
  a.setImage(images[0]);
}
