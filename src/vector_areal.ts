/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="vector.ts" />

// Vector with area of effect
//
class VectorAreal extends Vector {
    public areal;

    constructor(x:number =0.0, y:number =0.0, areal =1.0) {
        super(x,y);
        this.areal = areal;
    }

    public copyAreal(): VectorAreal {
        return new VectorAreal(this.x, this.y, this.areal);
    }

    isIntersected(v: VectorAreal): boolean {
        return Vector.minus(this, v).distance() < this.areal + v.areal;
    }
}