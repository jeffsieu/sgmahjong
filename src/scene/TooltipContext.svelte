<script lang="ts">
  import { setContext } from "svelte";

  import { KEY_TOOLTIP_CONTEXT } from "./constants";

  let tooltipContainer: HTMLElement;

  const getTooltipStyle = (pageX: number, pageY: number): string => {
    return `transform: translate(0%, -100%) translate(${pageX}px, ${pageY}px)`;
  };

  let tooltipStyle = getTooltipStyle(0, 0);

  const updateLocation = (event: MouseEvent) => {
    tooltipStyle = getTooltipStyle(event.pageX, event.pageY);
  };

  export const setContent = (newTooltipContent: HTMLElement) => {
    tooltipContainer.replaceChildren(newTooltipContent);
  };

  setContext(KEY_TOOLTIP_CONTEXT, {
    setContent: setContent,
  });
</script>

<div class="tooltip" style={tooltipStyle} bind:this={tooltipContainer} />
<slot />
<svelte:window on:mousemove={updateLocation} />

<style>
  .tooltip {
    position: absolute;
    pointer-events: none;
    left: 0;
    top: 0;
  }
</style>
