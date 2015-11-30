

// IMPORTANT:
// Essential lib is used by many libraries and or apps. Please avoid adding any dependency
// Specially full libraries like angular, jquery, etc is a no go, ask the apps to configure
// those globals within the __libConfig, so basically the config given during init

import strCapitalize from 'lodash/string/capitalize';
import Debug from '../log';
var
  debug = Debug('essential:lib')
;

class EssentialLib {
  getSettings(){
    throw new Error('You must implment getSettings(), in order to use this feature from EssentialLib. Return an object with at least name and prefix properties.');
  }
  getId(name){
    throw new Error('You must implement getId(name), in order to use this feature from EssentialLib. Return a unique component name with a prefix.');
  }
  constructor(){
    this.loaded = false;
    this.initializers = [];
    this.settings = this.getSettings();

    // Do not access from outside
    this.__libConfig = undefined;
  }
  preRegister(initializer){
    this.initializers.unshif( initializer );
    if(this.loaded) this.init();
  }
  register(initializer){
    this.initializers.push( initializer );
    if(this.loaded) this.init();
  }
  init(config){
    // Only set the configuration once
    if(!this.__libConfig) this.__libConfig = config;

    // Notify about the action
    debug(`Hello ${this.settings.name} Running ${this.initializers.length} initializers`, this.initializers);

    // Run each of the initializers still pending
    this.initializers.forEach(initializer => initializer(this.__libConfig, this.settings));

    // Clear the initializers
    this.initializers = [];

    // Set the this.loaded flag to true
    this.loaded = true;
  }

  // ==========================================
  // The following should be implemented, but usually they should be offered under the lib for a specific framework

  // Utility to easily add components
  addComponent(name, wcConfig){
    throw new Error('You must implement addComponent(name, wcConfig), in order to use this feature from EssentialLib. Create a framework specific addComponent like the one of AngularLib.')
  }
  // Get a service from the application
  getService( name ){
    throw new Error('You must implement getService(name), in order to use this feature from EssentialLib. Create a framework specific getService like the one of AngularLib.')
  }
}


export default EssentialLib;
