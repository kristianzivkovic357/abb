var request=require('request')
var async=require('async');
function add(arr,Sajt,callback)
{
	//console.log('AAAAAAAAAAA');
	//console.log(Sajt)
	if(Sajt.websitename=="cityexpert")
	{
		var kraj=1;
		var route='http://www.cityexpert.rs/jnkrtn.json';
		async.each(['http://www.cityexpert.rs/jnkrtnpr.json','http://www.cityexpert.rs/jnkrtn.json'],function(route,call)
		{
			//console.log(' dqdqwd');
			request(route,function(err,resp,data)
			{
				if(err){console.log(err)}

				for(i in Sajt.binders)data=data.replace(new RegExp(i,'g'),Sajt.binders[i]);
					

				data=JSON.parse(data);
			for(var i=0;i<data.length;i++)
				{
						data[i].websitename='cityexpert';
						if(data[i].path.indexOf('izdavanje')!=-1)data[i].nacinkupovine='Izdavanje';
						else if(data[i].path.indexOf('prodaja'))data[i].nacinkupovine='prodaja';
						if(data[i].field_type_of_property.indexOf('Stan')!=-1)data[i].type='stan';
						else if(data[i].field_type_of_property.indexOf('Kuća')!=-1)data[i].type='kuca';
						else data[i].type='lokal';
				}
				for (var i=0;i<data.length;i++)arr.push(data[i]);
				call()
				
			
			})
		},function(err)
		{
			//console.log(arr)
			//process.exit(0)
			console.log('Poziv za cityexpert');
			callback(-1);
		})
	//	callback(-1);
	}

	else {callback(1);}
}
function addEveryTime(arr,Sajt,callback)
{
	if(Sajt.websitename=='4zida')
	{
		var req="?for="+Sajt.nacinkupovine+"&page="+page+"&sort=plus";
		request(Sajt.host+Sajt.path+req,function(err,resp,data)
		{
			if(!err)
			{
				data=JSON.parse(data);
				console.log(data);
				return 1;
			}
		})
	}
	
	else return -1;
}
module.exports={add,addEveryTime}