import "vitest/globals.d.ts";
import "jest-extended";
import nock from "nock";
import matchers from "jest-extended";

expect.extend(matchers);

nock.disableNetConnect();
nock.enableNetConnect("127.0.0.1");
