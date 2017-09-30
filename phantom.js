var page = require('webpage').create();
var system = require('system');
var args = system.args;
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36';
page.settings.loadImages=false;
//page.settings.resourceTimeout=15000;
//console.log('KRENULI SMOOOO');
//console.log(args[1]);
if(!args[1])console.log('ne valja komandna linija');
block_urls = ['google.com','gstatic.com', 'adocean.pl','analytics.com','dotmetrics.net','googleapis.com','httpool.com', 'gemius.pl', 'twitter.com', 'facebook.net', 'facebook.com', 'planplus.rs'];
page.onResourceRequested = function(requestData, request)
{
   	for(i in block_urls)
   	{
   		if(requestData.url.indexOf(block_urls[i])!=-1)
   		{
   			//console.log('Aborted:'+requestData.url)
   			request.abort();
   		}
   	}
}
page.open(args[1], function () {
    console.log(page.content);
    phantom.exit();
    });