define([
    "vendor/chai/chai",
    "vendor/sinon/sinon",
    "js/Class"
], function (
    chai,
    sinon,
    Class
) {
    "use strict";

    var expect = chai.expect;

    describe("Class", function () {
        it("should return a function", function () {
            expect(new Class()).to.be.an.instanceOf(Function);
        });

        it("should expose default public members publicly", function () {
            var Adult = new Class({
                "public": {
                    "lastSibling": {}
                }
            });

            expect(new Adult()).to.have.property("lastSibling");
        });

        it("should not expose default private members publicly", function () {
            var Adult = new Class({
                "private": {
                    "partner": {}
                }
            });

            expect(new Adult()).to.not.have.property("partner");
        });

        it("should not expose default protected members publicly", function () {
            var Adult = new Class({
                "protected": {
                    "ideas": {}
                }
            });

            expect(new Adult()).to.not.have.property("ideas");
        });

        it("should allow default public methods to access private members", function () {
            var Adult = new Class({
                "private": {
                    "partner": {}
                },
                "public": {
                    "checkFaithfulness": function () {
                        expect(this).to.have.property("partner");
                    }
                }
            });

            new Adult().checkFaithfulness();
        });

        it("should use the specified name as the class name", function () {
            var Clarence = new Class({ name: "Clarence" });

            expect(Clarence.name).to.equal("Clarence");
        });

        describe("protected methods", function () {
            it("should be able to add protected members", function () {
                var Planet = new Class({
                    "protected": {
                        "addIt": function () {
                            this.protecteds.prop = 72;
                        }
                    },
                    "public": {
                        "addIt": function () {
                            this.protecteds.addIt();

                            expect(this.protecteds.prop).to.equal(72);
                        }
                    }
                });

                new Planet().addIt();
            });

            it("should be able to add public members", function () {
                var Planet = new Class({
                    "protected": {
                        "addIt": function () {
                            this.publics.out = "and in";
                        }
                    },
                    "public": {
                        "addIt": function () {
                            this.protecteds.addIt();
                        }
                    }
                }),
                    world = new Planet();

                world.addIt();

                expect(world.out).to.equal("and in");
            });

            it("should be able to add private members", function () {
                var Planet = new Class({
                    "protected": {
                        "addIt": function () {
                            this.privates.prop = 72;
                        }
                    },
                    "public": {
                        "addIt": function () {
                            this.protecteds.addIt();

                            expect(this.privates.prop).to.equal(72);
                        }
                    }
                });

                new Planet().addIt();
            });
        });

        describe("public methods", function () {
            it("should be able to add protected members", function () {
                var Planet = new Class({
                    "public": {
                        "addIt": function () {
                            this.protecteds.prop = 72;

                            expect(this.protecteds.prop).to.equal(72);
                        }
                    }
                });

                new Planet().addIt();
            });

            it("should be able to add public members", function () {
                var Planet = new Class({
                    "public": {
                        "addIt": function () {
                            this.publics.oot = "and aboot";
                        }
                    }
                }),
                    world = new Planet();

                world.addIt();

                expect(world.oot).to.equal("and aboot");
            });

            it("should be able to add private members", function () {
                var Planet = new Class({
                    "public": {
                        "addIt": function () {
                            this.privates.prop = 72;

                            expect(this.privates.prop).to.equal(72);
                        }
                    }
                });

                new Planet().addIt();
            });
        });

        describe("private methods", function () {
            it("should be able to add protected members", function () {
                var Planet = new Class({
                    "private": {
                        "addIt": function () {
                            this.protecteds.prop = 72;
                        }
                    },
                    "public": {
                        "addIt": function () {
                            this.privates.addIt();

                            expect(this.protecteds.prop).to.equal(72);
                        }
                    }
                });

                new Planet().addIt();
            });

            it("should be able to add public members", function () {
                var Planet = new Class({
                    "private": {
                        "addIt": function () {
                            this.publics.oot = "and aboot";
                        }
                    },
                    "public": {
                        "addIt": function () {
                            this.privates.addIt();
                        }
                    }
                }),
                    world = new Planet();

                world.addIt();

                expect(world.oot).to.equal("and aboot");
            });

            it("should be able to add private members", function () {
                var Planet = new Class({
                    "private": {
                        "addIt": function () {
                            this.privates.prop = 77;
                        }
                    },
                    "public": {
                        "addIt": function () {
                            this.privates.addIt();

                            expect(this.privates.prop).to.equal(77);
                        }
                    }
                });

                new Planet().addIt();
            });
        });

        describe("constructor", function () {
            it("should not be called if no instances are created", function () {
                var constructor = sinon.spy(),
                    Silent = new Class({ constructor: constructor });

                expect(constructor).to.not.have.been.called;
            });

            it("should be called twice if two instances are created", function () {
                var constructor = sinon.spy(),
                    Constructable = new Class({ constructor: constructor }),
                    obj;

                obj = new Constructable();
                obj = new Constructable();

                expect(constructor).to.have.been.calledTwice;
            });

            it("should be called with arguments if specified", function () {
                var constructor = sinon.spy(),
                    Scary = new Class({
                        constructor: constructor
                    }),
                    obj = new Scary("arrrg1", 72);

                expect(constructor).to.have.been.calledWith("arrrg1", 72);
            });
        });

        describe("classes derived by extend()", function () {
            it("should create objects that are instances of that class", function () {
                var Short = new Class(),
                    Long = Short.extend();

                expect(new Long()).to.be.an.instanceOf(Long);
            });

            it("should create objects that are instances of the parent class", function () {
                var Animal = new Class({ name: "Animal" }),
                    Human = Animal.extend();

                expect(new Human()).to.be.an.instanceOf(Animal);
            });

            it("should not be the same as the class being extended", function () {
                var Before = new Class(),
                    After = Before.extend();

                expect(After).to.not.equal(Before);
            });

            it("should have a name matching the specified name", function () {
                var Rodent = new Class(),
                    Hamster = Rodent.extend({ name: "Hamster" });

                expect(Hamster.name).to.equal("Hamster");
            });

            it("should create objects that refer to the derived class as their constructor", function () {
                var Canine = new Class(),
                    Dog = Canine.extend();

                expect(new Dog().constructor).to.equal(Dog);
            });

            it("should create objects that have access to the parent class' protected members", function () {
                var Super = new Class({
                    "protected": {
                        "a-protected-prop": 7
                    }
                }),
                    Derived = Super.extend({
                        "public": {
                            tryIt: function () {
                                expect(this).to.have.property("a-protected-prop");
                            }
                        }
                    });

                new Derived().tryIt();
            });

            it("should create objects that have access to the parent class' public members", function () {
                var Super = new Class({
                    "public": {
                        "a-public-prop": 7
                    }
                }),
                    Derived = Super.extend();

                expect(new Derived()).to.have.property("a-public-prop");
            });

            it("should create objects that do not have access to the parent class' private members", function () {
                var Super = new Class({
                    "private": {
                        "in-the-parent": {}
                    }
                }),
                    Derived = Super.extend();

                expect(new Derived()).to.not.have.property("in-the-parent");
            });

            it("should create objects that have access to the derived class' public members", function () {
                var Super = new Class(),
                    Derived = Super.extend({
                        "public": {
                            "a-public-prop": 7
                        }
                    });

                expect(new Derived()).to.have.property("a-public-prop");
            });

            it("should create objects that have access to the derived class' protected members", function () {
                var Super = new Class(),
                    Derived = Super.extend({
                        "protected": {
                            "a-protected-prop": 7
                        },
                        "public": {
                            tryIt: function () {
                                expect(this).to.have.property("a-protected-prop");
                            }
                        }
                    });

                new Derived().tryIt();
            });

            it("should create objects that do have access to the derived class' private members", function () {
                var Super = new Class(),
                    Derived = Super.extend({
                        "private": {
                            "in-the-derivative": {}
                        },
                        "public": {
                            tryIt: function () {
                                expect(this).to.have.property("in-the-derivative");
                            }
                        }
                    });

                new Derived().tryIt();
            });

            it("should call the derived class' constructor if specified", function () {
                var Super = new Class(),
                    constructor = sinon.spy(),
                    Derived = Super.extend({
                        constructor: constructor
                    }),
                    obj = new Derived();

                expect(constructor).to.have.been.called;
            });

            it("should call the derived class' constructor with arguments if specified", function () {
                var Super = new Class(),
                    constructor = sinon.spy(),
                    Derived = Super.extend({
                        constructor: constructor
                    }),
                    obj = new Derived(2, 7);

                expect(constructor).to.have.been.calledWith(2, 7);
            });

            it("should call the parent class' constructor if specified when child class does not define one", function () {
                var constructor = sinon.spy(),
                    Super = new Class({
                        constructor: constructor
                    }),
                    Derived = Super.extend(),
                    obj = new Derived();

                expect(constructor).to.have.been.calledOnce;
            });
        });
    });
});
