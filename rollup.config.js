import typescript from "@rollup/plugin-typescript";
import del from "rollup-plugin-delete";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json"));

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.module,
      format: "es",
      sourcemap: true,
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    del({
      targets: "dist/*",
    }),
    typescript(),
  ],
};
