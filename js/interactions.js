// interactions.js - shared tooltip and helpers used by every chart.
// AI acknowledgement: first draft generated with Claude (Anthropic); reviewed and edited by the team.

const tooltip = d3.select("body").append("div").attr("class", "tooltip").attr("role", "status");

// Shows the tooltip next to the mouse, or next to the mark when it was reached by keyboard.
export function showTooltip(event, html) {
  const box = event.currentTarget.getBoundingClientRect();
  const x = event.clientX ?? box.right;
  const y = event.clientY ?? box.top;
  tooltip.html(html).style("left", `${x + 14 + window.scrollX}px`).style("top", `${y - 10 + window.scrollY}px`).classed("visible", true);
}

export function hideTooltip() {
  tooltip.classed("visible", false);
}

// a11y: every data mark can be reached with Tab and announces the same text as its tooltip.
export function makeFocusable(selection, labelFn) {
  selection
    .attr("tabindex", 0)
    .attr("aria-label", labelFn)
    .on("focus", (event, d) => showTooltip(event, labelFn(d)))
    .on("blur", hideTooltip);
}

// Shown instead of a blank chart when a file is missing or a filter leaves no rows.
export function showEmpty(container, message) {
  d3.select(container).selectAll("*").remove();
  d3.select(container).append("p").attr("class", "empty").text(message);
}

// a11y: creates a responsive SVG with a title and description for screen readers.
export function createSvg(container, { width, height, title, desc, id }) {
  d3.select(container).selectAll("*").remove();
  const svg = d3
    .select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-labelledby", `${id}-title ${id}-desc`);
  svg.append("title").attr("id", `${id}-title`).text(title);
  svg.append("desc").attr("id", `${id}-desc`).text(desc);
  return svg;
}
