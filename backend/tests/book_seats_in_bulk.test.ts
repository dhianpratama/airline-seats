// tslint:disable:no-implicit-dependencies
import { expect } from "chai";
import "mocha";

describe("First test", function() {
    this.timeout(60 * 1000);
    it("should return true", () => {
      const result = true;
      expect(result).to.equal(true);
  });
});
