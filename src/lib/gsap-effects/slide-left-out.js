import { gsap } from "gsap";

export default {
  name: "slideLeftOut",
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
      left: (i, obj) => {
        let to = 0;
        if (obj.originX === "left") {
          to = -(obj.width * obj.scaleX);
        } else if (obj.originX === "center") {
          to = -(obj.width * obj.scaleX) / 2;
        } else if (obj.originX === "right") {
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
