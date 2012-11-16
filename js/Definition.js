define([
    "./util"
], function (
    util
) {
    "use strict";

    function Definition(privatesMap, name) {
        this.name = name;
        this.privatesMap = privatesMap;
    }

    util.extend(Definition.prototype, {
        applyTo: function (object, options) {
            Object.defineProperty(object, this.name, this.getDescriptor(object, options));
        },

        clone: function () {
            return new this.constructor(this.privatesMap, this.name);
        },

        getDescriptor: function (object) {

        },

        wrap: function (fn) {
            var privatesMap = this.privatesMap;

            return function () {
                return fn.apply(privatesMap.get(this), arguments);
            };
        }
    });

    return Definition;
});
