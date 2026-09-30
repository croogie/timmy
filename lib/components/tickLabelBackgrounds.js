import * as d3 from "d3";

const horizontalPadding = 2;
const verticalPadding = 1;
const cornerRadius = 2;

export function addTickLabelBackgrounds(ticks, fill) {
  ticks.each(function () {
    const tick = d3.select(this);
    const label = tick.select("text").node();
    const transform = label.getAttribute("transform");
    const { height, width, x, y } = label.getBBox();

    tick
      .selectAll("rect.tick-label-background")
      .data([null])
      .join((enter) => enter.insert("rect", "text"))
      .attr("class", "tick-label-background")
      .attr("fill", fill)
      .style("pointer-events", "none")
      .attr("transform", transform)
      .attr("height", height + verticalPadding * 2)
      .attr("rx", cornerRadius)
      .attr("ry", cornerRadius)
      .attr("width", width + horizontalPadding * 2)
      .attr("x", x - horizontalPadding)
      .attr("y", y - verticalPadding);
  });
}
