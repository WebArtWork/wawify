var gu = require(__dirname+'/gu.js');
var fs = require('fs');
var fse = require('fs-extra');
/*
	waw create
*/
	module.exports.create = function(page){
		var dest = process.cwd() + '/' + page.replace(/[^\w\s]/gi, '').toLowerCase();
		if(fs.existsSync(dest))
			return gu.close('This page already exists');
		fse.copySync(__dirname+'/page', dest);
		gu.writeFile(dest + '/theme.json', [{
			from: 'PAGENAME',
			to: page.replace(/[^\w\s]/gi, '').toLowerCase()
		}], dest + '/theme.json');
		gu.close("Theme has been successfully created.");
	};
/*
	waw end of
*/