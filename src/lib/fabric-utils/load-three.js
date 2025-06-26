import { FabricObject } from "fabric";
import { JS2VideoMixin } from "./js2video-mixin";
// @ts-ignore
import * as THREE from "https://esm.sh/three@0.174.0";

class JS2VideoThree extends JS2VideoMixin(FabricObject) {
  static type = "js2video_three";

  /**
   * Create an instance of the JS2VideoThree class
   * @param {Object} options
   */
  constructor(options) {
    super(options);
    super.set({ objectCaching: false });
    this.js2video_renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.js2video_renderer.setSize(this.width, this.height);
    this.js2video_scene = new THREE.Scene();
    this.js2video_camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      0.1,
      1000
    );
  }

  _render(ctx) {
    this.js2video_renderer.render(this.js2video_scene, this.js2video_camera);
    super.js2video_renderImage(ctx, this.js2video_renderer.domElement);
  }

  async js2video_dispose() {
    this.js2video_renderer.dispose();
    this.js2video_renderer = null;
    console.log("disposed js2video_three obj");
  }
}

async function loadThree({ options = {} }) {
  const obj = new JS2VideoThree(options);
  return obj;
}

export { loadThree, JS2VideoThree };
