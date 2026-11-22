// hookLine.js - Scene 1: hospitalisations per year against the 2018-20 baseline and the 30% target.
// AI acknowledgement: first draft generated with Claude (Anthropic); reviewed and edited by the team.
import { COLORS, SIZE, MARGIN, fmtInt } from "../constants.js";
import { showTooltip, hideTooltip, makeFocusable, showEmpty, createSvg } from "../interactions.js";

export function drawHookLine(container, data) {
  if (!data.length) return showEmpty(container, "No yearly totals to show. Check data/hook_totals.csv.");

  const { width, height } = SIZE;
  const first = data[0];
  const last = data[data.length - 1];
  const svg = createSvg(container, {
    width, height, id: "hook",
    title: "Road crash hospitalisations per year, 2011 to 2021",
    desc: `Hospitalisations rose from ${fmtInt(first.hospitalisations)} in ${first.year} to ${fmtInt(last.hospitalisations)} in ${last.year}, level with the 2018 to 2020 average and far above the 30% target.`,
  });

  // Scales: the y axis starts at zero so the size of the gap to the target is not exaggerated.
  const x = d3.scaleLinear().domain(d3.extent(data, (d) => d.year)).range([MARGIN.left, width - MARGIN.right]);
  const y = d3.scaleLinear().domain([0, 45000]).range([height - MARGIN.bottom, MARGIN.top]);

  // Axes and light gridlines
  svg.append("g").attr("class", "grid").attr("transform", `translate(${MARGIN.left},0)`)
    .call(d3.axisLeft(y).ticks(5).tickSize(-(width - MARGIN.left - MARGIN.right)).tickFormat(""));
  svg.append("g").attr("class", "axis").attr("transform", `translate(${MARGIN.left},0)`)
    .call(d3.axisLeft(y).ticks(5).tickFormat(fmtInt));
  svg.append("g").attr("class", "axis").attr("transform", `translate(0,${height - MARGIN.bottom})`)
    .call(d3.axisBottom(x).ticks(data.length).tickFormat(d3.format("d")));

  // Reference lines come from the KNIME columns, so they update if the data changes.
  const refs = [
    { value: first.baseline, label: `2018–20 average: ${fmtInt(Math.round(first.baseline))}` },
    { value: first.target, label: `Target (30% below): ${fmtInt(Math.round(first.target))}` },
  ];
  const ref = svg.append("g").selectAll("g").data(refs).join("g");
  ref.append("line").attr("class", "reference")
    .attr("x1", MARGIN.left).attr("x2", width - MARGIN.right)
    .attr("y1", (d) => y(d.value)).attr("y2", (d) => y(d.value));
  ref.append("text").attr("class", "label-quiet")
    .attr("x", MARGIN.left + 8).attr("y", (d) => y(d.value) - 8).text((d) => d.label);

  // The line and its points
  const line = d3.line().x((d) => x(d.year)).y((d) => y(d.hospitalisations));
  svg.append("path").datum(data).attr("fill", "none").attr("stroke", COLORS.accent).attr("stroke-width", 3).attr("d", line);

  const label = (d) => `${d.year}: ${fmtInt(d.hospitalisations)} hospitalisations`;
  const points = svg.append("g").selectAll("circle").data(data).join("circle")
    .attr("class", "mark").attr("cx", (d) => x(d.year)).attr("cy", (d) => y(d.hospitalisations))
    .attr("r", 6).attr("fill", COLORS.accent)
    .on("mousemove", (event, d) => showTooltip(event, label(d)))
    .on("mouseleave", hideTooltip);
  makeFocusable(points, label);

  // Annotations: the latest value and the COVID-19 dip
  svg.append("text").attr("class", "label-strong").attr("text-anchor", "end")
    .attr("x", x(last.year)).attr("y", y(last.hospitalisations) - 16)
    .text(`${fmtInt(last.hospitalisations)} in ${last.year}`);
  const covid = data.find((d) => d.year === 2020);
  if (covid) {
    svg.append("text").attr("class", "label-quiet").attr("text-anchor", "middle")
      .attr("x", x(2020)).attr("y", y(covid.hospitalisations) + 28).text("COVID-19 dip");
  }
}
