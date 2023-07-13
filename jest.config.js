import jestConfigBase from "./jest.config.base.js";

const jestConfig = {
  ...jestConfigBase,
  roots: [
    "<rootDir>",
  ],
  projects:
    [
      "<rootDir>/packages/*/jest.config.js"
    ],
  coverageDirectory: "<rootDir>/coverage/"
};

export default jestConfig