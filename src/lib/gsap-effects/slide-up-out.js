import { gsap } from "gsap";

export default {
  name: "slideUpOut",
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
      top: (i, obj) => {
        let to = 0;
        if (obj.originY === "top") {
          to = -(obj.height * obj.scaleY);
        } else if (obj.originY === "center") {
          to = -(obj.height * obj.scaleY) / 2;
        } else if (obj.originY === "bottom") {
          to = 0;
        }
        return to;
      },
      duration: config.duration,
      ease: config.ease,
      stagger: config.stagger,
    });
    return tl;
  },
};
