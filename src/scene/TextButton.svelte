<script lang="ts">
  import {
    MeshBasicMaterial,
    PlaneBufferGeometry,
    ShapeBufferGeometry,
  } from "svelthree";

  import { Scene, Vector3 } from "svelthree-three";
  import Mesh from "svelthree/src/components/Mesh.svelte";
  import Text from "./Text.svelte";
  import gsap from "gsap";

  export let scene: Scene;
  export let text: string;
  export let onClick: () => void;
  export let onLoad: () => void = () => {};
  export let size: number;
  export let verticalPadding: number = size;
  export let horizontalPadding: number = size * 1.5;
  export let alignTop: boolean = false;
  export let alignLeft: boolean = false;

  let geometry = new PlaneBufferGeometry(0, 0);
  const material = new MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.7,
  });

  const transparentMaterial = new MeshBasicMaterial({
    transparent: true,
    opacity: 0,
  });

  let textPos = new Vector3();

  const onTextGeometryLoaded = (textGeometry: ShapeBufferGeometry) => {
    textGeometry.computeBoundingBox();
    const boundingBox = textGeometry.boundingBox!;

    const width = boundingBox.max.x - boundingBox.min.x + horizontalPadding * 2;
    const height = size + verticalPadding * 2;

    geometry = new PlaneBufferGeometry(width, height);

    textPos = new Vector3(-boundingBox.max.x / 2, -boundingBox.max.y / 2, 0.01);

    if (alignTop) {
      geometry.translate(0, -height / 2, 0);
      textPos.add(new Vector3(0, -height / 2, 0));
    }

    if (alignLeft) {
      geometry.translate(width / 2, 0, 0);
      textPos.add(new Vector3(width / 2, 0, 0));
    }
  };

  const onPointerOut = () => {
    gsap.to(material, {
      opacity: 0.5,
      duration: 0.2,
    });
  };

  const onPointerOver = () => {
    gsap.to(material, {
      opacity: 1,
      duration: 0.2,
    });
  };

  export const getWidth = () => {
    return geometry.parameters.width;
  };

  export const getHeight = () => {
    return geometry.parameters.height;
  };
</script>

<Mesh {scene} {geometry} {material} {...$$restProps} castShadow let:parent>
  <Mesh
    {scene}
    {geometry}
    material={transparentMaterial}
    {parent}
    pos={[0, 0, 0.02]}
    {onClick}
    {onPointerOver}
    {onPointerOut}
    interact
  />
  <Text
    {scene}
    {parent}
    {text}
    pos={textPos.toArray()}
    onGeometry={(textGeometry) => {
      onTextGeometryLoaded(textGeometry);
      onLoad();
    }}
    color={0x012101}
    {size}
  />
</Mesh>
