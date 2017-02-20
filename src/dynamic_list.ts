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


  constructor(renderer: Renderer, position: VectorAreal =new VectorAreal(), velocity: Vector =new Vector()) {
    var v = Vector.minus( position, Vector.scale(velocity, position.areal) );

    this.position = new VectorAreal(v.x, v.y, position.areal);
    this.velocity = velocity.copy();
    this.renderer = renderer;

    this.id = this.renderer.add(
        RendererObjectType.SPRITE, "arrow.png",
        this.position, this.position.areal
    );

    this.next = null;
    this.prev = null;
  }

  // Get element position
  //
  getPosition(): VectorAreal {
      return this.position;
  }

  // Get element count
  //
  getCount() {
      var n:  number = 1;
      var dl: DynamicList = this;

      while( dl.next ) {
          n++;
          dl = dl.next;
      }
      return n;
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

  // Get last item
  //
  getLast(): DynamicList {
      var dl: DynamicList = this;

      while( dl.next ) {
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

      var dlNearest: DynamicList  = this;
      var dlNext:    DynamicList  = this.next;

      while( dlNext ) {
          var d: number = Vector.minus( dlNext.position, position ).distance();

          if( d < distanceNearest ) {
              distanceNearest  = d;
              dlNearest        = dlNext;
          }
          dlNext = dlNext.next;
      }
      return dlNearest;
  }

  // Append to DynamicList
  //
  append(n: number = 1) {
    if( n <= 0 ) return;

    if(this.next) {
      this.next.append(n);
    }
    else {
     this.next = new DynamicList( this.renderer, this.position, this.velocity );
     this.next.prev = this;
     this.append(n-1);
    }
  }

  // Truncate the DynamicList
  //
  truncate() {
      var dl: DynamicList = this.next;

      while( dl ) {
          this.renderer.remove(dl.id, false);
          dl = dl.next;
      }
      this.next = null;
  }

  // Follow an object
  //
  follow( positionFollow: Vector, speedFollow: number, dt: number ): void {
    var distanceDelta          = Vector.minus( positionFollow, this.position ).distance();
    var elasticitySpeed        = Math.max(-1.0, Math.min(1.0, distanceDelta-this.position.areal))*speedFollow*3.5;
    var distanceAdjustedSpeed  = speedFollow + elasticitySpeed;

    this.velocity = Vector.norm( Vector.minus( positionFollow, this.position) );
    this.position.set( Vector.plus(this.position, Vector.scale(this.velocity, distanceAdjustedSpeed*dt)) );

    this.renderer.position( this.id, this.position );
    this.renderer.rotation( this.id, this.velocity.angle() );

    // Propagate movement down the DynamicList
    if( this.next ) this.next.follow( this.position, distanceAdjustedSpeed, dt );
  }
}
