define([
    "vendor/chai/chai",
    "vendor/sinon/sinon",
    "js/Class",
    "js/Exception"
], function (
    chai,
    sinon,
    Class,
    Exception
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

        it("should throw an Exception if called without the 'new' keyword", function () {
            var Leaf = Class({});

            expect(function () {
                Leaf();
            }).to.throw(Exception);
        });

        describe("Class.prototype", function () {
            beforeEach(function () {
                Class.prototype.prop = 6;
            });

            afterEach(function () {
                delete Class.prototype.prop;
            });

            it("should be included in the prototype chain for Classes", function () {
                var LampPost = new Class();

                expect(new LampPost()).to.have.property("prop");
            });

            it("should throw an Exception if a non-Class instance or derivative is passed as prototype", function () {
                expect(function () {
                    var Tree = new Class("Tree", {}, {});
                }).to.throw(Exception);
            });
        });

        describe("public members", function () {
            it("should support defining a getter with 'get'", function () {
                var Planet = new Class({
                    "public constructor": function (diameterInKM) {
                        this.diameterInKM = diameterInKM;
                    },
                    "public get circumference": function () {
                        return Math.round(Math.PI * this.diameterInKM);
                    },
                    "private diameterInKM": null
                }),
                    earth = new Planet(12756.2);

                expect(earth.circumference).to.equal(40075);
            });

            it("should support defining a setter with 'set'", function () {
                var Planet = new Class({
                    "public getNumberOfInhabitants": function () {
                        return this.numberOfInhabitants;
                    },
                    "public set inhabitants": function (number) {
                        this.numberOfInhabitants = number;
                    },
                    "private numberOfInhabitants": null
                }),
                    neptune = new Planet();

                neptune.inhabitants = 27;

                expect(neptune.getNumberOfInhabitants()).to.equal(27);
            });

            it("should support defining a getter with 'get' and a setter with 'set' for the same member", function () {
                var Leaf = new Class({
                    "public get greenness": function () {
                        return this.greenness * 2;
                    },
                    "public set greenness": function (greenness) {
                        this.greenness = greenness;
                    },
                    "private greenness": 0
                }),
                    leaf = new Leaf();

                leaf.greenness = 20;

                expect(leaf.greenness).to.equal(40);
            });

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

                it("should be writable from privates object when default value is a number", function () {
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

                it("should be writable from privates object when default value is null", function () {
                    var privates,
                        Planet = new Class({
                            "public value": null,
                            "public getPrivates": function () {
                                privates = this;
                            }
                        }),
                        planet = new Planet();

                    planet.getPrivates();
                    privates.value = 9;

                    expect(planet.value).to.equal(9);
                });

                it("should not treat Classes as functions to wrap", function () {
                    var Cinema = new Class(),
                        Entertainment = new Class({
                            "public Cinema": Cinema
                        });

                    expect(new Entertainment().Cinema).to.equal(Cinema);
                });
            });

            describe("methods", function () {
                it("should be able to modify public members", function () {
                    var Planet = new Class({
                        "public addIt": function () {
                            this.oot = "and aboot";
                        },
                        "public oot": "side"
                    }),
                        world = new Planet();

                    world.addIt();

                    expect(world.oot).to.equal("and aboot");
                });

                it("should be able to modify protected members", function () {
                    var Planet = new Class({
                        "public addIt": function () {
                            this.prop = 72;

                            expect(this.prop).to.equal(72);
                        },
                        "protected prop": 0
                    });

                    new Planet().addIt();
                });

                it("should be able to modify private members", function () {
                    var Planet = new Class({
                        "public addIt": function () {
                            this.prop = 72;

                            expect(this.prop).to.equal(72);
                        },
                        "private prop": 0
                    });

                    new Planet().addIt();
                });
            });

            describe("readonly members", function () {
                it("should allow reading the value internally", function () {
                    var ReadMe = new Class({
                        "public getValue": function () {
                            return this.value;
                        },
                        "public readonly value": 6
                    });

                    expect(new ReadMe().getValue()).to.equal(6);
                });

                it("should allow reading the value externally", function () {
                    var ReadMe = new Class({
                        "public readonly value": 7
                    });

                    expect(new ReadMe().value).to.equal(7);
                });

                it("should not allow modifying the value internally", function () {
                    var ReadMe = new Class({
                        "public modifyIt": function () {
                            this.value = 4;
                        },
                        "public readonly value": 7
                    });

                    expect(function () {
                        new ReadMe().modifyIt();
                    }).to.throw(TypeError);
                });

                it("should not allow modifying the value externally", function () {
                    var ReadMe = new Class({
                        "public readonly value": 7
                    });

                    expect(function () {
                        new ReadMe().value = 6;
                    }).to.throw(TypeError);
                });

                it("should allow modifying the value in the constructor", function () {
                    var SetMeUp = new Class({
                        "public constructor": function (value) {
                            this.value = value;
                        },
                        "public readonly value": null
                    });

                    expect(function () {
                        var setMeUp = new SetMeUp("start");
                    }).to.not.throw();
                });
            });
        });

        describe("protected members", function () {
            describe("properties", function () {
                it("should be able to define a data descriptor", function () {
                    var World = new Class({
                        "protected descriptor iAmEnclosed": {
                            value: 7
                        },
                        "public testIt": function () {
                            expect(this.iAmEnclosed).to.equal(7);
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
                            expect(this.getMe).to.equal(21);
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
                            this.setMe = 27;
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

                it("should allow a property with name 'data' of implicit type data", function () {
                    var AntiInception = new Class({
                        "public data": 7
                    });

                    expect(new AntiInception().data).to.equal(7);
                });

                it("should allow a property with name 'descriptor' of implicit type data", function () {
                    var AntiInception = new Class({
                        "public descriptor": 7
                    });

                    expect(new AntiInception().descriptor).to.equal(7);
                });

                it("should allow a property with name 'length' of implicit type data", function () {
                    var AntiInception = new Class({
                        "public length": 7
                    });

                    expect(new AntiInception().length).to.equal(7);
                });

                it("should allow a property with name 'data' of explicit type data", function () {
                    var AntiInception = new Class({
                        "public data data": 7
                    });

                    expect(new AntiInception().data).to.equal(7);
                });

                it("should allow a property with name 'descriptor' of explicit type data", function () {
                    var AntiInception = new Class({
                        "public data descriptor": 7
                    });

                    expect(new AntiInception().descriptor).to.equal(7);
                });

                it("should allow a property with name 'length' of explicit type data", function () {
                    var AntiInception = new Class({
                        "public data length": 7
                    });

                    expect(new AntiInception().length).to.equal(7);
                });

                describe("when shadowing a public property with the same name", function () {
                    describe("for internal reads", function () {
                        it("should be used when default value is a number", function () {
                            var Fun = new Class({
                                "public value": 1,
                                "protected value": 2,
                                "public getValue": function () {
                                    return this.value;
                                }
                            });

                            expect(new Fun().getValue()).to.equal(2);
                        });

                        it("should be used when default value is null", function () {
                            var Fun = new Class({
                                "public value": 1,
                                "protected value": null,
                                "public getValue": function () {
                                    return this.value;
                                }
                            });

                            expect(new Fun().getValue()).to.equal(null);
                        });
                    });

                    describe("for internal writes", function () {
                        it("should be used when default value is a number", function () {
                            var Fun = new Class({
                                "public value": 1,
                                "protected value": 2,
                                "public getValue": function () {
                                    return this.value;
                                },
                                "public setValue": function (value) {
                                    this.value = value;
                                }
                            }),
                                fun = new Fun();

                            fun.setValue(8);
                            expect(fun.getValue()).to.equal(8);
                        });

                        it("should be used when default value is null", function () {
                            var Fun = new Class({
                                "public value": 1,
                                "protected value": null,
                                "public getValue": function () {
                                    return this.value;
                                },
                                "public setValue": function (value) {
                                    this.value = value;
                                }
                            }),
                                fun = new Fun();

                            fun.setValue(8);
                            expect(fun.getValue()).to.equal(8);
                        });

                        it("should prevent writes to public, shadowed property when default value is a number", function () {
                            var Fun = new Class({
                                "public value": 1,
                                "protected value": 2,
                                "public getValue": function () {
                                    return this.value;
                                },
                                "public setValue": function (value) {
                                    this.value = value;
                                }
                            }),
                                fun = new Fun();

                            fun.setValue(8);
                            expect(fun.value).to.equal(1);
                        });

                        it("should prevent writes to public, shadowed property when default value is null", function () {
                            var Fun = new Class({
                                "public value": 1,
                                "protected value": null,
                                "public getValue": function () {
                                    return this.value;
                                },
                                "public setValue": function (value) {
                                    this.value = value;
                                }
                            }),
                                fun = new Fun();

                            fun.setValue(8);
                            expect(fun.value).to.equal(1);
                        });
                    });
                });
            });

            describe("methods", function () {
                it("should be able to modify public members", function () {
                    var Planet = new Class({
                        "public addIt": function () {
                            this.addIt();
                        },
                        "public out": "and about",
                        "protected addIt": function () {
                            this.out = "and in";
                        }
                    }),
                        world = new Planet();

                    world.addIt();

                    expect(world.out).to.equal("and in");
                });

                it("should be able to modify protected members", function () {
                    var Planet = new Class({
                        "public addIt": function () {
                            this.addIt();

                            expect(this.prop).to.equal(72);
                        },
                        "protected addIt": function () {
                            this.prop = 72;
                        },
                        "protected prop": 2
                    });

                    new Planet().addIt();
                });

                it("should be able to modify private members", function () {
                    var Planet = new Class({
                        "public addIt": function () {
                            this.addIt();

                            expect(this.prop).to.equal(64);
                        },
                        "protected addIt": function () {
                            this.prop = 64;
                        },
                        "private prop": 2
                    });

                    new Planet().addIt();
                });
            });

            describe("readonly members", function () {
                it("should allow reading the value internally", function () {
                    var ReadMe = new Class({
                        "public getValue": function () {
                            return this.value;
                        },
                        "protected readonly value": 6
                    });

                    expect(new ReadMe().getValue()).to.equal(6);
                });

                it("should not allow modifying the value internally", function () {
                    var ReadMe = new Class({
                        "public modifyIt": function () {
                            this.value = 4;
                        },
                        "protected readonly value": 7
                    });

                    expect(function () {
                        new ReadMe().modifyIt();
                    }).to.throw(TypeError);
                });

                it("should allow modifying the value in the constructor", function () {
                    var SetMeUp = new Class({
                        "public constructor": function (value) {
                            this.value = value;
                        },
                        "protected readonly value": null
                    });

                    expect(function () {
                        var setMeUp = new SetMeUp("start");
                    }).to.not.throw();
                });
            });
        });

        describe("private members", function () {
            describe("properties", function () {
                it("should be able to define a data descriptor", function () {
                    var World = new Class({
                        "public testIt": function () {
                            expect(this.iAmEnclosed).to.equal(7);
                        },
                        "private descriptor iAmEnclosed": {
                            value: 7
                        }
                    });

                    new World().testIt();
                });

                it("should be able to define an accessor descriptor with just a getter", function () {
                    var World = new Class({
                        "public testIt": function () {
                            expect(this.getMe).to.equal(21);
                        },
                        "private descriptor getMe": {
                            get: function () {
                                return 21;
                            }
                        }
                    });

                    new World().testIt();
                });

                it("should be able to define an accessor descriptor with just a setter", function () {
                    var World = new Class({
                        "public testIt": function () {
                            this.setMe = 27;
                            expect(this.hidden).to.equal(27);
                        },
                        "private descriptor setMe": {
                            set: function (value) {
                                this.hidden = value;
                            }
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
                it("should be able to modify public members", function () {
                    var Planet = new Class({
                        "public addIt": function () {
                            this.addIt();
                        },
                        "public oot": "side",
                        "private addIt": function () {
                            this.oot = "and aboot";
                        }
                    }),
                        world = new Planet();

                    world.addIt();

                    expect(world.oot).to.equal("and aboot");
                });

                it("should be able to modify protected members", function () {
                    var Planet = new Class({
                        "public addIt": function () {
                            this.addIt();

                            expect(this.prop).to.equal(72);
                        },
                        "protected prop": 0,
                        "private addIt": function () {
                            this.prop = 72;
                        }
                    });

                    new Planet().addIt();
                });

                it("should be able to modify private members", function () {
                    var Planet = new Class({
                        "public addIt": function () {
                            this.addIt();

                            expect(this.prop).to.equal(77);
                        },
                        "private addIt": function () {
                            this.prop = 77;
                        },
                        "private prop": 0
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
            describe("with one parent", function () {
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

                describe("public members", function () {

                });

                describe("protected members", function () {
                    describe("properties", function () {
                        describe("data", function () {
                            describe("when there is a public property with the same name", function () {
                                it("should shadow public property when read from parent class", function () {
                                    var Parent = new Class({
                                        "public data value": 1,
                                        "public getValue": function () {
                                            return this.value;
                                        }
                                    }),
                                        Child = Parent.extend({
                                            "protected data value": 2
                                        });

                                    expect(new Child().getValue()).to.equal(2);
                                });

                                it("should shadow public property when read from derived class", function () {
                                    var Parent = new Class({
                                        "public data value": 1
                                    }),
                                        Child = Parent.extend({
                                            "protected data value": 2,
                                            "public getValue": function () {
                                                return this.value;
                                            }
                                        });

                                    expect(new Child().getValue()).to.equal(2);
                                });
                            });
                        });

                        describe("descriptor", function () {
                            describe("when there is a public property with the same name", function () {
                                it("should shadow public property when read from parent class", function () {
                                    var Parent = new Class({
                                        "public descriptor value": { get: function () { return 1; } },
                                        "public getValue": function () {
                                            return this.value;
                                        }
                                    }),
                                        Child = Parent.extend({
                                            "protected descriptor value": { get: function () { return 2; } }
                                        });

                                    expect(new Child().getValue()).to.equal(2);
                                });

                                it("should shadow public property when read from derived class", function () {
                                    var Parent = new Class({
                                        "public descriptor value": { get: function () { return 1; } }
                                    }),
                                        Child = Parent.extend({
                                            "protected descriptor value": { get: function () { return 2; } },
                                            "public getValue": function () {
                                                return this.value;
                                            }
                                        });

                                    expect(new Child().getValue()).to.equal(2);
                                });
                            });
                        });
                    });
                });

                describe("private members", function () {
                    describe("properties", function () {
                        describe("data", function () {
                            describe("when there is a public property with the same name", function () {
                                it("should shadow public property when read from parent class", function () {
                                    var Parent = new Class({
                                        "public data value": 1,
                                        "public getValue": function () {
                                            return this.value;
                                        }
                                    }),
                                        Child = Parent.extend({
                                            "private data value": 2
                                        });

                                    expect(new Child().getValue()).to.equal(2);
                                });

                                it("should shadow public property when read from derived class", function () {
                                    var Parent = new Class({
                                        "public data value": 1
                                    }),
                                        Child = Parent.extend({
                                            "private data value": 2,
                                            "public getValue": function () {
                                                return this.value;
                                            }
                                        });

                                    expect(new Child().getValue()).to.equal(2);
                                });
                            });
                        });

                        describe("descriptor", function () {
                            describe("when there is a public property with the same name", function () {
                                it("should shadow public property when read from parent class", function () {
                                    var Parent = new Class({
                                        "public descriptor value": { get: function () { return 1; } },
                                        "public getValue": function () {
                                            return this.value;
                                        }
                                    }),
                                        Child = Parent.extend({
                                            "private descriptor value": { get: function () { return 2; } }
                                        });

                                    expect(new Child().getValue()).to.equal(2);
                                });

                                it("should shadow public property when read from derived class", function () {
                                    var Parent = new Class({
                                        "public descriptor value": { get: function () { return 1; } }
                                    }),
                                        Child = Parent.extend({
                                            "private descriptor value": { get: function () { return 2; } },
                                            "public getValue": function () {
                                                return this.value;
                                            }
                                        });

                                    expect(new Child().getValue()).to.equal(2);
                                });
                            });
                        });
                    });
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

            describe("with two parents", function () {
                it("should create objects that are instances of that class", function () {
                    var Short = new Class(),
                        Medium = Short.extend(),
                        Long = Medium.extend();

                    expect(new Long()).to.be.an.instanceOf(Long);
                });

                it("should create objects that are instances of the parent class", function () {
                    var Short = new Class(),
                        Medium = Short.extend(),
                        Long = Medium.extend();

                    expect(new Long()).to.be.an.instanceOf(Medium);
                });

                it("should create objects that are instances of the parent's parent class", function () {
                    var Short = new Class(),
                        Medium = Short.extend(),
                        Long = Medium.extend();

                    expect(new Long()).to.be.an.instanceOf(Short);
                });

                it("should not be the same as the class being extended", function () {
                    var Short = new Class(),
                        Medium = Short.extend(),
                        Long = Medium.extend();

                    expect(Long).to.not.equal(Medium);
                });

                it("should not be the same as the parent of the class being extended", function () {
                    var Short = new Class(),
                        Medium = Short.extend(),
                        Long = Medium.extend();

                    expect(Long).to.not.equal(Short);
                });

                describe("protected members", function () {
                    describe("properties", function () {
                        describe("data", function () {
                            describe("when there is a public property with the same name", function () {
                                it("should shadow public property when read from parent class");

                                it("should shadow public property when read from derived class");
                            });
                        });

                        describe("descriptor", function () {
                            describe("when there is a public property with the same name", function () {
                                it("should not attempt to redefine the same property twice", function () {
                                    var DocumentFragment = new Class({
                                        "protected nodeName": "#documentFragment"
                                    }),
                                        Document = DocumentFragment.extend({
                                            "public createElement": function () {}
                                        });

                                    expect(function () {
                                        new Document().createElement();
                                        new Document();
                                        new Document();
                                    }).to.not.throw();
                                });

                                it("should shadow public property when read from parent class");

                                it("should shadow public property when read from derived class");
                            });
                        });
                    });
                });
            });
        });
    });
});
