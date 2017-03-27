/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE.md for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="../typings/globals/three/index.d.ts" />
/// <reference path="vector.ts" />
/// <reference path="slot_list.ts" />

// Renderer object types
//
enum RendererObjectType {
  SPRITE, SPRITE_PIVOT_RIGHT, SPHERE
}

// Renderer interface
//
interface Renderer {
  // Add an object
  add(type: RendererObjectType, file: string, position: Vector, w: number, h: number): number;

  // Remove an object
  remove(id: number, fadeOut: boolean);

  // Position an object
  position(id: number, position: Vector);

  // Postion object z zindex
  positionz(id: number, zindex: number)

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

  private geometryBuffers = {};

  private fadeSpeed:   number;
  private fadeInList:  SlotList;
  private fadeOutList: SlotList;

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

    let light1 = new THREE.DirectionalLight( 0xffffff, 0.8 );
    light1.position.set( -1.0, +1.0, 0.5 );
    this.scene.add( light1 );

    let light2 = new THREE.DirectionalLight( 0xffffff, 0.1 );
    light2.position.set( +1.0, -1.0, -0.5 );
    this.scene.add( light2 );

    //this.renderer.setClearColor( new THREE.Color(155,155,155) );

    this.fadeSpeed    = 1.5;
    this.fadeInList   = new SlotList();
    this.fadeOutList  = new SlotList();

    this.createGeometryBuffers();
  }

  // Geometry to be instantiated by objects
  //
  private createGeometryBuffers() {
    let spriteGeometry    = new THREE.PlaneBufferGeometry( 1.0, 1.0, 1, 1 );
    let spritePivotRight  = new THREE.BufferGeometry();
    let sphereGeometry    = new THREE.SphereBufferGeometry(1.0, 6, 6);

    let vertices = new Float32Array( [
        -1.0, -0.5, 0.0,
        +0.0, -0.5, 0.0,
        +0.0, +0.5, 0.0,

        +0.0, +0.5, 0.0,
        -1.0, +0.5, 0.0,
        -1.0, -0.5, 0.0 ]);
    let uvs = new Float32Array( [
        -0.0, -0.0,
        +1.0, -0.0,
        +1.0, +1.0,

        +1.0, +1.0,
        -0.0, +1.0,
        -0.0, -0.0 ]);

    spritePivotRight.addAttribute( 'position', new THREE.BufferAttribute(vertices, 3) );
    spritePivotRight.addAttribute( 'uv', new THREE.BufferAttribute(uvs, 2) );

    this.geometryBuffers[RendererObjectType.SPRITE] = spriteGeometry;
    this.geometryBuffers[RendererObjectType.SPRITE_PIVOT_RIGHT] = spritePivotRight;
    this.geometryBuffers[RendererObjectType.SPHERE] = sphereGeometry;
  }

  // Get an object by id
  //
  private get(id: number): THREE.Object3D {
      return this.scene.getObjectById(id);
  }

  // Add an object
  //
  add(type: RendererObjectType, file: string, position: Vector, w: number, h: number): number {
    let spriteMap: THREE.Texture = this.textureLoader.load( "assets/" + file );
    spriteMap.magFilter = THREE.LinearFilter;
    spriteMap.minFilter = THREE.LinearFilter;

    let material: THREE.Material;

    if( type == RendererObjectType.SPHERE ) {
      material = new THREE.MeshStandardMaterial({
        color: 0x9acd66,
        envMap: spriteMap,
        emissive: new THREE.Color(0x5f9d4a),
        metalness: 0.8,
        roughness: 0.4} );
    }
    else {
      material = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide, color: 0xffffff, map: spriteMap, transparent: true} );
    }

    let obj: THREE.Mesh = new THREE.Mesh( this.geometryBuffers[type], material );

    obj.position.x = position.x;
    obj.position.y =  position.y;
    obj.position.z = 0.0;

    obj.scale.x = w;
    obj.scale.y = h;
    obj.scale.z = h;

    obj.material.opacity = 0.0;
    this.fadeInList.enlist(obj);

    this.scene.add( obj );
    return obj.id;
  }

  // Remove an object
  remove(id: number, fadeOut: boolean) {
      var obj: THREE.Mesh  = <THREE.Mesh> this.get(id);

      var idFade: number = this.fadeInList.find(obj);
      if( idFade >= 0 ) this.fadeInList.remove(idFade);

      if( fadeOut ) {
        this.fadeOutList.enlist(obj);
      }
      else {
        this.scene.remove( this.get(obj.id) );
      }

  }

  // Position an object
  //
  position(id: number, position: Vector) {
    var obj: THREE.Object3D = this.get(id);
    obj.position.x = position.x;
    obj.position.y = position.y;
  }

  // Position an object
  //
  positionz(id: number, zindex: number) {
    var obj: THREE.Object3D = this.get(id);
    obj.position.z = zindex;
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
      if( obj.material.opacity > opacityDelta ) {
          obj.material.opacity -= opacityDelta;
      }
      else {
        obj.material.opacity = 0.0;
        this.fadeOutList.remove(id);
        this.scene.remove( this.get(obj.id) );
      }
    });
  }
}
