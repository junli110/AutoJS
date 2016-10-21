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

//js

var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify; 
 var UglifyJS=require("uglify-js")
function jsMinifier(flieIn, fileOut) {
     var flieIn=Array.isArray(flieIn)? flieIn : [flieIn];
     var origCode,ast,finalCode='';
     var result = UglifyJS.minify(flieIn, {
    //outSourceMap: "out.js.map"
	});
    fs.writeFileSync(fileOut, result.code, 'utf8');
}
 
//jsMinifier('./file-src/test2.js', './file-smin/test-min.js');  //单个文件压缩
//jsMinifier(['./file-src/test.js','./file-src/test2.js'], './file-smin/test-min.js'); /
  
exports.walk = walk; 
exports.jsMinifier=jsMinifier;