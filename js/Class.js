define([
    "js/util"
], function (
    util
) {
    "use strict";

    function Class(members) {
        var moduleKey = {},
            klass = function () {
                var publics = this,
                    protecteds = Object.create(publics),
                    privates = Object.create(protecteds),
                    secrets = {
                        protecteds: protecteds,
                        privates: privates
                    };

                protecteds.publics = publics;
                privates.protecteds = protecteds;

                util.each(members["private"], function (value, name) {
                    privates[name] = function () {
                        var secrets = this.valueOf(moduleKey);

                        return value.apply(secrets.privates);
                    };
                });

                util.each(members["protected"], function (value, name) {
                    protecteds[name] = function () {
                        var secrets = this.valueOf(moduleKey);

                        return value.apply(secrets.privates);
                    };
                });

                Object.defineProperty(publics, "valueOf", {
                    configurable: true,
                    enumerable: false,
                    value: function (key) {
                        if (key === moduleKey) {
                            return secrets;
                        }
                        return Object.prototype.valueOf.call(this);
                    }
                });

                if (util.isFunction(members.constructor)) {
                    members.constructor.call(this);
                }
            };

        members = members || {};

        util.each(members["public"], function (value, name) {
            klass.prototype[name] = function () {
                var secrets = this.valueOf(moduleKey);

                return value.apply(secrets.privates);
            };
        });

        klass.extend = function () {

        };

        return klass;
    }

    return Class;
});
