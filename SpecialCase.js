var request=require('request')
var async=require('async');
var getData=require("./GetData");
var db=require('./mongo');
var indexOfReturnAll=require('./crawl').indexOfReturnAll;
function add(arr,Sajt,callback)
{
callback(1)
}
function eraseHtml(data)
{
	var formed='';
	var dontAdd=0;
	 for(var i=0;i<data.length;i++)
            {
                if(data[i]=='<')
                {
                    dontAdd=1;
            	}
                else if(data[i]=='>')
                {
                    dontAdd=0;
                    continue;
                }
                if(!dontAdd)formed+=data[i];//CONTENT
            }
			return formed;
}
function modifyUrl(arr)
{
	//console.log(arr[0]);process.exit();
	for(var i in arr)
	{
		arr[i]=arr[i].replace("{{mode}}","max");
		arr[i]=arr[i].replace("{{width}}","1920");
		arr[i]=arr[i].replace("{{height}}","1080");
	}
	return arr;
}
function traverseJsonRecursively(obj,key)
{
	var response=[];
	function recursion(field)
	{
		//console.log(field);
		//console.log(field);
		//return;
		if(!field)return;
		if(field[key])
		{
			response.push(field[key]);
		}
		if(typeof field=='object')
		{
			for(var i in field)
			{
				//console.log(field[i]);return 0;
				recursion(field[i]);
			}
		}
		return
	}
	recursion(obj);
	response=modifyUrl(response);
	//console.log(response);
	//process.exit();
	if(response.length)
	{
		//console.log(response);
		//console.log('///////////////////////')
		return response;
	}
	return null;
}
function locateJSONField(objectToTraverse,path)
{
	var field=objectToTraverse;
	path=path.split(".");
	for(var i in path)
	{
		if(typeof field=='object')
		{
			field=objectToTraverse[path[i]];
		}
		else return -1;
	}
	return field;
}
function addEveryTime(Sajt,pageNum,UzmiSve,callback)
{

	if(Sajt.websitename=='4zida')
	{
		/*if(UzmiSve)
		{
			db.MongoWrapper(function(db)
			{

				var stateCollection=db.collection('previousState');
				var obj={};
				obj.route=Route.host+Route.path;
				obj.page=PageNum;
				stateCollection.update({'route':obj.route},obj,{upsert:true},function(err,res)
				{
					db.close();
				})
			})
		}*/
		//process.exit();
		var req=Sajt.host+Sajt.path+pageNum;
		//console.log(req);process.exit();
		
		getData.GetRawData(Sajt.host+Sajt.path+req,Sajt.phantomSupport,Sajt.websitename,0,function(err,resp,data)//ne treba nula za prioritet
		{
			//console.log(Sajt);process.exit();
			var response=[];
			var a=Sajt;
			//console.log(data)
			
			data = eraseHtml(data);
			
			data=JSON.parse(data).items;
			//console.log(data);
			for(var j in data)
				{
					var obj={};
					obj.type=Sajt.type;
					obj.nacinkupovine=Sajt.nacinkupovine;
					obj.images=traverseJsonRecursively(data[j].images,'url');
					obj.slika=traverseJsonRecursively(data[j].mainImage,'url');
					obj.naslov=data[j].title; 
					obj.brojsoba=data[j].structureName;
					if(obj.slika)obj.slika=obj.slika[0];
					if(!obj.slika)obj.slika="https://www.4zida.rs/images/placeholders/image-placeholder.jpg";
					if((!obj.images)||(!obj.images.length))obj.images=["https://www.4zida.rs/images/placeholders/image-placeholder.jpg"];
					obj.lokacija='';
					var w=0;
					//console.log(data[j].placeNames);
					for(var kl in data[j].placeNames)
					{
						//console.log(data[j].placeNames[kl]);
						if(w==0)
						{
							obj.lokacija+=data[j].placeNames[kl];
						}
						else
						{
							obj.lokacija+=(','+data[j].placeNames[kl]);
						}
						w++;
					}
					//console.log(obj.lokacija)
					obj.websitename=Sajt.websitename;
					obj.shouldCrawl=Sajt.shouldCrawl;
					//console.log('.')
					for(var i in a.binders)
					{
						if(typeof a.binders[i]=='object')
						{
							if(data[j][i])
							{
								addTo=a.binders[i].addTo;
								addLike=a.binders[i].addLike;
								if(!obj[addTo])obj[addTo]=[]
								
								obj[addTo].push(addLike);
								
							}
							continue;

						}
						if(a.binders[i][a.binders[i].length-1]=='*')
						{
							if(!obj[a.binders[i]])obj[a.binders[i]]=[];
							if(typeof data[j][i]=='boolean'&&(data[j][i]))obj[a.binders[i]].push(a.binders[i]);
							else
							{
								obj[a.binders[i]].push(data[j][i]);
							}
							
						}
						else
						{
							obj[a.binders[i]]=data[j][i];
						}
					}
					response.push(obj);
					
				}
				//console.log(response);
				callback(response)
				
		})
	}
	
	else callback(-1);
}
module.exports={add,addEveryTime}