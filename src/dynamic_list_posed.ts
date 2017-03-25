/*
  Project: Golden
  Author:  Copyright (C) 2017, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="dynamic_list.ts" />
/// <reference path="vector_areal.ts" />
/// <reference path="matrix.ts" />

// Posed dynamic list
//
// This type of list keeps elements at fixed distance to each other
// and the element's pose is transformed (translated and rotated) to follow the parent.
//
class DynamicListPosed extends DynamicList {
  private pose: Vector;
  private rot: Matrix = new Matrix();

  constructor( position: VectorAreal, pose: Vector, renderer: Renderer, image: string, imageRatio: number ) {
      super(position, new Vector(), renderer, image, imageRatio);
      this.pose = pose.copy();
  }

  copy(): DynamicList {
    return new DynamicListPosed(
      this.position, this.pose, this.renderer, this.image, this.imageRatio);
  }

  follow( positionFollow: Vector, speedFollow: number, dt: number ): void {
    if( !this.getPrevious() ) {
      console.log("Posed element needs a parent to follow.")
      return;
    }
    this.velocity.set( this.getPrevious().getVelocity() );

    let transformedPose: Vector = this.pose.copy();

    this.rot.rotation( this.velocity.angle() );
    this.rot.transform( transformedPose );

    this.position.set( Vector.plus(positionFollow, transformedPose) );

    this.renderer.position( this.id, this.position );
    this.renderer.rotation( this.id, this.velocity.angle() );

    // Propagate movement down the DynamicList
    if( this.getCount() > 1 ) {
        this.getNext().follow( this.position, speedFollow, dt );
    }
  }
}