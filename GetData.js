var exec=require('child_process').exec;
var request=require('request');
var fs=require('fs');

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
	//if(!phantomSupport)console.log('phantomSupport no parameter name');
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
				regulatePhantomJSCall(requestInfo,1);
		}
		else
		{
			
			request(requestInfo.url,function(err,resp,body)
			{
				//console.log(body);
				requestInfo.callback(err,null,body);
			})
		}
}
function regulatePhantomJSCall(requestInfo,countOfCalls)
{
	exec('phantomjs ./phantom.js '+requestInfo.url,{maxBuffer:1024*10000},function(err,stdout,stderr)
	{
		if(stdout.length<=5000)
		{
			console.log("PHANTOMJS returned invalid webpage for "+countOfCalls+" times "+"on object:");
			console.log(JSON.stringify(requestInfo));
			console.log("Sending request again");
			regulatePhantomJSCall(requestInfo,countOfCalls+1);
		}
		else
		{
			requestInfo.callback(err,stderr,stdout);
		}
	})

}
setInterval(timeControlledRequests,2500);
module.exports={GetRawData};