// constants.js - shared colours, orders, sizes and number formats for every chart.
// AI acknowledgement: first draft generated with Claude (Anthropic); reviewed and edited by the team.

// Colours match the stand-up deck. Pink = the group the chart is about, lavender = second focus, greys = context.
export const COLORS = {
  accent: "#C2185B",
  second: "#8E5BD6",
  greys: ["#B9B4BD", "#CFCAD2", "#DEDAE0", "#ECE9ED"],
  ink: "#3D1A2E",
  quiet: "#7A4D63",
  grid: "#EAE3E7",
  reference: "#85808A",
};

// Fixed order so a category keeps the same position and colour in every chart.
export const COUNTERPARTY_ORDER = [
  "Non-collision",
  "Car or van",
  "Other or unspecified",
  "Fixed object",
  "Another cyclist",
  "Other",
];

export const ROAD_USER_ORDER = ["Car occupant", "Motorcyclist", "Pedal cyclist", "Pedestrian", "Other"];

// Every chart draws in this coordinate box; the viewBox scales it to the container width.
export const SIZE = { width: 800, height: 450 };
export const MARGIN = { top: 30, right: 40, bottom: 40, left: 70 };

export const fmtInt = d3.format(",");
export const fmtPct = d3.format(".0f");
export const fmtChange = d3.format("+.1f");
