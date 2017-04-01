/*
  Project: Golden
  Author:  Copyright (C) 2017, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="vector.ts" />

enum GridSnapType {
  TOP_LEFT, CENTER
}

class Grid {
  private dimension: Vector;

  constructor(dimension: Vector) {
    this.dimension = dimension;
  }

  // Snap vector coordinates to the grid
  //
  snap( vector: Vector, snapTo: GridSnapType = GridSnapType.TOP_LEFT ): Vector {
    let pos: Vector = this.getWorldPosition( this.getGridIndex(vector) );

    switch( snapTo ) {
      case GridSnapType.CENTER:
        return Vector.plus( pos, new Vector(this.dimension.x*0.5, this.dimension.y*0.5) );
    }
    return pos;
  }

  // Get the grid dimension
  //
  getDimension(): Vector {
    return this.dimension;
  }

  // Convert grid index to world coordinates
  //
  getWorldPosition( index: Vector ): Vector {
    return new Vector(index.x * this.dimension.x, index.y * this.dimension.y);
  }

  //Convert world coordinates to grid index
  //
  getGridIndex( position: Vector ): Vector {
    return new Vector( Grid.toIndex(position.x, this.dimension.x), Grid.toIndex(position.y, this.dimension.y) );
  }

  // Snap coordinate to the grid
  //
  private static toIndex( c: number, d: number ): number {
    return Math.round( c / d );
  }
}