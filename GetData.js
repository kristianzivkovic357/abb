var exec=require('child_process').exec;
var request=require('request');
var fs=require('fs');
var getPage=require('./SpecialCase').addEveryTime;
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj)
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    return copy;
}

var hashesOfEveryWebsite=[];
var listOfNames=[];
//MOZDA POSTOJI PROBLEM AKO REQUEST KOJI DODJE KASNIJE 
var GetRawData=function(url,phantomSupport,nameOfRemoteWebsite,priority,callback)//priority 1-fast 0-slow
{
	//console.log('dobio request');
	if(!nameOfRemoteWebsite){console.log('GetRawData no parameter name');}
	if(!phantomSupport)console.log('phantomSupport no parameter name');
	//console.log(phantomSupport,nameOfRemoteWebsite)
	
		if(!hashesOfEveryWebsite[nameOfRemoteWebsite])
		{
			hashesOfEveryWebsite[nameOfRemoteWebsite]=[];			
		}
		var object={};
		
		object.url=url;
		object.callback=callback;
		object.phantomSupport=phantomSupport;
		if(priority==1)
		{
			hashesOfEveryWebsite[nameOfRemoteWebsite].unshift(clone(object));
		}
		else
		{
			hashesOfEveryWebsite[nameOfRemoteWebsite].push(clone(object));
		}
}
function timeControlledRequests()
{
	//console.log(hashesOfEveryWebsite);
	for(var i in hashesOfEveryWebsite)
	{
		if(hashesOfEveryWebsite[i].length)
		{
			takeRequest(clone(hashesOfEveryWebsite[i][0]));
			hashesOfEveryWebsite[i].shift();
		}
	}
}
function takeRequest(requestInfo)
{
	//console.log(requestInfo);
	if(!requestInfo)console.log("nema request info");
	
	//process.exit();
	if(requestInfo.phantomSupport=='true')
		{
				exec('phantomjs ./phantom.js '+requestInfo.url,{maxBuffer:1024*100000},function(err,stdout,stderr)
				{
					requestInfo.callback(err,stderr,stdout);
				})
		}
		else
		{
			request(requestInfo.url,function(err,resp,body)
			{
				requestInfo.callback(err,null,body);
			})
		}
}
setInterval(timeControlledRequests,2000);
module.exports={GetRawData};