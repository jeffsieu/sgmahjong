<script lang="ts">
  import type { SeatedPlayer } from "./game-state/game-state";
  export let player: SeatedPlayer;
</script>

<h3>Flower hand ({player.wind.name})</h3>
<div id="flowers">
  {player.bonusTiles.map((flower) => flower.toString()).join("")}
</div>
