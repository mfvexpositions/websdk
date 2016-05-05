

// IMPORTANT:
// Essential lib is used by many libraries and or apps. Please avoid adding any dependency
// Specially full libraries like angular, jquery, etc is a no go, ask the apps to configure
// those globals within the __libConfig, so basically the config given during init

import EssentialLib from '../lib';
import Debug from '../../log';
var
  ngInjectorModules = ['ng']
  ,debug            = Debug('essential:lib:angular')
;

class AngularLib extends EssentialLib {
  constructor(){
    // Call the main constructor
    super();
  }

  // ==========================================
  // These are implmentation speific, create new classes for other libraries

  // Utility to easily add components
  addComponent(name, wcConfig){
    // Register the component using the configuration given
    var self=this;
    this.register(function init(config) {
      wcConfig.name = name[0]==='_' ? name.substr(1) : self.getId(name.substr(0,1).toUpperCase()+name.substr(1));
      config.ngApp.directive(wcConfig.name,()=>wcConfig);
      debug(`Registered component: ${wcConfig.name}`);
    });

    // TODO: Use the parent method
    // Export the directive, in case someone else wants to mixin the controller
    // or use some certain funccionality of its definition. Use with caution.
    return {
      conf: wcConfig
    }
  }
  // Get a service from the application
  getService( name, ignoreWarning ){
    return (
      (this.__libConfig&&this.__libConfig.ngApp&&this.__libConfig.ngApp.getService)
        ? this.__libConfig.ngApp.getService(name)
        : this.__getService( name, ignoreWarning )
    )
  }

  // IMPORTANT:
  // Use __libconfig for globals (the config on init)
  __getService( name ){
    // Angular needs to be provided
    if( !this.__libConfig.angular&&!this.anular )
      throw new Error(`
        You are attempting to get "${name}" service before the app has initialized.
        Please configure the library with a property named 'angular' and provide the angular object. E.g. lib.init({angular:angularReference})
      `);

    if(!ignoreWarning) console.warn(`
        Attempting to getService "${name}" Using angular to find an injector (lib:${this.settings.name}).
        Prefer ngApp having a getService method which has access to the injector created from bootstraping the application.
        Otherwise you will be missing some items with services like $compile (e.g. directives).
        You may also try lib.getService within a lib.register callback in order to defer getService request until the app has been bootstrapped.
      `);

    if(!ignoreWarning && !this.settings.selector) console.warn(`
        You are attempting to get the service "${name}", but no injector is available, will generate an injector for it including only the modules: ${ngInjectorModules}.
        Try at least adding a selector to the NgApp on the settings "${JSON.stringify(this.settings)}"
      `);

    return (
      this.settings.selector
      // At this point the app must have provided at least a reference to angular during init
      // Ideally this.angular is never used, and even better if this point is not reached
        ? (this.__libConfig.angular||this.angular).element(document.querySelector(this.settings.selector)).injector().get(name)
        : (this.__libConfig.angular||this.angular).injector(ngInjectorModules).get(name) 
    );
  }
}


export default AngularLib;
