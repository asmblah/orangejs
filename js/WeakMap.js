define([
    "js/util"
], function (
    util
) {
    "use strict";

    var nextIndex = 0;

    // ES6 WeakMap
    // - See https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/WeakMap
    function WeakMap() {
        var namespace = createNamespace(),
            index = nextIndex;

        nextIndex += 1;

        util.extend(this, {
            "delete": function (key) {
                if (!this.has(key)) {
                    return false;
                }

                return delete namespace(key)[index];
            },

            "get": function (key, defaultValue) {
                var values = namespace(key);

                return (values.hasOwnProperty(index)) ? values[index] : defaultValue;
            },

            "has": function (key) {
                return namespace(key).hasOwnProperty(index);
            },

            "set": function (key, value) {
                namespace(key)[index] = value;
            }
        });
    }

    function createNamespace() {
        var key = {};

        return function (obj) {
            var values = obj.valueOf(key),
                valueOf = obj.valueOf;

            if (values === obj) {
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

            return values;
        };
    }

    return WeakMap;
});
