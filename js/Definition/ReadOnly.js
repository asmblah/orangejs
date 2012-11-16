define([
    "../util",
    "../Definition/Data"
], function (
    util,
    DataDefinition
) {
    "use strict";

    function ReadOnlyDefinition(privatesMap, name) {
        DataDefinition.call(this, privatesMap, name);
    }

    ReadOnlyDefinition.prototype = Object.create(DataDefinition.prototype);
    ReadOnlyDefinition.prototype.constructor = ReadOnlyDefinition;

    util.extend(ReadOnlyDefinition.prototype, {

    });

    return ReadOnlyDefinition;
});
