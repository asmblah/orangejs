define([
    "js/util",
    "require",
    "module"
], function (
    util,
    require,
    module
) {
    "use strict";

    var global = util.global;

    // ES5 Object.create()
    if (!global.Object.create) {
        global.Object.create = function (from) {
            function F() {}
            F.prototype = from;
            return new F();
        };
    }

    // ES6 Object.getPropertyDescriptor
    if (!global.Object.getPropertyDescriptor) {
        global.Object.getPropertyDescriptor = function (object, name) {
            var descriptor = Object.getOwnPropertyDescriptor(object, name);

            while (!descriptor && object !== Object.prototype) {
                object = Object.getPrototypeOf(object);
                descriptor = Object.getOwnPropertyDescriptor(object, name);
            }

            return descriptor;
        };
    }

    // ES6 Map
    // - See https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Map
    if (!global.Map) {
        (function () {
            var callback = module.defer();

            require([
                "js/Map"
            ], function (
                Map
            ) {
                global.Map = Map;
                callback();
            });
        }());
    }
});
