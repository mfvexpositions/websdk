var
  settings = require('./settings.yaml')
  ,tmpl    = require('./index.html')
;

// Load some libraries
import angular from 'angular';

// Load needed some websdk dependencies
import {AngularModule as ComponentModule} from 'websdk/essential/module/angular';


// Include needed parts of the app
import lib from './lib';


// We will enable the logging for demo purposes
// FOR DEMO PURPOSES, USUALLY YOU WOULD TYPE THIS INTO THE CONSOLE AS NEEDED
// ======================================================
window["@LOGGGING"]&&window["@LOGGGING"].enable('*');
console.warn('If this is the first time opening the page, refresh to see logs');
// ======================================================


// Everything is ready, create the app
var componentModule = new ComponentModule( {angular:angular}, settings, lib, tmpl );


// Export the Lib Initializer
// We can export the lib, but AngularModule will start this module automatically anyways
// export default Lib.init.bind( lib );
