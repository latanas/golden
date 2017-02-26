/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="vector.ts" />
/// <reference path="matrix.ts" />

/// <reference path="renderer.ts" />

/// <reference path="dynamic_list.ts" />

/// <reference path="game_object.ts" />
/// <reference path="game_object_consumable.ts" />

// Creature in the game
//
class GameObjectCreature implements GameObject {
  // Position and velocity vector
  protected position: VectorAreal;
  protected velocity: Vector;

  // Target coordinate and speeds
  protected moveTarget:  Vector;
  protected speedLinear: number;
  protected speedTurn:   number;

  // Expandable tail
  protected tail: DynamicList;

  // Display parameters
  //
  protected renderer: Renderer;
  protected id: number;

  private static rendererImageHead: string = "head.png";
  private static rendererImageBody: string = "body.png";
  private static rendererImageTail: string = "tail.png";

  private static ratioHeadX : number = 4.5;
  private static ratioHeadY : number = 4.5
  private static ratioBody : number = 2.3;
  private static ratioTail : number = 3.0;

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

    this.id = this.renderer.add(
        RendererObjectType.SPRITE,
        GameObjectCreature.rendererImageHead,
        this.position,
        this.position.areal * GameObjectCreature.ratioHeadX,
        this.position.areal * GameObjectCreature.ratioHeadY
    );
    this.renderer.positionz(this.id, 0.001);

    this.tail = new DynamicList(
        renderer, this.position,
        this.velocity,
        GameObjectCreature.rendererImageBody,
        GameObjectCreature.ratioBody
    );
    this.append( segments );

    this.spawnPending = [];
  }

  // Append body segments whilst preserving the tail
  //
  private append(n: number): void {
    this.tail.getLast().getPrevious().truncate();

    for( var i = 0; i < n; i++ ) {
      this.tail.append( 1, GameObjectCreature.rendererImageBody, GameObjectCreature.ratioBody );
    }
    this.tail.append( 1, GameObjectCreature.rendererImageTail, GameObjectCreature.ratioTail );
    this.renderer.positionz(this.tail.getLast().getID(), -0.001);
  }

  // Creature eats a consumable
  //
  eat( consumable: GameObjectConsumable ) {
    this.append(consumable.consume());
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
          nearest.getPrevious().getPrevious().truncate();
          this.append(0);
        }
    }

    // Update position and rotation
    //
    this.position.set( Vector.plus(this.position, Vector.scale(this.velocity, this.speedLinear*dt)) );

    this.renderer.position( this.id, this.position );
    this.renderer.rotation( this.id, this.velocity.angle() );

    this.tail.follow(this.position, this.speedLinear, dt);
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
    this.renderer.remove(this.id, true);
  }

  // Perceive another object
  //
  perceive( another: GameObject ): void {
  }

  // Get head position
  //
  getPosition(): VectorAreal {
    return this.position;
  }

  // Get nearest position in the tail
  //
  getNearestPosition( position: Vector ) {
    return this.tail.getNearest(position).getPosition();
  }

  // Get perceive distance
  //
  getPreceiveDistance(): number {
    return 0.0;
  }

  // Is object alive
  //
  isAlive() {
    return true;
  }

  // Is object perceiving
  //
  isPerceptive() {
    return false;
  }
}
