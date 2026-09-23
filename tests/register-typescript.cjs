/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS loader for dependency-free TypeScript tests. */
const ts = require("typescript");
const fs = require("node:fs");
// Compile just this feature in memory; no application bundler or extra dependency needed.
require.extensions[".ts"] = (module, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  module._compile(result.outputText, filename);
};
