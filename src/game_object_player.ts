/*
  Project: Golden
  Author:  Copyright (C) 2016, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="game_object_creature.ts" />

// Creature controlled by the player
//
class GameObjectPlayer extends GameObjectCreature {

  private idMoveTarget: number;

  constructor( renderer:    Renderer,
               position:    VectorAreal  = new VectorAreal(0.0, 0.0, 0.02),
               speedLinear: number       = 0.2,
               speedTurn:   number       = 1.5 )
  {
    super( renderer, position, speedLinear, speedTurn );

    this.idMoveTarget = this.renderer.add(
        RendererObjectType.SPRITE, "circle.png",
        new Vector(), 0.05, 0.05
    );

    this.target( new Vector() );

    window.addEventListener('click', (e) => {
      var clickPosition: Vector = new Vector(e.clientX, e.clientY);
      this.target( renderer.unproject(clickPosition) );
    });
  }

  // Set the movement target
  //
  private target(v: Vector) {
    this.moveTarget = v;
    this.renderer.position( this.idMoveTarget, this.moveTarget );
  }

  // Animate the player
  //
  animate(dt: number): void {
    super.animate(dt);
  }

  // Remove the player
  //
  remove(): void {
    super.remove();
    this.renderer.remove(this.idMoveTarget, true);
  }

  // Perceive another object
  //
  perceive( another: GameObject ): void {
    if( another instanceof GameObjectConsumable ) {
      this.eat(<GameObjectConsumable> another);
    }
  }

  // Get perceive distance
  //
  getPreceiveDistance(): number {
    return this.position.areal * 1.5;
  }

  // Is object alive
  //
  isAlive() {
    return true;
  }

  // Is object perceiving
  //
  isPerceptive() {
    return true;
  }
}
