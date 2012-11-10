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
                "public lastSibling": {}
            });

            expect(new Adult()).to.have.property("lastSibling");
        });

        it("should not expose default private members publicly", function () {
            var Adult = new Class({
                "private partner": {}
            });

            expect(new Adult()).to.not.have.property("partner");
        });

        it("should not expose default protected members publicly", function () {
            var Adult = new Class({
                "protected ideas": {}
            });

            expect(new Adult()).to.not.have.property("ideas");
        });

        it("should use the specified name as the class name", function () {
            var Clarence = new Class("Clarence");

            expect(Clarence.name).to.equal("Clarence");
        });

        describe("protected members", function () {
            describe("properties", function () {
                it("should be able to define a data descriptor", function () {
                    var World = new Class({
                        "protected descriptor iAmEnclosed": {
                            value: 7
                        },
                        "public testIt": function () {
                            expect(this.protecteds.iAmEnclosed).to.equal(7);
                        }
                    });

                    new World().testIt();
                });

                it("should be able to define an accessor descriptor with just a getter", function () {
                    var World = new Class({
                        "protected descriptor getMe": {
                            get: function () {
                                return 21;
                            }
                        },
                        "public testIt": function () {
                            expect(this.protecteds.getMe).to.equal(21);
                        }
                    });

                    new World().testIt();
                });

                it("should be able to define an accessor descriptor with just a setter", function () {
                    var World = new Class({
                        "protected descriptor setMe": {
                            set: function (value) {
                                this.hidden = value;
                            }
                        },
                        "public testIt": function () {
                            this.protecteds.setMe = 27;
                            expect(this.hidden).to.equal(27);
                        }
                    });

                    new World().testIt();
                });

                it("should allow writing to data properties", function () {
                    var World = new Class({
                        "protected write-to-me": 1,
                        "public testIt": function () {
                            this["write-to-me"] = 2;
                        }
                    }),
                        world = new World();

                    expect(function () {
                        world.testIt();
                    }).to.not.throw();
                });

                it("should be writable from privates object", function () {
                    var privates,
                        Planet = new Class({
                            "public getPrivates": function () {
                                privates = this;
                            }
                        }),
                        Earth = Planet.extend({
                            "public getValue": function () {
                                return this.value;
                            },
                            "protected value": 6
                        }),
                        earth = new Earth();

                    earth.getPrivates();
                    privates.value = 12;

                    expect(earth.getValue()).to.equal(12);
                });
            });

            describe("methods", function () {
                it("should be able to add protected members", function () {
                    var Planet = new Class({
                        "protected addIt": function () {
                            this.protecteds.prop = 72;
                        },
                        "public addIt": function () {
                            this.protecteds.addIt();

                            expect(this.protecteds.prop).to.equal(72);
                        }
                    });

                    new Planet().addIt();
                });

                it("should be able to add public members", function () {
                    var Planet = new Class({
                        "protected addIt": function () {
                            this.publics.out = "and in";
                        },
                        "public addIt": function () {
                            this.protecteds.addIt();
                        }
                    }),
                        world = new Planet();

                    world.addIt();

                    expect(world.out).to.equal("and in");
                });

                it("should be able to modify private members", function () {
                    var Planet = new Class({
                        "private descriptor prop": {
                            get: function () {
                                return this.test;
                            },
                            set: function (value) {
                                this.test = value + 1;
                            }
                        },
                        "protected addIt": function () {
                            this.prop = 72;
                        },
                        "public addIt": function () {
                            this.protecteds.addIt();

                            expect(this.prop).to.equal(73);
                        }
                    });

                    new Planet().addIt();
                });
            });
        });

        describe("public members", function () {
            describe("properties", function () {
                it("should be able to define a data descriptor", function () {
                    var World = new Class({
                        "public descriptor iAmExposed": {
                            value: 8
                        }
                    });

                    expect(new World().iAmExposed).to.equal(8);
                });

                it("should be able to define an accessor descriptor with just a getter", function () {
                    var World = new Class({
                        "public descriptor getMe": {
                            get: function () {
                                return 26;
                            }
                        }
                    });

                    expect(new World().getMe).to.equal(26);
                });

                it("should be able to define an accessor descriptor with just a setter", function () {
                    var World = new Class({
                        "public descriptor setMe": {
                            set: function (value) {
                                this.hidden = value;
                            }
                        },
                        "public getMe": function () {
                            return this.hidden;
                        }
                    }),
                        world = new World();

                    world.setMe = 27;
                    expect(world.getMe()).to.equal(27);
                });

                it("should allow writing to data properties", function () {
                    var World = new Class({
                        "public write-to-me": 1
                    }),
                        world = new World();

                    expect(function () {
                        world["write-to-me"] = 2;
                    }).to.not.throw();
                });

                it("should be writable from privates object", function () {
                    var privates,
                        Planet = new Class({
                            "public value": 7,
                            "public getPrivates": function () {
                                privates = this;
                            }
                        }),
                        planet = new Planet();

                    planet.getPrivates();
                    privates.value = 9;

                    expect(planet.value).to.equal(9);
                });
            });

            describe("methods", function () {
                it("should be able to add protected members", function () {
                    var Planet = new Class({
                        "public addIt": function () {
                            this.protecteds.prop = 72;

                            expect(this.protecteds.prop).to.equal(72);
                        }
                    });

                    new Planet().addIt();
                });

                it("should be able to add public members", function () {
                    var Planet = new Class({
                        "public addIt": function () {
                            this.publics.oot = "and aboot";
                        }
                    }),
                        world = new Planet();

                    world.addIt();

                    expect(world.oot).to.equal("and aboot");
                });

                it("should be able to add private members", function () {
                    var Planet = new Class({
                        "public addIt": function () {
                            this.privates.prop = 72;

                            expect(this.privates.prop).to.equal(72);
                        }
                    });

                    new Planet().addIt();
                });
            });
        });

        describe("private members", function () {
            describe("properties", function () {
                it("should be able to define a data descriptor", function () {
                    var World = new Class({
                        "private descriptor iAmEnclosed": {
                            value: 7
                        },
                        "public testIt": function () {
                            expect(this.privates.iAmEnclosed).to.equal(7);
                        }
                    });

                    new World().testIt();
                });

                it("should be able to define an accessor descriptor with just a getter", function () {
                    var World = new Class({
                        "private descriptor getMe": {
                            get: function () {
                                return 21;
                            }
                        },
                        "public testIt": function () {
                            expect(this.privates.getMe).to.equal(21);
                        }
                    });

                    new World().testIt();
                });

                it("should be able to define an accessor descriptor with just a setter", function () {
                    var World = new Class({
                        "private descriptor setMe": {
                            set: function (value) {
                                this.hidden = value;
                            }
                        },
                        "public testIt": function () {
                            this.privates.setMe = 27;
                            expect(this.hidden).to.equal(27);
                        }
                    });

                    new World().testIt();
                });

                it("should allow writing to data properties", function () {
                    var World = new Class({
                        "private write-to-me": 1,
                        "public testIt": function () {
                            this["write-to-me"] = 2;
                        }
                    }),
                        world = new World();

                    expect(function () {
                        world.testIt();
                    }).to.not.throw();
                });
            });

            describe("methods", function () {
                it("should be able to add protected members", function () {
                    var Planet = new Class({
                        "private addIt": function () {
                            this.protecteds.prop = 72;
                        },
                        "public addIt": function () {
                            this.privates.addIt();

                            expect(this.protecteds.prop).to.equal(72);
                        }
                    });

                    new Planet().addIt();
                });

                it("should be able to add public members", function () {
                    var Planet = new Class({
                        "private addIt": function () {
                            this.publics.oot = "and aboot";
                        },
                        "public addIt": function () {
                            this.privates.addIt();
                        }
                    }),
                        world = new Planet();

                    world.addIt();

                    expect(world.oot).to.equal("and aboot");
                });

                it("should be able to add private members", function () {
                    var Planet = new Class({
                        "private addIt": function () {
                            this.privates.prop = 77;
                        },
                        "public addIt": function () {
                            this.privates.addIt();

                            expect(this.privates.prop).to.equal(77);
                        }
                    });

                    new Planet().addIt();
                });
            });
        });

        describe("constructor", function () {
            it("should not be called if no instances are created", function () {
                var constructor = sinon.spy(),
                    Silent = new Class({
                        "public constructor": constructor
                    });

                expect(constructor).to.not.have.been.called;
            });

            it("should be called twice if two instances are created", function () {
                var constructor = sinon.spy(),
                    Constructable = new Class({
                        "public constructor": constructor
                    }),
                    obj;

                obj = new Constructable();
                obj = new Constructable();

                expect(constructor).to.have.been.calledTwice;
            });

            it("should be called with arguments if specified", function () {
                var constructor = sinon.spy(),
                    Scary = new Class({
                        "public constructor": constructor
                    }),
                    obj = new Scary("arrrg1", 72);

                expect(constructor).to.have.been.calledWith("arrrg1", 72);
            });

            it("should be called on the object's privates object", function () {
                var privates,
                    Galvanize = new Class({
                        "public constructor": function () {
                            privates = this;
                        },
                        "private a-matter-of-privacy": 5
                    });

                new Galvanize();

                expect(privates).to.have.property("a-matter-of-privacy");
            });
        });

        describe("classes derived by extend()", function () {
            it("should create objects that are instances of that class", function () {
                var Short = new Class(),
                    Long = Short.extend();

                expect(new Long()).to.be.an.instanceOf(Long);
            });

            it("should create objects that are instances of the parent class", function () {
                var Animal = new Class("Animal"),
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
                    Hamster = Rodent.extend("Hamster");

                expect(Hamster.name).to.equal("Hamster");
            });

            it("should create objects that refer to the derived class as their constructor", function () {
                var Canine = new Class(),
                    Dog = Canine.extend();

                expect(new Dog().constructor).to.equal(Dog);
            });

            it("should create objects that have access to the parent class' protected members", function () {
                var Super = new Class({
                    "protected a-protected-prop": 7
                }),
                    Derived = Super.extend({
                        "public tryIt": function () {
                            expect(this).to.have.property("a-protected-prop");
                        }
                    });

                new Derived().tryIt();
            });

            it("should create objects that have access to the parent class' public members", function () {
                var Super = new Class({
                    "public a-public-prop": 7
                }),
                    Derived = Super.extend();

                expect(new Derived()).to.have.property("a-public-prop");
            });

            it("should create objects that do not have access to the parent class' private members", function () {
                var Super = new Class({
                    "private in-the-parent": {}
                }),
                    Derived = Super.extend();

                expect(new Derived()).to.not.have.property("in-the-parent");
            });

            it("should create objects that have access to the derived class' public members", function () {
                var Super = new Class(),
                    Derived = Super.extend({
                        "public a-public-prop": 7
                    });

                expect(new Derived()).to.have.property("a-public-prop");
            });

            it("should create objects that have access to the derived class' protected members", function () {
                var Super = new Class(),
                    Derived = Super.extend({
                        "protected a-protected-prop": 7,
                        "public tryIt": function () {
                            expect(this).to.have.property("a-protected-prop");
                        }
                    });

                new Derived().tryIt();
            });

            it("should create objects that do have access to the derived class' private members", function () {
                var Super = new Class(),
                    Derived = Super.extend({
                        "private in-the-derivative": {},
                        "public tryIt": function () {
                            expect(this).to.have.property("in-the-derivative");
                        }
                    });

                new Derived().tryIt();
            });

            it("should call the derived class' constructor if specified", function () {
                var Super = new Class(),
                    constructor = sinon.spy(),
                    Derived = Super.extend({
                        "public constructor": constructor
                    }),
                    obj = new Derived();

                expect(constructor).to.have.been.called;
            });

            it("should call the derived class' constructor with arguments if specified", function () {
                var Super = new Class(),
                    constructor = sinon.spy(),
                    Derived = Super.extend({
                        "public constructor": constructor
                    }),
                    obj = new Derived(2, 7);

                expect(constructor).to.have.been.calledWith(2, 7);
            });

            it("should call the parent class' constructor if specified when child class does not define one", function () {
                var constructor = sinon.spy(),
                    Super = new Class({
                        "public constructor": constructor
                    }),
                    Derived = Super.extend(),
                    obj = new Derived();

                expect(constructor).to.have.been.calledOnce;
            });
        });
    });
});
