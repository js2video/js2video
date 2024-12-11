import { gsap } from "gsap";

export default {
  name: "slideDownIn",
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
      top: (i, obj) => {
        let start = 0;
        if (obj.originY === "top") {
          start = -(obj.height * obj.scaleY);
        } else if (obj.originY === "center") {
          start = -(obj.height * obj.scaleY) / 2;
        } else if (obj.originY === "bottom") {
          start = 0;
        }
        return start;
      },
      duration: config.duration,
      ease: config.ease,
      stagger: config.stagger,
    });
    return tl;
  },
};
