// main.js - loads the data once, then draws each chart into its container.
// AI acknowledgement: first draft generated with Claude (Anthropic); reviewed and edited by the team.
import { loadAll } from "./data.js";
import { drawHookLine } from "./charts/hookLine.js";
import { drawCyclistStacked } from "./charts/cyclistStacked.js";
import { drawChangeBars } from "./charts/changeBars.js";

const data = await loadAll();

drawHookLine("#chart-hook", data.hook);
drawCyclistStacked("#chart-cyclists", data.cyclists);
drawChangeBars("#chart-change", data.roadUsers);
