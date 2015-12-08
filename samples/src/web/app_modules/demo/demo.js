// By websdk convention, all requires should only be at the top
// these are not a standard, HTML imports solves this kind of issue
// but in the websdk HTML imports are not promoted. I prefer HTML
// imports though :)
// =======================================
require('./demo.less');

var
  settings = require('./settings.yaml')
  ,tmpl    = require('./demo.htm')
;

// =======================================

// Load some libraries
import angular from 'angular';

// Not necessary if using the default common chunk, this is already included
// Used for interop between angular 1.x and polymer 1.x bindings
import 'websdk/build/vendors/angupoly';

// Load needed some websdk dependencies
import {AngularModule as ComponentModule} from 'websdk/essential/module/angular';

// Include needed parts of the app
import lib from './lib';

// Include the paper input
import 'paper-input/paper-input.html';

// Include some files from this application
import './welcome';
import './welcome/title-polymer/title-polymer.html';
import './welcome/title-angular'; // Javascript files have default file name matching the parent directory

// We will enable the logging for demo purposes
// FOR DEMO PURPOSES, USUALLY YOU WOULD TYPE THIS INTO THE CONSOLE AS NEEDED
// ======================================================
window["@LOGGGING"]&&window["@LOGGGING"].enable('*');
console.warn('If you ran "npm run build" and this is the first time opening the page, refresh to see logs');
// ======================================================


// Everything is ready, create the app
var componentModule = new ComponentModule( {angular:angular}, settings, lib, tmpl );


// Export the Lib Initializer
// We can export the lib, but AngularModule will start this module automatically anyways
// export default Lib.init.bind( lib );
