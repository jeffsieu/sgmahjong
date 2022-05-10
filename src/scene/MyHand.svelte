<script lang="ts">
  import type { Tile } from "../tiles";
  import TileMesh from "./TileMesh.svelte";
  import { Mesh } from "svelthree";
  import type { Scene, Mesh as ThreeMesh } from "svelthree-three";
  import { TILE_WIDTH } from "./constants";

  import gsap from "gsap";
  import type { ReadonlyPlayer } from "../game-state";
  import type { PlayerHandInterface } from "../controls/hand-control";

  export let player: ReadonlyPlayer;
  export let playerHandInterface: PlayerHandInterface;
  export let scene: Scene;
  export let onUpdate: () => void;

  const onTilePointerOver = (event: CustomEvent): void => {
    const tileObject: ThreeMesh = event.detail.target;
    gsap.to(tileObject.position, {
      duration: 0.3,
      z: 1,
      ease: "power3.out",
    });
  };

  const onTilePointerOut = (event: CustomEvent): void => {
    const tileObject: ThreeMesh = event.detail.target;
    gsap.to(tileObject.position, {
      duration: 0.3,
      z: 0,
      ease: "power3.out",
    });
  };

  const onTileClick =
    (position: number) =>
    (event: CustomEvent): void => {
      playerHandInterface.removeFromHand(position);
      player = player;
      onUpdate();
    };
</script>

<Mesh {scene} {...$$restProps} let:parent>
  {#each player.hand as tile, index (tile.toString() + index)}
    <TileMesh
      {scene}
      {tile}
      {parent}
      pos={[(index - player.hand.length / 2 + 0.5) * TILE_WIDTH, 0, 0]}
      rot={[Math.PI / 2, -Math.PI, 0]}
      onPointerOver={onTilePointerOver}
      onPointerOut={onTilePointerOut}
      onClick={onTileClick(index)}
    />
  {/each}
</Mesh>
