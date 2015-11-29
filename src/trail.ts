/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="vector.ts" />
/// <reference path="matrix.ts" />
/// <reference path="renderer.ts" />

// Trail consisting of one or more segments
//
class Trail {
  private size: number;
  private position: Vector;
  private velocity: Vector;

  private renderer: Renderer;
  private id: number;

  private next: Trail;

  constructor(renderer: Renderer, size: number, position: Vector = new Vector(), velocity: Vector = new Vector()) {
    this.size = size;
    this.position = position.copy();
    this.velocity = velocity.copy();

    this.renderer = renderer;
    this.id = this.renderer.add( RendererObjectType.SPRITE, "arrow.png", this.position );

    this.next = null;
  }

  // Append to trail
  //
  append() {
    if(this.next) {
      this.next.append();
    }
    else {
     this.next = new Trail( this.renderer, this.size, this.position, this.velocity );
    }
  }

  // Follow an object
  //
  follow( positionFollow: Vector, speedFollow: number, dt: number ): void {
    var distanceDelta = Vector.minus( positionFollow, this.position ).distance();
    var distanceAdjustedSpeed = speedFollow * (1.0 + (distanceDelta-this.size)*10.0 );

    this.velocity = Vector.norm( Vector.minus( positionFollow, this.position) );
    this.position = Vector.plus( this.position, Vector.scale(this.velocity, distanceAdjustedSpeed*dt) );

    this.renderer.position( this.id, this.position );
    this.renderer.rotation( this.id, this.velocity.angle() );

    // Propagate movement down the trail
    if( this.next ) this.next.follow( this.position, distanceAdjustedSpeed, dt );

  }
}
