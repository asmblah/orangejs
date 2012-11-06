define([
    "vendor/chai/chai",
    "js/Class"
], function (
    chai,
    Class
) {
    "use strict";

    var expect = chai.expect;

    describe("Class", function () {
        it("should return a function", function () {
            expect(new Class()).to.be.an.instanceOf(Function);
        });

        it("should expose default public members publicly", function () {
            var Adult = new Class({
                "public": {
                    "lastSibling": {}
                }
            });

            expect(new Adult()).to.have.property("lastSibling");
        });

        it("should not expose default private members publicly", function () {
            var Adult = new Class({
                "private": {
                    "partner": {}
                }
            });

            expect(new Adult()).to.not.have.property("partner");
        });

        it("should not expose default protected members publicly", function () {
            var Adult = new Class({
                "protected": {
                    "ideas": {}
                }
            });

            expect(new Adult()).to.not.have.property("ideas");
        });

        it("should allow default public methods to access private members", function () {
            var Adult = new Class({
                "private": {
                    "partner": {}
                },
                "public": {
                    "checkFaithfulness": function () {
                        expect(this).to.have.property("partner");
                    }
                }
            });

            new Adult().checkFaithfulness();
        });

        it("should use the specified name as the class name", function () {
            var Clarence = new Class({ name: "Clarence" });

            expect(Clarence.name).to.equal("Clarence");
        });
    });
});
