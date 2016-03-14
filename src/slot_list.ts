/*
  Project: Golden
  Author:  Copyright (C) 2016, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

// Slot list provides object lookup with constant ID
// Empty slots are set to null and reused
//
// - Constant time lookup by ID
// - Constant time delete by ID
// - Linear time insert
//
class SlotList {
  private items: any[];

  // Copy initial list
  //
  constructor( init: any[] = [] ) {
    this.items = init.slice();
  }

  // Add new item
  //
  enlist( obj: any ): number
  {
    var isEnlisted = false;

    for( var id=0; id<this.items.length; id++ ) {
      if( !this.items[id] ) {
        this.items[id] = obj;
        isEnlisted = true;
        return id;
      }
    }

    if( !isEnlisted ) {
      this.items.push( obj );
      return this.items.length;
    }
  }

  // Remove an item
  //
  remove( id: number )
  {
    if( id >= this.items.length ) return null;
    this.items[id] = null;
  }

  // Get an item
  //
  get( id: number )
  {
    if( id >= this.items.length ) return null;
    return this.items[id];
  }

  // Iterate over items
  //
  each( action: (obj: any, id: number) => void )
  {
    for( var id=0; id<this.items.length; id++ ) {
      if( !this.items[id] ) continue;
      action( this.items[id], id );
    }
  }

  // Find object ID
  //
  find( obj: any ): number
  {
    for( var id=0; id<this.items.length; id++ ) {
      if( !this.items[id] ) continue;
      if( this.items[id] === obj ) return id;
    }
    return -1;
  }
}
