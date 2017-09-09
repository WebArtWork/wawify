var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var app = express();
var server = require('http').Server(app);
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
	'extended': 'true'
}));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(passport.initialize());
app.use(passport.session());
app.set('view cache', true);

var sd = {
	fse: require('fs-extra'),
	fs: require('fs'),
	path: require('path'),
	request: require('request'),
	_isEndOfStr: function(str, strCheck){
		var length = strCheck.length;
		return str.slice(str.length-length).toLowerCase()==strCheck.toLowerCase();
	}
};
var waits = [];
sd._wait_next = function(){
	if(waits.length>0){
		waits.pop();
	}
	if(waits.length>0) waits[waits.length-1]();
}
sd._wait = function(funcs){
	waits.unshift(funcs);
	if(waits.length==1) waits[0]();
}
sd._getFiles = function(srcpath) {
	return sd.fs.readdirSync(srcpath).filter(function(file) {
		return sd.fs.statSync(sd.path.join(srcpath, file)).isFile();
	});
}
sd.theme = sd.fse.readJsonSync(process.cwd()+'/theme.json', {throws: false});
require(__dirname + '/serve')(app, sd);
require(__dirname + '/bridge')(app, sd);

var session = require('express-session');
var store;
var sessionMiddleware = session({
	key: 'express.sid.'+sd.theme.prefix,
	secret: 'thisIsCoolSecretFromWaWFramework'+sd.theme.prefix,
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: 365 * 24 * 60 * 60 * 1000
	},
	rolling: true,
	store: store
});
app.use(sessionMiddleware);

server.listen(sd.theme.port||8080);
console.log("App listening on port " + (sd.theme.port||8080) );