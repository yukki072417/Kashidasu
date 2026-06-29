const Sequencer = require("@jest/test-sequencer").default;
const path = require("path");

const TEST_ORDER = ["admin", "users", "books", "cards", "debug"];

class IntegrationTestSequencer extends Sequencer {
  sort(tests) {
    return [...tests].sort((a, b) => {
      const aName = path.basename(a.path, ".test.js");
      const bName = path.basename(b.path, ".test.js");
      const aIndex = TEST_ORDER.indexOf(aName);
      const bIndex = TEST_ORDER.indexOf(bName);
      const aOrder = aIndex === -1 ? TEST_ORDER.length : aIndex;
      const bOrder = bIndex === -1 ? TEST_ORDER.length : bIndex;
      return aOrder - bOrder;
    });
  }
}

module.exports = IntegrationTestSequencer;
