var fs = require('fs');
var fse = require('fs-extra');
var gu = require(__dirname+'/gu.js');
var userService = require(__dirname+'/user.js');
var $http = require('request-promise');
var recursive = require('recursive-readdir');

if (fs.existsSync(__dirname+'/user.json')) {
	var user = fse.readJsonSync(__dirname+'/user.json', {throws: false});
}else var user = {};
/*
	wawify create
*/
	module.exports.create = function(page){
		var dest = process.cwd() + '/' + page.replace(/[^\w\s]/gi, '').toLowerCase();
		if(fs.existsSync(dest))
			return close('This page already exists');
		if (user.devToken) {
			createFromDefault(page, dest);
			gu.close('You have logged in with username: ' + user.username);
		} else createFromDefault(page, dest);
	};
	var createFromDefault = function(page, dest){
		fse.copySync(__dirname + '/page', dest);
		writeFile(dest + '/theme.json', [{
			from: 'PAGENAME',
			to: page.replace(/[^\w\s]/gi, '').toLowerCase()
		}], dest + '/theme.json');
		gu.close("Theme has been successfully created.");
	}
/*
	wawify fetch
*/
	module.exports.fetch = function(){
		checkThemeAvailability(false, function(answer){
			if (answer.notUser) userService.off();
			else if (answer.update) fetch(answer.files, 0);
			else if (answer.themeDoNotExists) {
				gu.close('Theme do not exists.');
			}
		});
	};
	var fetch = function(files, i){
		if(files.length==0) return;
		var path = process.cwd() + files[i].url;
		if (!fs.existsSync(path)) {
			files[i].sync = true;
		} else {
			var fileInfo = fs.statSync(path);
			var timediff = new Date(fileInfo.mtime).getTime() - new Date(files[i].mtime).getTime();
			if (timediff > 1000 || timediff < -1000 ||
				fileInfo.size != files[i].size)
				files[i].sync = true;
		}
		if(files[i].sync){
			var theme = fse.readJsonSync(process.cwd()+'/theme.json', {throws: false});
			$http({
				method: 'POST',
				uri: 'http://localhost:3265/api/theme/file/fetch/'+theme.name+'/'+user.devToken+'/'+user.username+files[i].url
			}).then(function(resp){
				fse.outputFile(path, resp, function(err) {
					fs.utimesSync(path, fileInfo.atime, new Date(files[i].mtime));
					if(++i<files.length) fetch(files, i);
				});
			});
		}else if(++i<files.length) fetch(files, i);
	}
/*
	wawify update
*/
	module.exports.update = function(){
		checkThemeAvailability(true, function(answer){
			if (answer.notUser) userService.off();
			else if (answer.update) update(answer.files, 0);
			else if (answer.somethingWentWrong) {
				gu.close('Something went wrong.');
			} else if (answer.themeCreated){
				recursive(process.cwd(), function(err, files) {
					var filesInfo = [];
					for (var i = 0; i < files.length; i++) {
						var fileInfo = fs.statSync(files[i]);
						filesInfo.push({
							base: files[i],
							url: files[i].replace(process.cwd(), ''),
							mtime: fileInfo.mtime,
							size: fileInfo.size
						});
					}
					update(filesInfo, 0);
				});
			}
		});
	};
	var update = function(files, i){
		if(files.length==0) return;
		var theme = fse.readJsonSync(process.cwd()+'/theme.json', {throws: false});
		$http({
			method: 'POST',
			uri: 'http://localhost:3265/api/theme/file/update/'+theme.name+'/'+user.devToken+'/'+user.username+'/'+files[i].mtime+files[i].url,
			formData: {
				file: fs.createReadStream(files[i].base)
			}
		}).then(function(answer){
			if(++i<files.length) update(files, i);
		});
	}
/*
	wawify support
*/
	var checkThemeAvailability = function(create, callback){
		if (user.devToken) {
			var theme = fse.readJsonSync(process.cwd()+'/theme.json', {throws: false});
			if(!theme.name) gu.close('Please give your theme a name.');
			recursive(process.cwd(), function(err, files) {
				var filesInfo = [];
				for (var i = 0; i < files.length; i++) {
					var fileInfo = fs.statSync(files[i]);
					filesInfo.push({
						base: files[i],
						url: files[i].replace(process.cwd(), ''),
						mtime: fileInfo.mtime,
						size: fileInfo.size
					});
				}
				$http({
					uri: 'http://localhost:3265/api/theme/check',
					method: 'POST',
					body: {
						username: user.username,
						devToken: user.devToken,
						create: create,
						files: filesInfo,
						name: theme.name
					},
					json: true
				}).then(callback);
			});
		} else {
			gu.close('You are not authenticated.');
		}
	}
	var writeFile = function(src, renames, dest, callback) {
		var data = fs.readFileSync(src, 'utf8');
		for (var i = 0; i < renames.length; i++) {
			data=data.replace(new RegExp(renames[i].from, 'g'), renames[i].to);
		}
		fs.writeFileSync(dest, data);
		if (typeof callback == 'function') callback();
	}
/*
	wawify end of
*/