/*
  Project: Arena game
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE.md for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="../typings/globals/jasmine/index.d.ts" />
/// <reference path="../src/matrix.ts" />

describe("Matrix", () => {
  it("should construct identity matrix", () => {
    var m:Matrix = new Matrix();
    var v:Vector = new Vector(0.1, 2.3);

    m.transform(v);

    expect(v.x).toEqual(0.1);
    expect(v.y).toEqual(2.3);
  });

  it("should construct rotation matrix", () => {
    var m:Matrix = new Matrix();
    var v:Vector = null;

    v = new Vector(1.0, 0.0);
    m.rotation( Math.PI );
    m.transform(v);

    expect(v.x).toBeCloseTo(-1.0, 5);
    expect(v.y).toBeCloseTo(0.0, 5);

    v = new Vector(1.0, 0.0);
    m.rotation( Math.PI*0.5 );
    m.transform(v);

    expect(v.x).toBeCloseTo(0.0, 5);
    expect(v.y).toBeCloseTo(1.0, 5);

    v = new Vector(1.0, 0.0);
    m.rotation( Math.PI*(-0.5) );
    m.transform(v);

    expect(v.x).toBeCloseTo(0.0, 5);
    expect(v.y).toBeCloseTo(-1.0, 5);

    v = new Vector(1.0, 0.0);
    m.rotation( Math.PI*0.25 );
    m.transform(v);

    expect(v.x).toBeCloseTo( Math.cos(Math.PI*0.25), 5);
    expect(v.y).toBeCloseTo( Math.sin(Math.PI*0.25), 5);

    v = new Vector(Math.cos(Math.PI*0.1), Math.sin(Math.PI*0.1));
    m.rotation( Math.PI*0.1 );
    m.transform(v);

    expect(v.x).toBeCloseTo( Math.cos(Math.PI*0.2), 5);
    expect(v.y).toBeCloseTo( Math.sin(Math.PI*0.2), 5);
  });
});
