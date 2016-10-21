var arguments = process.argv.splice(2);
var path = require('path');
var cheerio = require("cheerio");
var walk = require('./walk.js');
var fs=require("fs");
var beautify = require('js-beautify').js_beautify
var Entities = require('html-entities').XmlEntities;
entities = new Entities();
var pathroot=arguments[0];
var debug=arguments[1]=='debug';
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
	 var $ = cheerio.load(html);
	 var s=$("head script[src][compress!=false]");//[comprees=true]
	 var jsfiles=[]
		var readFromMinHtml=false;
		var minhtmlPath;
		var wirtHtml=false;
		var $1
		if(!s){
			console.log("没有扫描到要压缩的文件");
			return
		}
		console.log("扫描到要压缩的js 文件")
		function loopScripts(code) {
			jsfiles=[]

			minPath=""
			$1 = cheerio.load(code)
			s=$1("head script[src][compress!=false]");
			for (var i = 0; i < s.length; i++) {
				if ($(s[i]).attr("src")) {
					var jsp = path.join(htmlPath, $(s[i]).attr("src"))

					jsp = jsp.substr(0, jsp.indexOf("?") == -1 ? jsp.length : jsp.indexOf("?"))

					console.log("\t" + jsp)
					jsfiles.push(jsp)
					if (jsp.match(/resources.js/)) {
						minPath = jsp.substr(0, jsp.indexOf('resources')) + "resources\\minjs"
						if (!fs.existsSync(minPath)) {
							fs.mkdirSync(minPath)
						}
						minPath += htmlName + "." + hashCode(p) + ".min.js"
					}
					if (jsp.match(/resources.minjs/)) {
						minhtmlPath = jsp.replace(/js$/, "html")
						//minPath += htmlName + "." + hashCode(p) + ".min.js"
					}
				}
			}
		}
		loopScripts(html)
		if(minPath&&minhtmlPath){
			console.log("请在debug 模式下添加 js 文件")
			return;
		}
		if(!minhtmlPath&&minPath){
			//原Html 文件中 没有压缩 js文件 只有 没有压缩的js文件是 从写 minjs下的 html文件
			wirtHtml=true;
		}

		if(!minPath&&minhtmlPath){
			var code=fs.readFileSync(minhtmlPath, {encoding: 'utf8'})
			loopScripts(code)
			readFromMinHtml=true;
			console.log("到下面的目录寻找 本页引用的 js文件 "+minhtmlPath)

		}
	 console.log("压缩文件保存中：")
	 console.log("\t"+minPath)
		if(fs.existsSync(minPath)){
			fs.unlinkSync(minPath)
		}
	walk.jsMinifier(jsfiles,minPath);
	if(debug==false&&readFromMinHtml==false){
		var scriptPath=minPath;
		scriptPath=scriptPath.substr(0,scriptPath.length-2)+"html";
		var strScript=""
		for(var i=0;i<$("head script[src][compress!=false]").length;i++){
			strScript+=$.html($("head script[src][compress!=false]")[i])+"\r\n"
		}
		strScript= $.html($('<head></head>').html(strScript))
		if(!fs.existsSync(scriptPath)||wirtHtml==true) {
			fs.writeFileSync(scriptPath, entities.decode(strScript), 'utf8');
		}
		$("head script[src][compress!=false]").remove();
		var minReltivePath=path.relative(htmlPath,minPath)
		minReltivePath=minReltivePath.replace(/\\/g,"/");
		$("head").prepend('\r\n<script  src="'+minReltivePath+'?version='+new Date().getTime()+'" type="text/javascript" charset="utf-8"></script>');
		var htm= $.html();
		htm=htm.replace(/\r\n*\s*\r\n/g,'\r\n');
		fs.writeFileSync(p, entities.decode(htm), 'utf8');
	}else if(debug==true&&readFromMinHtml==true){
		var str="\r\n"
		$("head script[src][compress!=false]").remove();
		for(var i=0;i<$1("head script[src][compress!=false]").length;i++){
			str+=$1.html($1("head script[src][compress!=false]")[i])+"\r\n"
		}
		$("head").prepend(str);
		var htm= $.html();
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
