"use strict";

// Print all entries, across all of the sources, in chronological order.

module.exports = (logSources, printer) => {
  /**
   * Context:
   * There are n apps
   * Each app has infinite log entries sorted asc (going up in time)
   * We only know the last log entry of an app
   * Goal: Print all log entries across all apps in the right order
   * ->
   * Use a "Two Pointer" technique and read all log sources concurrently to print each
   * entry in order
   * ---
   * 
      Read smallest on all sources or cached
      The smallest of those, print out,
      On the other ones, cache it for next iteration
      Repeat until all drained
   */
  let allSourcesEmpty = false;
  let cached = Array(logSources.length).fill(null);
  let i = 0;
  while(!allSourcesEmpty) {
    const parallelEntries = logSources.map((s, i) => cached[i] ? cached[i] : s.pop());
    allSourcesEmpty = parallelEntries.every((log) => log === false || log === null);
    if(allSourcesEmpty) {
      break;
    }

    const smallestIndex = findSmallestIndex(parallelEntries);
    for(let i = 0; i < parallelEntries.length; i++) {
      // Print smallest; Cache the others
      if(i === smallestIndex) {
        printer.print(parallelEntries[i]);
        cached[i] = null;
      } else {
        cached[i] = parallelEntries[i];
      }
    }
  }
  return console.log("Sync sort complete.");
};

const findSmallestIndex = (entries) => {
  let index = entries.findIndex((log) => log.date);
  let oldest = entries.find((log) => log.date).date;
  entries.forEach((entry, i) => {
    if(entry && entry.date < oldest) {
      index = i;
      oldest = entry.date;
    }
  });
  return index;
};