const esbuild = require("esbuild");
const esbuildPluginTsc = require("esbuild-plugin-tsc");

esbuild
  .build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    outfile: "dist/bundle.js",
    platform: "node",
    loader: { ".ts": "ts" },
    target: "node18",
    treeShaking: true,
    minify: true,
    plugins: [esbuildPluginTsc()],
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
