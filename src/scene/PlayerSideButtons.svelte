<script lang="ts">
  import { onMount } from "svelte";

  import type { Scene } from "svelthree-three";
  import Group from "../svelthree-patch/Group.svelte";
  import TextButton from "./TextButton.svelte";

  export let scene: Scene;
  export let size: number;
  const spacing = size / 2;

  export let actions: {
    name: string;
    onClick: () => void;
    button?: TextButton;
    pos?: number[];
    buttonWidth?: number;
  }[];
</script>

<Group {scene} {...$$restProps} let:parent>
  {#each actions as action, index}
    <TextButton
      bind:this={action.button}
      {scene}
      {parent}
      alignTopLeft
      text={action.name}
      onClick={action.onClick}
      pos={action.pos}
      onLoad={() => {
        console.debug("LOL");
        console.debug(action.button.getWidth());
        const width = action.button.getWidth();
        if (width !== action.buttonWidth) {
          action.buttonWidth = width;

          let offset = 0;
          const totalWidth =
            actions.reduce((acc, action) => acc + action.buttonWidth, 0) +
            spacing * (actions.length - 1);

          for (const action of actions) {
            action.pos = [offset - totalWidth, 0, 0.01];
            offset += action.buttonWidth + spacing;
          }
        }
      }}
      {size}
    />
  {/each}
</Group>
