/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="vector.ts" />
/// <reference path="renderer.ts" />

// Abstract game object
//
interface GameObject {
  position: Vector;
  velocity: Vector;

  animate( dt: number ): void;
}
