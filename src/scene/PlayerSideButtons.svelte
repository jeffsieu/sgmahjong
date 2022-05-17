<script context="module" lang="ts">
  export type ButtonAction = {
    name: string;
    show: boolean;
    onClick: () => void;
    button?: TextButton;
    pos?: number[];
    buttonWidth?: number;
  };
</script>

<script lang="ts">
  import type { Scene } from "svelthree-three";
  import Group from "../svelthree-patch/Group.svelte";
  import TextButton from "./TextButton.svelte";

  export let scene: Scene;
  export let size: number;
  const spacing = size / 2;

  export let actions: ButtonAction[];
  export let onLoad: () => void = () => {};

  export const getTotalWidth = (): number => {
    return (
      actions.reduce((acc, action) => acc + (action.buttonWidth ?? 0), 0) +
      spacing * (actions.length - 1)
    );
  };
</script>

<Group {scene} {...$$restProps} let:parent>
  {#each actions as action}
    <TextButton
      bind:this={action.button}
      props={{
        visible: action.show,
      }}
      {scene}
      {parent}
      alignTop
      alignLeft
      text={action.name}
      onClick={action.onClick}
      pos={action.pos}
      onLoad={() => {
        const width = action.button?.getWidth() ?? 0;
        if (width !== action.buttonWidth) {
          action.buttonWidth = width;

          let offset = 0;
          const totalWidth = getTotalWidth();

          for (const action of actions) {
            action.pos = [offset - totalWidth, 0, 0.01];
            offset += (action.buttonWidth ?? 0) + spacing;
          }
        }
        onLoad();
      }}
      {size}
    />
  {/each}
</Group>
