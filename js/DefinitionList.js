define([
    "js/util",
    "js/Definition/Data",
    "js/Definition/Descriptor",
    "js/Definition/Enum",
    "js/Exception",
    "js/Definition/ReadOnly"
], function (
    util,
    DataDefinition,
    DescriptorDefinition,
    EnumDefinition,
    Exception,
    ReadOnlyDefinition
) {
    "use strict";

    var TYPE_READONLY = "readonly",
        VISIBILITY_PRIVATE = "private",
        VISIBILITY_PROTECTED = "protected",
        VISIBILITY_PUBLIC = "public",
        PROPERTY_TYPES = {
            "data": true,
            "descriptor": true,
            "enum": true,
            "get": true,
            "readonly": true,
            "set": true
        };

    function DefinitionList(privatesMap, parent, definitions) {
        this.definitions = definitions;
        this.parent = parent;
        this.privatesMap = privatesMap;
    }

    util.extend(DefinitionList, {
        VISIBILITY_PRIVATE: VISIBILITY_PRIVATE,
        VISIBILITY_PROTECTED: VISIBILITY_PROTECTED,
        VISIBILITY_PUBLIC: VISIBILITY_PUBLIC,

        parse: function (privatesMap, parent, members) {
            var definitions;

            if (members && (members instanceof DefinitionList)) {
                return members;
            }

            definitions = util.createHash();

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

                if (visibility !== VISIBILITY_PRIVATE && visibility !== VISIBILITY_PROTECTED && visibility !== VISIBILITY_PUBLIC) {
                    name = type;
                    type = visibility;
                    visibility = VISIBILITY_PRIVATE;
                }

                if (!PROPERTY_TYPES.hasOwnProperty(type) || typeof name === "undefined") {
                    name = type;
                    type = "data";
                }

                definitions[visibility] = definitions[visibility] || util.createHash();
                definition = definitions[visibility][name];

                if (type === "data") {
                    definition = new DataDefinition(privatesMap, name);
                    definition.setDefaultValue(data);
                } else if (type === "descriptor") {
                    if (!definition || !(definition instanceof DescriptorDefinition)) {
                        definition = new DescriptorDefinition(privatesMap, name);
                    }

                    if (data.hasOwnProperty("value")) {
                        definition.defineValue(data.value);
                    } else {
                        definition.defineGetter(data.get);
                        definition.defineSetter(data.set);
                    }
                } else if (type === "enum") {
                    definition = new EnumDefinition(privatesMap, name);
                    definition.defineItems(data);
                } else if (type === "get") {
                    if (!definition || !(definition instanceof DescriptorDefinition)) {
                        definition = new DescriptorDefinition(privatesMap, name);
                    }
                    definition.defineGetter(data);
                } else if (type === "readonly") {
                    definition = new ReadOnlyDefinition(privatesMap, name);
                    definition.defineValue(data);
                } else if (type === "set") {
                    if (!definition || !(definition instanceof DescriptorDefinition)) {
                        definition = new DescriptorDefinition(privatesMap, name);
                    }
                    definition.defineSetter(data);
                }

                definitions[visibility][name] = definition;
            }, { keys: true });

            return new DefinitionList(privatesMap, parent, definitions);
        }
    });

    util.extend(DefinitionList.prototype, {
        applyTo: function (object, options) {
            util.each(this.definitions, function (definitions, visibility) {
                util.each(definitions, function (definition) {
                    definition.applyTo(object, options);
                }, { keys: true });
            }, { keys: true });
        },

        clone: function () {
            var definitions = util.createHash();

            definitions[VISIBILITY_PRIVATE] = util.createHash();
            definitions[VISIBILITY_PROTECTED] = util.createHash();
            definitions[VISIBILITY_PUBLIC] = util.createHash();

            util.each(this.definitions, function (names, visibility) {
                util.each(names, function (definition, name) {
                    definitions[visibility][name] = definition.clone();
                });
            });

            return new DefinitionList(this.privatesMap, this.parent, definitions);
        },

        extend: function (childList) {
            var list = this.getProtecteds().clone();

            childList = DefinitionList.parse(this.privatesMap, this, childList);

            util.extend(list.definitions[VISIBILITY_PRIVATE], childList.definitions[VISIBILITY_PRIVATE]);
            util.extend(list.definitions[VISIBILITY_PROTECTED], childList.definitions[VISIBILITY_PROTECTED]);
            util.extend(list.definitions[VISIBILITY_PUBLIC], childList.definitions[VISIBILITY_PUBLIC]);

            return list;
        },

        getPrivates: function () {
            var definitions = {};
            definitions[VISIBILITY_PRIVATE] = this.definitions[VISIBILITY_PRIVATE];
            definitions[VISIBILITY_PROTECTED] = util.createHash();
            definitions[VISIBILITY_PUBLIC] = util.createHash();
            return new DefinitionList(this.privatesMap, this, definitions);
        },

        getProtecteds: function () {
            var definitions = {};
            definitions[VISIBILITY_PRIVATE] = util.createHash();
            definitions[VISIBILITY_PROTECTED] = this.definitions[VISIBILITY_PROTECTED];
            definitions[VISIBILITY_PUBLIC] = util.createHash();
            return new DefinitionList(this.privatesMap, this, definitions);
        },

        getPublics: function (options) {
            var definitions = {};

            options = options || {};

            definitions[VISIBILITY_PRIVATE] = util.createHash();
            definitions[VISIBILITY_PROTECTED] = util.createHash();
            definitions[VISIBILITY_PUBLIC] = this.definitions[VISIBILITY_PUBLIC];

            if (this.parent) {
                util.extend(definitions[VISIBILITY_PUBLIC], this.parent.getPublics(options).definitions[VISIBILITY_PUBLIC]);
            }

            return new DefinitionList(this.privatesMap, this, definitions);
        },

        getReadOnlys: function () {
            var definitions = {},
                privatesMap = this.privatesMap;

            definitions[VISIBILITY_PRIVATE] = util.createHash();
            definitions[VISIBILITY_PROTECTED] = util.createHash();
            definitions[VISIBILITY_PUBLIC] = util.createHash();

            util.each(this.definitions, function (names, visibility) {
                util.each(names, function (definition, name) {
                    if (definition instanceof ReadOnlyDefinition) {
                        definitions[visibility][name] = definition;
                    }
                });
            });

            return new DefinitionList(privatesMap, this, definitions);
        }
    });

    return DefinitionList;
});
