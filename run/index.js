var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var app = express();
var server = require('http').Server(app);
var favicon = require('serve-favicon');
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
app.use(favicon(process.cwd() + '/img/favicon.png'));
require(__dirname + '/readClientRoutes')(app);

var fse = require('fs-extra');
var themeInfo = fse.readJsonSync(process.cwd()+'/theme.json', {throws: false});
server.listen(themeInfo.port||8080);
console.log("App listening on port " + (themeInfo.port||8080) );