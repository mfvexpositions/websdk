

export default {
  
  // The following is a sample code of how to register new libraries with <ensure import="someregistrykey"></ensure>

  // // When this function is executed webpack will load a chunk, execute the exported function (should be a lib) and run the callback for ensure
  // someregistrykey: function(config, cb){
  //   // This will tell webpack to create a new chunk
  //   require.ensure(['../some/path/to/a/lib/dir'],function(require){
  //     cb(
  //       // Execute the libarary init (the libraries index should export its lib.init)
  //       // Config will be the configuration with which this module was created with
  //       require('../some/path/to/a/lib/dir')(config)
  //     );
  //   })
  // }
}
