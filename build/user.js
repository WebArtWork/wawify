var fse = require('fs-extra');
var fs = require('fs');
var rp = require('request-promise');
var gu = require(__dirname+'/gu.js');
if (fs.existsSync(__dirname+'/user.json')) {
	var user = fse.readJsonSync(__dirname+'/user.json', {throws: false});
}else var user = {};

module.exports.pull = function(){
	if(user.devToken){
		gu.close('You have logged in with username: '+user.username);
	}else{
		gu.close('You are not authenticated.');
	}
};

module.exports.off = function(){
	if(user.devToken){
		user = {};
		fse.writeJsonSync(__dirname+'/user.json', user, {throws: false});
		gu.close('You have logged off.');
	}else{
		gu.close('You are not authenticated.');
	}
};

module.exports.log = function(username, devToken) {
	rp({
		uri: 'http://localhost:3265/api/user/devToken',
		method: 'POST',
		body: {
			username: username,
			devToken: devToken
		},
		json: true
	}).then(function(answer) {
		if(answer){
			user.username = username;
			user.devToken = devToken;
			fse.writeJsonSync(__dirname+'/user.json', user, {throws: false});
			gu.close('You have successfully loged into wawify.');
		}else gu.close("username with this devToken is not matching.");
	}).catch(function(err) {
		gu.close("Couldn't connect with the wawify.");
	});
};