import analyzeExports from "../";

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
