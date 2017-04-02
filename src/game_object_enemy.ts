/*
  Project: Golden
  Author:  Copyright (C) 2016, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="game_object_creature.ts" />
/// <reference path="game_object_apple.ts" />
/// <reference path="skin_dragon.ts" />

// The enemy finds apples and eats them, whilst evading the player.
//
class GameObjectEnemy extends GameObjectCreature implements Consumable {
  private static readonly enemyColor: number           = 0xffaaaa;
  private static readonly enemyEyeColor: number        = 0xaa0000;
  private static readonly distancePerceive: number     = 5.0;
  private static readonly distanceEvade: number        = 0.5;
  private static readonly matureLenght: number         = 14;
  private static readonly destructionDuration: number  = 2.5;

  // Performing evasive move
  private isEvasive: boolean;

  // Closest object we can eat
  private distanceMin: number;

  constructor( renderer:    Renderer,
               position:    VectorAreal  = new VectorAreal(0.0, 0.0, 0.01),
               speedLinear: number       = 0.15,
               speedTurn:   number       = 3.0,
               segments:    number       = 5,
               velocity:    Vector       = new Vector(1.0, 0.0) )
  {
    super( renderer, position, speedLinear, speedTurn, segments, velocity );

    this.isEvasive    = false;
    this.distanceMin  = GameObjectEnemy.distancePerceive;
  }

  protected createNewSkin(): Skin {
    return new SkinDragon( this.renderer, GameObjectEnemy.enemyColor, GameObjectEnemy.enemyEyeColor );
  }

  // Someone i.e. the player, has consumed an enemy
  //
  consume(): number {
    if( this.tail.isDestructionRequested() ) {
      return 0;
    }
    let consumedValue: number = Math.ceil(this.tail.getCount() / 3.0);

    this.tail.animateDestruction( GameObjectEnemy.destructionDuration );
    return consumedValue;
  }

  // Perceive something
  //
  perceive( another: any ): void {
    if( another instanceof GameObjectCreature ) {
      this.perceiveCreature( another );
    }
    else if( another instanceof GameObjectApple ) {
      this.perceiveApple( another );
    }
  }

  // Perceive another creature
  //
  perceiveCreature( another: GameObjectCreature ) {
    let pos: Vector = this.getPosition();
    let nearest: Vector = another.getNearestPosition( pos );
    let posToPlayer: Vector = Vector.minus( another.getPosition(), pos );
    let d: number = posToPlayer.distance();

    // Evade the creature
    if( d <= GameObjectEnemy.distanceEvade ) {
      let evade: Vector = Vector.scale( posToPlayer, GameObjectEnemy.distanceEvade/d );

      this.moveTarget   = Vector.minus( pos, evade );
      this.isEvasive    = true;
      this.distanceMin  = GameObjectEnemy.distancePerceive;
    }
    else {
      this.isEvasive = false;
    }
  }

  // Perceive an apple
  //
  perceiveApple( another: GameObjectApple ) {
    if( this.isEvasive ) {
      return;
    }
    let d = Vector.minus( this.getPosition(), another.getPosition() ).distance();

    // Greedily approach the nearest apple
    if( d < this.distanceMin )
    {
      this.moveTarget = another.getPosition();
      this.distanceMin = d;

      // Eat the apple if it is within reach
      if( d < this.position.areal + another.getPosition().areal  )
      {
        this.eat( another );
        this.distanceMin = GameObjectEnemy.distancePerceive;
      }
    }
  }

  // The glutton eats apples
  //
  eat( consumable: Consumable ) {
    super.eat(consumable);

    // Spawn a child creature
    if( this.tail.getCount() + 1 >= GameObjectEnemy.matureLenght )
    {
      let childPosition = this.tail.getLast().getPosition();
      let divisionLenght = Math.floor(GameObjectEnemy.matureLenght / 2.0);

      this.tail.getNext(divisionLenght-1).truncate();
      this.skin.append( this.tail, 0 );

      this.spawnPending.push( new GameObjectEnemy(
        this.renderer,
        childPosition,
        this.speedLinear,
        this.speedTurn,
        divisionLenght-1,
        Vector.scale(this.velocity, -1.0)
      ));
    }
  }

  // Get perceive distance
  //
  getPreceiveDistance(): number {
    return GameObjectEnemy.distancePerceive;
  }

  // Is object perceiving
  //
  isPerceptive() {
    return true;
  }
}
