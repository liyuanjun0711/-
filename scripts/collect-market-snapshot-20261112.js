const fs = require("fs");
const Module = require("module");

const sourcePath = require.resolve("./collect-market-snapshot-20261110.js");
const source = fs.readFileSync(sourcePath, "utf8")
  .replace('const expectedDate = "2026-11-09";', 'const expectedDate = "2026-11-12";')
  .replace('scripts/market-snapshot-20261110.json', 'scripts/market-snapshot-20261112.json');

const collectorModule = new Module(__filename, module);
collectorModule.filename = sourcePath;
collectorModule.paths = module.paths;
collectorModule._compile(source, sourcePath);
