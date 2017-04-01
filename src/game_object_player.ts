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

  private static readonly playerColor: number = 0xaaffaa;
  private static readonly playerEyeColor: number = 0x11aa11;

  constructor( renderer:    Renderer,
               position:    VectorAreal  = new VectorAreal(0.0, 0.0, 0.02),
               speedLinear: number       = 0.2,
               speedTurn:   number       = 1.5 )
  {
    super( renderer, position, speedLinear, speedTurn );

    this.idMoveTarget = this.renderer.add(
        RendererObjectType.SPRITE,
        "circle.png", 0xffffff,
        new Vector(), 0.1, 0.1 );

    this.target( new Vector() );

    window.addEventListener('click', (e) => {
      var clickPosition: Vector = new Vector(e.clientX, e.clientY);
      this.target( renderer.unproject(clickPosition) );
    });
  }

  protected createNewSkin(): Skin {
    return new SkinDragon( this.renderer, GameObjectPlayer.playerColor, GameObjectPlayer.playerEyeColor );
  }

  // Set the movement target
  //
  private target(v: Vector) {
    this.moveTarget = v;
    this.renderer.position( this.idMoveTarget, this.moveTarget );
    this.renderer.positionz( this.idMoveTarget, -0.5 );
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
