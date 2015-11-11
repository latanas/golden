/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/
/// <reference path="vector.ts" />

// Transformation matrix for Vector
//
class Matrix {
  private m: number[];

  constructor() {
    this.m = [
      1, 0,
      0, 1
    ];
  }

  public set(m: number[]) {
    this.m = m;
  }

  public rotation(angle: number) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);

    this.m = [
      c, s,
      (-1)*s, c
    ];
  }

  public transform(v: Vector) {
    var x = v.x, y = v.y;
    v.x = x*this.m[0] + y*this.m[2];
    v.y = x*this.m[1] + y*this.m[3];
  }
}
