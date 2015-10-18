/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE.md for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="vector.ts" />
/// <reference path="clock.ts" />

// Game initializes and manages dynamic objects
//
class Game{
  private clock: Clock;
  private isPaused: boolean;

  constructor() {
    this.clock    = new Clock();
    this.isPaused = false;
  }

  // Single action frame of the game
  //
  actionFrame = () => {
    var dt = this.clock.tick();

    if( !this.isPaused ) {
      this.render();
      this.animate(dt);
    }
    window.requestAnimationFrame( this.actionFrame );
  }

  // Make a picture
  //
  private render() {
  }

  // Make things move
  //
  private animate(dt: number) {
  }
}
