/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE.md for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="../typings/threejs/three.d.ts" />
/// <reference path="vector.ts" />

// Renderer interface
//
interface Renderer {
  // Add an object
  add(position: Vector): number;

  // Position an object
  position(id: number, position: Vector);

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
  add(position: Vector): number {
    var geometry = new THREE.SphereGeometry( 0.05, 64, 64 );
    var material = new THREE.MeshPhongMaterial( { color: 0xffff00, emissive: 0x111100 } );
    var mesh = new THREE.Mesh( geometry, material );

    mesh.position.x = position.x;
    mesh.position.y =  position.y;
    mesh.position.z = 0.0;

    this.scene.add( mesh );
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
