/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="vector_areal.ts" />
/// <reference path="matrix.ts" />
/// <reference path="renderer.ts" />

// Linked list with the ability to propagate motion slowly to its elements.
//
class DynamicList {
  private position: VectorAreal;
  private velocity: Vector;

  private renderer: Renderer;
  private id: number;

  private next: DynamicList;
  private prev: DynamicList;


  constructor(renderer: Renderer, position: VectorAreal = new VectorAreal(), velocity: Vector = new Vector()) {
    this.position = position.copyAreal();
    this.velocity = velocity.copy();

    this.renderer = renderer;
    this.id = this.renderer.add( RendererObjectType.SPRITE, "arrow.png", this.position, this.position.areal );

    this.next = null;
    this.prev = null;
  }

  // Get element position
  //
  getPosition(): VectorAreal {
      return this.position;
  }

  // Get next element
  //
  getNext(n: number =1): DynamicList {
      if( n<=0 ) return this;

      var dl: DynamicList = this;

      while(n--) {
          if( !dl.next ) return dl;
          dl = dl.next;
      }
      return dl;
  }

  // Get previous element
  //
  getPrevious(n: number =1): DynamicList {
      if( n<=0 ) return this;

      var dl: DynamicList = this;

      while(n--) {
          if( !dl.prev ) return dl;
          dl = dl.prev;
      }
      return dl;
  }

  // Get nearest segment
  //
  getNearest( position: Vector ): DynamicList {
      var distanceNearest: number = Vector.minus(this.position, position).distance();

      var DynamicListNearest: DynamicList  = this;
      var DynamicListNext:    DynamicList  = this.next;

      while( DynamicListNext ) {
          var d: number = Vector.minus( DynamicListNext.position, position ).distance();

          if( d < distanceNearest ) {
              distanceNearest = d;
              DynamicListNearest = DynamicListNext;
          }
          DynamicListNext = DynamicListNext.next;
      }
      return DynamicListNearest;
  }

  // Append to DynamicList
  //
  append() {
    if(this.next) {
      this.next.append();
    }
    else {
     var p = Vector.minus( this.position, Vector.scale(this.velocity, this.position.areal) );
     this.next = new DynamicList( this.renderer, new VectorAreal(p.x, p.y, this.position.areal), this.velocity );
     this.next.prev = this;
    }
  }

  // Truncate the DynamicList
  //
  truncate() {
      var DynamicListNext: DynamicList = this.next;

      while( DynamicListNext ) {
          this.renderer.remove(DynamicListNext.id);
          DynamicListNext = DynamicListNext.next;
      }
      this.next = null;
  }

  // Follow an object
  //
  follow( positionFollow: Vector, speedFollow: number, dt: number ): void {
    var distanceDelta = Vector.minus( positionFollow, this.position ).distance();
    var distanceAdjustedSpeed = speedFollow * (1.0 + (distanceDelta-this.position.areal)*10.0 );

    this.velocity = Vector.norm( Vector.minus( positionFollow, this.position) );
    this.position.set( Vector.plus(this.position, Vector.scale(this.velocity, distanceAdjustedSpeed*dt)) );

    this.renderer.position( this.id, this.position );
    this.renderer.rotation( this.id, this.velocity.angle() );

    // Propagate movement down the DynamicList
    if( this.next ) this.next.follow( this.position, distanceAdjustedSpeed, dt );

  }
}
