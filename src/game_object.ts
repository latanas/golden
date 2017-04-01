/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="vector_areal.ts" />
/// <reference path="renderer.ts" />

// Abstract game object
//
interface GameObject {
  animate( dt: number ): void;
  perceive( another: any ): void;
  spawn(): GameObject[];
  remove(): void;

  getPosition(): VectorAreal;
  getNearestPosition( position: Vector );
  getPreceiveDistance(): number;

  isAlive(): boolean;
  isPerceptive(): boolean;
}
