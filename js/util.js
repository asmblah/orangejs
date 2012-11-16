define([
    "modular"
], function (
    modular
) {
    "use strict";

    var util = modular.util.extend({}, modular.util, {
        createHash: function () {
            return Object.create({ constructor: null });
        }
    });

    return util;
});
