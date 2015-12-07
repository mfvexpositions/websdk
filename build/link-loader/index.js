

var
  loaderUtils = require('loader-utils')
  ,cheerio    = require('cheerio')
  ,minify     = require('html-minifier').minify
;

module.exports = function(content) {

  // Store the loader context
  var
    loaderContext = this
    ,config       = loaderUtils.parseQuery(this.query)
    ,dom          = cheerio.load(content);
  ;

  // Extract the javascript
  var
    scripts = dom('script')
    ,code  = '// No javascript';
  ;

  if(scripts){
    scripts.remove();
    code = Array.prototype.map.call(scripts,function(currentScript){
      if(currentScript.attribs && currentScript.attribs.src){
        var path = currentScript.attribs.src;
        return 'require("clean!'+(path[0].match(/\./)?path:('./'+path))+'");'
      }
      else if(currentScript.children && currentScript.children[0] && currentScript.children[0].data){
        return currentScript.children[0].data;
      }
    }).join("\n");
  }

  // Find the imports and turn them into requires
  var
    imports  = dom('[rel="import"]')
    ,require = '// No dependencies'
  ;
  if(imports){
    imports.remove();
    requires = Array.prototype.map.call(imports,function(htmlImport){
      // Ensure relative links are explicit (implicit ones would be mapped to a module)
      var path = htmlImport.attribs.href;
      if( path[0]==='~' ) path = path.slice(1);
      else if( path[0]!=='.') path = './'+path;
      return 'require("clean!web!'+path+'");';
    }).join("\n")
  }

  // Extract the rest of the html and turn it into a string that will be inserted when
  // the module's javascript runs
  var
    domRegistration = '// No dom'
    ,htmlCode       = dom.html()
  ;

  if(htmlCode) {
    // Create a placeholder function that will be turned into string
    function insertHTML(){
      debug('Registered: __NAME__');
      var container = document.createElement('div');
      container.innerHTML = "__HTML__";
      document.head.appendChild(container); // Add it to the dom and it will auto register itself
      document.head.removeChild(container); // REVIEW: Remove it since by now polymer should already have registered it
    }

    // Should we minify the HTML
    if(config.minifyHTML){
      // Polymer uses attributes like $= which make html-minifier crash
      // so hide them before the minification, and return them to place
      // after the minification
      htmlCode = htmlCode.replace(/(\$|\!)=(\"|\')/g,'_____=$2$1');
      htmlCode = minify(htmlCode,{
        removeComments             : true
        ,collapseWhitespace        : true
        ,collapseBooleanAttributes : true
        ,minifyCSS                 : true
      });
      htmlCode = htmlCode.replace(/_____=(.)(.)/g,'$2=$1');
    }

    // Replace any new line with javascript and escape quotes
    htmlCode = htmlCode.replace(/(")|(\n|\r)/g,function(str,p1,p2) {
        if(p1) return '\\"';
        if(p2) return "\\n\"\n+\"";
    });

    // Create the DOM registration method
    if( htmlCode ){
      domRegistration = insertHTML
                          .toString()
                          .replace(/__NAME__/,loaderContext.resourcePath.split(/\\|\//).pop())
                          .replace(/__HTML__/,htmlCode);
      domRegistration = '!('+ domRegistration+')();';
    }
  }

  // Prepend the requires to the code
  code = requires
    + "\n\n"
    + "var debug=require('websdk/essential/log').default('web-loader');"
    + "\n\n"
    + domRegistration
    + "\n\n"
    + code
  ;

  // Set cacheable
  this.cacheable && this.cacheable();

  // Extract the javasript
  return code;
};
