/*
  Project: Golden
  Author:  Copyright (C) 2016, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="game_object_creature.ts" />
/// <reference path="game_object_consumable.ts" />
/// <reference path="game_object_player.ts" />

// The glutton finds apples and eats them
//
class GameObjectGlutton extends GameObjectCreature {
  private static distanceMax:   number  = 5.0;
  private static distanceEvade: number  = 0.3;

  // Performing evasive move
  private isEvasive: boolean;

  // Closest object we can eat
  private distanceMin: number;

  constructor( renderer:    Renderer,
               position:    VectorAreal  = new VectorAreal(0.0, 0.0, 0.01),
               speedLinear: number       = 0.15,
               speedTurn:   number       = 3.0 )
  {
    super( renderer, position, speedLinear, speedTurn, 1 );

    this.isEvasive    = false;
    this.distanceMin  = GameObjectGlutton.distanceMax;
  }

  // Animate the glutton
  //
  animate(dt: number): void {
    super.animate(dt);
  }

  // Perceive something
  //
  perceive( another: GameObject ): void {
    // Perceive another creature
    //
    if( another instanceof GameObjectCreature ) {

      var pos: Vector = this.getPosition();
      var nearest: Vector = (<GameObjectCreature> another).getNearestPosition(pos);
      var posToPlayer: Vector = Vector.minus( another.getPosition(), pos );

      var d: number = posToPlayer.distance();

      // Evade the creature
      if( d <= GameObjectGlutton.distanceEvade ) {
        var evade: Vector = Vector.scale( posToPlayer, GameObjectGlutton.distanceEvade/d );

        this.moveTarget   = Vector.minus( pos, evade );
        this.isEvasive    = true;
        this.distanceMin  = GameObjectGlutton.distanceMax;
      }
      else {
        this.isEvasive = false;
      }
    }

    // Perceive an apple
    //
    if( another instanceof GameObjectConsumable ) {
      if( this.isEvasive ) return;

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
          this.distanceMin = GameObjectGlutton.distanceMax;
        }
      }
    }
  }

  // Glutton eats an apple
  //
  eat( consumable: GameObjectConsumable ) {
    super.eat(consumable);

    if( this.tail.getCount() > 6)
    {
      this.tail.truncate();

      var posChild = this.tail.getPosition();
      var child = new GameObjectGlutton( this.renderer, posChild );

      this.spawnPending.push( child );
    }
  }

  // Get perceive distance
  //
  getPreceiveDistance(): number {
    return GameObjectGlutton.distanceMax;
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
