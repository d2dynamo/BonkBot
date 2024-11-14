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
    sourcemap: true,
  })
  .catch((err) => {
    console.log("esbuild error:", err);
    process.exit(1);
  });
