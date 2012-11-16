define([
    "../util",
    "../Definition",
    "../TreeMap"
], function (
    util,
    Definition,
    TreeMap
) {
    "use strict";

    var valueMap = new TreeMap();

    function DataDefinition(privatesMap, name) {
        Definition.call(this, privatesMap, name);

        this.defaultValue = null;
    }

    DataDefinition.prototype = Object.create(Definition.prototype);
    DataDefinition.prototype.constructor = DataDefinition;

    util.extend(DataDefinition.prototype, {
        clone: function () {
            var definition = Definition.prototype.clone.call(this);
            definition.defaultValue = this.defaultValue;
            return definition;
        },

        defineValue: function (value) {
            this.defaultValue = value;
        },

        getDefaultValue: function () {
            return this.defaultValue;
        },

        getDescriptor: function (object, options) {
            var definition = this,
                descriptor = {
                    configurable: true,
                    enumerable: false
                };

            options = options || {};

            descriptor.get = function () {
                var privates = definition.privatesMap.get(this),
                    publics = Object.getPrototypeOf(privates),
                    value;

                if (this === privates && valueMap.has([privates, definition.name])) {
                    value = valueMap.get([privates, definition.name]);
                } else {
                    value = valueMap.get([publics, definition.name], definition.defaultValue);
                }

                if (util.isFunction(value) && !value.extend) {
                    value = definition.wrap(value);
                }

                return value;
            };

            if (options.allowWrites !== false) {
                descriptor.set = function (value) {
                    var privates = definition.privatesMap.get(this),
                        publics = Object.getPrototypeOf(privates);

                    if (this === privates && valueMap.has([privates, definition.name])) {
                        valueMap.set([privates, definition.name], value);
                    } else {
                        valueMap.set([publics, definition.name], value);
                    }
                };
            } else {
                descriptor.set = undefined;
            }

            if (!valueMap.has([object, definition.name])) {
                valueMap.set([object, definition.name], definition.defaultValue);
            }

            return descriptor;
        },

        setDefaultValue: function (value) {
            this.defaultValue = value;
        }
    });

    return DataDefinition;
});
