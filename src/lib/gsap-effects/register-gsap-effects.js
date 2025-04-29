import { gsap } from "gsap";

// in
import fadeIn from "./fade-in";
import slideLeftIn from "./slide-left-in";
import slideRightIn from "./slide-right-in";
import slideUpIn from "./slide-up-in";
import slideDownIn from "./slide-down-in";
import scaleDownIn from "./scale-down-in";
import scaleUpIn from "./scale-up-in";

// out
import fadeOut from "./fade-out";
import slideLeftOut from "./slide-left-out";
import slideRightOut from "./slide-right-out";
import slideUpOut from "./slide-up-out";
import slideDownOut from "./slide-down-out";
import scaleDownOut from "./scale-down-out";
import scaleUpOut from "./scale-up-out";

const registerGsapEffects = () => {
  // show
  gsap.registerEffect(fadeIn);
  gsap.registerEffect(slideLeftIn);
  gsap.registerEffect(slideRightIn);
  gsap.registerEffect(slideUpIn);
  gsap.registerEffect(slideDownIn);
  gsap.registerEffect(scaleDownIn);
  gsap.registerEffect(scaleUpIn);
  // hide
  gsap.registerEffect(fadeOut);
  gsap.registerEffect(slideLeftOut);
  gsap.registerEffect(slideRightOut);
  gsap.registerEffect(slideUpOut);
  gsap.registerEffect(slideDownOut);
  gsap.registerEffect(scaleDownOut);
  gsap.registerEffect(scaleUpOut);
};

export { registerGsapEffects };
