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

// The factory counts game objects of certain type, and creates new objects when needed.
//
class GameObjectFactory<T extends GameObject> implements GameObject {
  private factoryType: {new(r:Renderer, pos:VectorAreal): T};

  private renderer: Renderer;

  private countQuota: number;
  private countPresent: number;

  private waitTimeMax: number;
  private waitTime: number;

  private scale: number;

  private pending: GameObject[];

  // Create the factory with the type e.g. GameObjectApple or GameObjectEnemy
  //
  constructor( renderer: Renderer,
               factoryType: {new(r:Renderer, pos:VectorAreal): T},
               quota: number = 1, timing: number = 1, scale = 0.1 ) {

    this.renderer = renderer;
    this.factoryType = factoryType;

    this.pending = [];

    this.countQuota    = quota;
    this.countPresent  = 0;

    this.waitTimeMax  = timing;
    this.waitTime     = timing;

    this.scale = scale;
  }

  private createNewObject(): GameObject {
    let positionRandom: Vector = new Vector((Math.random()-0.5) * 0.8, (Math.random()-0.5) * 0.8);
    let positionSnap: Vector = this.renderer.grid().snap( positionRandom );
    return new this.factoryType( this.renderer, new VectorAreal(positionSnap.x, positionSnap.y, this.scale) );
  }

  // Animate the factory
  //
  animate(dt: number): void {
    this.waitTime -= dt;

    if( this.waitTime <= 0 ) {
      this.waitTime = this.waitTimeMax;

      if( this.countPresent < this.countQuota ) {
        this.pending.push( this.createNewObject() );
      }
    }
    this.countPresent = 0;
  }

  // Perceive objects
  //
  perceive( another: any ): void {
    let factoryTypeName = (<any> this.factoryType).name;

    if( factoryTypeName == another.constructor.name ) {
      this.countPresent++;
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
  getPosition(): VectorAreal { return new VectorAreal(); }
  getNearestPosition(): VectorAreal { return new VectorAreal(); }
  getPreceiveDistance(): number { return 1.0; }

  // Always alive and perceiving
  //
  isAlive() { return true; }
  isPerceptive() { return true; }
}
