/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE.md for more details.

  http://www.atanaslaskov.com/golden/
*/

// Animation clock
//
class Clock{
  public clock: number; // Absolute time
  public dt:    number; // Time delta
  public fps:   number; // Frames per second

  private timeService: ()=> number;
  private fpsUpdateTime: number;
  private fpsElement: any;

  constructor( timeService: ()=>number = ()=> { return window.performance.now(); } ) {
    this.timeService = timeService;
    this.clock = this.timeService();

    this.fps = 60.0;
    this.dt  = 1.0/60.0;
    this.fpsUpdateTime = 0;

    // Reset clock when focus returns to the game window, or an FPS glitch will occur
    window.addEventListener("focus", () => {
      this.clock = this.timeService() - 1.0/60.0;
    });
    this.fpsElement = document.getElementById("fps");
  }

  public tick() {
    var t = this.timeService();
    this.dt = Math.min((t-this.clock)*0.001, 1.0); // Sec

    if( this.dt <= 0 ) {
      this.dt = 0.001;
    }
    this.fps = 1.0 / this.dt;
    this.clock = t;

    // Every 0.5 seconds, show an updated figure
    //
    this.fpsUpdateTime -= this.dt;

    if( this.fpsElement && (this.fpsUpdateTime <= 0) ) {
      this.fpsUpdateTime = 0.5;
      this.fpsElement.innerHTML = "Frame Rate: " + Math.round(this.fps) + "fps";
    }

    // Return the time difference, because it is what we need for animation
    return this.dt;
  }
}
