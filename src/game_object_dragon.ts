/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="vector.ts" />
/// <reference path="renderer.ts" />
/// <reference path="game_object.ts" />

// Dragon controlled by the player
//
class GameObjectDragon implements GameObject {
  private position: Vector;
  private velocity: Vector;
  
  private clickTarget: Vector;

  private renderer: Renderer;
  private id: number;
  private idClickTarget: number;

  constructor(renderer: Renderer, position: Vector = new Vector()) {
    this.position = position;
    this.velocity = new Vector();

    this.renderer = renderer;
    this.id = this.renderer.add( RendererObjectType.SPRITE, "arrow.png", this.position );
    this.idClickTarget = this.renderer.add( RendererObjectType.SPRITE, "circle.png", new Vector() );
    
    this.target( new Vector(0.0, -0.4) );

    window.addEventListener('click', (e) => {
      var clickPosition: Vector = new Vector(e.clientX, e.clientY);
      this.target( renderer.unproject(clickPosition) );
    });
  }
  
  private target(v: Vector) {
    this.clickTarget = v;
    this.renderer.position( this.idClickTarget, this.clickTarget );
    this.velocity = Vector.norm( Vector.minus(this.clickTarget, this.position) );
    this.renderer.rotation( this.id, Math.atan2(this.velocity.y, this.velocity.x) );
  }

  // Animate the dragon
  //
  animate(dt: number): void {
    this.position = Vector.plus( this.position, Vector.scale(this.velocity, dt*0.1) );
    this.renderer.position( this.id, this.position );
  }
}
