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
    protected velocity;

    protected renderer: Renderer;
    protected image: string;
    protected imageRatio: number;
    protected id: number;

    protected next: DynamicList;
    protected prev: DynamicList;
    protected branches: DynamicList[];

    constructor(position: VectorAreal, velocity: Vector, renderer: Renderer, image: string, imageRatio: number) {
        this.position = position.copy();
        this.velocity = velocity.copy();

        this.renderer = renderer;
        this.image = image;
        this.imageRatio = imageRatio;

        this.next = null;
        this.prev = null;
        this.branches = new Array<DynamicList>();
    }

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
        var n:  number = 1;
        var dl: DynamicList = this;

        while( dl.next ) {
            n++;
            dl = dl.next;
        }
        return n;
    }

    // Get the next element
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

    // Get the last element
    //
    getLast(): DynamicList {
        var dl: DynamicList = this;

        while( dl.next ) {
            dl = dl.next;
        }
        return dl;
    }

    // Get the previous element
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

    // Get the nearest segment
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

    // Get all branches at this segment
    //
    getBranches(): DynamicList[] {
        return this.branches;
    }

    // Append to the end of the DynamicList
    //
    append(n: number, image: string, ratio: number) {
        if( n <= 0 ) return;

        if(this.next) {
            this.next.append(n, image, ratio);
        }
        else {
            this.next = this.copy();
            this.next.prev = this;
            this.append(n-1, image, ratio);
        }
    }

    // Append a branch
    //
    appendBranch(branch: DynamicList) {
        branch.prev = this;
        this.branches.push(branch);
    }

    // Truncate the DynamicList
    //
    truncate() {
        let dl: DynamicList = this.next;

        while( dl ) {
            for( let branch of dl.getBranches() ) {
                this.renderer.remove(branch.id, false);
            }
            this.renderer.remove(dl.id, false);
            dl = dl.next;
        }
        this.next = null;
    }

    // Truncate the branches
    //
    truncateBranches() {
        for( let branch of this.branches ) {
            this.renderer.remove(branch.id, false);
        }
        this.branches = new Array<DynamicList>();
    }

    // Make a copy
    abstract copy(): DynamicList;

    // Follow an object
    abstract follow( positionFollow: Vector, speedFollow: number, dt: number ): void;
}