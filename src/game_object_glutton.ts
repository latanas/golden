/*
  Project: Golden
  Author:  Copyright (C) 2016, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="game_object_creature.ts" />

// The glutton finds apples and eats them
//
class GameObjectGlutton extends GameObjectCreature {

  // Closest object we can eat
  private distanceMin: number;

  constructor( renderer:    Renderer,
               position:    VectorAreal  = new VectorAreal(0.0, 0.0, 0.01),
               speedLinear: number       = 0.1,
               speedTurn:   number       = 1.0 )
  {
    super( renderer, position, speedLinear, speedTurn, 3 );
    this.distanceMin = 1.0;
  }

  // Animate the glutton
  //
  animate(dt: number): void {
    super.animate(dt);
  }

  // Perceive an apple
  //
  perceive( another: GameObject ): void {
    if( another instanceof GameObjectConsumable ) {

      var d = Vector.minus( this.getPosition(), another.getPosition() ).distance();

      // Greedily approach the nearest apple
      if( d < this.distanceMin )
      {
        this.moveTarget = another.getPosition();
        this.distanceMin = d;

        // Eat if within reach
        if( d < this.position.areal + another.getPosition().areal  )
        {
          this.eat(<GameObjectConsumable> another);
          this.distanceMin = 1.0;
        }
      }
    }
  }

  // Get perceive distance
  //
  getPreceiveDistance(): number {
    return 1.0;
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
