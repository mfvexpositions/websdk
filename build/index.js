// To support older versions of node
if(typeof Promise === 'undefined') global.Promise = require('promise');

// Main module
module.exports = function webpackConfig( dirName, done ) {

  // Run with NodeJS in order to see the command documentation
  var argv = require('optimist')
    .usage('Usage: $0 -- od [str] --pp [str] [--w [bool] --sm [bool] --fp [str] --cwd [str] --dt [str]]')
    .default({
      pp    : '/assets/'
      ,fp   : './files'
      ,w    : false
      ,kl   : false
      ,sm   : false
      ,cwd  : process.cwd()
      ,dt   : 'inline-source-map'
      ,env  : 'dev'
      ,dd   : false
      ,pf   : null
      ,sc   : 'all'
    })
    .alias('od','out-dir').describe('od', 'The directory were the bundles should be saved at')
    .alias('pp','public-path').describe('pp', 'The pulbic path for the bundled files')
    .alias('fp','files-path').describe('fp', 'Relative path from --od to export files referenced in src')
    .alias('kl','keep-log').boolean('kl').describe('kl', 'Weather to keep the logs or remove them')
    .alias('w','watch').boolean('w').describe('w', 'Watch files that change. Only watches compiled files')
    .alias('sm','sourcemap').boolean('sm').describe('sm', 'Force sourcemap to be enabled and use --dt')
    .alias('smcss', 'sourcemapscss').boolean('smcss').describe('smcss','Force sourcemap for css/less/scss to be enabled and use --dt')
    .alias('dt','devtool').describe('dt', 'Choose a developer tool. File size increases')
    .alias('dd','dedupe').boolean('dd').describe('dd', 'Dedupe files in order to descrize file size')
    .alias('env','environment').describe('env', 'Choose environment. dev, qa or prod')
    .alias('pf','profile').describe('pf', 'Enable the profiling during compilation. --pf someName')
    .alias('sc','scope').describe('sc', 'Define a scope. --sc all,myapp,otherentry')
    .demand(['od'])
    .argv
  ;

  // This is a special case in case websdk is being used for frontend development
  var amdPathcingTest = null;
  try{ amdPathcingTest = path.resolve( require.resolve('jquery'),'../../src/selector.js') }
  catch(err){} // jQuery is not needed

  var
    run                = !argv.w
    ,scope             = argv.scope.split(',')
    ,outDir            = argv.od
    ,publicPath        = argv.pp
    ,fileDir           = argv.fp 
    ,devtool           = argv.dt
    ,env               = argv.env
    ,dedupe            = argv.dd
    ,profile           = argv.pf
    ,allowSM           = argv.sm || (env!=='prod') // If not prod then source maps are allowed
    ,allowSMCSS        = argv.smcss
    ,stripLog          = argv.kl || (argv.env!=='prod'&&!argv.kl) ? '' : '!strip?strip[]=debug,strip[]=console.log'
    ,webpack           = require('webpack')
    // ,ProgressPlugin    = require("webpack/lib/ProgressPlugin")
    ,defaultFilePlugin = require('./plugin/DirectoryDynamicDefaultFilePlugin')
    // ,ngAnnotate     = require('ng-annotate-webpack-plugin')
    ,ExtractTextPlugin = require('extract-text-webpack-plugin')
    ,fs                = require('fs')
    ,path              = require('path')

    // Utility variables and functions
    ,pathSepExp        = /\\|\/|\\\\/g
    ,jsIncludeDir      = ['app_modules/websdk','node_modules/websdk','web_modules/websdk']
    ,jsExcludeDir      = jsIncludeDir.map(function(filepath){return filepath+'(.+)?/node_modules'})
    ,expressions       = {
      jsIncludeDir        : new RegExp(jsIncludeDir.join('|'))
      ,jsExcludeDir       : new RegExp(jsExcludeDir.join('|'))
      ,jsAlwaysIncludeDir : /node_modules|web_modules|app_modules(\\|\/)vendor/
    }
    ,shouldTranspile   = function(filepath){
      filepath = filepath.replace(pathSepExp,'/'); // Use unix paths regardless. Makes these checks easier
      if(filepath &&
        (
          ( // If filepath has the jsIncludeDir, but does not include the node_modules directory under them
            filepath.match(expressions.jsIncludeDir)
            && !filepath.match(expressions.jsExcludeDir)
          )
          // Or the filepath has nothing to do with node_modules, web_modules or app_modules/vendor
          || !filepath.match(expressions.jsAlwaysIncludeDir)
        )
      ) {
        // console.log('===================================')
        // console.log(filepath)
        // console.log('### Transpiling: '+filepath);
        return true;
      }
    }

    // Keep a list of the loaders and expose it to the build
    ,loaders = {}

    // Keep a list of the plugins and expose it to the build
    ,plugins = {}

    // Configuration for webpack
    ,config = {
      // Configuration specific to the websdk
      websdk : {
        defaultFiles               : null // If user has set to a value no dynamic default files will be used
        ,dynamicDefaultFilesIgnore : /debug$/ // Ignoring some directories, that are know to belong to modules with files named the same as the directory
        
        // If previous artifact builds should remain
        ,disableClean : false

        // Common takes care of bundling the most common packages
        ,enableCommon : false

        // Libraries to match for amd patching
        ,amdPathcingTest : amdPathcingTest

        // When polymer is enabled the extension .html is used for html-imports
        ,enableHtmlImport : false

        // Allow webpack progress to be shown
        ,progress: true

        // Cache the build files
        ,cache: {}

        // Lib is used to create chunks that can later be lazy loaded
        // Libs should include, <index>.js, lib.js and settings.yaml
        // They should export form their <index>.js the lib.init function
        // Use { registryKeyName: 'modulename/some/path/to/lib/<index>' }
        ,lib : null
      }

      // context: argv.c,
      ,entry: {
        start : dirName + '/../app_modules/index.js' // Starting point
      }
      ,lib     : {} // The concept of libraries is part of the websdk
      ,profile : profile ? true : false
      ,cache   : true
      ,output  : {
        path           : outDir
        ,filename      : '[name].bundle.js'
        ,chunkFilename : '[name].chunk.js'
        ,publicPath    : publicPath
      }
      ,resolve: {
        modulesDirectories: ['app_modules', 'node_modules', 'web_modules'] // Only main files
      }
      // To resolve loaders
      ,resolveLoader: {
        // The default configuration can be found at https://webpack.github.io/docs/configuration.html#resolveloader
        modulesDirectories : ['node_modules', 'node_modules/websdk/build', 'node_modules/websdk/node_modules', 'app_modules/websdk/node_modules']
        ,extensions        : ['', '.webpack-loader.js', '.web-loader.js', '.loader.js', '.js']
        ,packageMains      : ['webpackLoader', 'webLoader', 'loader', 'main']
        ,moduleTemplates   : ['*-webpack-loader', '*-web-loader', '*-loader', '*']
        // Adding alias for babel and web loader
        ,alias : {
          sdkes  : 'babel?optional[]=runtime'
          ,web   : 'link' + (env!=='dev' ? '?minifyHTML=true' : '')
          ,clean : stripLog ? stripLog.replace(/!/,'') : 'noop'
        }
      }
      ,plugins : []
      ,module  : {
        loaders: [
          // Javascript excluding node_modules and web_modules except for this library
          loaders.ES    = { test: /\.js$/, loader: 'sdkes'+stripLog, include: shouldTranspile }

          // Styles
          ,loaders.css  = { test: /\.css$/, loader: 'style!css'+ (allowSMCSS ? '?sourceMap=true' : '') }
          ,loaders.less = { test: /\.less$/, loader: 'style!css'+ (allowSMCSS ? '?sourceMap=true' : '') +'!less' + (allowSMCSS ? '?sourceMap=true' : '') }
          ,loaders.sass = { test: /\.(sass|scss)$/, loader: 'style!css'+ (allowSMCSS ? '?sourceMap=true' : '') + '!resolve-url' + (allowSMCSS ? '?sourceMap=true' : '') + '!sass?' + (allowSMCSS ? '?sourceMap=true' : '') }

          // Config files
          ,loaders.yaml = { test: /\.yaml$/, loader: 'json!yaml' }
          ,loaders.json = { test: /\.json$/, loader: 'json!json' }

          // Use htm extenstion for html files that should be loaded as strings
          // In case of an extension html, then use require("!!html!file-path") as needed
          ,loaders.html = { test: /\.htm$/, loader: 'html', exclude: /((web_modules|node_modules)(\/|\\|\.)polymer|paper-|iron-|carbon-|font-)/ }

          // HTML Imports
          // Enable the usage of <link rel="import"> and allow sdkes to be used against it
          ,loaders.importES = { test: /\.html$/, loader: 'sdkes'+stripLog+'!web', exclude: /((web_modules|node_modules)(\/|\\|\.)polymer|paper-|iron-|carbon-|font-)/ }
          ,loaders.import   = { test: /\.html$/, loader: 'clean!web', include: /((web_modules|node_modules)(\/|\\|\.)polymer(\/|\\|\.)|paper-|iron-|carbon-|font-)/ }

          // Fonts
          ,loaders.ttf  = { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader?name='+fileDir+'/[hash].[ext]&limit=10000&mimetype=application/x-font-ttf'}
          ,loaders.woff = { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?name='+fileDir+'/[hash].[ext]&limit=10000&mimetype=application/font-woff'}

          // Images
          ,loaders.png  = { test: /\.png/, loader: 'url?name='+fileDir+'/[hash].[ext]&limit=10000&mimetype=image/png' }
          ,loaders.jpg  = { test: /\.jpg/, loader: 'url?name='+fileDir+'/[hash].[ext]&limit=10000&mimetype=image/jpg' }
          ,loaders.gif  = { test: /\.gif/, loader: 'url?name='+fileDir+'/[hash].[ext]&limit=10000&mimetype=image/gif' }
          ,loaders.svg  = { test: /\.svg/, loader: 'url?name='+fileDir+'/[hash].[ext]&limit=10000&mimetype=image/svg+xml' }
        ]
      }
      ,htmlLoader: {
        collapseBooleanAttributes: false
      }
      ,sassLoader: {
        includePaths: [
          require('node-bourbon').includePaths
          ,path.resolve(path.join(__dirname,'../../compass-mixins/lib'))
        ]
      }
    }
  ;

  // Add a few more loaders if needed
  // special loader for vendor modules
  // jQuery has an AMD bug, and needs to be patched for now
  amdPathcingTest = amdPathcingTest || config.websdk.amdPathcingTest;
  if(amdPathcingTest){
    config.module.loaders.push(
      loaders.definePatch = { test: amdPathcingTest, loader: 'amd-define-factory-patcher-loader'}
    );
  }

  // Add more settings to the configuration
  var allowDevtool = (!!devtool) && env!=='prod';
  if(allowDevtool||allowSM) config.devtool = devtool;
  if(allowDevtool||allowSMCSS) config.devtool = devtool;

  var defaultFiles = ['index'];
  config.plugins.push(
    plugins.resolver = new webpack.ResolverPlugin([
      new defaultFilePlugin(function(fpath){
        // Check if default files should be modified
        if(config.websdk.defaultFiles) return config.websdk.defaultFiles;
        if(fpath.match(config.websdk.dynamicDefaultFilesIgnore)) return ['index'];

        // Otherwise add the directory name as the possible default file name too
        var name = fpath.split(path.sep).pop();
        return ['index',name];
      })
    ], ['normal'])
  );

  // Add some more plugins
  config.plugins.push(plugins.extract = new ExtractTextPlugin('[name].css'));
  config.plugins.push(plugins.context = new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/)); // Do not allow all locales to be loaded for moment. TODO: Figure out how to allow it if needed

  // Remove the logging module from source
  // if(stripLog){
  //   config.plugin.push(new webpack.NormalModuleReplacementPlugin(/websdk\/essential\/log/, __dirname + '/noop.js'));
  // }

  // If running for qa or prod
  if(env!=='dev') {

    config.plugins.push(
      // NOT PROMOTING THIS. DO NOT ENABLE. DEVELOPERS SHOULD TYPE THEIR DEPS AND NOT SLOW DOWN BUILD
      // new ngAnnotate({
      //   add        : true
      //   ,sourcemap : allowDevtool
      // })
      plugins.uglify = new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
        ,mangle: {
          // except: ['angular']
        }
      })
    );
    // If prod or dedupe enabled then we will run the deduping feature
    // if (dedupe||env=='prod') config.plugins.unshift(new webpack.optimize.DedupePlugin());
  }

  function handleCompile(err, stats){
    if(err)
      throw err;
    var jsonStats = stats.toJson();
    if(jsonStats.errors.length > 0)
      throw jsonStats.errors.join();
    if(jsonStats.warnings.length > 0)
      throw jsonStats.warnings.join();

    var moduleCount='N/A';
    if(config.websdk.cache){
      moduleCount = Object.keys(config.websdk.cache).length;
    }

    // Only show the stats if progress is not enabled
    if(!config.websdk.progress) console.log(stats.toString({colors:true}));
    console.log('====================================');
    console.log('Webpack completed build');
    console.log('Output dir was set to ', outDir);
    // TODO: Review why stripLog is making files non-cacheable during build
    if(stripLog) console.log('WARNING: You should use the flag --kl in order to keep the logs and allow files to be cacheable');
    if(config.websdk.cache){ console.log('Cached: '+moduleCount+' modules'); }
    console.log('If you need stats then run with --profile flag or disable config.websdk.progress.');
    if(!run){
      console.log('Webpack has locked this process. Watching file that were part of the build.');
    }

    if(profile){
      var filePath = path.resolve(dirName,'..','profile.stats.json')
      console.log('Saving profile to: ' + filePath);
      console.log('Visualize profile using (it will not be actually uploaded): http://webpack.github.io/analyse');
      fs.writeFileSync( filePath, JSON.stringify(jsonStats) );
    }

    // If a done method is configured, then execute it
    done && done(err, stats, this, config.websdk.cache); // this => webpack compiler
  }

  return {
    argv     : argv
    ,scope   : scope
    ,config  : config
    ,plugins : plugins
    ,loaders : loaders // Provides a direct reference to the loaders, so users can modify extensions, includes, etc as needed. They can always just remove/add items from the list config.module.loaders
    ,run     : function(){
      // Create the chunk splits
      createChunkSplits(config, dirName);

      // Clean the directory if needed
      if(!config.websdk.disableClean){
        rmDir(argv.od);
      }

      // If the user does not want polymer/html-imports enabled, then disable the loader and allow html to be loaded as a string
      if(!config.websdk.enableHtmlImport){
        loaders.importES.test = /\.web$/; // They will still be available if the extension is htmlx
        loaders.import.test   = /\.html$/; // Leave this one, since it has an explicit include, chances of collision are low, and they can still use .htmlx without problems
        loaders.html.test     = /\.(htm|html)$/; // Html is back to normal string loading
      }

      // Common loads the most common libraries, and the ones needed for integration
      if(config.websdk.enableCommon){
        // Create vendor entries
        // TODO: This approach copies the entire vendor library even if not used, find a better solution
        config.entry.common = __dirname + '/vendors/bundle.js'; // Common modules between entry files will go here (should be the first file to be loaded)
        config.plugins.push(new webpack.optimize.CommonsChunkPlugin( /*bundlename*/ 'common', /*filename*/ 'common.bundle.js' ));
      }

      // Notify about the action
      console.log('Building from scratch, this might take some time');
      console.log('====================================')

      // Create the compiler
      var compiler = webpack(config);

      // Check if the cache is enabled
      if(config.websdk.cache) {
        compiler.apply(new webpack.CachePlugin(config.websdk.cache));
      }

      // Check if the progress shuld be added
      if(config.websdk.progress){
        var chars = 0;
        compiler.apply(new webpack.ProgressPlugin(function(percentage, msg) {
          if(percentage < 1) {
            percentage = Math.floor(percentage * 100);
            msg = percentage + "% " + msg;
            if(percentage < 100) msg = " " + msg;
            if(percentage < 10) msg = " " + msg;
          }
          for(; chars > msg.length; chars--)
            process.stdout.write("\b \b");
          chars = msg.length;
          for(var i = 0; i < chars; i++)
            process.stdout.write("\b");
          process.stdout.write(msg);
        }));
      }


      if(run){
        compiler.run(handleCompile.bind(compiler))
      } else {
        compiler.watch({
          aggregateTimeout: 300 // Wait so long for more changes
          // ,poll: true // Use polling instead of native watchers
          // pass a number to set the polling interval
        },handleCompile.bind(compiler));
      }
    }
  }

  // ================================================

  // Load all vendor libraries into a single module
  // var vendors = [];
  // try{ vendors.push.apply(vendors, Object.keys(require(path.resolve(process.cwd(),'package.json')).dependencies)) }
  // catch(e) { console.error('Issue finding a package.json at ' + process.cwd(), e); }
  // try{ vendors.push.apply(vendors, Object.keys(require(path.resolve(process.cwd(),'bower.json')).dependencies)) }
  // catch(e) { console.error('Issue finding a bower.json at ' + process.cwd(), e); }

  // try{ vendors.push.apply(vendors, fs.readdirSync(path.resolve(process.cwd(),'./node_modules'))) }
  // catch(e) { console.error('Issue finding node_modules at ' + process.cwd(), e); }
  // try{ vendors.push.apply(vendors, fs.readdirSync(path.resolve(process.cwd(),'./web_modules'))) }
  // catch(e) { console.error('Issue finding web_modules at ' + process.cwd(), e); }

  // config.entry.vendor = vendors;

}


// ==========================================

// Get a reference to the file system library
var
  fs    = require('fs')
  ,path = require('path')
;

// ==================================================

// Utility function to remove directories
function rmDir(dirPath){
  console.log('Attempting to clean: ' + dirPath);
  try { var files = fs.readdirSync(dirPath); }
  catch(e) { return; } // No files to clean
  if(files.length > 0)
    for (var i = 0; i < files.length; i++){
      var filePath = dirPath + '/' + files[i];
      if (fs.statSync(filePath).isFile())
        fs.unlinkSync(filePath);
      else
        rmDir(filePath);
    }
  try { fs.rmdirSync(dirPath); }
  catch(e) { return; }
}


// ==================================================


// Utility function to scan directories
function scanDir(dir, done) {
  console.log('Scanning directory: '+dir);
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          scanDir(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};


// ==================================================


// Create a file with references that will create library chunks if used
function createChunkSplits(config, dirName){

  // Only if there are libs to process
  if(!config.websdk.lib) return;

  // Notify about it
  console.log('Creating library splits');

  // Create a common loader
  var loader = function(config, cb){
    // This will tell webpack to create a new chunk
    rq.ensure(['INDEX_PATH'],function(rq){
      cb(
        // Execute the libarary init (the libraries index should export its lib.init)
        // Config will be the configuration with which this module was created with
        rq('INDEX_PATH')(config)
      );
    },'NAME')
  }

  // For each lib in the config or for each app_module
  var
    loaders = []
    fileOut = dirName + '/libraries.websdk.js'
    names   = Object.keys(config.websdk.lib)
  ;
  if( !names.length ) return;
  names.forEach(function(it){
    var libPath = path.resolve(config.websdk.lib[it]).replace(/\\/g,'/');

    // Add the definition for this loader
    loaders.push(
      'Registry["' + it + '"] = ' + loader.toString()
        .replace(/INDEX_PATH/g, libPath)
        .replace(/NAME/g, it)
        .replace(/rq/g,'require')
    );
  });

  // Create the libraries file, this file can be committed if desired
  fs.writeFileSync( fileOut,
    'import Registry from "websdk/essential/module/registry";\n'
    + loaders.join("\n")
  );
  console.log('Created a library at: ' + fileOut);
  console.log('If you require this file from a runtime file, chunks will be generated for you');
}
