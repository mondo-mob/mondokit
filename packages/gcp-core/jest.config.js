import base from "../../jest.config.base.js";
import pack from "./package.json" assert { type: "json" };

const jestConfig = {
  ...base,
  displayName: pack.name,
};

export default jestConfig;
