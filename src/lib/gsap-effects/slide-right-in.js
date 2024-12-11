import { gsap } from "gsap";

export default {
  name: "slideRightIn",
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
      left: (i, obj) => {
        let start = 0;
        if (obj.originX === "left") {
          start = -(obj.width * obj.scaleX);
        } else if (obj.originX === "center") {
          start = -(obj.width * obj.scaleX) / 2;
        } else if (obj.originX === "right") {
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
