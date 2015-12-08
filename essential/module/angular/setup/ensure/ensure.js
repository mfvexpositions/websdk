
// IMPORTANT: This directive is similar to the funccionality provided by html imports
// but it allows for styling and works with the modules/libraries approach provided
// by this web sdk
var tmpl = require('./ensure.htm');

// Get the registry
import Debug from '../../../../log';
import Registry from '../../../registry';

// Create a debug method
var debug = Debug('essential:module:angular:ensure');

/**
 * @param  {AngularLib} lib must be an instance inheriting the AngularLib from essential
 * @param  {Object} config will contain the configuration for the current AngularLib
 * @param  {Object} settings will contain the settings for the current module
 */
export function setup(lib, config, settings){
  // Always named ensure as a convention, the underscore allows for no prefixing
  lib.addComponent('_ensure', {
    restrict: 'E' // Always use only an element for ensure
    ,compile: function ensureCompile(tElement, tAttrs, transclude){

      // Use the loader for this chunk
      var loader = Registry[tAttrs.import];
      if(!loader) throw new Error(`Chunk ${tAttrs.import} does not exist. Import {Registry} and add one (add one to the registry.js if common lib module).`)
    
      // If the loader was already processed then we can skip this process
      if( loader.__done === true ) return function(){ debug(`The registry item "${tAttrs.import}" has already been loaded.`) };

      // Obtain the original content, since it contains components that are expected to be defined in a seperate not yet loaded chunk
      var content = angular.element(tElement[0].children).remove();

      // Define a render method
      function render(scope, element){
        debug('Rendering after loading "${tAttrs.import}"');

        // Transclude and link the DOM tree !(transclude)(scope, link)
        !(lib.getService('$compile')( content ))(
          scope,
          function chunkTransclusion( contentClone, $scope ){
            element.empty();
            element.append( contentClone );
          }
        );
      }

      // The linking funciton will start loading the chunk and delay compilation
      return {
        pre: function ensurePreLink( $scope, element, attributes ){

          // Now we can proceed with the compilation
          var
            shell       = element // angular.element( element )
            ,shellScope = shell.scope()
          ;

          // If the loader was already processed then we can skip this process
          if( loader.__done === true ){
            render(shellScope, shell);
            return;
          }

          lib.getService('$compile')(tmpl)(shell.scope(), function(c){ shell.append(c); });

          // Load the chunk
          loader(config, function firstLoad(){

            // Ready to render the original content
            render(shellScope, shell);

            // Mark the loader as done
            loader.__done = true;

            // Trigger a $digest on the new tree
            try { shellScope.$digest(); }
            catch(e){ debug('Digest in progress. Module was already loaded.'); }
          })
        }
      }; // Returned linking functions
    } // End of compile method
  }); // End of component registration
}

// Export the registry
export {Registry};
