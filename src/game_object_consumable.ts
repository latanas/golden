/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="vector.ts" />
/// <reference path="renderer.ts" />
/// <reference path="game_object.ts" />

// Object consumable by the player's dragon
//
class GameObjectConsumable implements GameObject {
  private position: Vector;
  private velocity: Vector;

  private renderer: Renderer;

  private id: number;
  private swing: number;

  private value: number;

  constructor(renderer: Renderer, position: Vector = new Vector(), value: number =1.0) {
    this.position = position;
    this.velocity = new Vector();

    this.swing = Math.random()*Math.PI;

    this.renderer = renderer;
    this.id = this.renderer.add( RendererObjectType.MODEL, "apple.json", this.position, 0.03 );

    this.value = value;
  }

  // Animate the consumable
  //
  animate(dt: number): void {
    this.swing += dt * 3.0;
    this.position = Vector.plus( this.position, Vector.scale(this.velocity, dt) );
    this.position.y += Math.sin( this.swing )*0.001;

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
    this.renderer.remove(this.id);
  }

  // Get position
  //
  getPosition(): Vector {
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
