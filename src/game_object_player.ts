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

    this.moveTarget = new Vector();

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

    window.addEventListener('click', (e) => {
      this.moveTarget = this.unprojectSnap(e);
      this.renderer.position( this.idMoveTarget, this.moveTarget );
    });

    window.addEventListener('mousemove', (e) => {
      this.renderer.position( this.idHoverTarget, this.unprojectSnap(e) );
    });
  }

  protected createNewSkin(): Skin {
    return new SkinDragon( this.renderer, GameObjectPlayer.playerColor, GameObjectPlayer.playerEyeColor );
  }

  private unprojectSnap(e: MouseEvent): Vector {
    let unprojectedVector = this.renderer.unproject( new Vector(e.clientX, e.clientY) );
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
