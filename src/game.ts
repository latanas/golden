/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE.md for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="clock.ts" />
/// <reference path="renderer.ts" />
/// <reference path="vector_areal.ts" />

/// <reference path="game_object_player.ts" />
/// <reference path="game_object_enemy.ts" />
/// <reference path="game_object_factory.ts" />

/// <reference path="slot_list.ts" />

// Game manages the dynamic objects
//
class Game {
  private renderer: Renderer;
  private clock: Clock;
  private isPaused: boolean;

  private objects: SlotList;

  constructor( renderer: Renderer ) {
    this.renderer = renderer;
    this.clock    = new Clock();
    this.isPaused = false;

    this.objects = new SlotList([
      new GameObjectFactory( renderer, GameObjectApple, 3, 3.0, 0.1 ),
      new GameObjectFactory( renderer, GameObjectEnemy, 3, 10.0, 0.03 ),
      new GameObjectPlayer( renderer, new VectorAreal(0.0, 0.4, 0.06) ),
    ]);
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
    this.renderer.animate(dt);

    this.objects.each( (obj: GameObject, id:number) => {

      if( !obj.isAlive() )
      {
        obj.remove();
        this.objects.remove(id);
        return;
      }

      obj.animate(dt);

      var pendingObjects: GameObject[] = obj.spawn();
      while( pendingObjects.length ) this.spawn( pendingObjects.pop() );

      if( obj.isPerceptive() ) this.perceive(obj, id);
    });
  }

  // Object perceives the world
  //
  perceive(obj: GameObject, id: number)
  {
    let pos: Vector = obj.getPosition();

    this.objects.each( (objPercept: GameObject, k:number) => {
      if( (id == k) || !objPercept ) return;

      let distance: number =
        Vector.minus( pos, objPercept.getNearestPosition(pos) ).distance();

      if( distance < obj.getPreceiveDistance() ) {
        obj.perceive( objPercept );
      }
    });
  }

  // Spawn a new object
  //
  spawn( obj: GameObject ) {
    this.objects.enlist(obj);
  }
}
