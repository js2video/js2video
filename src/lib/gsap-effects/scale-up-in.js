import { gsap } from "gsap";

export default {
  name: "scaleUpIn",
  extendTimeline: true,
  defaults: {
    delay: 0,
    duration: 0.4,
    ease: "power2.inOut",
    stagger: { each: 0.1 },
  },
  effect: (targets, config) => {
    let tl = gsap.timeline();
    tl.from(targets, {
      delay: config.delay,
      opacity: (i, obj) => 0,
      scaleX: (i, obj) => {
        return 0.01;
      },
      scaleY: (i, obj) => {
        return 0.01;
      },
      duration: config.duration,
      ease: config.ease,
      stagger: config.stagger,
    });
    return tl;
  },
};
