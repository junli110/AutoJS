var arguments = process.argv.splice(2);
var path = require('path');
var cheerio = require("cheerio");
var walk = require('./walk.js');
var fs = require("fs");
var beautify = require('js-beautify').html;
var Entities = require('html-entities').XmlEntities;
entities = new Entities();
//var pathroot='E:\\development\\workspace\\exchange\\exchange-web\\src\\main\\webapp\\tradeDetail.html'//arguments[0];
//var pathroot='E:\\development\\workspace\\crowdfunding\\pnk-web\\src\\main\\webapp\\WEB-INF\\views\\templates\\ybk\\ybkUsercenterLayout.jsp'
var pathroot = arguments[0];
//var debug=false;//arguments[1]=='debug';
var debug = arguments[1] == 'debug';
var pixfix = /.html$/
var pixfix1 = /.htm$/
var pixfix2 = /.jsp$/

var jspMatch =  /<%[\s\S]+%>/g

var headMatch = /<\s*head\s*>[\s\S]+<\s*\/\s*head\s*>/
var selector = "head script[src][compress!=false]";
var webRoot = ""
if (!pathroot.match(pixfix) && !pathroot.match(pixfix1)&& !pathroot.match(pixfix2) ) {
    console.log("请选择 html  文件");
    return;
}
var isJSP=!!pathroot.match(pixfix2)
var p = pathroot;

    webRoot = walk.getWebRoot(p);
    fs.readFile(p, {encoding: 'utf8'}, function (err, html) {
        if (err) {
            console.error(err);
            return;
        }
        var htmlPath = p.substr(0, p.lastIndexOf("\\"))
        var htmlName = p.substr(p.lastIndexOf("\\"));
        var minPath = webRoot + "\\resources\\minjs"
        var headHtml = html.match(headMatch);
        if (!headHtml) {
            console.log("文档中没有head 标签")
            return;
        }


        var jsfiles = []
        var readFromMinHtml = false;
        var minhtmlPath = webRoot + "\\resources\\minjs";
        var wirtHtml = false;
        var $ = cheerio.load(headHtml[0]),$script
        var jspCode

        if (!fs.existsSync(minPath)) {
            fs.mkdirSync(minPath)
        }

        var hash = path.relative(webRoot, p)
        minPath += htmlName + "." + hashCode(hash) + ".min.js"
        minhtmlPath = minPath.replace(/js$/, "html")

        var hasMinjs = false, hasOtherjs = false;
        console.log("扫描到要压缩的js 文件")
        function loopScripts(code) {
            jsfiles = []


            $script = cheerio.load(code)
            var s = $script(selector);
            if (!s) {
                console.log("没有扫描到要压缩的文件");
                return
            }
            for (var i = 0; i < s.length; i++) {
                if ($script(s[i]).attr("src")) {
                    var jsreltivePath=$script(s[i]).attr("src")
                    jspCode=jsreltivePath.match(jspMatch)
                    jsreltivePath=jsreltivePath.replace(jspMatch,"")
                    var jsp = path.join(isJSP?webRoot:htmlPath, jsreltivePath)

                    jsp = jsp.substr(0, jsp.indexOf("?") == -1 ? jsp.length : jsp.indexOf("?"))

                    console.log("\t" + path.relative(webRoot,jsp))
                    jsfiles.push(jsp)
                    if (jsp.match(/resources.minjs/)) {
                        hasMinjs = true;

                    } else {
                        hasOtherjs = true;

                    }
                }
            }
        }

        loopScripts(headHtml[0])
        if (hasMinjs && hasOtherjs) {
            console.log("请在debug 模式下添加 js 文件")
            return;
        }
        if (!hasMinjs && hasOtherjs) {
            //原Html 文件中 没有压缩 js文件 只有 没有压缩的js文件是 从写 minjs下的 html文件
            wirtHtml = true;
        }

        if (!hasOtherjs && hasMinjs) {
            var code = fs.readFileSync(minhtmlPath, {encoding: 'utf8'})
            loopScripts(code)
            readFromMinHtml = true;
            console.log("到下面的目录寻找 本页引用的 js文件 " + path.relative(webRoot,minhtmlPath))

        }
        console.log("压缩文件保存中：")
        console.log("\t" +path.relative(webRoot, minPath))
        if (fs.existsSync(minPath)) {
            fs.unlinkSync(minPath)
        }
        if (debug == false) {
            walk.jsMinifier(jsfiles, minPath);
        }
        if (debug == false && readFromMinHtml == false) {
            var scriptPath = minPath;
            scriptPath = scriptPath.substr(0, scriptPath.length - 2) + "html";

            var strScript = $.html($('<head></head>').html($(selector)))
            if (!fs.existsSync(scriptPath) || wirtHtml == true) {
                fs.writeFileSync(scriptPath, beautify(entities.decode(strScript), {indent_size: 4}), 'utf8');
            }
            $(selector).remove();
            if(isJSP){
                var minReltivePath = path.relative(webRoot, minPath)
            }else {
                var minReltivePath = path.relative(htmlPath, minPath)
            }
            minReltivePath = minReltivePath.replace(/\\/g, "/");
            $("head").prepend('\r\n<script  src="'+(!!jspCode?jspCode[0]+"/":'') + minReltivePath + '?version=' + new Date().getTime() + '" type="text/javascript" charset="utf-8"></script>');
            var htm = $.html();
            htm = beautify(htm, {indent_size: 4, 'preserve_newlines': false})
            htm = html.replace(headMatch, htm)

            fs.writeFileSync(p, entities.decode(htm), 'utf8');
        } else if (debug == true && readFromMinHtml == true) {

            $(selector).remove();

            $("head").prepend($script(selector));
            var htm = $.html();
            htm = beautify(htm, {indent_size: 4, 'preserve_newlines': false})
            htm = html.replace(headMatch, htm)

            fs.writeFileSync(p, entities.decode(htm), 'utf8');
        }
        console.log("SUCCESSED")

    });

function hashCode(str) {
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
