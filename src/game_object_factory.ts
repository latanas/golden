/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="vector.ts" />
/// <reference path="vector_areal.ts" />
/// <reference path="renderer.ts" />

/// <reference path="game_object.ts" />
/// <reference path="game_object_consumable.ts" />

// Watch game objects and manufacture new ones as needed
//
class GameObjectFactory implements GameObject {
  private renderer: Renderer;
  private pending: GameObject[];

  private countConsumablesTarget: number;
  private countConsumables: number;

  private waitTimeMax: number;
  private waitTime: number;

  constructor(renderer: Renderer) {
    this.renderer = renderer;

    this.pending = [];

    this.countConsumablesTarget   = 3;
    this.countConsumables         = 0;

    this.waitTimeMax  = 5.0;
    this.waitTime     = 0.0;
  }

  private makeConsumable(): GameObject {
    var position = new VectorAreal( (Math.random()-0.5)*0.8, (Math.random()-0.5)*0.8, 0.05 );
    return new GameObjectConsumable( this.renderer, position );
  }

  private factory() {
    if( this.countConsumables < this.countConsumablesTarget  ) {
        this.pending.push( this.makeConsumable() );
    }
  }

  // Animate the factory
  //
  animate(dt: number): void {
    this.waitTime -= dt;

    if( this.waitTime <= 0 ) {
      this.waitTime = this.waitTimeMax;
      this.factory();
    }
    this.countConsumables = 0;
  }

  // Perceive objects
  //
  perceive( another: GameObject ): void {
    if( another instanceof GameObjectConsumable ) {
      this.countConsumables++;
    }
  }

  // Spawn new objects
  //
  spawn(): GameObject[] {
    var p = this.pending;
    this.pending = [];
    return p;
  }

  // Remove factory
  //
  remove(): void {}

  // Position at the centre of gameplay area, and percieve the entire area
  //
  getPosition(): Vector { return new Vector(); }
  getPreceiveDistance(): number { return 1.0; }

  // Always alive and perceiving
  //
  isAlive() { return true; }
  isPerceptive() { return true; }
}
