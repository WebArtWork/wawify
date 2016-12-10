var fs = require('fs');
var fse = require('fs-extra');
/*
	wawify create
*/
	module.exports.create = function(page){
		var dest = process.cwd() + '/' + page.replace(/[^\w\s]/gi, '').toLowerCase();
		if(fs.existsSync(dest))
			return close('This page already exists');
		fse.copySync(__dirname+'/page', dest);
		writeFile(dest + '/theme.json', [{
			from: 'PAGENAME',
			to: page.replace(/[^\w\s]/gi, '').toLowerCase()
		}], dest + '/theme.json');
		close("Theme has been successfully created.");
	};
/*
	wawify support
*/

	var writeFile = function(src, renames, dest, callback) {
		var data = fs.readFileSync(src, 'utf8');
		for (var i = 0; i < renames.length; i++) {
			data=data.replace(new RegExp(renames[i].from, 'g'), renames[i].to);
		}
		fs.writeFileSync(dest, data);
		if (typeof callback == 'function') callback();
	}
	var close = function(message) {
		console.log(message);
		process.exit(0);
	}
/*
	wawify end of
*/