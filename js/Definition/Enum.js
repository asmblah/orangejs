define([
    "../util",
    "../Definition",
    "../Enum"
], function (
    util,
    Definition,
    Enum
) {
    "use strict";

    function EnumDefinition(privatesMap, name) {
        Definition.call(this, privatesMap, name);

        this.items = null;
    }

    EnumDefinition.prototype = Object.create(Definition.prototype);
    EnumDefinition.prototype.constructor = EnumDefinition;

    util.extend(EnumDefinition.prototype, {
        applyTo: function (object) {
            var enumeration = Enum.fromArray(this.name, this.items);

            enumeration.exposeIn(object);
        },

        clone: function () {
            var definition = Definition.prototype.clone.call(this);
            definition.items = this.items;
            return definition;
        },

        defineItems: function (items) {
            this.items = items;
        }
    });

    return EnumDefinition;
});
