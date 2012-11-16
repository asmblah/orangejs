define([
    "vendor/chai/chai",
    "js/util",
    "js/Map"
], function (
    chai,
    util,
    Map
) {
    "use strict";

    var document = util.global.document,
        expect = chai.expect;

    describe("Map shim (ES6/Harmony)", function () {
        it("should return an instance of Map", function () {
            expect(new Map()).to.be.an.instanceOf(Map);
        });

        describe("delete()", function () {
            it("should remove the item from the Map", function () {
                var map = new Map(),
                    key = {};

                map.set(key, 6);
                map.delete(key);

                expect(map.has(key)).to.equal(false);
            });

            it("should remove the item from the Map even if its value is undefined", function () {
                var map = new Map(),
                    key = {};

                map.set(key, undefined);
                map.delete(key);

                expect(map.has(key)).to.equal(false);
            });

            it("should return true if the value was deleted", function () {
                var map = new Map(),
                    key = {};

                map.set(key, 6);

                expect(map.delete(key)).to.equal(true);
            });

            it("should return false if attempting to delete a non-existent value", function () {
                var map = new Map(),
                    key = {};

                expect(map.delete(key)).to.equal(false);
            });

            it("should return false if attempting to delete a value for a second time", function () {
                var map = new Map(),
                    key = {};

                map.set(key, 21);
                map.delete(key);
                expect(map.delete(key)).to.equal(false);
            });
        });

        describe("get()", function () {
            it("should retrieve the value with the specified key if the key is a string", function () {
                var map = new Map(),
                    key = "test";

                map.set(key, 2);

                expect(map.get(key)).to.equal(2);
            });

            it("should retrieve the value with the specified key if the key is a number", function () {
                var map = new Map(),
                    key = 6;

                map.set(key, 3);

                expect(map.get(key)).to.equal(3);
            });

            it("should retrieve the value with the specified key if the key is NaN", function () {
                var map = new Map(),
                    key = util.global.NaN;

                map.set(key, 4);

                expect(map.get(key)).to.equal(4);
            });

            it("should retrieve the value with the specified key if the key is undefined", function () {
                var map = new Map(),
                    key = undefined;

                map.set(key, 4);

                expect(map.get(key)).to.equal(4);
            });

            it("should retrieve the value with the specified key if the key is a plain object", function () {
                var map = new Map(),
                    key = {};

                map.set(key, 2);

                expect(map.get(key)).to.equal(2);
            });

            it("should retrieve the value with the specified key if the key is a DOM object", function () {
                var map = new Map(),
                    key = document.createElement("span");

                map.set(key, 6);

                expect(map.get(key)).to.equal(6);
            });

            it("should retrieve the value with the specified key if the value is a string", function () {
                var map = new Map(),
                    key = {},
                    value = "in the mix";

                map.set(key, value);

                expect(map.get(key)).to.equal(value);
            });

            it("should retrieve the value with the specified key if the value is a number", function () {
                var map = new Map(),
                    key = {},
                    value = 1337;

                map.set(key, value);

                expect(map.get(key)).to.equal(value);
            });

            it("should retrieve the value with the specified key if the value is a plain object", function () {
                var map = new Map(),
                    key = {},
                    value = {};

                map.set(key, value);

                expect(map.get(key)).to.equal(value);
            });

            it("should retrieve the value with the specified key if the value is null", function () {
                var map = new Map(),
                    key = {},
                    value = null;

                map.set(key, value);

                expect(map.get(key)).to.equal(value);
            });

            it("should retrieve the value with the specified key if the value is undefined", function () {
                var map = new Map(),
                    key = {},
                    value = undefined;

                map.set(key, value);

                expect(map.get(key)).to.equal(value);
            });

            it("should retrieve the value with the specified key if the value is NaN", function () {
                var map = new Map(),
                    key = {},
                    value = Math.NaN;

                map.set(key, value);

                expect(map.get(key)).to.equal(Math.NaN);
            });

            it("should return defaultValue if the specified key is not in the map", function () {
                var map = new Map();

                expect(map.get({}, 21)).to.equal(21);
            });

            it("should not return defaultValue if the specified key is in the map with value null", function () {
                var map = new Map(),
                    key = {};

                map.set(key, null);

                expect(map.get(key, 26)).to.equal(null);
            });

            it("should not return defaultValue if the specified key is in the map with value undefined", function () {
                var map = new Map(),
                    key = {};

                map.set(key, undefined);

                expect(map.get(key, 29)).to.equal(undefined);
            });

            it("should not be possible to use an object that extends an existing key as that key", function () {
                var map = new Map(),
                    key = {},
                    inheritedKey = Object.create(key);

                map.set(key, 7);

                expect(map.get(inheritedKey)).to.not.equal(7);
            });
        });

        describe("has()", function () {
            it("should return true if the specified key is in the map and is a plain object", function () {
                var map = new Map(),
                    key = {};

                map.set(key, 1);

                expect(map.has(key)).to.equal(true);
            });

            it("should return true if the specified key is in the map and is a DOM object", function () {
                var map = new Map(),
                    key = document.createElement("div");

                map.set(key, 1);

                expect(map.has(key)).to.equal(true);
            });
        });

        describe("set()", function () {
            it("should return undefined", function () {
                expect(new Map().set({}, 7)).to.be.undefined;
            });

            it("should store the value in the map with the specified key if the key is a plain object", function () {
                var map = new Map(),
                    key = {};

                map.set(key, 21);

                expect(map.get(key)).to.equal(21);
            });

            it("should store the value in the map with the specified key if the key is a DOM object", function () {
                var map = new Map(),
                    key = document.createElement("article");

                map.set(key, 21);

                expect(map.get(key)).to.equal(21);
            });

            describe("when using the same object as the key in two separate maps", function () {
                it("should store the value against the key in the first map", function () {
                    var map1 = new Map(),
                        map2 = new Map(),
                        key = {};

                    map1.set(key, 2);
                    map2.set(key, 3);

                    expect(map1.get(key)).to.equal(2);
                });

                it("should store the value against the key in the second map", function () {
                    var map1 = new Map(),
                        map2 = new Map(),
                        key = {};

                    map1.set(key, 2);
                    map2.set(key, 3);

                    expect(map2.get(key)).to.equal(3);
                });
            });
        });
    });
});
