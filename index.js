#!/usr/bin/env node

/*
	all commands require user authenticated in wawify.

	wawify THEMENAME: will create folder with new theme, if that theme do not exists it will also be created in wawify else it will be pulled from there.

	wawify: will run the theme.
	
	wawify fetch: will fetch all files from wawify source.

	wawify update: will update all files in wawify source.
*/

var nodemon = require('nodemon');
var fse = require('fs-extra');
var run = function(){
	nodemon({
		script: __dirname+'/run/index.js',
		ext: 'js json',
		watch: process.cwd()+'/server'
	});
}
if(process.argv[2]){
	switch(process.argv[2].toLowerCase()){
		case 'f':
		case 'fetch':
			return require(__dirname+'/build').fetch();
		case 'u':
		case 'update':
			return require(__dirname+'/build').update();
		case 'd':
		case 'dev':
			return require(__dirname+'/build/user.js').pull();
		case 'o':
		case 'off':
			return require(__dirname+'/build/user.js').off();
		case 'l':
		case 'log':
			return require(__dirname+'/build/user.js')
			.log(process.argv[3], process.argv[4]);
		case '--version':
		case '-version':
		case '--v':
		case '-v':
			var config = fse.readJsonSync(__dirname+'/package.json', {throws: false});
			console.log('wawify version is '+config.version);
			return;
		default:
			require(__dirname+'/build').create(process.argv[2]);
	}
}else run();