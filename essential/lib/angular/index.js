

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

    // Let angular be defined before initialziation, ideally this is never happening
    this.angular = undefined;
  }

  // ==========================================
  // These are implmentation speific, create new classes for other libraries

  // Utility to easily add components
  addComponent(name, wcConfig){
    // Register the component using the configuration given
    var self=this;
    this.register(function init(config) {
      wcConfig.name = name[0]==='_' ? name.substr(1) : self.getId(strCapitalize(name));
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
  getService( name ){
    return (
      (this.__libConfig&&this.__libConfig.ngApp&&this.__libConfig.ngApp.getService)
        ? this.__libConfig.ngApp.getService(name)
        : this.__getService( name )
    )
  }

  // IMPORTANT:
  __getService( name ){
    // Angular needs to be provided
    if( !this.__libConfig.angular&&!this.anular )
      throw new Error(`
        You are attempting to get "${name}" service before the app has initialized.
        Please configure the library with a property named 'angular' and provide the angular object. E.g. lib.init({angular:angularReference})
      `)

    return (
      this.settings.selector
      // At this point the app must have provided at least a reference to angular during init
      // Ideally this.angular is never used, and even better if this point is not reached
        ? (this.__libConfig.angular||this.angular).element(this.settings.selector).injector().get(name)
        : (this.__libConfig.angular||this.angular).injector(ngInjectorModules).get(name) 
    );
  }
}


export default AngularLib;
