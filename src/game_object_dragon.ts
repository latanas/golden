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

// Dragon controlled by the player
//
class GameObjectDragon implements GameObject {
  private position: VectorAreal;
  private velocity: Vector;

  private speedLinear: number;
  private speedTurn: number;

  private clickTarget: Vector;

  private renderer: Renderer;
  private id: number;
  private idClickTarget: number;

  private rotMatrix: Matrix;

  private wiggle: number;
  private turn: number;

  private isTurning: boolean;
  private turnDirection: number;

  private tail: DynamicList;

  constructor( renderer:Renderer, position:VectorAreal =new VectorAreal(), speedLinear:number =0.2, speedTurn:number =3.0 ) {
    this.position = position.copyAreal();
    this.velocity = new Vector(1.0, 0.0);

    this.speedLinear = speedLinear;
    this.speedTurn   = speedTurn;

    this.rotMatrix = new Matrix();

    this.wiggle = 0.0;
    this.turn   = 0.0;

    this.isTurning     = false;
    this.turnDirection = +1;

    this.renderer = renderer;

    this.id = this.renderer.add(
        RendererObjectType.SPRITE, "arrow.png",
        this.position, this.position.areal
    );

    this.idClickTarget = this.renderer.add(
        RendererObjectType.SPRITE, "circle.png",
        new Vector(), 0.05
    );

    this.target( new Vector(0.0, -0.2) );

    window.addEventListener('click', (e) => {
      var clickPosition: Vector = new Vector(e.clientX, e.clientY);
      this.target( renderer.unproject(clickPosition) );
    });

    this.tail = new DynamicList( renderer, this.position, this.velocity );
    for(var i=0; i<15; i++) this.tail.append();
  }

  // Target waypoint
  //
  private target(v: Vector) {
    this.clickTarget = v;
    this.renderer.position( this.idClickTarget, this.clickTarget );
  }

  // Animate the dragon
  //
  animate(dt: number): void {
    var targetVelocity = Vector.norm( Vector.minus(this.clickTarget, this.position) );
    var targetDistance = Vector.minus(this.position, this.clickTarget).distance();

    // If target approached, add [+1; -1] rotation bias
    if( targetDistance >= 0.1 ) {
        this.isTurning = false;
        this.turn      = 0.0;
        this.wiggle   += dt*2.0;
    }
    else if( this.isTurning ) {
        this.turn += dt*this.turnDirection*0.5;
    }
    else {
        this.isTurning      = true;
        this.turnDirection *= -1;
    }

    // Turn and wiggle
    this.rotMatrix.rotation( this.turn + Math.sin(this.wiggle)*targetDistance*0.8 );
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

    // Cut tail at nearest intersection with dragon's head
    if( this.tail.getCount() > 2 ) {
        var nearest: DynamicList = this.tail.getNext(2).getNearest( this.position );

        if( nearest.getPosition().isIntersected(this.position) )
            nearest.getPrevious().truncate();
    }

    // Update position and rotation
    //
    this.position.set( Vector.plus(this.position, Vector.scale(this.velocity, this.speedLinear*dt)) );

    this.renderer.position( this.id, this.position );
    this.renderer.rotation( this.id, this.velocity.angle() );

    this.tail.follow(this.position, this.speedLinear, dt);
  }

   // Remove the dragon
  //
  remove(): void {
    this.renderer.remove(this.id);
    this.renderer.remove(this.idClickTarget);
  }

  // Perceive another object
  //
  perceive( another: GameObject ): void {
    if( another instanceof GameObjectConsumable ) {
      this.eat(<GameObjectConsumable> another);
    }
  }

  // Dragon eats another object
  //
  eat( consumable: GameObjectConsumable ) {
    var value = consumable.consume();
    for(var i=0; i<value; i++) this.tail.append();
  }

  // Get position
  //
  getPosition(): Vector {
    return this.position;
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
