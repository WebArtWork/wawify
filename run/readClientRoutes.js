var fontifier = require('svg-fontify');
var minifier = require('js-minify');
var fse = require('fs-extra');
var path = require('path');
var fs = require('fs');
var request = require('request');
var parallelKeyInObj = function(obj, func, callback){
	var counter = 0;
	for(var key in obj){
		counter++;
		func(key, obj[key], function(){
			if(--counter===0) callback();
		});
	}
}
module.exports = function(app){
	var themeInfo = fse.readJsonSync(process.cwd()+'/theme.json', {throws: false});
	app.use(require('node-sass-middleware')({
		src: process.cwd(),
		dest: process.cwd(),
		debug: true,
		outputStyle: 'compressed',
		force: true
	}));
	fontifier({
		name: themeInfo.name,
		files: getListOfSvgs(process.cwd()+'/svgs'),
		way: process.cwd() + '/gen/',
		prefix: themeInfo.name
	});
	minifier({
		files: getListOfComponents(process.cwd()+'/components'),
		way: process.cwd() + '/gen/',
		prefix: themeInfo.name,
		production: false
	});

	var swig = require('derer');
	swig = swig;
	swig.setDefaults({
		varControls: ['{{{', '}}}'],
		cache: false
	});
	app.engine('html', swig.renderFile);
	app.set('view engine', 'html');
	app.set('view cache', true);
	app.set('views', process.cwd() + '/page');

	var filesSupported = ['.css', '.js', '.html', '.png', '.jpg', '.svg', '.mp3'];

	parallelKeyInObj(themeInfo.pulls, function(place, url, callback){
		request(url, function(error, response, body) {
			themeInfo[place] = JSON.parse(body);
			callback();
		});
	}, function(){
		app.use(function(req, res) {
			for (var i = 0; i < filesSupported.length; i++) {
				if (req.originalUrl.indexOf(filesSupported[i]) > -1) {
					return res.sendFile(process.cwd() + req.originalUrl);
				}
			}
			var path = process.cwd() + '/page';
			if(req.originalUrl=='/') path += '/_index.html';
			else if(req.originalUrl.toLowerCase().indexOf(themeInfo.productRename.url)==0){
				path += '/' + themeInfo.productRename.file+'.html';
				var id = req.originalUrl.toLowerCase().replace(themeInfo.productRename.url, '').toString();
				for (var i = themeInfo.products.length - 1; i >= 0; i--) {
					if(themeInfo.products[i].id.toString()==id){
						themeInfo.product=themeInfo.products[i];
						break;
					}
				}
				if(!Array.isArray(req.session.products)) req.session.products=[];
				for (var i = req.session.products.length - 1; i >= 0; i--) {
					if(req.session.products[i].id==themeInfo.product.id){
						req.session.products.splice(i, 1);
					}
				}
				req.session.products.unshift(themeInfo.product);
				themeInfo.sessionProducts = req.session.products;
			}else{
				var correctPage = req.originalUrl.replace(new RegExp('/', 'g'), '').toLowerCase();
				if(themeInfo.collectionRenames[correctPage]){
					path += '/'+themeInfo.collectionRenames[correctPage]+'.html';
					var order = themeInfo.collectionRenames[correctPage+'Order'];
					themeInfo.collection =  themeInfo.collections[order];
				}else path += req.originalUrl+'.html';
			}
			var tpl = swig.compileFile(path);
			res.send(tpl(themeInfo));
		});
	});
}
var getListOfComponents = function(dest){
	fse.mkdirsSync(dest);
	var libs = getFiles(dest);
	libs.sort(function(a,b){
		if(a>b) return 1;
		else return -1;
	});
	for (var i = 0; i < libs.length; i++) {
		libs[i]=dest+'/'+libs[i];
	}
	return libs;
}
var getListOfSvgs = function(dest){
	fse.mkdirsSync(dest);
	var svgs = getFiles(dest);
	for (var i = svgs.length - 1; i >= 0; i--) {
		if(svgs[i].indexOf('.svg')==-1){
			svgs.splice(i,1);
		};
	}
	for (var i = 0; i < svgs.length; i++) {
		svgs[i]=dest+'/'+svgs[i];
	}
	return svgs;
}
var getFiles = function(srcpath) {
	return fs.readdirSync(srcpath).filter(function(file) {
		return fs.statSync(path.join(srcpath, file)).isFile();
	});
}