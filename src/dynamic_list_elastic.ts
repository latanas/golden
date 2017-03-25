/*
  Project: Golden
  Author:  Copyright (C) 2017, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="dynamic_list.ts" />
/// <reference path="vector_areal.ts" />
/// <reference path="matrix.ts" />
/// <reference path="renderer.ts" />

// Elastic dynamic list
//
// This type of list will extend as the velocity increases,
// and shrink as the velocity decreases.
//
class DynamicListElastic extends DynamicList {
    constructor(position: VectorAreal, velocity: Vector, renderer: Renderer, image: string, imageRatio: number) {
        super(position, velocity, renderer, image, imageRatio);

        let v: Vector = Vector.minus( position, Vector.scale(velocity, position.areal) );

        this.position = new VectorAreal(v.x, v.y, position.areal);
        this.velocity = velocity.copy();
    }

    copy(): DynamicList {
        return new DynamicListElastic(
            this.position, this.velocity, this.renderer, this.image, this.imageRatio);
    }

    follow( positionFollow: Vector, speedFollow: number, dt: number ): void {
        let distanceDelta          = Vector.minus( positionFollow, this.position ).distance();
        let elasticitySpeed        = Math.max(-1.0, Math.min(1.0, distanceDelta-this.position.areal))*speedFollow*3.5;
        let distanceAdjustedSpeed  = speedFollow + elasticitySpeed;

        this.velocity = Vector.norm( Vector.minus( positionFollow, this.position) );
        this.position.set( Vector.plus(this.position, Vector.scale(this.velocity, distanceAdjustedSpeed*dt)) );

        this.renderer.position( this.id, this.position );
        this.renderer.rotation( this.id, this.velocity.angle() );

        // Propagate movement down the DynamicList
        if( this.next ) {
            this.next.follow( this.position, distanceAdjustedSpeed, dt );
        }

        // Propagate movement to branches
        for( let branch of this.branches ) {
            branch.follow( this.position, distanceAdjustedSpeed, dt );
        }
    }
}
