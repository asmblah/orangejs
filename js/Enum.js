define([
    "./util"
], function (
    util
) {
    "use strict";

    function Enum(name, items) {
        this.name = name;
        this.items = items;
    }

    util.extend(Enum, {
        fromArray: function (name, array) {
            var items = {};

            util.each(array, function (name, index) {
                items[name] = index + 1;
            });

            return new Enum(name, items);
        }
    });

    util.extend(Enum.prototype, {
        exposeIn: function (object) {
            util.each(this.items, function (value, name) {
                object[name] = value;
            });

            object[this.name] = this;
        }
    });

    return Enum;
});
