const fs = require("fs");

const originalWriteFileSync = fs.writeFileSync;
fs.writeFileSync = function redirectSnapshot(file, ...args) {
  const target = file === "scripts/index-snapshot-20261029.json"
    ? "scripts/index-snapshot-20261104.json"
    : file;
  return originalWriteFileSync.call(fs, target, ...args);
};

require("./collect-index-snapshot-20261029.js");
