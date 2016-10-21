var arguments = process.argv.splice(2);
var path = require('path');
var cheerio = require("cheerio");
var walk = require('./walk.js');
var fs=require("fs");
var Entities = require('html-entities').XmlEntities;
entities = new Entities();
var pathroot="F:\\exchange\\exchange-web\\src\\main\\webapp\\tradeDetail.html"//arguments[0];
var debug=false;
var pixfix=/.html$/
var pixfix1=/.htm$/
var folderKey=/webapp/
var jspMatch=/<\s*script.*src\s*=.+<\s*\/\s*script\s*>/g
if(!pathroot.match(pixfix)&&!pathroot.match(pixfix1)){
	console.log("请选择 html 文件");
	return;
}

var p=pathroot;
if(p.match(pixfix)&&p.match(folderKey)){
	fs.readFile(p, {encoding: 'utf8'}, function (err, html) {
	if(err) {
		 console.error(err);
		 return;
	}
	var htmlPath=p.substr(0,p.lastIndexOf("\\"))
	var htmlName=p.substr(p.lastIndexOf("\\"));
	var minPath=""
	var jspArr=html.match(jspMatch)

	 var $ = cheerio.load(jspArr.join('\r\n'));
	 var s=$("script[src]");//[comprees=true]
	 var jsfiles=[]

		if(!s){
			console.log("没有扫描到要压缩的文件");
			return
		}
		console.log("扫描到要压缩的js 文件")
	 for(var i=0;i<s.length;i++){
		 if($(s[i]).attr("src")){
			var jsp=path.join(htmlPath,$(s[i]).attr("src"))
		   
		   jsp=jsp.substr(0,jsp.indexOf("?")==-1?jsp.length:jsp.indexOf("?"))

		   console.log("\t"+jsp)
		   jsfiles.push(jsp)
		   if(jsp.match(/resources.js/)){
			   minPath=jsp.substr(0,jsp.indexOf('resources'))+"resources\\minjs"
			   if(!fs.existsSync(minPath)){
				   fs.mkdirSync(minPath)
			   }
			   minPath+=htmlName+"."+hashCode(p)+".min.js"
		   }
		}
	 }
		if(!minPath){
			console.log("ERROR ：早不到 min.js 要存放的路径 ")
			return;
		}
	 console.log("压缩文件保存到了：")
	 console.log("\t"+minPath)
		if(fs.existsSync(minPath)){
			fs.unlinkSync(minPath)
		}
	walk.jsMinifier(jsfiles,minPath);
	if(debug==false){
		var scriptPath=minPath;
		scriptPath=scriptPath.substr(0,scriptPath.length-2)+"html";
		var strScript=jspArr.join("\r\n")
		fs.writeFileSync(scriptPath, entities.decode(strScript), 'utf8');

		var minReltivePath=path.relative(htmlPath,minPath)
		minReltivePath=minReltivePath.replace(/\\/g,"/");

		jspArr&&jspArr.forEach(function(j,index){
			if(jspArr.length==index+1){
				html = html.replace(j, '<script src="'+minReltivePath+'" type="text/javascript" charset="utf-8"></script>')
			}else {
				html = html.replace(j, "")
			}
		})

		var htm=html;
		htm=htm.replace(/\r\n*\s*\r\n/g,'\r\n');
		fs.writeFileSync(p, entities.decode(htm), 'utf8');
	}
		console.log("SUCCESSED")
	 
	});
}
 function hashCode(str){
	var hash = 0;
	if (str.length == 0) return hash;
	for (i = 0; i < str.length; i++) {
		char = str.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}
