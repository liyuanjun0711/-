const fs = require("fs");
const Module = require("module");

const sourcePath = require.resolve("./collect-index-snapshot-20261118.js");
const source = fs.readFileSync(sourcePath, "utf8")
  .replaceAll("2026-11-19", "2026-11-20")
  .replaceAll("20261118", "20261120");

const collectorModule = new Module(__filename, module);
collectorModule.filename = sourcePath;
collectorModule.paths = module.paths;
collectorModule._compile(source, sourcePath);
