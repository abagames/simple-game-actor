import * as sga from "../../..";
import * as ppe from "particle-pattern-emitter";
import * as PIXI from "pixi.js";

let particleContainer: PIXI.particles.ParticleContainer;
let particleTexture: PIXI.Texture;
const particleBaseSize = 16;

export function init(
  app: PIXI.Application,
  parent: PIXI.Container,
  padding: number
) {
  particleContainer = new PIXI.particles.ParticleContainer(
    1000,
    {
      scale: true,
      position: true,
      alpha: true
    },
    1000
  );
  particleContainer.x = particleContainer.y = padding;
  parent.addChild(particleContainer);
  const g = new PIXI.Graphics();
  g.beginFill(0xffffff);
  g.drawRect(0, 0, particleBaseSize, particleBaseSize);
  g.endFill();
  particleTexture = app.renderer.generateTexture(g);
}

export function emit(
  patternName: string,
  x: number,
  y: number,
  angle = 0,
  emitOptions: ppe.EmitOptions = {}
) {
  ppe.emit(patternName, x, y, angle, emitOptions).forEach(ppe => {
    new sga.Actor().init(particle, ppe);
  });
}

export function update() {
  ppe.update();
  pool.update();
}

let pool = new sga.Pool();

function particle(
  p: sga.Actor & { sprite: PIXI.Sprite; scale: PIXI.Point },
  ppe: ppe.Particle
) {
  p.setPool(pool);
  p.scale = new PIXI.Point();
  p.sprite = new PIXI.Sprite(particleTexture);
  p.sprite.anchor.x = p.sprite.anchor.y = 0.5;
  p.sprite.scale = p.scale;
  particleContainer.addChild(p.sprite);
  p.onRemove = () => {
    particleContainer.removeChild(p.sprite);
  };
  p.addUpdater(() => {
    if (!ppe.isAlive) {
      p.remove();
      return;
    }
    p.sprite.x = Math.round(ppe.pos.x);
    p.sprite.y = Math.round(ppe.pos.y);
    p.sprite.tint =
      (Math.floor(ppe.color.r * 255) << 16) |
      (Math.floor(ppe.color.g * 255) << 8) |
      Math.floor(ppe.color.b * 255);
    p.scale.x = p.scale.y = (Math.round(ppe.size / 2) * 2) / particleBaseSize;
    p.sprite.scale = p.scale;
  });
}
