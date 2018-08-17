import * as sga from "../../..";
import * as ppc from "pixel-perfect-collider";
import * as screen from "./screen";
import Vector from "../vector";

let textures = {};
const removePaddingRatio = 0.25;

export class Actor extends sga.Actor {
  pos = new Vector();
  size = new Vector();
  sprite: PIXI.Sprite;
  collider: ppc.Collider;
  colliders: { [key: string]: ppc.Collider } = {};

  setImage(image: HTMLImageElement, name: string, isAddingCollider = true) {
    let texture;
    if (textures[name] != null) {
      texture = textures[name];
    } else {
      texture = PIXI.Texture.fromLoader(image, name);
      textures[name] = texture;
    }
    this.setTextureToSprite(texture);
    this.size.x = image.width;
    this.size.y = image.height;
    if (isAddingCollider) {
      const c = this.colliders[name];
      if (c != null) {
        this.collider = c;
      } else {
        this.collider = new ppc.Collider(image);
        this.collider.setAnchor(0.5, 0.5);
        this.colliders[name] = this.collider;
      }
    }
    this.onRemove = () => {
      if (this.sprite != null) {
        screen.container.removeChild(this.sprite);
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
      }
    };
  }

  setGraphics(g: PIXI.Graphics, app: PIXI.Application) {
    let texture = app.renderer.generateTexture(g);
    this.setTextureToSprite(texture);
  }

  setTextureToSprite(texture: PIXI.Texture) {
    if (this.sprite == null) {
      this.sprite = new PIXI.Sprite(texture);
      this.sprite.anchor.x = 0.5;
      this.sprite.anchor.y = 0.5;
      this.sprite.x = this.pos.x;
      this.sprite.y = this.pos.y;
      screen.container.addChild(this.sprite);
    } else {
      this.sprite.texture = texture;
    }
  }

  testColliding(other: Actor) {
    if (this.collider == null || other.collider == null) {
      return false;
    }
    return this.collider.test(other.collider);
  }

  getCollidings(func?: Function) {
    const actors = this.pool.get(func) as Actor[];
    return actors.filter(a => this.testColliding(a));
  }

  getColliding(func?: Function) {
    const actors = this.pool.get(func) as Actor[];
    for (let a of actors) {
      if (this.testColliding(a)) {
        return a;
      }
    }
    return false;
  }

  updateFrame() {
    super.updateFrame();
    if (this.sprite != null) {
      this.sprite.x = this.pos.x;
      this.sprite.y = this.pos.y;
    }
    if (this.collider != null) {
      this.collider.setPos(this.pos.x, this.pos.y);
    }
    if (
      this.pos.x < -screen.size * removePaddingRatio ||
      this.pos.x > screen.size * (1 + removePaddingRatio) ||
      this.pos.y < -screen.size * removePaddingRatio ||
      this.pos.y > screen.size * (1 + removePaddingRatio)
    ) {
      this.remove();
    }
  }
}

export function reset() {
  textures = {};
  ppc.clearCache();
}
