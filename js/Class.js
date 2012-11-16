define([
    "js/util",
    "js/DefinitionList",
    "js/Enum",
    "js/Exception"
], function (
    util,
    DefinitionList,
    Enum,
    Exception
) {
    "use strict";

    var privatesMap = new util.global.Map();

    function Class(arg1, arg2, arg3) {
        var args = parseArgs(arg1, arg2, arg3),
            name = args.name,
            definitions = DefinitionList.parse(privatesMap, null, args.definitions),
            prototype = args.prototype,
            proxyConstructor = function () {
                var publics = this,
                    privates,
                    beingConstructed = false;

                if (!(publics instanceof namedConstructor)) {
                    throw new Exception("Constructor must be called on an instance of its class");
                }

                privates = privatesMap.get(publics);

                if (!privates) {
                    beingConstructed = true;
                    privates = createPrivates(publics);
                }

                if (beingConstructed) {
                    definitions.getPrivates().applyTo(privates);
                    definitions.getProtecteds().applyTo(privates);
                }

                if (publics.constructor && publics.constructor !== namedConstructor) {
                    publics.constructor.apply(publics, arguments);
                }

                if (beingConstructed) {
                    definitions.getPrivates().getReadOnlys().applyTo(privates, { allowWrites: false });
                    definitions.getProtecteds().getReadOnlys().applyTo(privates, { allowWrites: false });
                    definitions.getPublics({ includeInherited: true }).getReadOnlys().applyTo(publics, { allowWrites: false });
                }
            },
            namedConstructor = namedFunction(proxyConstructor, name);

        if (!prototype) {
            prototype = Class.prototype;
        } else if (!(prototype instanceof Class)) {
            throw new Exception("Prototype must be a Class");
        }

        namedConstructor.prototype = Object.create(prototype);
        Object.defineProperty(namedConstructor.prototype, "constructor", {
            configurable: true,
            enumerable: true,
            value: namedConstructor
        });

        definitions.getPublics().applyTo(namedConstructor.prototype);

        namedConstructor.extend = function (arg1, arg2, arg3) {
            var args = parseArgs(arg1, arg2, arg3),
                childDefinitions = definitions.extend(args.definitions);

            return new Class(args.name, childDefinitions, namedConstructor.prototype);
        };

        return namedConstructor;
    }

    function parseArgs(arg1, arg2, arg3) {
        var name = arg1,
            definitions = arg2,
            prototype = arg3;

        if (util.isPlainObject(name)) {
            definitions = name;
            name = null;
        }

        return {
            name: name || "anonymous",
            definitions: definitions || {},
            prototype: prototype
        };
    }

    function createPrivates(publics) {
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

    return Class;
});
