// changeBars.js - Scene 3 twist: change in hospitalisations from 2019 to 2020 by road user group.
// AI acknowledgement: first draft generated with Claude (Anthropic); reviewed and edited by the team.
import { COLORS, SIZE, MARGIN, fmtInt, fmtChange } from "../constants.js";
import { showTooltip, hideTooltip, makeFocusable, showEmpty, createSvg } from "../interactions.js";

export function drawChangeBars(container, data, from = 2019, to = 2020, focus = "Pedal cyclist") {
  // TODO: move this % change into a KNIME branch (unit rule: derived data comes from KNIME).
  const lookup = d3.index(data, (d) => d.year, (d) => d.group);
  const before = lookup.get(from);
  const after = lookup.get(to);
  if (!before || !after) return showEmpty(container, `No data for ${from} or ${to}.`);

  const rows = [...before.keys()]
    .filter((g) => after.has(g))
    .map((g) => {
      const a = before.get(g).hospitalisations;
      const b = after.get(g).hospitalisations;
      return { group: g, from: a, to: b, change: ((b - a) / a) * 100 };
    })
    .sort((p, q) => q.change - p.change);

  const { width, height } = SIZE;
  const left = 150; // room for the road user names
  const svg = createSvg(container, {
    width, height, id: "change",
    title: `Change in hospitalisations from ${from} to ${to} by road user group`,
    desc: `${focus}s were the only group whose hospitalisations rose; every other group fell.`,
  });

  // Bars grow left or right from zero, so a fall and a rise are read on the same scale.
  // Extra room at both ends keeps the value labels clear of the names and the edge.
  const lo = Math.min(0, d3.min(rows, (d) => d.change)) * 1.45;
  const hi = Math.max(0, d3.max(rows, (d) => d.change)) * 1.45;
  const x = d3.scaleLinear().domain([lo, hi]).nice().range([left, width - MARGIN.right]);
  const y = d3.scaleBand().domain(rows.map((d) => d.group)).range([MARGIN.top, height - MARGIN.bottom]).padding(0.3);

  svg.append("g").attr("class", "grid").attr("transform", `translate(0,${height - MARGIN.bottom})`)
    .call(d3.axisBottom(x).ticks(6).tickSize(-(height - MARGIN.top - MARGIN.bottom)).tickFormat(""));
  svg.append("g").attr("class", "axis").attr("transform", `translate(0,${height - MARGIN.bottom})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat((d) => `${d > 0 ? "+" : ""}${d}%`));
  svg.append("g").attr("class", "axis axis-names").attr("transform", `translate(${left},0)`)
    .call(d3.axisLeft(y).tickSize(0).tickPadding(10));

  const label = (d) => `${d.group}: ${fmtInt(d.from)} in ${from} to ${fmtInt(d.to)} in ${to} (${fmtChange(d.change)}%)`;
  const bars = svg.append("g").selectAll("rect").data(rows).join("rect")
    .attr("class", "mark")
    .attr("x", (d) => x(Math.min(0, d.change))).attr("width", (d) => Math.abs(x(d.change) - x(0)))
    .attr("y", (d) => y(d.group)).attr("height", y.bandwidth())
    .attr("fill", (d) => (d.group === focus ? COLORS.accent : COLORS.greys[0]))
    .on("mousemove", (event, d) => showTooltip(event, label(d)))
    .on("mouseleave", hideTooltip);
  makeFocusable(bars, label);

  // Value labels at the end of each bar
  svg.append("g").selectAll("text").data(rows).join("text")
    .attr("class", (d) => (d.group === focus ? "label-strong" : "label"))
    .attr("x", (d) => x(d.change) + (d.change >= 0 ? 8 : -8))
    .attr("y", (d) => y(d.group) + y.bandwidth() / 2 + 5)
    .attr("text-anchor", (d) => (d.change >= 0 ? "start" : "end"))
    .text((d) => `${fmtChange(d.change)}%`);

  svg.append("line").attr("class", "zero").attr("x1", x(0)).attr("x2", x(0))
    .attr("y1", MARGIN.top).attr("y2", height - MARGIN.bottom);
}
