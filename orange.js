define({
    paths: {
        "js": "../../vendor/orangejs/js"
    }
}, [
    "js/Class",
    "js/Enum",
    "js/Exception",
    "js/Map",
    "js/shims"
], function (
    Class,
    Enum,
    Exception,
    Map
) {
    "use strict";

    return {
        Class: Class,
        Enum: Enum,
        Exception: Exception,
        Map: Map
    };
});
