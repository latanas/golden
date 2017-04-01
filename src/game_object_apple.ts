/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/


/// <reference path="game_object.ts" />
/// <reference path="consumable.ts" />

/// <reference path="vector.ts" />
/// <reference path="renderer.ts" />

// Apples are consumable by the player's dragon (and also by enemy creatures).
//
class GameObjectApple implements GameObject, Consumable {
  private position: VectorAreal;
  private velocity: Vector;

  private renderer: Renderer;
  private static readonly rendererImageFile: string = "apple.png";
  private static readonly rendererImageRatio : number = 1.0;

  private id: number;
  private swing: number;

  private value: number;

  constructor( renderer: Renderer,
               position: VectorAreal  = new VectorAreal(0.0, 0.0, 0.006),
               value:    number       = 1.0)
  {
    this.position = position;
    this.velocity = new Vector();

    this.swing = Math.random()*Math.PI;

    this.renderer = renderer;
    this.id = this.renderer.add(
      RendererObjectType.SPRITE,
      GameObjectApple.rendererImageFile,
      0xffffff,
      this.position,
      position.areal * GameObjectApple.rendererImageRatio * 0.7,
      position.areal * 0.7
    );

    this.value = value;
  }

  // Animate the apple
  //
  animate(dt: number): void {
    this.swing += dt * 3.0;
    this.position.x += this.velocity.x*dt;
    this.position.y += this.velocity.x*dt + Math.sin( this.swing )*0.001;

    this.renderer.position( this.id, this.position );
  }

  // Perceive nothing
  //
  perceive( another: GameObject ): void {}

  // Consume
  //
  consume(): number {
    var v = this.value;
    this.value = 0;
    return v;
  }

  // Spawn new objects
  //
  spawn(): GameObject[] {
    return [];
  }

  // Remove the consumable
  //
  remove(): void {
    this.renderer.remove(this.id, true);
  }

  // Get position
  //
  getPosition(): VectorAreal {
    return this.position;
  }

  // Get nearest position
  //
  getNearestPosition( position: Vector ): VectorAreal {
    return this.position;
  }

  // Get perceive distance
  //
  getPreceiveDistance(): number {
    return 0.0;
  }

  // Is object alive
  //
  isAlive() {
    return this.value > 0;
  }

  // Is object perceiving
  //
  isPerceptive() {
    return false;
  }
}
