define([
    "js/util",
    "js/WeakMap"
], function (
    util,
    WeakMap
) {
    "use strict";

    var TYPE_PRIVATE = "private",
        TYPE_PROTECTED = "protected",
        TYPE_PUBLIC = "public",
        secretsMap = new WeakMap(),
        propertyDefiners = {
            "data": function (object, name, data) {
                Object.defineProperty(object, name, {
                    value: wrap(data),
                    writable: true
                });
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

    function Class(arg1, arg2, arg3) {
        function getConstructor() {
            var publicDefinitions = definitions[TYPE_PUBLIC];
            return publicDefinitions && publicDefinitions.constructor ?
                    publicDefinitions.constructor.data :
                    null;
        }

        var args = parseArgs(arg1, arg2, arg3),
            name = args.name,
            members = args.members,
            definitions = parseDefinitions(members),
            prototype = args.prototype,
            proxyConstructor = function () {
                var constructor = getConstructor(),
                    publics = this,
                    secrets = getSecrets(publics);

                defineProperties(secrets.privates, definitions[TYPE_PRIVATE]);
                defineProperties(secrets.protecteds, definitions[TYPE_PROTECTED]);

                if (constructor) {
                    constructor.apply(secrets.privates, arguments);
                }
            },
            namedConstructor = namedFunction(proxyConstructor, name);

        namedConstructor.prototype = Object.create(prototype);
        namedConstructor.prototype.constructor = namedConstructor;

        defineProperties(namedConstructor.prototype, definitions[TYPE_PUBLIC], function (name) {
            return name !== "constructor";
        });

        namedConstructor.extend = function (arg1, arg2, arg3) {
            var args = parseArgs(arg1, arg2, arg3),
                childDefinitions = parseDefinitions(args.members);

            return new Class(
                args.name,
                util.extend({}, args.members, {
                    "public constructor": function () {
                        defineProperties(this.protecteds, definitions[TYPE_PROTECTED]);

                        if (childDefinitions[TYPE_PUBLIC] && childDefinitions[TYPE_PUBLIC].constructor) {
                            childDefinitions[TYPE_PUBLIC].constructor.data.apply(this, arguments);
                        } else {
                            proxyConstructor.apply(this, arguments);
                        }
                    }
                }),
                namedConstructor.prototype
            );
        };

        return namedConstructor;
    }

    function createHash() {
        return Object.create({ constructor: null });
    }

    function parseArgs(arg1, arg2, arg3) {
        var name = arg1,
            members = arg2,
            prototype = arg3;

        if (util.isPlainObject(name)) {
            members = name;
            name = null;
        }

        return {
            name: name || "anonymous",
            members: members || {},
            prototype: prototype || {}
        };
    }

    function parseDefinitions(members) {
        var definitions = createHash();

        util.each(members, function (data, definition) {
            var parts = definition.match(/^([^\s]+)(?:\s+([^\s]+))?(?:\s+([^\s]+))?$/),
                visibility,
                type,
                name;

            if (!parts) {
                throw new Error("Invalid property definition: '" + definition + "'");
            }

            visibility = parts[1];
            type = parts[2];
            name = parts[3];

            if (visibility !== TYPE_PRIVATE && visibility !== TYPE_PROTECTED && visibility !== TYPE_PUBLIC) {
                name = type;
                type = visibility;
                visibility = TYPE_PRIVATE;
            }

            if (!propertyDefiners.hasOwnProperty(type)) {
                name = type;
                type = "data";
            }

            definitions[visibility] = definitions[visibility] || createHash();
            definitions[visibility][name] = {
                type: type,
                data: data
            };
        });

        return definitions;
    }

    function defineProperty(object, name, definition) {
        var definer,
            type = definition.type,
            data = definition.data;

        definer = propertyDefiners[type];

        if (!definer) {
            throw new Error("Tried to define a property with an invalid type '" + type + "'");
        }

        definer(object, name, data);
    }

    function defineProperties(object, definitions, filter) {
        util.each(definitions, function (definition, name) {
            if (!filter || filter(name)) {
                defineProperty(object, name, definition);
            }
        });
    }

    function getSecrets(publics) {
        var privates,
            protecteds,
            secrets = secretsMap.get(publics);

        if (!secrets) {
            protecteds = Object.create(publics);
            privates = Object.create(protecteds);
            secrets = {
                protecteds: protecteds,
                privates: privates
            };

            protecteds.protecteds = protecteds;
            protecteds.publics = publics;
            privates.privates = privates;
            privates.protecteds = protecteds;

            secretsMap.set(publics, secrets);
        }

        return secrets;
    }

    function namedFunction(parent, name) {
        /*jslint evil:true */
        return eval("(function " + name + "() { return parent.apply(this, arguments); })");
    }

    function wrap(value) {
        return util.isFunction(value) ? function () {
            return value.apply(getSecrets(this).privates, arguments);
        } : value;
    }

    return Class;
});
