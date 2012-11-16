define({
    paths: {
        "js": "../../vendor/orangejs/js"
    }
}, [
    "js/Class",
    "js/Enum",
    "js/Exception",
    "js/WeakMap",
    "js/shims"
], function (
    Class,
    Enum,
    Exception,
    WeakMap
) {
    "use strict";

    return {
        Class: Class,
        Enum: Enum,
        Exception: Exception,
        WeakMap: WeakMap
    };
});
