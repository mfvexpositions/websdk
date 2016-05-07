# Web SDK

| The websdk is a library to ease the creation of progressive web apps. It eases the use of multiple frameworks within the same build and overall application. Frameworks like **Angular**, **Polymer** and **ReactJS** (pending react integration). In tandem with npm and some node_modules it can replace most/all of the need for **grunt**, **gulp**, **vulcanize** and **crisp**. It uses **babel** to enable ES2015 features, even for you polymer web components in .html or .web

Features:
- Simple build system (based on webpack):
- Lazy load angular modules
- Declerative imports (even for angular)
- Allows for incremental migration between frameworks
- Lazy load packaged library definition (websdk/essential/lib)
- **build** Not opinionated in terms of directory structure
- **build** Minification of your files when running --env prod flag
- **build** Bundling of files
- - **build** "Not" opinionated in terms of dependency manager (use bower or npm). Suggested to use npm, *bower_components* must be *web_modules* (you can still use bower_components by changing the build.config)

### How to use

```
npm install websdk
npm install live-server # Not required, only for demo purpose
```

Create **./your-build.js**
```
// build.config will be the webpack config
// Access to loaders object through build.loaders. Object.keys(build.loaders)
// Access to plugins object through build.plugins. Object.keys(build.plugins)

var build = require('websdk/build');
build.config.output.publicPath = '/artifacts/'; // Server url path
build.config.websdk.enableHtmlImport = false; // .web ext for html imports
build.config.entry.style = __dirname + '/any/file/for.css'; // Or less or sass
build.config.entry.start = __dirname + '/any/file/for.js'; // JavaScript
build.run();
```

Run your build with
```
node ./your-build.js --od=artifacts --w
```

Create an **./index.html**
```
<!DOCTYPE html><html><head></head><body>
<script src="artifacts/style.bundle.js"
<script src="artifacts/start.bundle.js"
</body></html>
```

Run your server
```
live-server .
```

### Angular <-> Polymer sample

Use the [WebSDK Samples](https://github.com/juliostanley/websdk-samples) as a template/recipe to create a project that uses the websdk.

### Work in progress
This is just the initial version, more to come soon. Many things supported in this release are not available in the sample code

### FAQs
- **Why use javascript for css?** To not block rendering (some browsers still block when using link tags), you can deliver a spinner while base styles load

- **Can I customize the webpack config?** Yes. Its all under build.config, change it before executing build.run()

- **I would like stats on my build** Run your build with the flag ```--profile``` and upload it to [Webpack Analyse](https://webpack.github.io/analyse/)

- **Can I load paper elements?** Yes. Just load it on your .js file with ES, CommonJS or AMD: ```import 'paper-input/paper-input.html';```, ```require('paper-input/paper-input.html');```, it will be ready for use on your page

- **Can I make angular 1 work with polymer 1?** Yes. Just import ```import 'websdk/build/vendors/angupoly';```, it uses [angupoly](https://github.com/matjaz/angu-poly), add 'angupoly' as a dependency on your angular app.

- **Can I lazy load angular directives?** Yes

- **Should I continue using angular value,constant,service,factory,provide,module** No. Stop using them. For services export singletons, for factories functions, values export utilities. If you need access to modules from the injector, get the DOMElement of you app and run ```e.g  element.injector().get('$timeout')```. The suggested approach is to use the ```websdk/essential/lib``` then lib.getService('$timeout'). Look in the [WebSDK Samples](https://github.com/juliostanley/websdk-samples)

- **Does this support ES2015/ES6** Yes, it by default uses babel on any module under **app_modules**

- **Under what directory should I store my code** A directory named **app_modules**, this will act like if they were in **node_modules** or **web_modules**

- **How do I separate my app into multiple bundles** Create multiple entires, or.. more info coming soon. (There is a cool way to load bundles declerativly with ```<ensure import="bundle.filename"></ensure>```)

- **...sooo my gulp/grunt task manager?** For the most not needed, use npm scripts to run commands  ```npm run <command>```

### Suggested commands for package.json
```
"scripts": {
  ,"start"              : "live-server --path=./gui"
  ,"postinstall"        : "bower install"
  ,"postupdate"         : "bower update"
  ,"build"              : "node ./tools/build.js --od ./gui/artifacts"
  ,"build:some"         : "node ./tools/build.js --od ./gui/artifacts --sc some,maybeother"
  ,"build:help"         : "node ./tools/build.js --help"
  ,"build:profile"      : "node ./tools/build.js --od ./gui/artifacts --pf"
  ,"build:watch"        : "node ./tools/build.js --od ./gui/artifacts --w"
  ,"build:watch:dist"   : "node ./tools/build.js --od ./gui/artifacts --w --env prod --kl"
  ,"build:watch:css"    : "node ./tools/build.js --od ./gui/artifacts --w --env prod --smcss"
  ,"build:watch:raw"    : "node ./tools/build.js --od ./gui/artifacts --w --devtool="
  ,"build:debug"        : "node ./tools/build.js --od ./gui/artifacts --w --env prod --kl --sm"
  ,"build:debug:css"    : "node ./tools/build.js --od ./gui/artifacts --w --env prod --kl --sm --smcss"
  ,"build:dist"         : "node ./tools/build.js --od ./gui/artifacts --w --env prod"
  ,"sdk:link"           : "rimraf ./node_modules/websdk && cd ./node_modules && sudo cmd /c mklink /D websdk ..\\app_modules\\websdk"
  ,"deps"               : "npm list --depth=0"
  ,"git:nicer"          : "git config diff.submodule log"
}
```

## Things to notice or not obvious in the samples
- Open your console and look at the logs
- Angular is mixed with polymer
- HTML Imports are allowed, and work with webpack notice [demo.js](./samples/src/web/app_modules/demo) and [title-polymer.html](./samples/src/web/app_modules/demo/welcome/title-polymer)
- The build supports chunks by using ```build.config.websdk.lib = {name:'path'}```
- Chunks can be loaded async using ```<ensure import="">content pending</ensure>```
- Paper elements and angular code are bundled
- No link tag blocking rendering (try throttling your connection), the site weights under 2K uncompressed, you prob want to stop the live-server and use a standard HTTP server
- Changes to files take around one second since webpack only needs to do partial rebuilds when watching files
- The build supports source maps and complete minification (even of HTML imports)
