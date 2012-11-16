define([
    "../util",
    "../Definition/Data"
], function (
    util,
    DataDefinition
) {
    "use strict";

    function DescriptorDefinition(privatesMap, name) {
        DataDefinition.call(this, privatesMap, name);

        this.getter = null;
        this.setter = null;
    }

    DescriptorDefinition.prototype = Object.create(DataDefinition.prototype);
    DescriptorDefinition.prototype.constructor = DescriptorDefinition;

    util.extend(DescriptorDefinition.prototype, {
        clone: function () {
            var definition = DataDefinition.prototype.clone.call(this);
            definition.getter = this.getter;
            definition.setter = this.setter;
            return definition;
        },

        defineGetter: function (getter) {
            this.getter = getter || null;
        },

        defineSetter: function (setter) {
            this.setter = setter || null;
        },

        defineValue: function (value) {
            DataDefinition.prototype.defineValue.call(this, value);
            this.getter = null;
            this.setter = null;
        },

        getDescriptor: function (object) {
            var definition = this,
                descriptor = {
                    configurable: true,
                    enumerable: false
                };

            if (!this.getter && !this.setter) {
                return DataDefinition.prototype.getDescriptor.call(this, object);
            }

            if (definition.getter) {
                descriptor.get = definition.wrap(definition.getter);
            } else {
                descriptor.get = undefined;
            }

            if (definition.setter) {
                descriptor.set = definition.wrap(definition.setter);
            } else {
                descriptor.set = undefined;
            }

            return descriptor;
        }
    });

    return DescriptorDefinition;
});
