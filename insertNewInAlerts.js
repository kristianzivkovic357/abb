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
		if(alert.lokacija.length>advert.lokacija.length)
		{
			return 0;
		}
		for(var i=alert.lokacija.length-1,j=advert.lokacija.length-1;(i>=0)&&(j>=0);i--,j--)
		{
			if(alert.lokacija[i]!=advert.lokacija[j])return 0;
		}
		
		
	}
	return 1;
}
var lastNotificationPushed=[];
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
								obj.timestamp=new Date();
								//console.log("userid"+allDatabaseAlerts[j].userId);
								var collection=dbCon.collection(allDatabaseAlerts[j].userId.toString());
				                collection.update({idalert:obj.idalert,idogl:obj.idogl},obj,{upsert:true},function(err,result)// ne valja Objectid
				                {
				                    //console.log('UBACIO U TABELU');
				                    if(err)console.log(err);
				                });
								(function(alert)
									{
											
										users.findOne({email:alert.email},function(err,result)
										{
											if(result)
											{
												var currentTime= new Date();
												/*console.log(currentTime);
												console.log(result.lastNotificationPushed);
												console.log(currentTime-result.lastNotificationPushed)
												console.log("razlika intervala:"+(currentTime-result.lastNotificationPushed));process.exit();*/
												if((!lastNotificationPushed[alert.userId.toString()])||((currentTime-lastNotificationPushed[alert.userId.toString()])>1000*60*2))//dva sata
												{
														//console.log('DOSAO DO SLANJA ALERTOVA')
														if((!err)&&result)notifications.sendNotification(result,alert);
														else
														{
															console.log(err);
														}
														lastNotificationPushed[alert.userId.toString()]=currentTime;
														/*users.update({email:alert.email},{$set:{lastNotificationPushed:currentTime}},function(err,res)
														{
															if(err)console.log(err);
															console.log(res);
															process.exit();
														})*/
												}
												
											}
											
										})
								   	
								})(allDatabaseAlerts[j]);
								   
	               		}
						else
						{
							//console.log('Parameters dont fit.');
						}
	                    
	             }
          
}
/*var oglas={
    "_id": {
        "$oid": "59c1011614802f2304e2c6c2"
    },
    "type": "stan",
    "nacinkupovine": "prodaja",
    "images": [
        "https://api.4zida.rs/resize/59c0ed4f70baeb6e866fa849/max/3dd48ab31d016ffcbf3314df2b3cb9ce/generala-horvatovica-1920x1080.jpeg",
        "https://api.4zida.rs/resize/59c0ed4f70baeb6e866fa849/max/21c3134ee5edcb618c4f9aae358d73a7/generala-horvatovica-1920x1080.jpeg",
        "https://api.4zida.rs/resize/59c0ed4f70baeb6e866fa849/max/9b7da66eb5bb0e80c82e88fd2bfde5ce/generala-horvatovica-1920x1080.jpeg",
        "https://api.4zida.rs/resize/59c0ed4f70baeb6e866fa849/max/caaa29eab72b231b0af62fbdff89bfce/generala-horvatovica-1920x1080.jpeg",
        "https://api.4zida.rs/resize/59c0ed4f70baeb6e866fa849/max/c37f36800219dcb5960c40d1d4bade55/generala-horvatovica-1920x1080.jpeg",
        "https://api.4zida.rs/resize/59c0ed4f70baeb6e866fa849/max/1e1d184167ca7676cf665225e236a3d2/generala-horvatovica-1920x1080.jpeg",
        "https://api.4zida.rs/resize/59c0ed4f70baeb6e866fa849/max/073b00ab99487b74b63c9a6d2b962ddc/generala-horvatovica-1920x1080.jpeg",
        "https://api.4zida.rs/resize/59c0ed4f70baeb6e866fa849/max/53f0d7c537d99b3824f0f99d62ea2428/generala-horvatovica-1920x1080.jpeg",
        "https://api.4zida.rs/resize/59c0ed4f70baeb6e866fa849/max/42e77b63637ab381e8be5f8318cc28a2/generala-horvatovica-1920x1080.jpeg",
        "https://api.4zida.rs/resize/59c0ed4f70baeb6e866fa849/max/310dcbbf4cce62f762a2aaa148d556bd/generala-horvatovica-1920x1080.jpeg"
    ],
    "slika": "https://api.4zida.rs/resize/59c0ed4f70baeb6e866fa849/max/3dd48ab31d016ffcbf3314df2b3cb9ce/generala-horvatovica-1920x1080.jpeg",
    "naslov": "GENERALA HORVATOVICA",
    "brojsoba": 3.5,
    "lokacija": [
        "Vračar",
        "Beograd",
        "Srbija"
    ],
    "datum": {
        "$date": "2017-09-19T10:11:28.000Z"
    },
    "websitename": "4zida",
    "kvadratura": 74,
    "link": "https://www.4zida.rs/prodaja/stanovi/beograd/oglas/generala-horvatovica/59c0ed4f70baeb6e866fa849",
    "opis": "AG. PROV 2% STAN SE NALAZI U KOMPLEKSU NOVIH ZGRADA. ZGRADA IMA SVOJ PARKING. OBEZBEDJENO PARKING MESTO ZA OVAJ STAN. IZUZETNO SVETAO, TROSTRA. IZUZETNO FUNKCIONALAN. CINE GA: ULAZNO PREDSOBLJE, DVA KUPATILA, KUHINJA SA TRPEZARIJOM, DNEVNA SOBA, TRI SPAVACE SOBE, TRI TERASE. UKNJIZEN. www.favoritnekretnine.co.rs UKNJIZEN 2/3 GENERALA HORVATOVICA",
    "cena": 125000
}
insert(oglas)*/
module.exports={insert}