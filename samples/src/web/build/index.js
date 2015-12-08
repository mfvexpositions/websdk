var
  buildFactory = require('websdk/build')
  ,build       = buildFactory( __dirname, function(){ console.log('Built..') } )
;

// =========== It is possible to modify the way the build works, we will get the defaults for now
// // Set where we are serving the artifacts from
// build.config.output.publicPath = '/artifacts/';

// // Remove this filter when creating multiple entry points (NOTE: This should be renamed anyways)
// build.conig.plugins = build.config.plugins.filter(function(plugin){
//   return !(plugin instanceof require('webpacck').optimize.CommonsChunkPlugin && plugin.chunkNames === 'common');
// });

// delete build.config.entry.common; // Remove any vendor
// delete build.config.entry.start; // Remove the start for now
// ============


// Set the entry point (you could have multiple, depending on how many segments
// you have on your app, they can be only libraries that attach themselved ot the running app)
build.config.entry['start'] = __dirname + '/../app_modules/demo/demo.js';

// Run the build
build.run();
