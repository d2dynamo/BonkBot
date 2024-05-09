const esbuild = require("esbuild");
const esbuildPluginTsc = require("esbuild-plugin-tsc");

esbuild
  .build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    outfile: "build/bundle.js",
    platform: "node",
    loader: { ".ts": "ts" },
    treeShaking: true,
    minify: false,
    plugins: [esbuildPluginTsc()],
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
