
/*request('https://wawify.com/api/template/get/'+themeInfo.template, function(error, response, body) {
	var data = JSON.parse(body);
	themeInfo.collections = data.collections;
	themeInfo.items = data.items;
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
			for (var i = themeInfo.items.length - 1; i >= 0; i--) {
				if(themeInfo.items[i]._id==id){
					themeInfo.item=themeInfo.items[i];
					break;
				}
			}
			if(!Array.isArray(req.session.items)) req.session.items=[];
			for (var i = req.session.items.length - 1; i >= 0; i--) {
				if(req.session.items[i]._id==themeInfo.item._id){
					req.session.items.splice(i, 1);
				}
			}
			req.session.items.unshift(themeInfo.item);
			themeInfo.sessionItems = req.session.items;
			fixItemImages(themeInfo.item);
			for (var j = 0; j < themeInfo.sessionItems.length; j++) {
				fixItemImages(themeInfo.sessionItems[j]);
				
			}
		}else{
			var correctPage = req.originalUrl.replace(new RegExp('/', 'g'), '').toLowerCase();
			var notFound = true;
			for (var i = 0; i < themeInfo.collections.length; i++) {
				if(themeInfo.collections[i].url.toLowerCase() == correctPage){
					notFound = false;
					path += '/Collection.html';
					themeInfo.tag =  themeInfo.collections[i].tag;
					for (var j = 0; j < themeInfo.tag.items.length; j++) {
						fixItemImages(themeInfo.tag.items[j]);
					}
					console.log(themeInfo.tag.items[0]);
					break;
				}
			}
			if(notFound) path += req.originalUrl+'.html';
		}
		var tpl = swig.compileFile(path);
		themeInfo.url = req.originalUrl;
		res.send(tpl(themeInfo));
	});
});*/


var addWawifyToUrl = function(url){
	return 'https://wawify.com' + url.replace('https://wawify.com','');
}
var fixItemImages = function(item){
	item.hoverUrl = addWawifyToUrl(item.hoverUrl);
	for (var j = 0; j < item.hoverUrls.length; j++) {
		item.hoverUrls[j] = addWawifyToUrl(item.hoverUrls[j]);
	}
}



module.exports = function(app, sd){
	app.get('/', function(req, res) {
		res.render('Simple', {});
	});
	app.get('/Local', function(req, res) {
		res.render('Local', {});
	});
	app.get('/Route', function(req, res) {
		res.render('Route', {});
	});
};