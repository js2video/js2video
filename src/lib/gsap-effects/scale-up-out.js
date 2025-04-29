import { gsap } from "gsap";

export default {
  name: "scaleUpOut",
  extendTimeline: true,
  defaults: {
    delay: 0,
    duration: 0.4,
    ease: "power2.inOut",
    stagger: { each: 0.1 },
  },
  effect: (targets, config) => {
    let tl = gsap.timeline();
    tl.to(targets, {
      delay: config.delay,
      opacity: (i, obj) => 0,
      scaleX: (i, obj) => {
        return obj.scaleX * 3;
      },
      scaleY: (i, obj) => {
        return obj.scaleX * 3;
      },
      duration: config.duration,
      ease: config.ease,
      stagger: config.stagger,
    });
    return tl;
  },
};
