var exec=require('child_process').exec;
var request=require('request');
var fs=require('fs');
var MAX_REQUEST_RETRY=3;
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
var alertPointer=0;
var svePointer=0;
var GetRawData=function(url,phantomSupport,nameOfRemoteWebsite,priority,callback)//priority 1-fast 0-slow
{
	//console.log('dobio request');
	if(!nameOfRemoteWebsite){console.log('GetRawData no parameter name');}
	//if(!phantomSupport)console.log('phantomSupport no parameter name');
	//console.log(phantomSupport,nameOfRemoteWebsite)
	
		if(!hashesOfEveryWebsite[nameOfRemoteWebsite])
		{
			hashesOfEveryWebsite[nameOfRemoteWebsite]={};
			hashesOfEveryWebsite[nameOfRemoteWebsite].arrayForAlerts=[];
			hashesOfEveryWebsite[nameOfRemoteWebsite].arrayForTakingAll=[];
			hashesOfEveryWebsite[nameOfRemoteWebsite].lastSent=0			
		}
		var object={};
		
		object.url=url;
		object.callback=callback;
		object.phantomSupport=phantomSupport;
		if(priority==1)
		{
			hashesOfEveryWebsite[nameOfRemoteWebsite].arrayForAlerts.push(clone(object));
		}
		else
		{
			hashesOfEveryWebsite[nameOfRemoteWebsite].arrayForTakingAll.push(clone(object));
		}
}
function timeControlledRequests()
{
	//console.log(hashesOfEveryWebsite);
	for(var i in hashesOfEveryWebsite)
	{
		var alreadySent=0;
		if(hashesOfEveryWebsite[i].lastSent==4)
		{
			if(hashesOfEveryWebsite[i].arrayForAlerts.length)
			{
				//alreadySent=1;
				//console.log("sent to alerts")
				hashesOfEveryWebsite[i].lastSent++;
				takeRequest(clone(hashesOfEveryWebsite[i].arrayForAlerts[0]));
				hashesOfEveryWebsite[i].arrayForAlerts.shift();
			}
			else
			{
				if(hashesOfEveryWebsite[i].arrayForTakingAll.length)
				{
					//console.log("sent to getall")
					takeRequest(clone(hashesOfEveryWebsite[i].arrayForTakingAll[0]));
					hashesOfEveryWebsite[i].arrayForTakingAll.shift();
				}
			}
			
		}
		else if((hashesOfEveryWebsite[i].lastSent<4))
		{
			if(hashesOfEveryWebsite[i].arrayForTakingAll.length)
			{
				//console.log("sent to getall")
				hashesOfEveryWebsite[i].lastSent++;
				takeRequest(clone(hashesOfEveryWebsite[i].arrayForTakingAll[0]));
				hashesOfEveryWebsite[i].arrayForTakingAll.shift();
			}
			else
			{
				if(hashesOfEveryWebsite[i].arrayForAlerts.length)
				{
					//console.log("sent to alerts")
					takeRequest(clone(hashesOfEveryWebsite[i].arrayForAlerts[0]));
					hashesOfEveryWebsite[i].arrayForAlerts.shift();
				}
			}
		}
		hashesOfEveryWebsite[i].lastSent%=5;
		
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
			regulateRequestCall(requestInfo,1);	
		}
}
function regulatePhantomJSCall(requestInfo,countOfCalls)
{
	exec('phantomjs ./phantom.js '+requestInfo.url,{maxBuffer:1024*10000},function(err,stdout,stderr)
	{
		if((!stdout)||(stdout.length<=5000))
		{
			if((countOfCalls % MAX_REQUEST_RETRY)==0)
				{
					console.log("***PHANTOMJS will delay for 60 seconds on: "+requestInfo.url+" because returned NO data***");
					setTimeout(function()
					{
						regulatePhantomJSCall(requestInfo,countOfCalls+1);
					},1000*60);
					return;
				}
				else
				{
					console.log("Request returned INVALID webpage for "+countOfCalls+" times "+"on object:");
					console.log(JSON.stringify(requestInfo));
					console.log("Sending request again");
					regulatePhantomJSCall(requestInfo,countOfCalls+1);	
				}	
		}
		else
		{
			requestInfo.callback(err,stderr,stdout);
		}
	})

}
function regulateRequestCall(requestInfo,countOfCalls)
{
	request(requestInfo.url,function(err,resp,body)
	{
		if((!body)||(body.length<5000))
		{
			if((countOfCalls % MAX_REQUEST_RETRY)==0)
			{
				console.log("***Request will delay for 60 seconds on: "+requestInfo.url+" because returned NO data***");
				setTimeout(function()
				{
					regulateRequestCall(requestInfo,countOfCalls+1);
				},1000*60);
				return;
			}
			else
			{
				console.log("Request returned INVALID webpage for "+countOfCalls+" times "+"on object:");
				console.log(JSON.stringify(requestInfo));
				console.log("Sending request again");
				regulateRequestCall(requestInfo,countOfCalls+1);	
			}	
		}
		else
		{
			requestInfo.callback(err,resp,body);
		}
	})
}
setInterval(timeControlledRequests,2500);
module.exports={GetRawData};