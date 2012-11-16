define([
    "js/util",
    "js/WeakMap"
], function (
    util,
    WeakMap
) {
    "use strict";

    var privatesMap = new WeakMap();

    function getPrivates(object, defaults) {
        var privates = privatesMap.get(object);

        if (!privates) {
            privates = defaults || {};
            privatesMap.set(object, privates);
        }

        return privates;
    }

    function TreeMap() {
        var privates = getPrivates(this, {
            keyMap: new WeakMap()
        });
    }

    function wrap(fn) {
        return function () {
            return fn.apply(getPrivates(this), arguments);
        };
    }

    util.extend(TreeMap.prototype, {
        get: wrap(function (keys, defaultValue) {
            var index,
                map = this.keyMap;

            for (index = 0; map && index < keys.length - 1; index += 1) {
                map = map.get(keys[index]);
            }

            return map ? map.get(keys[index], defaultValue) : defaultValue;
        }),

        has: wrap(function (keys) {
            var index,
                map = this.keyMap;

            for (index = 0; map && index < keys.length - 1; index += 1) {
                map = map.get(keys[index]);
            }

            return map && map.has(keys[index]);
        }),

        set: wrap(function (keys, value) {
            var index,
                map = this.keyMap,
                nextMap;

            for (index = 0; index < keys.length - 1; index += 1) {
                nextMap = map.get(keys[index]);
                if (!nextMap) {
                    nextMap = new WeakMap();
                    map.set(keys[index], nextMap);
                }
                map = nextMap;
            }

            return map.set(keys[index], value);
        })
    });

    return TreeMap;
});
