<script lang="ts">
  import type { SeatedPlayer } from "./game-state";
  export let player: SeatedPlayer;

  let flowers = player.flowers;
  
</script>
<h3>Flower hand</h3>
<div id="flowers">
  {flowers.map(flower => flower.toString()).join('')}
</div>