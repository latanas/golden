/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE.md for more details.

  http://www.atanaslaskov.com/golden/
*/

/// <reference path="game.ts" />
/// <reference path="renderer.ts" />

window.addEventListener("load", () => {
  var g = new Game( new ThreeRenderer() );
  g.actionFrame();
});
