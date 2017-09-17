var mongo=require('./mongo');
var notifications=require('./pushNotifications');
var CONST_PERCENTAGE=85;
var allDatabaseAlerts=[];
var dbCon;
var adressMatching=require('./master')
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj)
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    return copy;
}
var getAllDbAlerts=function()
{
	mongo.MongoWrapper(function(db)
	{
		
		var alerts=db.collection('alerts');
		var matching=db.collection('matching');
		alerts.find({}).toArray(function(err,res)
		{
			allDatabaseAlerts=[];
			for(var i=0;i<res.length;i++)allDatabaseAlerts.push(Object.assign({},res[i]));
			console.log('Azurirani podaci o alertovima iz baze');
		})
	})
}
getAllDbAlerts();
setInterval(getAllDbAlerts,1000*60*5);//AZURIRANJE NA SVAKIH 5 MIN 

mongo.MongoWrapper(function(db)
{
	dbCon=db;
})
function parametersFit(advert,alert)
{
	if(advert.nacinkupovine.toLowerCase()!=alert.namena.toLowerCase())
	{
		return 0;
	}
	if(advert.type.toLowerCase()!=alert.vrsta.toLowerCase())
	{
		return 0;
	}
	if(alert.kvadraturalow)
	{
		if(alert.kvadraturalow>advert.kvadratura)//if not
		{
			return 0;
		}
	}
	if(alert.kvadraturahigh)
	{
		if(alert.kvadraturahigh<advert.kvadratura)//if not
		{
			return 0;
		}
	}
	if(alert.cenalow)
	{
		if(alert.cenalow>advert.cena)//if not
		{
			return 0;
		}
	}
	if(alert.cenahigh)
	{
		if(alert.cenahigh<advert.cena)
		{
			return 0;
		}
	}
	if(alert.brojsoba)
	{
		if(alert.brojsoba.indexOf(advert.brojsoba)==-1)
		{
			return 0;
		}
	}
	if(alert.lokacija)
	{
		for(var i=alert.lokacija.length-1,j=advert.lokacija.length-1;(i>=0)&&(j>=0);i--,j--)
		{
			if(alert.lokacija[i]!=advert.lokacija[j])return 0;
		}
	}
	return 1;
}
var insert=function(Advert)
{
		//console.log(Advert);
			
			var users=dbCon.collection('users')
			if(allDatabaseAlerts.length==0){console.log('NEMA NIJEDAN ALERT')}
			for(var j=0;j<allDatabaseAlerts.length;j++)
	            {

	                  if(parametersFit(Advert,allDatabaseAlerts[j]))
	                   {
	                   			//console.log('Usao da dodam alert');
		                       //console.log(Advert);
		                        var copy=clone(allDatabaseAlerts[j]);
		                     
			                    var obj={}
			                    obj.idalert=allDatabaseAlerts[j]._id;
			                    obj.idogl=Advert.link;
			                    obj.websitename=Advert.nacinkupovine+Advert.type;
			                    //console.log(obj)
			                    delete obj._id;
								obj.seen=0;
								console.log("userid"+allDatabaseAlerts[j].userId);
								var collection=dbCon.collection(allDatabaseAlerts[j].userId.toString());
								
				                collection.update({idalert:obj.idalert,idogl:obj.idogl},obj,{upsert:true},function(err,result)// ne valja Objectid
				                {
				                    console.log('UBACIO U TABELU');
				                    if(err)console.log(err);
				                });
								(function(alert)
									{
											
										users.findOne({email:alert.email},function(err,result)
										{
											//console.log('DOSAO DO SLANJA ALERTOVA')
											if((!err)&&result)notifications.sendNotification(result,alert);
											else
											{
												console.log(err);
											}
										})
								   	
								})(allDatabaseAlerts[j]);
								   
	               		}
						else
						{
							console.log('Parameters dont fit.');
						}
	                    
	             }
          
}
module.exports={insert}