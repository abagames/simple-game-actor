import * as sga from "../../..";
import { Collider, clearCache } from "pixel-perfect-collider";
import * as screen from "./screen";
import Vector from "../vector";

const removePaddingRatio = 0.5;
let imageCache: { [key: string]: HTMLImageElement[] } = {};
let textureCache: { [key: string]: PIXI.Texture[] } = {};

export class Actor extends sga.Actor {
  pos = new Vector();
  prevPos = new Vector();
  vel = new Vector();
  speed = 0;
  angle = 0;
  size = new Vector();
  sprite: PIXI.Sprite;
  collider: Collider;
  colliderCache: { [key: string]: Collider } = {};

  setImage(image: HTMLImageElement) {
    const name = this.func.name;
    let cachedImages = imageCache[name];
    if (cachedImages == null) {
      cachedImages = imageCache[name] = [];
      textureCache[name] = [];
    }
    let texture;
    const ci = cachedImages.indexOf(image);
    if (ci >= 0) {
      texture = textureCache[ci];
    } else {
      texture = PIXI.Texture.fromLoader(
        image,
        `${name}_${cachedImages.length}`
      );
      cachedImages.push(image);
      textureCache[name].push(texture);
    }
    this.setTextureToSprite(texture);
    this.size.x = image.width;
    this.size.y = image.height;
    const c = this.colliderCache[name];
    if (c != null) {
      this.collider = c;
    } else {
      this.collider = new Collider(image);
      this.collider.setAnchor(0.5, 0.5);
      this.colliderCache[name] = this.collider;
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
    this.prevPos.set(this.pos);
    this.pos.add(this.vel);
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
    super.updateFrame();
  }
}

export function reset() {
  imageCache = {};
  textureCache = {};
  clearCache();
}
