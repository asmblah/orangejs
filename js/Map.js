define([
    "./util"
], function (
    util
) {
    "use strict";

    var has = {}.hasOwnProperty,
        key = {},
        namespaces = {},
        nextIndex = 0,
        stringNamespaces = {};

    // ES6 Map
    // - See https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Map
    function Map() {
        var index = nextIndex,
            size = 0;

        nextIndex += 1;

        util.extend(this, {
            "delete": function (key) {
                if (!this.has(key)) {
                    return false;
                }

                delete getNamespace(key)[index];

                size -= 1;

                return true;
            },

            "get": function (key, defaultValue) {
                var values = getNamespace(key);

                return (values.hasOwnProperty(index)) ? values[index] : defaultValue;
            },

            "has": function (key) {
                return getNamespace(key).hasOwnProperty(index);
            },

            "set": function (key, value) {
                var namespace = getNamespace(key);

                if (!has.call(namespace, index)) {
                    size += 1;
                }

                namespace[index] = value;
            }
        });

        Object.defineProperty(this, "size", {
            get: function () {
                return size;
            }
        });
    }

    function getNamespace(obj) {
        var values,
            valueOf;

        if (typeof obj === "string") {
            values = stringNamespaces[obj];

            if (!values) {
                values = {};
                stringNamespaces[obj] = values;
            }
        } else if (obj === null || typeof obj === "undefined" || typeof obj === "number") {
            // Handle negative and positive zero
            if (obj === 0) {
                obj = (1 / obj === -Infinity) ? "-0" : "0"
            }

            values = namespaces[obj];

            if (!values) {
                values = {};
                namespaces[obj] = values;
            }
        } else {
            values = obj.valueOf(key);
            valueOf = obj.valueOf;

            if (values === obj || !obj.hasOwnProperty("valueOf")) {
                values = {};

                Object.defineProperty(obj, "valueOf", {
                    configurable: true,
                    enumerable: false,
                    value: function (request) {
                        if (request === key) {
                            return values;
                        }
                        return valueOf.apply(this, arguments);
                    }
                });
            }
        }

        return values;
    }

    return Map;
});
