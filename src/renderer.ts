/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE.md for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="../typings/threejs/three.d.ts" />
/// <reference path="vector.ts" />

// Renderer object types
//
enum RendererObjectType {
  SPRITE, MODEL
}

// Renderer interface
//
interface Renderer {
  // Add an object
  add(type: RendererObjectType, file: string, position: Vector): number;

  // Position an object
  position(id: number, position: Vector);
  
  // Rotate an object
  rotation(id: number, angle: number)

  // Unproject vector (Convert screen to scene vector)
  unproject(screenPosition: Vector): Vector;

  // Render scene
  render();
}

// Renderer implementation using ThreeJS
//
class ThreeRenderer implements Renderer {
  private width:   number;
  private height:  number;

  private scale:   number;
  private origin:  Vector;

  private renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera;
  private scene: THREE.Scene;

  // Construct renderer
  //
  constructor() {
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

    this.camera.position.z = 1;

    window.addEventListener('resize', (e) => {
      c.width = this.width = window.innerWidth;
      c.height = this.height = window.innerHeight;
      this.scale = Math.min(this.width, this.height);
      this.origin = new Vector(this.width/2.0, this.height/2.0);
    });

    var light1 = new THREE.DirectionalLight( 0xffffff, 0.8 );
    light1.position.set( -1.0, +1.0, 0.5 );
    this.scene.add( light1 );

    var light2 = new THREE.DirectionalLight( 0xffffff, 0.1 );
    light2.position.set( +1.0, -1.0, -0.5 );
    this.scene.add( light2 );
  }

  // Add an object
  //
  add(type: RendererObjectType, file: string, position: Vector): number {
    var obj = null;
    
    if( type == RendererObjectType.SPRITE ) {
      var spriteMap = THREE.ImageUtils.loadTexture( "assets/" + file );
      var spriteMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, map: spriteMap, transparent: true} );
      var spriteGeometry = new THREE.PlaneGeometry( 1.0, 1.0, 1, 1 );
      
      obj = new THREE.Mesh( spriteGeometry, spriteMaterial );
    }
    else if( type == RendererObjectType.MODEL ) {
      var modelGeometry = new THREE.SphereGeometry( 1.0, 32, 32 ); // TODO: Load model file
      var modelMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, emissive: 0x111100 } );
      
      obj = new THREE.Mesh( modelGeometry, modelMaterial );
    }
    else throw "Invalid renderer object type."

    obj.position.x = position.x;
    obj.position.y =  position.y;
    obj.position.z = 0.0;
    
    obj.scale.x = 0.05;
    obj.scale.y = 0.05;
    obj.scale.z = 0.05;

    this.scene.add( obj );
    return this.scene.children.length-1;
  }

  // Position an object
  //
  position(id: number, position: Vector) {
    var mesh = this.scene.children[id];
    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = 0.0;
  }
  
  // Rotate an object
  //
  rotation(id: number, angle: number) {
    var mesh = this.scene.children[id];
    mesh.rotation.z = angle;
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
}