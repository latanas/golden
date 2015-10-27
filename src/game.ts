/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE.md for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="vector.ts" />
/// <reference path="clock.ts" />
/// <reference path="renderer.ts" />

/// <reference path="game_object.ts" />
/// <reference path="apple.ts" />

// Game manages the dynamic objects
//
class Game {
  private renderer: Renderer;
  private clock: Clock;
  private isPaused: boolean;

  private objects: GameObject[];
  private clickTarget: Vector;

  constructor( renderer: Renderer ) {
    this.renderer = renderer;
    this.clock    = new Clock();
    this.isPaused = false;

    this.objects = [
      new Apple( renderer )
    ];

    this.clickTarget = new Vector();

    window.addEventListener('click', (e) => {
      this.clickTarget = renderer.unproject( new Vector(e.clientX, e.clientY) );
    });
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
    this.objects[0].position = this.clickTarget;
  }
}
