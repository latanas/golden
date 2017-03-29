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

  private angularSpeed: number; // Rad per second
  private angle: number = null;

  private imageType: number;

  constructor( position: VectorAreal, pose: Vector, angularSpeed: number,
               renderer: Renderer, image: string, imageRatio: number,
               imageType: RendererObjectType, imageColor: number ) {

      super( position, new Vector(), renderer, image, imageRatio, imageColor );
      this.angularSpeed = angularSpeed;
      this.pose = pose.copy();
      this.imageType = imageType;

      this.id = this.renderer.add(
            imageType, image, imageColor,
            this.position, this.position.areal * imageRatio, this.position.areal );
  }

  copy(): DynamicList {
    return new DynamicListPosed(
      this.position, this.pose, this.angularSpeed,
      this.renderer, this.image, this.imageRatio, this.imageType, this.imageColor );
  }

  follow( positionFollow: Vector, speedFollow: number, dt: number ): void {
    if( !this.getPrevious() ) {
      console.log("Posed element needs a parent to follow.")
      return;
    }
    this.velocity.set( this.getPrevious().getVelocity() );

    if( this.angle == null ) {
      this.angle = this.velocity.angle();
    }
    else {
      let angleDelta: number = (this.velocity.angle() - this.angle);
      let angleSign: number = angleDelta>=0? +1:-1;

      // If the angle happens to be obtuse, we don't want to animate it the "long way",
      // so just add 2 * Pi to make it sharp
      if( angleSign*angleDelta >= Math.PI ) {
        this.angle += angleSign*Math.PI*2;
        angleDelta -= angleSign*Math.PI*2;
      }
      this.angle = this.angle + angleDelta * this.angularSpeed * dt

      this.rot.rotation( -1.0*angleDelta );
      this.rot.transform( this.velocity );
    }
    let transformedPose: Vector = this.pose.copy();

    this.rot.rotation( this.angle );
    this.rot.transform( transformedPose );

    this.position.set( Vector.plus(positionFollow, transformedPose) );

    this.renderer.position( this.id, this.position );
    this.renderer.rotation( this.id, this.angle );

    // Propagate movement down the DynamicList
    if( this.getCount() > 1 ) {
        this.getNext().follow( this.position, speedFollow, dt );
    }
    for( let branch of this.branches ) {
      branch.follow( this.position, speedFollow, dt );
    }
  }
}