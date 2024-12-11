import { gsap } from "gsap";

export default {
  name: "fadeIn",
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
      duration: config.duration,
      ease: config.ease,
      opacity: 0,
      stagger: config.stagger,
    });
    return tl;
  },
};
