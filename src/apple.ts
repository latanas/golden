/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="vector.ts" />
/// <reference path="renderer.ts" />
/// <reference path="game_object.ts" />

// Apple consumed by the player's dragon
//
class Apple implements GameObject {
  public position: Vector;
  public velocity: Vector;

  private renderer: Renderer;
  private renderPosition: Vector;

  private id: number;
  private swing: number;

  constructor(renderer: Renderer, position: Vector = new Vector()) {
    this.position = position;
    this.velocity = new Vector();

    this.renderPosition = position.copy();
    this.swing = 0.0;

    this.renderer = renderer;
    this.id = this.renderer.add( this.position );
  }

  // Animate the apple
  //
  animate(dt: number): void {
    this.swing += dt * 2.0;
    this.position = Vector.plus( this.position, Vector.scale(this.velocity, dt) );

    this.renderPosition.set( this.position );
    this.renderPosition.y += Math.sin( this.swing )*0.05;

    this.renderer.position( this.id, this.renderPosition );

  }
}
