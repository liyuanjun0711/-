const fs = require("fs");

const originalWriteFileSync = fs.writeFileSync;
fs.writeFileSync = function redirectSnapshot(file, ...args) {
  const target = file === "scripts/market-snapshot-20261029.json"
    ? "scripts/market-snapshot-20261103.json"
    : file;
  return originalWriteFileSync.call(fs, target, ...args);
};

require("./collect-market-snapshot-20261029.js");
