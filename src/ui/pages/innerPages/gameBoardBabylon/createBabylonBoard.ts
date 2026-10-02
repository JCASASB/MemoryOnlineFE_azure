import "@babylonjs/core/Culling/ray";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import type { Card } from "../../../../core/game/domain/entities/Card";
import { StateCard } from "../../../../core/game/domain/entities/StateCard";
import { getBackColor, getSquareColor } from "../../../components/card/MemoryCard.utils";

interface Callbacks {
  flip: (id: string) => void;
  start: (id: string) => Promise<void>;
  finish: (id: string) => Promise<void>;
}
interface Tile {
  root: TransformNode;
  shadow: Mesh;
  texture: DynamicTexture;
  card: Card;
  target: number;
  elapsed: number;
  from: number;
  animation?: Promise<void>;
}
const duration = 650;

export function createBabylonBoard(canvas: HTMLCanvasElement, callbacks: Callbacks) {
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.055, 0.075, 0.10, 1);
  const camera = new FreeCamera("board-camera", new Vector3(0, 0, -20), scene);
  camera.setTarget(Vector3.Zero());
  camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
  const light = new HemisphericLight("board-light", new Vector3(-0.7, 1, -1), scene);
  light.intensity = 0.95;
  const tiles = new Map<string, Tile>();
  let disposed = false;
  let boardWidth = 1;
  let boardHeight = 1;

  function material(name: string, texture: DynamicTexture) {
    const result = new StandardMaterial(name, scene);
    result.diffuseTexture = texture;
    result.emissiveColor = new Color3(0.18, 0.18, 0.18);
    result.specularColor = new Color3(0.12, 0.12, 0.12);
    result.specularPower = 48;
    return result;
  }
  const backTexture = new DynamicTexture("card-back", { width: 256, height: 320 }, scene, false);
  backTexture.drawText("?", 96, 195, "bold 100px sans-serif", "#c4f37a", "#203b30", true);
  const backMaterial = material("card-back-material", backTexture);

  const edgeMaterial = new StandardMaterial("card-edge", scene);
  edgeMaterial.diffuseColor = Color3.FromHexString("#d8dccb");
  edgeMaterial.specularColor = new Color3(0.15, 0.15, 0.15);
  const shadowMaterial = new StandardMaterial("card-shadow", scene);
  shadowMaterial.diffuseColor = Color3.Black();
  shadowMaterial.disableLighting = true;
  shadowMaterial.alpha = 0.28;

  function paint(tile: Tile) {
    const { value, state } = tile.card;
    const context = tile.texture.getContext() as CanvasRenderingContext2D;
    context.fillStyle = state === StateCard.Matched ? "#c4f37a" : getBackColor(value);
    context.fillRect(0, 0, 256, 320);
    context.fillStyle = getSquareColor(value);
    context.textAlign = "center";
    context.font = "bold 68px sans-serif";
    context.fillText(String(value), 128, 95);
    // Keep the same colored-square vocabulary as MemoryCard.
    const count = Math.max(0, Math.floor(value));
    const columns = Math.ceil(Math.sqrt(count || 1));
    const rows = Math.ceil(count / columns);
    const size = Math.min(30, 150 / Math.max(columns, rows, 1));
    for (let i = 0; i < count; i++) {
      context.fillRect(128 + (i % columns - columns / 2) * size,
        140 + Math.floor(i / columns) * size, size * 0.7, size * 0.7);
    }
    tile.texture.update();
  }
  function release(tile: Tile) {
    if (!tile.animation) return;
    const pending = tile.animation;
    tile.animation = undefined;
    // Serialize remove after add, including unmount during asynchronous registration.
    void pending.then(() => callbacks.finish(tile.card.id)).catch(console.error);
  }
  function resize() {
    if (disposed) return;
    engine.resize();
    const ratio = canvas.clientWidth / Math.max(canvas.clientHeight, 1);
    const halfHeight = Math.max(boardHeight / 2 + 0.4, (boardWidth / 2 + 0.4) / ratio);
    camera.orthoTop = halfHeight;
    camera.orthoBottom = -halfHeight;
    camera.orthoLeft = -halfHeight * ratio;
    camera.orthoRight = halfHeight * ratio;
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  scene.onPointerObservable.add(info => {
    if (info.type !== PointerEventTypes.POINTERPICK) return;
    const id: unknown = info.pickInfo?.pickedMesh?.metadata?.cardId;
    if (typeof id !== "string") return;
    const tile = tiles.get(id);
    if (tile && !tile.animation && tile.card.state === StateCard.FaceDown) callbacks.flip(id);
  });
  engine.runRenderLoop(() => {
    for (const tile of tiles.values()) {
      if (!tile.animation) continue;
      tile.elapsed = Math.min(duration, tile.elapsed + engine.getDeltaTime());
      const progress = tile.elapsed / duration;
      const eased = progress * progress * (3 - 2 * progress);
      tile.root.rotation.y = tile.from + (tile.target - tile.from) * eased;
      const lift = Math.sin(Math.PI * progress);
      // Negative Z lifts the card towards the camera; secondary axes add a natural tilt.
      tile.root.position.z = -0.65 * lift;
      tile.root.rotation.x = 0.20 * lift;
      tile.root.rotation.z = 0.075 * Math.sin(2 * Math.PI * progress) * lift;
      const baseScale = tile.card.state === StateCard.Matched ? 0.93 : 1;
      tile.root.scaling.setAll(baseScale * (1 + 0.07 * lift));
      tile.shadow.scaling.setAll(baseScale * (1 + 0.16 * lift));
      tile.shadow.visibility = 1 - 0.45 * lift;
      if (progress === 1) {
        tile.root.rotation.set(0, tile.target, 0);
        tile.root.position.z = 0;
        release(tile);
      }
    }
    scene.render();
  });

  return {
    update(cards: readonly Card[]) {
      const ids = new Set(cards.map(card => card.id));
      for (const [id, tile] of tiles) {
        if (ids.has(id)) continue;
        release(tile);
        tile.root.dispose();
        tile.shadow.dispose();
        scene.getMaterialByName("material-" + id)?.dispose();
        tile.texture.dispose();
        tiles.delete(id);
      }
      const columns = Math.max(1, Math.ceil(Math.sqrt(cards.length)));
      const rows = Math.ceil(cards.length / columns);
      boardWidth = columns * 1.55;
      boardHeight = rows * 1.95;
      cards.forEach((card, index) => {
        const angle = card.state === StateCard.FaceDown ? 0 : Math.PI;
        let tile = tiles.get(card.id);
        if (!tile) {
          const root = new TransformNode(card.id, scene);
          const body = CreateBox("body-" + card.id, { width: 1.3, height: 1.65, depth: 0.08 }, scene);
          body.parent = root;
          body.material = edgeMaterial;
          body.metadata = { cardId: card.id };
          const shadow = CreatePlane("shadow-" + card.id, { width: 1.36, height: 1.71 }, scene);
          shadow.position.z = 0.13;
          shadow.material = shadowMaterial;
          shadow.isPickable = false;
          const cover = CreatePlane("back-" + card.id, { width: 1.3, height: 1.65 }, scene);
          cover.parent = root; cover.position.z = -0.041;
          cover.material = backMaterial; cover.metadata = { cardId: card.id };
          const face = CreatePlane("face-" + card.id, { width: 1.3, height: 1.65 }, scene);
          face.parent = root; face.position.z = 0.041; face.rotation.y = Math.PI;
          const texture = new DynamicTexture("texture-" + card.id, { width: 256, height: 320 }, scene, false);
          face.material = material("material-" + card.id, texture);
          face.metadata = { cardId: card.id };
          root.rotation.y = angle;
          tile = { root, shadow, texture, card, target: angle, from: angle, elapsed: duration };
          tiles.set(card.id, tile);
          paint(tile);
        } else {
          const changed = tile.card.value !== card.value || tile.card.state !== card.state;
          tile.card = card;
          if (changed) paint(tile);
          if (tile.target !== angle) {
            tile.target = angle;
            tile.from = tile.root.rotation.y;
            tile.elapsed = 0;
            if (!tile.animation) tile.animation = callbacks.start(card.id);
          }
        }
        tile.root.position.set((index % columns - (columns - 1) / 2) * 1.55,
          ((rows - 1) / 2 - Math.floor(index / columns)) * 1.95, tile.root.position.z);
        tile.shadow.position.x = tile.root.position.x + 0.055;
        tile.shadow.position.y = tile.root.position.y - 0.065;
        tile.root.scaling.setAll(card.state === StateCard.Matched ? 0.93 : 1);
      });
      resize();
    },
    dispose() {
      disposed = true;
      observer.disconnect();
      engine.stopRenderLoop();
      for (const tile of tiles.values()) release(tile);
      tiles.clear();
      scene.dispose();
      engine.dispose();
    },
  };
}


