/*
  Project: Golden
  Author:  Copyright (C) 2017, Atanas Laskov

  License: BSD license, see LICENSE for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="Skin.ts" />

/// <reference path="dynamic_list_elastic.ts" />
/// <reference path="dynamic_list_posed.ts" />
/// <reference path="vector_areal.ts" />

// Graphical skin of a dragon
//
class SkinDragon implements Skin {
  public static readonly rendererImageHead: string        = "headElement0.png";
  public static readonly rendererImageWingLeft: string    = "headElement1.png";
  public static readonly rendererImageWingRight: string   = "headElement2.png";
  public static readonly rendererImageWingCenter: string  = "headElement3.png";
  public static readonly rendererImageEye: string         = "headElement4.png";
  public static readonly rendererImageBody: string        = "body.png";
  public static readonly rendererImageTail: string        = "tail.png";

  public static readonly ratioHead : number = 2.0;
  public static readonly ratioBody : number = 2.3;
  public static readonly ratioTail : number = 3.0;

  private renderer: Renderer;
  private color: number;
  private eyeColor: number;

  constructor(renderer: Renderer, color: number, eyeColor: number) {
    this.renderer = renderer;
    this.color = color;
    this.eyeColor = eyeColor;
  }

  // Create new skin and store it as DynamicList
  //
  create( position: VectorAreal, velocity: Vector, segments: number ): DynamicList {
    let dragonBody: DynamicList = new DynamicListElastic(
        position, velocity,
        this.renderer,
        SkinDragon.rendererImageBody,
        SkinDragon.ratioBody );

    this.append( dragonBody, segments );
    this.appendHeadBranches(dragonBody, position);
    this.appendBodyBranches(dragonBody, position);
    return dragonBody;
  }

  // Append segments to the skin
  //
  append( dragonBody: DynamicList, segments: number ) {
    dragonBody.getLast().truncateBranches();

    for( let i = 0; i < segments; i++ ) {
      dragonBody.append( 1, SkinDragon.rendererImageBody, SkinDragon.ratioBody );
    }
    this.appendTailBranch( dragonBody );
  }

  // Append the head's decoraive branches
  //
  private appendHeadBranches( dragonBody: DynamicList, position: VectorAreal ) {
    let headElements: DynamicList[] = new Array<DynamicList>();

    headElements.push( new DynamicListPosed(
      new VectorAreal( position.x, position.y, position.areal * 2.0 ),
      new Vector(+1.85 * position.areal, +0.0 * position.areal),
      Math.PI * 6.0,
      this.renderer,
      SkinDragon.rendererImageHead,
      SkinDragon.ratioHead,
      RendererObjectType.SPRITE_PIVOT_RIGHT,
      0xffffff ));

    headElements.push( new DynamicListPosed(
      new VectorAreal( position.x, position.y, position.areal * 0.1 ),
      new Vector(+0.8 * position.areal, +0.31 * position.areal),
      Math.PI * 6.0,
      this.renderer,
      SkinDragon.rendererImageEye,
      1.0,
      RendererObjectType.SPHERE,
      this.eyeColor ));

    headElements.push( new DynamicListPosed(
      new VectorAreal( position.x, position.y, position.areal * 0.1 ),
      new Vector(+0.8 * position.areal, -0.31 * position.areal),
      Math.PI * 6.0,
      this.renderer,
      SkinDragon.rendererImageEye,
      1.0,
      RendererObjectType.SPHERE,
      this.eyeColor ));

    headElements.push( new DynamicListPosed(
      new VectorAreal( position.x, position.y, position.areal * 2.0 ),
      new Vector(0.0 * position.areal, +1.0 * position.areal),
      Math.PI * 1.8,
      this.renderer,
      SkinDragon.rendererImageWingLeft,
      SkinDragon.ratioTail * 0.6,
      RendererObjectType.SPRITE_PIVOT_RIGHT,
      this.color ));

    headElements.push( new DynamicListPosed(
      new VectorAreal( position.x, position.y, position.areal * 2.0 ),
      new Vector(0.0 * position.areal, -1.0 * position.areal),
      Math.PI * 1.8,
      this.renderer,
      SkinDragon.rendererImageWingRight,
      SkinDragon.ratioTail * 0.6,
      RendererObjectType.SPRITE_PIVOT_RIGHT,
      this.color ));

    headElements.push( new DynamicListPosed(
      new VectorAreal( position.x, position.y, position.areal * 0.5 ),
      new Vector(+0.0 * position.areal, +0.0 * position.areal),
      Math.PI * 2.5,
      this.renderer,
      SkinDragon.rendererImageWingCenter,
      SkinDragon.ratioTail * 1.4,
      RendererObjectType.SPRITE_PIVOT_RIGHT,
      this.color ));

    for(let element of headElements) {
      dragonBody.appendBranch( element );
      this.renderer.positionz( element.getID(), +0.002 );
    }
    this.renderer.positionz( headElements[0].getID(), +0.003 )
    this.renderer.positionz( headElements[1].getID(), position.areal * 0.05 + 0.003 )
    this.renderer.positionz( headElements[2].getID(), position.areal * 0.05 + 0.003 )
  }

  // Append the decoraive branches to the body
  //
  private appendBodyBranches( dragonBody: DynamicList, position: VectorAreal ) {
    let bodyElements: DynamicList[] = new Array<DynamicList>();

    bodyElements.push( new DynamicListPosed(
      new VectorAreal( position.x, position.y, position.areal * 1.5 ),
      new Vector(0.0 * position.areal, +0.8 * position.areal),
      Math.PI * 1.0,
      this.renderer,
      SkinDragon.rendererImageWingLeft,
      SkinDragon.ratioTail * 0.6,
      RendererObjectType.SPRITE_PIVOT_RIGHT,
      this.color ));

    bodyElements.push( new DynamicListPosed(
      new VectorAreal( position.x, position.y, position.areal * 1.5 ),
      new Vector(0.0 * position.areal, -0.8 * position.areal),
      Math.PI * 1.0,
      this.renderer,
      SkinDragon.rendererImageWingRight,
      SkinDragon.ratioTail * 0.6,
      RendererObjectType.SPRITE_PIVOT_RIGHT,
      this.color ));

    for( let element of bodyElements ) {
        dragonBody.getLast().getPrevious().appendBranch( element );
        this.renderer.positionz( element.getID(), -0.001 );
    }
  }

  // Append the tail's decorative branches
  //
  private appendTailBranch( dragonBody: DynamicList ) {
    let tailBranch: DynamicList = new DynamicListPosed(
      dragonBody.getLast().getPosition(),
      new Vector( +0.0 * dragonBody.getLast().getPosition().areal, 0.0 ),
      Math.PI * 8.0,
      this.renderer,
      SkinDragon.rendererImageTail,
      SkinDragon.ratioTail,
      RendererObjectType.SPRITE_PIVOT_RIGHT,
      this.color );

    dragonBody.getLast().appendBranch( tailBranch );
    this.renderer.positionz( tailBranch.getID(), -0.001 );
  }
}