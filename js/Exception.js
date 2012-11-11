define([
    "js/util"
], function (
    util
) {
    "use strict";

    function Exception(message, code) {
        this.message = message;
        this.code = code;
    }

    Exception.prototype = Object.create(Error.prototype);

    util.extend(Exception.prototype, {
        name: "Exception"
    });

    return Exception;
});
