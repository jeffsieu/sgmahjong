import gsap from "gsap";
import type { Material } from "three";

export const animateMaterial = (material: Material) => {
  gsap.timeline({ repeat: -1, yoyo: true }).fromTo(
    material,
    {
      opacity: 0.3,
      duration: 2,
      ease: "power3.out",
      yoyoEase: "power3.in",
    },
    {
      opacity: 0.2,
      duration: 2,
    }
  );
};
