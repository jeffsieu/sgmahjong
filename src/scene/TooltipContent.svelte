<script lang="ts">
  import { afterUpdate, getContext } from "svelte";
  import { KEY_TOOLTIP_CONTEXT } from "./constants";

  export let text: string;
  let tooltipContent: HTMLElement;
  const { setContent } = getContext(KEY_TOOLTIP_CONTEXT);

  afterUpdate(() => {
    setContent(tooltipContent);
  });
</script>

<div class="tooltip" bind:this={tooltipContent}>
  {text}
</div>

<style>
  .tooltip {
    background-color: #000000aa;
    color: white;
    border-radius: 8px;
    padding: 16px;
    font-family: Poppins, sans-serif;
  }
</style>
