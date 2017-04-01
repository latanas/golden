/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="vector.ts" />
/// <reference path="matrix.ts" />

/// <reference path="renderer.ts" />
/// <reference path="skin.ts" />

/// <reference path="dynamic_list_elastic.ts" />
/// <reference path="dynamic_list_posed.ts" />

/// <reference path="game_object.ts" />
/// <reference path="consumable.ts" />

// Creature in the game
//
abstract class GameObjectCreature implements GameObject {
  // Position and velocity vector
  protected position: VectorAreal;
  protected velocity: Vector;

  // Target coordinate and speeds
  protected moveTarget:  Vector;
  protected speedLinear: number;
  protected speedTurn:   number;

  // Renderer and graphic skin
  //
  protected renderer: Renderer;
  protected skin: Skin;

  // The creature's body is stored in DynamicList
  protected tail: DynamicList;

  // Animation parameters
  //
  protected wiggle: number;
  protected turn: number;

  protected isTurning: boolean;
  protected turnDirection: number;

  protected rotMatrix: Matrix;

  // Spawned children
  protected spawnPending: GameObject[];

  // Make a new creature
  //
  constructor( renderer:    Renderer,
               position:    VectorAreal  = new VectorAreal(0.0, 0.0, 0.01),
               speedLinear: number       = 0.2,
               speedTurn:   number       = 1.5,
               segments:    number       = 7,
               velocity:    Vector       = new Vector(1.0, 0.0) )
  {
    this.position = position.copyAreal();
    this.velocity = velocity;

    this.moveTarget  = new Vector();
    this.speedLinear = speedLinear;
    this.speedTurn   = speedTurn;

    this.rotMatrix = new Matrix();

    this.wiggle = 0.0;
    this.turn   = 0.0;

    this.isTurning     = false;
    this.turnDirection = +1;

    this.renderer = renderer;
    this.skin = this.createNewSkin();
    this.tail = this.skin.create( this.position, this.velocity, segments );

    this.spawnPending = [];
  }

  // Abstract methods
  //
  protected abstract createNewSkin(): Skin;

  abstract isPerceptive();
  abstract getPreceiveDistance();
  abstract perceive( another: any );

  // Is object alive
  //
  isAlive() {
    return this.tail.getCount() > 1;
  }

  // Creature eats a consumable
  //
  eat( consumable: Consumable ) {
    this.skin.append( this.tail, consumable.consume() );
  }

  // Animate the creature
  //
  animate(dt: number): void {
    var targetVelocity = Vector.norm( Vector.minus(this.moveTarget, this.position) );
    var targetDistance = Vector.minus(this.position, this.moveTarget).distance();

    // If target approached, add [+1; -1] rotation bias
    if( targetDistance >= 0.1 ) {
        this.isTurning = false;
        this.turn      = 0.0;
        this.wiggle   += dt * 2.0;
    }
    else if( this.isTurning ) {
        this.turn += dt * this.turnDirection * 0.5;
    }
    else {
        this.isTurning      = true;
        this.turnDirection *= -1;
    }

    // Turn and wiggle
    this.rotMatrix.rotation( this.turn + Math.sin(this.wiggle)*targetDistance*0.5 );
    this.rotMatrix.transform( targetVelocity );

    var angleDelta = targetVelocity.angle() - this.velocity.angle();

    // Choose shortest rotation direction [+1; -1]
    if( Math.abs(angleDelta) > dt ) {
      var direction = angleDelta >= 0 ? +1:-1;
      if( direction*angleDelta >= Math.PI ) direction *= -1;

      this.rotMatrix.rotation(direction*this.speedTurn*dt);
      this.rotMatrix.transform(this.velocity);
    }
    else {
      this.velocity = targetVelocity.copy();
    }

    // Cut tail at nearest intersection with the creature's head
    if( this.tail.getCount() > 2 ) {
        var nearest: DynamicList = this.tail.getNext(2).getNearest( this.position );

        if( nearest.getPosition().isIntersected(this.position) ) {
          nearest.getPrevious().truncate();
          this.skin.append( this.tail, 0 );
        }
    }

    // Update position and rotation
    this.position.set( Vector.plus(this.position, Vector.scale(this.velocity, this.speedLinear*dt)) );
    this.tail.animate( this.position, this.speedLinear, dt );
  }

  // Spawn new objects
  //
  spawn(): GameObject[] {
    var sp = this.spawnPending;

    if( this.spawnPending.length ) {
      this.spawnPending = [];
    }
    return sp;
  }

  // Remove the creature
  //
  remove(): void {
    this.tail.truncate();
    this.tail.truncateBranches();
    this.renderer.remove(this.tail.getID(), false);
  }

  // Get head position
  //
  getPosition(): VectorAreal {
    return this.position;
  }

  // Get nearest position in the tail
  //
  getNearestPosition( position: Vector ): VectorAreal {
    return this.tail.getNearest(position).getPosition();
  }
}
