/*
  Project: Golden
  Author:  Copyright (C) 2016, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="game_object_creature.ts" />
/// <reference path="consumable.ts" />
/// <reference path="skin_dragon.ts" />

// Creature controlled by the player
//
class GameObjectPlayer extends GameObjectCreature {
  private idMoveTarget: number;
  private idHoverTarget: number;

  private static readonly playerColor: number = 0xaaffaa;
  private static readonly playerEyeColor: number = 0x11aa11;

  constructor( renderer:    Renderer,
               position:    VectorAreal  = new VectorAreal(0.0, 0.0, 0.02),
               speedLinear: number       = 0.2,
               speedTurn:   number       = 1.5 )
  {
    super( renderer, position, speedLinear, speedTurn );

    // Selection markers to guide the player
    //
    this.idMoveTarget = this.renderer.add(
        RendererObjectType.SPRITE,
        "rectangle.png", 0x00ff00,
        new Vector(),
        this.renderer.grid().getDimension().x,
        this.renderer.grid().getDimension().y );

    this.idHoverTarget = this.renderer.add(
        RendererObjectType.SPRITE,
        "rectangle.png", 0xaaaaaa,
        new Vector(),
        this.renderer.grid().getDimension().x,
        this.renderer.grid().getDimension().y );

    this.renderer.positionz( this.idHoverTarget, -0.0001 );

    // Control the player with mouse and touch events
    //
    window.addEventListener('click', (e: MouseEvent) => {
      this.moveTarget = this.unprojectSnap( new Vector(e.clientX, e.clientY) );
      this.renderer.position( this.idMoveTarget, this.moveTarget );
      this.renderer.position( this.idHoverTarget, this.moveTarget );
    });

    window.addEventListener('touchstart', (e: TouchEvent) => {
      if( e.touches.length > 0 ) {
        this.moveTarget = this.unprojectSnap( new Vector(e.touches[0].clientX, e.touches[0].clientY) );
        this.renderer.position( this.idMoveTarget, this.moveTarget );
        this.renderer.position( this.idHoverTarget, this.moveTarget );
      }
    });

    window.addEventListener('mousemove', (e: MouseEvent) => {
      this.renderer.position( this.idHoverTarget, this.unprojectSnap( new Vector(e.clientX, e.clientY) ) );
    });
  }

  protected createNewSkin(): Skin {
    return new SkinDragon( this.renderer, GameObjectPlayer.playerColor, GameObjectPlayer.playerEyeColor );
  }

  private unprojectSnap( screenPos: Vector ): Vector {
    let doc   = document.documentElement;
    let left  = window.pageXOffset || doc.scrollLeft;
    let top   = window.pageYOffset || doc.scrollTop;

    let unprojectedVector = this.renderer.unproject( Vector.plus(screenPos, new Vector(left, top)) );
    return this.renderer.grid().snap( unprojectedVector );
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
  perceive( another: any ): void {
    if( "consume" in another ) {
      this.eat( another as Consumable );
    }
  }

  // Get perceive distance
  //
  getPreceiveDistance(): number {
    return this.position.areal * 0.8;
  }

  // Is object perceiving
  //
  isPerceptive() {
    return true;
  }
}
