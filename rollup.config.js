import typescript from "rollup-plugin-typescript2";
import del from "rollup-plugin-delete";
import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: [
    {
      dir: pkg.main,
      format: "cjs",
    },
    {
      file: pkg.module,
      format: "es",
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
    typescript({
      typescript: require("typescript"),
    }),
  ],
};
