/*
  Project: Golden
  Author:  Copyright (C) 2017, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="vector_areal.ts" />
/// <reference path="matrix.ts" />
/// <reference path="renderer.ts" />

// Linked list with the ability to propagate velocity
//
abstract class DynamicList {
  protected position: VectorAreal;
  protected velocity: Vector;

  protected next: DynamicList;
  protected prev: DynamicList;
  protected branches: DynamicList[];

  protected renderer: Renderer;

  protected image: string;
  protected imageRatio: number;
  protected imageColor: number
  protected id: number;

  private static readonly destructionPropagationFactor = 0.8;

  private destructionRequested: boolean = false;
  private destructionTimeMax: number;
  private destructionTime: number;

  constructor( position: VectorAreal, velocity: Vector, renderer: Renderer,
               image: string, imageRatio: number, imageColor: number ) {

    this.position = position.copy();
    this.velocity = velocity.copy();

    this.renderer = renderer;
    this.image = image;
    this.imageRatio = imageRatio;
    this.imageColor = imageColor;

    this.next = null;
    this.prev = null;
    this.branches = new Array<DynamicList>();
  }

  // Make a copy
  //
  abstract copy(): DynamicList;

  // Get the element renderer identifer
  //
  getID(): number {
    return this.id;
  }

  // Get the element position
  //
  getPosition(): VectorAreal {
    return this.position;
  }

  // Get the element velocity
  //
  getVelocity(): Vector {
    return this.velocity;
  }

  // Get the element count
  //
  getCount() {
    let n: number = 1;
    let dl: DynamicList = this;

    while( dl.next ) {
      n++;
      dl = dl.next;
    }
    return n;
  }

  // Get the next element
  //
  getNext( n: number =1 ): DynamicList {
    if( n<=0 ) {
      return this;
    }
    let dl: DynamicList = this;

    while( n-- ) {
      if( !dl.next ) {
        return dl;
      }
      dl = dl.next;
    }
    return dl;
  }

  // Get the last element
  //
  getLast(): DynamicList {
    let dl: DynamicList = this;

    while( dl.next ) {
      dl = dl.next;
    }
    return dl;
  }

  // Get the previous element
  //
  getPrevious( n: number =1 ): DynamicList {
    if( n<=0 ) {
      return this;
    }
    let dl: DynamicList = this;

    while( n-- ) {
      if( !dl.prev ) {
        return dl;
      }
      dl = dl.prev;
    }
    return dl;
  }

  // Get the nearest segment
  //
  getNearest( position: Vector ): DynamicList {
    let distanceNearest: number = Vector.minus( this.position, position ).distance();
    let dlNearest: DynamicList = this;

    let dlNext: DynamicList = this.next;

    while( dlNext ) {
      let d: number = Vector.minus( dlNext.position, position ).distance();

      if( d < distanceNearest ) {
        distanceNearest = d;
        dlNearest = dlNext;
      }
      dlNext = dlNext.next;
    }
    return dlNearest;
  }

  // Get all branches at this segment
  //
  getBranches(): DynamicList[] {
    return this.branches;
  }

  // Ask if destruction has been requested
  //
  isDestructionRequested(): boolean {
    return this.destructionRequested;
  }

  // Append element at the end of the list
  //
  append( n: number, image: string, ratio: number ) {
    if( this.destructionRequested  || (n <= 0) ) {
      return;
    }

    if( this.next ) {
      this.next.append(n, image, ratio);
    }
    else {
      this.next = this.copy();
      this.next.prev = this;
      this.append(n-1, image, ratio);
    }
  }

  // Append branch at the current element
  //
  appendBranch( branch: DynamicList ) {
    if( this.destructionRequested ) {
      return;
    }
    branch.prev = this;
    this.branches.push(branch);
  }

  // Truncate the list at the current element
  //
  truncate() {
    let dl: DynamicList = this.next;

    while( dl ) {
      dl.truncateBranches();
      this.renderer.remove( dl.id, false );
      dl = dl.next;
    }
    this.next = null;
  }

  // Truncate all branches
  //
  truncateBranches() {
    for( let branch of this.branches ) {
      this.renderer.remove(branch.id, false);
    }
    this.branches = new Array<DynamicList>();
  }

  // Trigger animated destruction
  //
  animateDestruction( time: number ) {
    if( this.destructionRequested ) {
      return;
    }
    this.destructionRequested  = true;
    this.destructionTimeMax    = Math.max(0.1, time);
    this.destructionTime       = 0.0;

    if( this.next ) {
      this.next.animateDestruction( time * DynamicList.destructionPropagationFactor );
    }

    for( let branch of this.branches ) {
      branch.animateDestruction( time * DynamicList.destructionPropagationFactor );
    }
  }

  // Animate
  //
  animate( positionFollow: Vector, speedFollow: number, dt: number ): void {
    // Animate destruction propagation
    if( this.destructionRequested ) {
      this.destructionTime += dt;

      let scaleFactor =
        Math.max(0.001, (this.destructionTimeMax - this.destructionTime) / this.destructionTimeMax );

      this.position.areal *= scaleFactor;
      this.renderer.scale( this.id, this.position.areal );
    }

    // Animate movement propagation
    if( this.next != null ) {
      this.next.animate( this.position, speedFollow, dt );

      if( this.next.destructionRequested && (this.next.destructionTime >= this.next.destructionTimeMax) ) {
        this.truncate();
      }
    }

    for( let branch of this.branches ) {
      branch.animate( this.position, speedFollow, dt );
    }
  }
}