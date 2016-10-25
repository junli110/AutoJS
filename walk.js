var fs=require("fs");

function walk(path, handleFile) {  
    //handleFile(path, floor);  
    
    fs.readdir(path, function(err, files) {  
        if (err) {  
            console.log(err);  
        } else {  
            files.forEach(function(item) {  
                var tmpPath = path + '/' + item;  
                fs.stat(tmpPath, function(err1, stats) {  
                    if (err1) {  
                        console.log('stat error');  
                    } else {  
                        if (stats.isDirectory()) {  
                            walk(tmpPath, handleFile);  
                        } else {  
                            handleFile(tmpPath);  
                        }  
                    }  
                })  
            });  
  
        }  
    });  
}  
function getWebRoot(htmlFile) {
    var dir = htmlFile

    while (dir.length > 0) {
        dir = dir.split(/[\\/]/)
        dir.pop()
        dir = dir.join("\\")
        var files = fs.readdirSync(dir);
        var result = ""
        files.forEach(function (item) {
            var tmpPath = dir + '\\' + item;
            if (fs.statSync(tmpPath).isDirectory() && item == "WEB-INF") {
                result = dir;
            }
        })
        if (result) {
            return result;
        }
    }
}
//js
 var UglifyJS=require("uglify-js")
var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify;
function jsMinifier(flieIn, fileOut) {
     /*var flieIn=Array.isArray(flieIn)? flieIn : [flieIn];
     var origCode,ast,finalCode='';
     var result = UglifyJS.minify(flieIn, {
    //outSourceMap: "out.js.map"
	});
    fs.writeFileSync(fileOut, result.code, 'utf8');*/
    var flieIn=Array.isArray(flieIn)? flieIn : [flieIn];
    var origCode,ast,finalCode='';
    for(var i=0; i<flieIn.length; i++) {
        origCode = fs.readFileSync(flieIn[i], 'utf8');
        ast = jsp.parse(origCode);
        ast = pro.ast_mangle(ast);
        ast= pro.ast_squeeze(ast);
        finalCode +=';'+ pro.gen_code(ast);
    }
    fs.writeFileSync(fileOut, finalCode, 'utf8');
}
 
//jsMinifier('./file-src/test2.js', './file-smin/test-min.js');  //单个文件压缩
//jsMinifier(['./file-src/test.js','./file-src/test2.js'], './file-smin/test-min.js'); /
  
exports.walk = walk; 
exports.jsMinifier=jsMinifier;
exports.getWebRoot=getWebRoot;
