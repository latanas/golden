/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="vector.ts" />
/// <reference path="matrix.ts" />

/// <reference path="renderer.ts" />
/// <reference path="game_object.ts" />

// Dragon controlled by the player
//
class GameObjectDragon implements GameObject {
  private position: Vector;
  private velocity: Vector;

  private clickTarget: Vector;
  private clickTargetVelocity: Vector;

  private renderer: Renderer;
  private id: number;
  private idClickTarget: number;

  private rotMatrix: Matrix;
  private wiggle: number;

  constructor(renderer: Renderer, position: Vector = new Vector()) {
    this.position = position;
    this.velocity = new Vector(1.0, 0.0);
    this.clickTargetVelocity = new Vector(1.0, 0.0);

    this.rotMatrix = new Matrix();
    this.wiggle = 0;

    this.renderer = renderer;
    this.id = this.renderer.add( RendererObjectType.SPRITE, "arrow.png", this.position );
    this.idClickTarget = this.renderer.add( RendererObjectType.SPRITE, "circle.png", new Vector() );

    this.target( new Vector(0.0, -0.3) );

    window.addEventListener('click', (e) => {
      var clickPosition: Vector = new Vector(e.clientX, e.clientY);
      this.target( renderer.unproject(clickPosition) );
    });
  }

  // Target waypoint
  //
  private target(v: Vector) {
    this.clickTarget = v;
    this.renderer.position( this.idClickTarget, this.clickTarget );
  }

  // Animate the dragon
  //
  animate(dt: number): void {
    // Compute velocity to reach the target
    this.clickTargetVelocity = Vector.norm( Vector.minus(this.clickTarget, this.position) );

    // As the dragon moves it wiggles
    var wiggleAmount = Vector.minus(this.position, this.clickTarget).distance()*0.8;
    this.rotMatrix.rotation( Math.sin(this.wiggle)*wiggleAmount );
    this.rotMatrix.transform( this.clickTargetVelocity );
    this.wiggle += dt*1.0;

    var angleDelta = this.clickTargetVelocity.angle() - this.velocity.angle();

    // Interpolate velocity vector (Note: lerp would cancel out speed)
    if( Math.abs(angleDelta) > dt ) {
      var direction = angleDelta >= 0 ? +1:-1;
      if( direction*angleDelta >= Math.PI ) direction *= -1;

      this.rotMatrix.rotation(direction*dt);
      this.rotMatrix.transform(this.velocity);
    }
    else {
      this.velocity = this.clickTargetVelocity.copy();
    }

    // Update position and rotation
    this.position = Vector.plus( this.position, Vector.scale(this.velocity, dt*0.1) );
    this.renderer.position( this.id, this.position );
    this.renderer.rotation( this.id, this.velocity.angle() );
  }
}
