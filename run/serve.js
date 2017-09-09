var fontifier = require('svg-fontify');
var minifier = require('js-minify');
var parallelKeyInObj = function(obj, func, callback){
	var counter = 0;
	for(var key in obj){
		counter++;
		func(key, obj[key], function(){
			if(--counter===0) callback();
		});
	}
}
module.exports = function(app, sd){
	/*
	*	Support
	*/
		var getListOfComponents = function(dest){
			sd.fse.mkdirsSync(dest);
			var libs = sd._getFiles(dest);
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
			sd.fse.mkdirsSync(dest);
			var svgs = sd._getFiles(dest);
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
	/*
	*	Serve
	*/
		app.use(require('node-sass-middleware')({
			src: process.cwd(),
			dest: process.cwd(),
			debug: true,
			outputStyle: 'compressed',
			force: true
		}));
		fontifier({
			name: sd.theme.name,
			files: getListOfSvgs(process.cwd()+'/icons'),
			way: process.cwd() + '/gen/',
			prefix: sd.theme.name
		});
		minifier({
			files: getListOfComponents(process.cwd()+'/lab'),
			way: process.cwd() + '/gen/',
			prefix: sd.theme.name,
			production: false
		});
		var derer  = require('derer');
		derer.setDefaults({
			varControls: ['{{{', '}}}'],
			cache: false
		});
		app.engine('html', derer.renderFile);
		app.set('view engine', 'html');
		app.set('view cache', true);
		derer.setFilter('string',function(input){
			return input&&input.toString()||'';
		});	
		app.set('views', process.cwd() + '/html');
	/*
	*	Translates
	*/
		var df = {};
		var ff = {};
		var fillFiles = function(folder, files, word){
			var langs = {};
			for (var i = 0; i < files.length; i++) {
				var words = require(folder+'/'+files[i]+'.js');
				langs[files[i]] = words;
				if(!words[word]){
					words[word] = '';
					sd.fs.writeFileSync(folder+'/'+files[i]+'.js', 'module.exports = '+JSON.stringify(words), 'utf-8');
				}
			}
			if(!sd._config.waw_idea||!devConfig.user) return;
			sd._wait(function(){
				console.log('langs');
				console.log(langs);
				// sd._request.post({
				// 	uri: 'http://pagefly.webart.work/api/idea/addTranslate',
				// 	form: {
				// 		_id: sd._config.waw_idea,
				// 		langs: langs,
				// 		token: devConfig.user
				// 	}
				// }, sd._wait_next);
			});
		}
		var checkFiles = function(word, file){
			for(var folder in ff){
				for (var i = 0; i < ff[folder].length; i++) {
					if(ff[folder][i]==file){
						return fillFiles(folder, ff[folder], word);
					}
				}
			}
		}
		var addLang = function(folder){
			var files = sd._getFiles(folder);
			for (var i = 0; i < files.length; i++) {
				var previousFileName = files[i];
				files[i] = files[i].replace('.js','');
				if(files[i].indexOf('.')>=0){
					files[i] = sd._rpl(files[i], '.', '');
					sd.fs.writeFileSync(folder+'/'+files[i]+'.js', sd.fs.readFileSync(folder+'/'+previousFileName, 'utf8'), 'utf8');
					sd.fs.unlinkSync(folder+'/'+previousFileName);
				}
			}
			ff[folder] = files;
			for (var i = 0; i < files.length; i++) {
				var words = require(folder+'/'+files[i]+'.js');
				if(!df[files[i]]) df[files[i]]={};
				for(key in words){
					df[files[i]][key.toLowerCase()] = words[key];
				}
			}
		}
		addLang(process.cwd() + '/lang');
		derer.setFilter('tr', function(word, file){
			if(df[file]&&df[file][word.toLowerCase()])
				return df[file][word.toLowerCase()];
			else{
				if(df[file]&&typeof df[file][word.toLowerCase()] != 'string') checkFiles(word, file);
				return word;
			}
		});

	/*
	*	Files Serving
	*	Basically this is only for localhost,
	*	and if for some reason nginx didn't serve fles
	*/
		var folders = ['css','fonts','gen','html','img','js','lang','page'];
		var ext = ['.css','.ttf','.woff','.woff2','.svg','.otf','.js','.html','.gif','.jpg','.png'];
		app.use(function(req, res, next) {
			if(req.originalUrl.indexOf('api')>-1) return next();
			for (var i = 0; i < ext.length; i++) {
				if( sd._isEndOfStr(req.originalUrl.split('?')[0], ext[i]) ) {
					for (var j = 0; j < folders.length; j++) {
						if(req.originalUrl.indexOf(folders[j])>-1){
							return res.sendFile(process.cwd() + req.originalUrl.split('?')[0]);
						}
					}
				}
			}
			next();
		});
	/*
	*	End
	*/
}