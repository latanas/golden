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
/// <reference path="game_object_consumable.ts" />
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
      new GameObjectDragon( renderer, new VectorAreal(0.0, 0.4, 0.05) ),
      new GameObjectConsumable( renderer, new VectorAreal(0.0, 0.0, 0.05) ),
      new GameObjectConsumable( renderer, new VectorAreal(+0.3, 0.0, 0.05) ),
      new GameObjectConsumable( renderer, new VectorAreal(-0.3, 0.0, 0.05) )
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
      if( !this.objects[i] ) continue;

      if( !this.objects[i].isAlive() ) {
        this.objects[i].remove();
        this.objects[i] = null;
        continue;
      }

      var obj = this.objects[i];
      obj.animate(dt);

      if( !obj.isPerceptive() ) continue;
      var pos: Vector = obj.getPosition();

      for( var j=0; j<this.objects.length; j++ ) {
        var objPercept = this.objects[j];
        if( (i == j) || !objPercept ) continue;

        var d: number = Vector.minus( pos, objPercept.getPosition() ).distance();
        if( d < obj.getPreceiveDistance() ) obj.perceive( objPercept );
      }
    }
  }
}
