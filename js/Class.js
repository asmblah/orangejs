define([
    "js/util",
    "js/Exception",
    "js/WeakMap"
], function (
    util,
    Exception,
    WeakMap
) {
    "use strict";

    var TYPE_PRIVATE = "private",
        TYPE_PROTECTED = "protected",
        TYPE_PUBLIC = "public",
        privatesMap = new WeakMap(),
        propertiesMap = new WeakMap(),
        propertyDefiners = {
            "data": function (object, name, data) {
                propertyDefiners["descriptor"](object, name, {
                    value: data,
                    writable: true
                });
            },
            "descriptor": function (object, name, data) {
                if (data.hasOwnProperty("value")) {
                    data = (function (data) {
                        // TODO: Possible issue here as we really need a 2D map using both "object" and "this" as keys
                        return {
                            get: function () {
                                var properties = propertiesMap.get(object);
                                if (!properties) {
                                    properties = {};
                                    propertiesMap.set(object, properties);
                                }
                                if (!properties[name]) {
                                    properties[name] = wrap(data.value);
                                }
                                return properties[name];
                            },
                            set: function (value) {
                                var properties = propertiesMap.get(object);
                                if (!properties) {
                                    properties = {};
                                    propertiesMap.set(object, properties);
                                }
                                properties[name] = value;
                            }
                        };
                    }(data));
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
                    privates;

                if (!(this instanceof namedConstructor)) {
                    throw new Exception("Constructor must be called on an instance of its class");
                }

                privates = getPrivates(publics);

                defineProperties(privates, definitions[TYPE_PRIVATE]);
                defineProperties(privates, definitions[TYPE_PROTECTED]);

                if (constructor) {
                    constructor.apply(privates, arguments);
                }
            },
            namedConstructor = namedFunction(proxyConstructor, name);

        if (!prototype) {
            prototype = Class.prototype;
        } else if (!(prototype instanceof Class)) {
            throw new Exception("Prototype must be a Class");
        }

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
                        var constructor = getConstructor();

                        defineProperties(this, definitions[TYPE_PROTECTED]);

                        if (childDefinitions[TYPE_PUBLIC] && childDefinitions[TYPE_PUBLIC].constructor) {
                            childDefinitions[TYPE_PUBLIC].constructor.data.apply(this, arguments);
                        } else if (constructor) {
                            constructor.apply(this, arguments);
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
            prototype: prototype
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
                throw new Exception("Invalid property definition: '" + definition + "'");
            }

            visibility = parts[1];
            type = parts[2];
            name = parts[3];

            if (visibility !== TYPE_PRIVATE && visibility !== TYPE_PROTECTED && visibility !== TYPE_PUBLIC) {
                name = type;
                type = visibility;
                visibility = TYPE_PRIVATE;
            }

            if (!propertyDefiners.hasOwnProperty(type) || typeof name === "undefined") {
                name = type;
                type = "data";
            }

            definitions[visibility] = definitions[visibility] || createHash();
            definitions[visibility][name] = {
                type: type,
                data: data
            };
        }, { keys: true });

        return definitions;
    }

    function defineProperty(object, name, definition) {
        var definer,
            type = definition.type,
            data = definition.data;

        definer = propertyDefiners[type];

        if (!definer) {
            throw new Exception("Tried to define a property with an invalid type '" + type + "'");
        }

        definer(object, name, data);
    }

    function defineProperties(object, definitions, filter) {
        util.each(definitions, function (definition, name) {
            if (!filter || filter(name)) {
                defineProperty(object, name, definition);
            }
        }, { keys: true });
    }

    function getPrivates(publics) {
        var privates = privatesMap.get(publics);

        if (!privates) {
            privates = Object.create(publics);

            privatesMap.set(publics, privates);
            privatesMap.set(privates, privates);
        }

        return privates;
    }

    function namedFunction(parent, name) {
        /*jslint evil:true */
        return eval("(function " + name + "() { return parent.apply(this, arguments); })");
    }

    function wrap(value) {
        return util.isFunction(value) && !value.extend ? function () {
            return value.apply(getPrivates(this), arguments);
        } : value;
    }

    return Class;
});
