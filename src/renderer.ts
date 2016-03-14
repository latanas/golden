/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE.md for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="../typings/threejs/three.d.ts" />
/// <reference path="vector.ts" />
/// <reference path="slot_list.ts" />

// Renderer object types
//
enum RendererObjectType {
  SPRITE, MODEL
}

// Renderer interface
//
interface Renderer {
  // Add an object
  add(type: RendererObjectType, file: string, position: Vector, size: number): number;

  // Remove an object
  remove(id: number);

  // Position an object
  position(id: number, position: Vector);

  // Rotate an object
  rotation(id: number, angle: number);

  // Unproject vector (Convert screen to scene vector)
  unproject(screenPosition: Vector): Vector;

  // Render scene
  render();

  // Animate scene
  animate(dt: number);
}

// Renderer implementation using ThreeJS
//
class ThreeRenderer implements Renderer {
  private width:   number;
  private height:  number;

  private scale:   number;
  private origin:  Vector;

  private renderer: THREE.WebGLRenderer;
  private camera:   THREE.PerspectiveCamera;
  private scene:    THREE.Scene;
  private textureLoader: THREE.TextureLoader;

  private idNext: number;

  private fadeSpeed:   number;
  private fadeInList:  SlotList;
  private fadeOutList: SlotList;

  // Construct renderer
  //
  constructor() {
    this.idNext = 1;

    this.width  = window.innerWidth;
    this.height = window.innerHeight;
    this.scale  = Math.min(this.width, this.height);
    this.origin = new Vector(this.width/2.0, this.height/2.0);

    var c = document.createElement("canvas");
    c.width  = this.width;
    c.height = this.height;
    document.body.appendChild(c);

    this.renderer = new THREE.WebGLRenderer({ canvas: c, antialias: true });
    this.scene    = new THREE.Scene();
    this.camera   = new THREE.PerspectiveCamera( 50, this.width/this.height, 0.1, 1000 );
    this.textureLoader = new THREE.TextureLoader();

    this.camera.position.z = 1;

    window.addEventListener('resize', (e) => {
      this.width  = c.width = window.innerWidth;
      this.height = c.height = window.innerHeight;
      this.scale  = Math.min(this.width, this.height);
      this.origin = new Vector(this.width/2.0, this.height/2.0);

      this.camera.aspect = this.width/this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });

    var light1 = new THREE.DirectionalLight( 0xffffff, 0.8 );
    light1.position.set( -1.0, +1.0, 0.5 );
    this.scene.add( light1 );

    var light2 = new THREE.DirectionalLight( 0xffffff, 0.1 );
    light2.position.set( +1.0, -1.0, -0.5 );
    this.scene.add( light2 );

    this.fadeSpeed    = 1.5;
    this.fadeInList   = new SlotList();
    this.fadeOutList  = new SlotList();
  }

  private get(id: number): THREE.Object3D {
      return this.scene.getObjectByName("object" + id);
  }

  // Add an object
  //
  add(type: RendererObjectType, file: string, position: Vector, size: number): number {
    var obj = null;

    if( type == RendererObjectType.SPRITE ) {
      var spriteMap = this.textureLoader.load( "assets/" + file );
      var spriteMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff, map: spriteMap, transparent: true, depthTest: false} );
      var spriteGeometry = new THREE.PlaneBufferGeometry( 1.0, 1.0, 1, 1 );

      obj = new THREE.Mesh( spriteGeometry, spriteMaterial );
    }
    else if( type == RendererObjectType.MODEL ) {
      var modelGeometry = new THREE.SphereGeometry( 1.0, 32, 32 ); // TODO: Load model file
      var modelMaterial = new THREE.MeshPhongMaterial( {color: 0xffaa00, emissive: 0x333300, depthTest: false, transparent: true} );

      obj = new THREE.Mesh( modelGeometry, modelMaterial );
    }
    else throw "Invalid renderer object type."

    obj.position.x = position.x;
    obj.position.y =  position.y;
    obj.position.z = 0.0;

    obj.scale.x = size;
    obj.scale.y = size;
    obj.scale.z = size;

    obj.material.opacity = 0.0;
    this.fadeInList.enlist(obj);

    obj.name = "object" + this.idNext;
    this.scene.add( obj );

    return this.idNext++;
  }

  // Remove an object
  remove(id: number) {
      var obj: THREE.Mesh  = <THREE.Mesh> this.get(id);

      var idFade: number = this.fadeInList.find(obj);
      if( idFade >= 0 ) this.fadeInList.remove(id);

      this.fadeOutList.enlist(obj);
  }

  // Position an object
  //
  position(id: number, position: Vector) {
    var obj: THREE.Object3D = this.get(id);
    obj.position.x = position.x;
    obj.position.y = position.y;
    obj.position.z = 0.0;
  }

  // Rotate an object
  //
  rotation(id: number, angle: number) {
    var obj: THREE.Object3D = this.get(id);
    obj.rotation.z = angle;
  }

  // Unproject vector (Convert screen to scene vector)
  //
  unproject(screenPosition: Vector): Vector {
    var v = new THREE.Vector3(
      (screenPosition.x/this.width) * 2.0 - 1.0,
      (screenPosition.y/this.height) * (-2.0) + 1.0,
      0.5
    );
    v.unproject( this.camera );

    var dir = v.sub( this.camera.position ).normalize();
    var distance = (-1) * this.camera.position.z / dir.z;
    var pos = this.camera.position.clone().add( dir.multiplyScalar( distance ) );

    return new Vector(pos.x, pos.y);
  }

  // Render the scene
  //
  render() {
    this.renderer.render( this.scene, this.camera );
  }

  // Animate the scene
  //
  animate( dt: number ) {
    var opacityDelta = this.fadeSpeed * dt;

    // Fade in objects
    this.fadeInList.each( (obj: THREE.Mesh, id: number) => {
      var opacity = obj.material.opacity + opacityDelta;

      if( opacity < 1.0 ) {
        obj.material.opacity = opacity;
      }
      else {
        obj.material.opacity = 1.0;
        this.fadeInList.remove(id);
      }
    });

    // Fade out objects
    this.fadeOutList.each( (obj: THREE.Mesh, id: number) => {
      var opacity = obj.material.opacity - opacityDelta;

      if( opacity > 0.0 ) {
          obj.material.opacity = opacity;
      }
      else {
        obj.material.opacity = 0.0;
        this.fadeOutList.remove(id);
        this.scene.remove(obj);
      }
    });
  }
}
