/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE.md for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="clock.ts" />
/// <reference path="renderer.ts" />
/// <reference path="vector_areal.ts" />

/// <reference path="game_object.ts" />
/// <reference path="game_object_apple.ts" />
/// <reference path="game_object_dragon.ts" />

// Game manages the dynamic objects
//
class Game {
  private renderer: Renderer;
  private clock: Clock;
  private isPaused: boolean;

  private objects: GameObject[];

  constructor( renderer: Renderer ) {
    this.renderer = renderer;
    this.clock    = new Clock();
    this.isPaused = false;

    this.objects = [
      new GameObjectDragon( renderer, new VectorAreal(0.0, 0.4, 0.05) )
    ];
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
    this.renderer.render();
  }

  // Make things move
  //
  private animate( dt: number ) {
    for( var i=0; i<this.objects.length; i++ ) {
      this.objects[i].animate(dt);
    }
  }
}
