/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="vector.ts" />
/// <reference path="matrix.ts" />

/// <reference path="renderer.ts" />
/// <reference path="trail.ts" />
/// <reference path="game_object.ts" />

// Dragon controlled by the player
//
class GameObjectDragon implements GameObject {
  private position: Vector;
  private velocity: Vector;

  private speedLinear: number;
  private speedTurn: number;

  private clickTarget: Vector;
  private clickTargetVelocity: Vector;

  private renderer: Renderer;
  private id: number;
  private idClickTarget: number;

  private rotMatrix: Matrix;

  private wiggle: number;
  private turn: number;
  private isTurning: boolean;

  private trail: Trail;

  constructor( renderer:Renderer, position:Vector =new Vector(), speedLinear:number =0.2, speedTurn:number =1.2 ) {
    this.position = position;
    this.velocity = new Vector(1.0, 0.0);
    this.clickTargetVelocity = new Vector(1.0, 0.0);

    this.speedLinear = speedLinear;
    this.speedTurn = speedTurn;

    this.rotMatrix = new Matrix();

    this.wiggle = 0.0;
    this.turn = this.speedTurn * 1.5;
    this.isTurning = false;

    this.renderer = renderer;
    this.id = this.renderer.add( RendererObjectType.SPRITE, "arrow.png", this.position );
    this.idClickTarget = this.renderer.add( RendererObjectType.SPRITE, "circle.png", new Vector() );

    this.target( new Vector(0.0, -0.2) );

    window.addEventListener('click', (e) => {
      var clickPosition: Vector = new Vector(e.clientX, e.clientY);
      this.target( renderer.unproject(clickPosition) );
    });

    this.trail = new Trail(renderer, 0.05, this.position, this.velocity);
    for(var i=0; i<5; i++) this.trail.append();
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

    // Target approached, choose rotation direction +1 or -1 each time
    var targetDistance = Vector.minus(this.position, this.clickTarget).distance();
    var turn = 0.0;

    if( targetDistance < 0.1 ) {
      if( !this.isTurning ) {
        this.isTurning = true;
        this.turn *= -1.0;
      }
      turn = this.turn;
    }
    else {
      this.isTurning = false;
    }

    // Wiggle and turn
    this.rotMatrix.rotation( Math.sin(this.wiggle)*targetDistance*0.8 + turn*dt );
    this.rotMatrix.transform( this.clickTargetVelocity );
    this.wiggle += dt*2.0;

    var angleDelta = this.clickTargetVelocity.angle() - this.velocity.angle();

    // Interpolate velocity vector (Note: lerp would cancel out speed)
    if( Math.abs(angleDelta) > dt ) {
      var angleDeltaRandomized = angleDelta;

      var direction = angleDeltaRandomized >= 0 ? +1:-1;
      if( direction*angleDeltaRandomized >= Math.PI ) direction *= -1;

      this.rotMatrix.rotation(direction*this.speedTurn*dt);
      this.rotMatrix.transform(this.velocity);
    }
    else {
      this.velocity = this.clickTargetVelocity.copy();
    }

    // Update position and rotation
    this.position = Vector.plus( this.position, Vector.scale(this.velocity, this.speedLinear*dt) );

    this.renderer.position( this.id, this.position );
    this.renderer.rotation( this.id, this.velocity.angle() );

    this.trail.follow(this.position, this.speedLinear, dt);
  }
}
