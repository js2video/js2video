/*
Animated bar charts (scrubbable version)
*/

const defaultParams = {
  fps: 30,
  size: {
    width: 1920,
    height: 1080,
  },
  title: "Revenue growth this year",
  bars: [
    { label: "Jan", value: 120000 },
    { label: "Feb", value: 240000 },
    { label: "Mar", value: 480000 },
    { label: "Apr", value: 600000 },
    { label: "May", value: 960000 },
  ],
};

const template = async ({
  gsap,
  timeline,
  canvas,
  canvasElement,
  params,
  Fabric,
  Pixi,
  PixiFilters,
  utils,
  canvasUtils,
  d3,
}) => {
  // Load Inter font
  await utils.loadGoogleFont("Inter");

  // Set background
  canvas.set({ backgroundColor: "#e9e9e9" });

  // Layout constants
  const padding = { top: 300, bottom: 60, left: 60, right: 60 };
  const chartHeight = params.size.height - padding.top - padding.bottom;
  const chartWidth = params.size.width - padding.left - padding.right;
  const baseY = params.size.height - padding.bottom;

  // Extract data
  const bars = params.bars;
  const labels = bars.map((b) => b.label);
  const maxValue = d3.max(bars, (d) => d.value);

  const xScale = d3
    .scaleBand()
    .domain(labels)
    .range([padding.left, padding.left + chartWidth])
    .padding(0.2);

  const yScale = d3.scaleLinear().domain([0, maxValue]).range([0, chartHeight]);

  // Add title
  const title = new Fabric.Text(params.title, {
    fontSize: 80,
    left: params.size.width / 2,
    top: 120,
    originX: "center",
    fill: "#000",
    fontFamily: "Inter",
  });
  canvas.add(title);

  // Create bars and labels
  const barObjects = bars.map((barData) => {
    const x = xScale(barData.label);
    const width = xScale.bandwidth();

    const rect = new Fabric.Rect({
      left: x,
      top: baseY,
      width,
      height: 1,
      fill: "#005500",
      originY: "bottom",
    });

    const valueLabel = new Fabric.Text("$0", {
      fontSize: 36,
      left: x + width / 2,
      top: baseY - 20,
      originX: "center",
      opacity: 0,
      fill: "#000",
      fontFamily: "Inter",
    });

    const bottomLabel = new Fabric.Text(barData.label, {
      fontSize: 32,
      left: x + width / 2,
      top: baseY + 12,
      originX: "center",
      fill: "#222",
      fontFamily: "Inter",
    });

    canvas.add(rect, valueLabel, bottomLabel);
    return { data: barData, rect, label: valueLabel };
  });

  // Render function for scrubbable animation
  const renderBars = (progress) => {
    const eased = gsap.parseEase("back.out(1.7)")(progress);

    barObjects.forEach(({ data, rect, label }) => {
      const targetHeight = yScale(data.value);
      const currentHeight = targetHeight * eased;
      const y = baseY - currentHeight;

      rect.set({ height: currentHeight });
      label.set({
        text: `$${Math.round((data.value * Math.min(1, eased)) / 1000)}k`,
        top: y - 40,
        opacity: eased,
      });
    });

    canvas.renderAll();
  };

  // Use a scrubbable state object
  const state = { progress: 0 };

  timeline.to(state, {
    progress: 1,
    duration: 1.5,
    ease: "linear", // we apply easing manually in renderBars
    onUpdate: () => {
      renderBars(state.progress);
    },
  });

  timeline.to({}, { duration: 2 }); // pause
};

export { template, defaultParams };
