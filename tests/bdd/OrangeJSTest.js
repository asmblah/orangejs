define([
    "vendor/chai/chai",
    "vendor/sinon/sinon",
    "js/Class",
    "js/Enum",
    "js/Exception",
    "root/orange"
], function (
    chai,
    sinon,
    Class,
    Enum,
    Exception,
    OrangeJS
) {
    "use strict";

    var expect = chai.expect;

    describe("Main (orange.js)", function () {
        it("should export Class class", function () {
            expect(OrangeJS.Class).to.equal(Class);
        });

        it("should export Enum class", function () {
            expect(OrangeJS.Enum).to.equal(Enum);
        });

        it("should export Exception class", function () {
            expect(OrangeJS.Exception).to.equal(Exception);
        });
    });
});
