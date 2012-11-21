OrangeJS
========

General toolkit for JavaScript. General like Orange Juice.

Creating a Tree class
---------------------

```javascript
define([
    "orange"
], function (
    OrangeJS
) {
    "use strict";

    // It is recommended, but not necessary,
    // that you specify the name of your class as the first argument
    var Tree = new OrangeJS.Class("Tree", {
        "public readonly quality": "unknown"
    });

    return Tree;
});
```

Creating an Oak class by extending Tree
---------------------------------------

```javascript
// ...
var Tree = new OrangeJS.Class("Tree", {
    "public readonly quality": "unknown"
}),
    Oak = Tree.extend({
        "public readonly quality": "high"
    });
// ...
```

Instantiating a Car class
-------------------------

```javascript
// ...
var Car = new OrangeJS.Class("Car"),
    car = new Car();
// ...
```

Defining a constructor
----------------------

OrangeJS' Class system should remove the need for constructors in many circumstances,
but constructors may still be defined as follows:

```javascript
// ...
var Car = new OrangeJS.Class("Car", {
    "public constructor": function (mileage) {
        this.mileage = mileage;
    },
    // Note: Readonly members are actually writable inside the constructor,
    //       so they may be initialized
    "private readonly mileage": null
}),
    car = new Car(3000);

console.log(car.mileage); // Prints "3000" to the console
car.mileage = 2000;       // No, you may not clock your car: throws an Exception
// ...
```

Defining readonly members
-------------------------

```javascript
// ...
var Car = new OrangeJS.Class("Car", {
    "public constructor": function (licensePlate) {
        this.licensePlate = licensePlate;
    },
    "public readonly licensePlate": null
}),
    car = new Car("0RAN G3");

console.log(car.licensePlate); // Prints "0RAN G3" to the console
car.licensePlate = 2000;       // Nobody can change your registration: throws an Exception
// ...
```

See "Defining a constructor" for another example.
