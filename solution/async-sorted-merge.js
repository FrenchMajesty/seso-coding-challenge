"use strict";

// Print all entries, across all of the *async* sources, in chronological order.

module.exports = (logSources, printer) => {
  return new Promise(async (resolve, reject) => {
    /**
     * Same technique but adapted for async
     */
    let allSourcesEmpty = false;
    let cached = Array(logSources.length).fill(null);
    let i = 0;
    while(!allSourcesEmpty) {
      const parallelEntries = await Promise.all(logSources.map((s, i) => cached[i] ? cached[i] : s.popAsync()));
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
    resolve(console.log("Async sort complete."));
  });
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