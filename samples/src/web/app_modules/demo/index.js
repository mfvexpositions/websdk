// By websdk convention, all requires should only be at the top
// these are not a standard, HTML imports solves this kind of issue
// but in the websdk HTML imports are not promoted. I prefer HTML
// imports though :)
// =======================================
require('./index.less');

var
  settings = require('./settings.yaml')
  ,tmpl    = require('./index.html')
;

// =======================================

// Load some libraries
import angular from 'angular';
import 'angu-poly/angupoly';

// Load needed some websdk dependencies
import {AngularModule as ComponentModule} from 'websdk/essential/module/angular';


// Include needed parts of the app
import lib from './lib';

// Include the paper input
import 'clean!web!paper-input/paper-input.html';

// Include some files from this application
import './welcome';
import './welcome/title/title.web';

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
