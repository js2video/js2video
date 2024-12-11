import { gsap } from "gsap";

export default {
  name: "fadeOut",
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
      duration: config.duration,
      ease: config.ease,
      opacity: 0,
      stagger: config.stagger,
    });
    return tl;
  },
};
