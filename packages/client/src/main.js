import { loadVideo } from "./load-video.js";
import { scaleToFit } from "./utils.js";

const onClick = (id, handler) =>
  document.getElementById(id).addEventListener("click", handler);

window.addEventListener("DOMContentLoaded", async () => {
  const vc = await loadVideo({
    templateUrl: "https://js2video.github.io/js2video-templates/hello-world.js",
    params: {
      text: "Rendered on the client!",
      fontFamily: "Bangers",
    },
    size: { width: 1080, height: 1920 },
  });

  document.getElementById("canvas-wrapper").appendChild(vc.canvasElement);

  onClick("rewind", async () => await vc.rewind());
  onClick("toggle-play", async () => vc.togglePlay());
  onClick("export", async () => vc.exportFile({ bitrate: 5_000_000 }));

  function resizePreview() {
    const target = document
      .getElementById("canvas-wrapper")
      .getBoundingClientRect();
    const scale = scaleToFit(
      vc.size.width,
      vc.size.height,
      target.width,
      target.height
    );
    vc.canvasElement.style.width = vc.size.width * scale + "px";
    vc.canvasElement.style.height = vc.size.height * scale + "px";
  }

  resizePreview();
  addEventListener("resize", resizePreview);
});
