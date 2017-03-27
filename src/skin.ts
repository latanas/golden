/*
  Project: Golden
  Author:  Copyright (C) 2017, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="dynamic_list.ts" />
/// <reference path="vector_areal.ts" />

// Abstract interface of a creature's graphical skin
//
interface Skin {
    // Create new skin and store it as DynamicList
    create( position: VectorAreal, velocity: Vector, segments: number ): DynamicList;

    // Append segments to the skin
    append( list: DynamicList, segments: number );
}