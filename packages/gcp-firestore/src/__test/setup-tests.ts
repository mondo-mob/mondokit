import "jest-extended";
import nock from "nock";

nock.disableNetConnect();
nock.enableNetConnect("127.0.0.1");
