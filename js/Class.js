define([
    "js/util",
    "js/WeakMap"
], function (
    util,
    WeakMap
) {
    "use strict";

    var privatesMap = new WeakMap(),
        propertyDefiners = {
            "data": function (object, name, data) {
                Object.defineProperty(object, name, { value: wrap(data) });
            },
            "descriptor": function (object, name, data) {
                if (data.value) {
                    data.value = wrap(data.value);
                }
                if (data.get) {
                    data.get = wrap(data.get);
                }
                if (data.set) {
                    data.set = wrap(data.set);
                }
                Object.defineProperty(object, name, data);
            }
        };

    function Class(members, prototype) {
        var constructor = function () {
            var publics = this,
                privates = getPrivates(publics),
                protecteds = privates.protecteds;

            util.each(members["private"], function (data, name) {
                defineProperty(privates, name, data);
            });

            util.each(members["protected"], function (data, name) {
                defineProperty(protecteds, name, data);
            });

            if (members.hasOwnProperty("constructor") && util.isFunction(members.constructor)) {
                members.constructor.apply(privates, arguments);
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

        util.each(members["public"], function (data, name) {
            defineProperty(klass.prototype, name, data);
        });

        klass.extend = function (childMembers) {
            return new Class(util.extend({}, members, childMembers), Object.create(klass.prototype));
        };

        return klass;
    }

    function defineProperty(object, name, data) {
        var definer,
            parts = name.match(/([^\s]+)\s+(.*)/),
            type;

        if (!parts) {
            type = "data";
        } else {
            type = parts[1];
            name = parts[2];
        }

        definer = propertyDefiners[type];

        if (!definer) {
            throw new Error("Tried to define a property with an invalid type '" + type + "'");
        }

        definer(object, name, data);
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

    function namedFunction(parent, name) {
        /*jslint evil:true */
        return eval("(function " + name + "() { return parent.apply(this, arguments); })");
    }

    function wrap(value) {
        return util.isFunction(value) ? function () {
            return value.apply(getPrivates(this), arguments);
        } : value;
    }

    return Class;
});
