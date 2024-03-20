function animalWelfareTooltipText(e) {
  if (e == "Yes") return "Support";
  else if (e == "No") return "No Support";
  else return "Partial Support";
}

async function drawScatter() {
  // Step 1: Get Data
  let dataset = await d3.csv("./Animal Rights Data Sheet.csv");
  // console.table(dataset[50]);
  const yAccessor = (d) =>
    parseFloat(d["Environmental Performance Index Score"]);
  const xAccessor = (d) => parseFloat(d["Total Score"]);
  const colorAccessor = (d) =>
    d["Support for the Universal Declaration of Animal Welfare"];

  // Step 2: Dimensions
  let dimensions = {
    width: window.innerWidth * 0.75,
    height: 500,
    margin: {
      top: 50,
      bottom: 60,
      left: 60,
      right: 150,
    },
  };

  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // Step 3: Canvas
  const wrapper = d3
    .select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const bounds = wrapper
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  // Step 4: Scales
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.extent(dataset, xAccessor)[1]])
    .range([0, dimensions.boundedWidth])
    .nice();

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.extent(dataset, yAccessor)[1]])
    .range([dimensions.boundedHeight, 0])
    .nice();

  const cScale = (d) =>
    d == "Yes" ? "#26547c" : d == "Partial" ? "#ffd166" : "#ef476f";

  // Step 5: Draw

  const ScatterBounds = bounds
    .append("rect")
    .attr("class", ".scatter-bound")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", dimensions.boundedWidth)
    .attr("height", dimensions.boundedHeight)
    .style("fill", "none")
    .style("stroke", "#eaeaea");

  const dotsGroup = bounds.append("g");
  const dots = dotsGroup
    .selectAll(".dot")
    .data(dataset, (d) => d[0])
    .join("circle")
    .attr("class", "dot")
    .attr("cx", (d) => xScale(xAccessor(d)))
    .attr("cy", (d) => yScale(yAccessor(d)))
    .attr("r", 5)
    .attr("fill", (d) => cScale(colorAccessor(d)))
    .attr("stroke", (d) => cScale(colorAccessor(d)));

  // Step 6: Peripherals

  const xAxisGenerator = d3.axisBottom().scale(xScale);
  const xAxis = bounds
    .append("g")
    .call(xAxisGenerator)
    .style("transform", `translateY(${dimensions.boundedHeight}px)`);

  const xAxisLabel = xAxis
    .append("text")
    .attr("class", "axis-label")
    .attr("x", dimensions.boundedWidth / 2)
    .attr("y", dimensions.margin.bottom - 20)
    .html("Total Animal Rights Score");

  const yAxisGenerator = d3.axisLeft().scale(yScale);
  const yAxis = bounds.append("g").call(yAxisGenerator);

  const yAxisLabel = yAxis
    .append("text")
    .attr("class", "axis-label")
    .attr("x", -dimensions.boundedHeight / 2)
    .attr("y", -dimensions.margin.left + 27)
    .html("Environmental Performance Score")
    .style("transform", "rotate(-90deg)")
    .style("text-anchor", "middle");

  // Step 7: Interactions
  bounds
    .selectAll("circle")
    .on("mouseenter", onMouseEnter)
    .on("mouseleave", onMouseLeave);

  const tooltip = d3.select("#tooltip");
  function onMouseEnter(datum) {
    const x = xScale(xAccessor(datum)) + dimensions.margin.left;
    const y = yScale(yAccessor(datum)) + dimensions.margin.top;

    const highlightDot = bounds
      .append("circle")
      .attr("class", "dot-highlight")
      .attr("cx", xScale(xAccessor(datum)))
      .attr("cy", yScale(yAccessor(datum)))
      .attr("r", 8)
      .attr("fill", cScale(colorAccessor(datum)))
      .attr("stroke", cScale(colorAccessor(datum)));

    tooltip
      .style("opacity", 0.85)
      .style(
        "transform",
        `translate(calc(-50% + ${x}px), calc(-100% + ${y}px))`
      );

    d3.select("#tt-country-text").text(datum["Country"]);
    d3.select("#tt-total-text").text(xAccessor(datum));
    d3.select("#tt-env-text").text(yAccessor(datum));
    d3.select("#tt-support-text")
      .text(animalWelfareTooltipText(colorAccessor(datum)))
      .style("color", cScale(colorAccessor(datum)));

    d3.select("#tooltip-circle").style("color", cScale(colorAccessor(datum)));
  }

  function onMouseLeave() {
    tooltip.style("opacity", 0);
    d3.selectAll(".dot-highlight").remove();
  }
}

drawScatter();
