import typescript from "@rollup/plugin-typescript";
import del from "rollup-plugin-delete";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
  input: "src/index.ts",
  output: [
    {
      sourcemap: true,
      dir: "dist",
      format: "es",
    },
  ],
  external: ["events"],
  plugins: [
    del({
      targets: "dist/*",
    }),
    nodeResolve(),
    json(),
    commonjs(),
    typescript(),
  ],
};
