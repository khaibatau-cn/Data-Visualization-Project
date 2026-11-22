// data.js - loads the CSV files exported by KNIME and converts text to numbers.
// AI acknowledgement: first draft generated with Claude (Anthropic); reviewed and edited by the team.

const num = (v) => (v === "" || v === undefined ? NaN : +v);

// d3.csv reads every value as text, so each loader turns the numeric columns into numbers.
const loaders = {
  hook: () =>
    d3.csv("data/hook_totals.csv", (d) => ({
      year: num(d["Calendar year"]),
      hospitalisations: num(d["Hospitalisations"]),
      baseline: num(d["Baseline_2018_20"]),
      target: num(d["Target"]),
    })),
  cyclists: () =>
    d3.csv("data/cyclist_counterparty_by_year.csv", (d) => ({
      year: num(d["Calendar year"]),
      group: d["Counterparty group"],
      hospitalisations: num(d["Hospitalisations"]),
      share: num(d["Share_pct"]),
    })),
  roadUsers: () =>
    d3.csv("data/road_user_by_year.csv", (d) => ({
      year: num(d["Calendar year"]),
      group: d["Road user group"],
      hospitalisations: num(d["Hospitalisations"]),
    })),
};

// Loads every file at once. A file that fails comes back as an empty array, so one bad file
// shows a message on its own chart instead of breaking the whole page.
export async function loadAll() {
  const entries = await Promise.all(
    Object.entries(loaders).map(async ([name, load]) => {
      try {
        const rows = await load();
        return [name, rows.filter((r) => !Number.isNaN(r.year))];
      } catch (err) {
        console.error(`Could not load ${name}:`, err);
        return [name, []];
      }
    })
  );
  return Object.fromEntries(entries);
}
