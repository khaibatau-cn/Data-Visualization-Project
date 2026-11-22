// cyclistStacked.js - Scene 3: share of cyclist hospitalisations by what they collided with, per year.
// AI acknowledgement: first draft generated with Claude (Anthropic); reviewed and edited by the team.
import { COLORS, SIZE, MARGIN, COUNTERPARTY_ORDER, fmtInt, fmtPct } from "../constants.js";
import { showTooltip, hideTooltip, makeFocusable, showEmpty, createSvg } from "../interactions.js";

export function drawCyclistStacked(container, data) {
  if (!data.length) return showEmpty(container, "No cyclist data to show. Check data/cyclist_counterparty_by_year.csv.");

  const { width, height } = SIZE;
  const right = 230; // room for the direct labels beside the last bar
  const years = [...new Set(data.map((d) => d.year))].sort();
  const svg = createSvg(container, {
    width, height, id: "cyclists",
    title: "Share of cyclist hospitalisations by what they collided with, 2011 to 2021",
    desc: "Each year about 44 to 46 percent of cyclist injuries involve no collision, and about 19 to 23 percent involve a car or van.",
  });

  // d3.stack needs one object per year; d3.index looks up each year's row for each group.
  const byYear = d3.index(data, (d) => d.year, (d) => d.group);
  const series = d3.stack()
    .keys(COUNTERPARTY_ORDER)
    .value(([, groups], key) => groups.get(key)?.share ?? 0)(byYear);

  const x = d3.scaleBand().domain(years).range([MARGIN.left, width - right]).padding(0.2);
  const y = d3.scaleLinear().domain([0, 100]).range([height - MARGIN.bottom, MARGIN.top]);
  const color = d3.scaleOrdinal().domain(COUNTERPARTY_ORDER).range([COLORS.accent, COLORS.second, ...COLORS.greys]);

  svg.append("g").attr("class", "axis").attr("transform", `translate(${MARGIN.left},0)`)
    .call(d3.axisLeft(y).ticks(4).tickFormat((d) => `${d}%`));
  svg.append("g").attr("class", "axis").attr("transform", `translate(0,${height - MARGIN.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  // One group per counterparty, one rect per year; white strokes separate the segments.
  const label = (d) => `${d.data[0]}, ${d.key}: ${fmtPct(d[1] - d[0])}% (${fmtInt(d.data[1].get(d.key)?.hospitalisations ?? 0)} cases)`;
  const rects = svg.append("g").selectAll("g").data(series).join("g")
    .attr("fill", (s) => color(s.key))
    .selectAll("rect").data((s) => s.map((d) => Object.assign(d, { key: s.key }))).join("rect")
    .attr("class", "mark").attr("stroke", "white").attr("stroke-width", 1.5)
    .attr("x", (d) => x(d.data[0])).attr("width", x.bandwidth())
    .attr("y", (d) => y(d[1])).attr("height", (d) => y(d[0]) - y(d[1]))
    .on("mousemove", (event, d) => showTooltip(event, label(d)))
    .on("mouseleave", hideTooltip);
  makeFocusable(rects, label);

  // a11y: direct labels beside the last bar, so colour is never the only way to tell groups apart.
  const lastYear = years[years.length - 1];
  const lastX = x(lastYear) + x.bandwidth() + 10;
  const segment = (key) => series.find((s) => s.key === key).find((d) => d.data[0] === lastYear);
  ["Non-collision", "Car or van", "Other or unspecified"].forEach((key) => {
    const d = segment(key);
    svg.append("text").attr("class", key === "Other or unspecified" ? "label" : "label-strong")
      .attr("x", lastX).attr("y", y((d[0] + d[1]) / 2) + 5).text(`${key} ${fmtPct(d[1] - d[0])}%`);
  });
  const restStart = segment("Fixed object")[0];
  svg.append("text").attr("class", "label")
    .attr("x", lastX).attr("y", y((restStart + 100) / 2) + 5)
    .text(`Fixed object, cyclist, other ${fmtPct(100 - restStart)}%`);
}
