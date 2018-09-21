import path from "path";
import analyzeExports, { searchDirectory } from "../";

describe("unusedExports", () => {
  test("it finds export usage", () => {
    const results = analyzeExports("../__mockDirectory__");

    expect(results).toEqual({
      "client/utils/display.js": {
        default: ["client/components/A.js", "client/components/B.js"],
        Display: ["client/components/C.js"]
      },
      "client/utils/camelcase.js": {
        default: []
      }
    });
  });
});

describe("searchDirectory", () => {
	test("it will walk trough the dir and get a list of files", () => {
		const files = searchDirectory("./src/__mockDirectory__");

		expect(files).toEqual([
			"./client/components/A.js",
			"./client/components/B.js",
			"./client/components/C.js",
			"./client/utils/camelcase.js",
			"./client/utils/display.js"
		])
	});
});
