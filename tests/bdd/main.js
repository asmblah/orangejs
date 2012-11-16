require({
    paths: {
        "root": "../..",
        "vendor": "../../vendor",
        "js": "../../js"
    }
}, [
    "require",
    "vendor/chai/chai",
    "vendor/sinon-chai/lib/sinon-chai",
    "js/shims"
], function (
    require,
    chai,
    sinonChai
) {
    "use strict";

    mocha.setup({
        "ui": "bdd",
        "reporter": mocha.reporters.HTML,
        "globals": ["_gaq", "jQuery*", "setTimeout", "setInterval", "clearTimeout", "clearInterval"]
    });

    chai.use(sinonChai);

    require({
        cache: false
    }, [
        "./ClassTest",
        "./MapTest"
    ], function () {
        mocha.run();
    });
});
