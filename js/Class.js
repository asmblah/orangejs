define([
    "js/util",
    "js/WeakMap"
], function (
    util,
    WeakMap
) {
    "use strict";

    var privatesMap = new WeakMap();

    function Class(members, prototype, parentProtecteds) {
        function namedFunction(parent, name) {
            /*jslint evil:true */
            return eval("(function " + name + "() { return parent.apply(this, arguments); })");
        }

        function getPrivates(publics) {
            var protecteds,
                privates = privatesMap.get(publics);

            if (!privates) {
                protecteds = Object.create(publics);
                privates = Object.create(protecteds);

                protecteds.protecteds = protecteds;
                protecteds.publics = publics;
                privates.privates = privates;
                privates.protecteds = protecteds;

                privatesMap.set(publics, privates);
            }

            return privates;
        }

        var constructor = function () {
            var publics = this,
                privates = getPrivates(publics),
                protecteds = privates.protecteds;

            util.each(members["private"], function (value, name) {
                privates[name] = util.isFunction(value) ? function () {
                    return value.apply(getPrivates(publics), arguments);
                } : value;
            });

            util.each(members["protected"], function (value, name) {
                protecteds[name] = util.isFunction(value) ? function () {
                    return value.apply(getPrivates(publics), arguments);
                } : value;
            });

            if (members.hasOwnProperty("constructor") && util.isFunction(members.constructor)) {
                members.constructor.apply(this, arguments);
            }
        },
            klass,
            name;

        members = members || {};
        name = members.name || "anonymous";
        klass = namedFunction(constructor, name);

        if (prototype) {
            klass.prototype = prototype;
            prototype.constructor = klass;
        }

        util.each(members["public"], function (value, name) {
            klass.prototype[name] = util.isFunction(value) ? function () {
                return value.apply(getPrivates(this), arguments);
            } : value;
        });

        klass.extend = function (childMembers) {
            return new Class(util.extend({}, members, childMembers), Object.create(klass.prototype));
        };

        return klass;
    }

    return Class;
});
