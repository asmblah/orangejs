define({
    paths: {
        "js": "../../vendor/orangejs/js"
    }
}, [
    "require",
    "module",
    "./js/shims"
], function (
    require,
    module
) {
    "use strict";

    var callback = module.defer();

    require([
        "./js/Class",
        "./js/Enum",
        "./js/Exception"
    ], function (
        Class,
        Enum,
        Exception
    ) {
        callback({
            Class: Class,
            Enum: Enum,
            Exception: Exception
        });
    });
});
