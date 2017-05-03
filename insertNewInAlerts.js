var mongo=require('./mongo');
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
function changeDataType(Advert)
{ 
	Advert.cena=Number(Advert.cena);
	Advert.kvadratura=Number(Advert.kvadratura);
	if(!Advert.brojsoba)
	{
		delete Advert.brojsoba;		
	}
	else Advert.brojsoba=Number(Advert.brojsoba);
	

}
mongo.MongoWrapper(function(db)
{
	dbCon=db;
})
var insert=function(Advert)
{

		changeDataType(Advert);
		//Oglas=clone(Advert)
		//console.log('DOSO')
			var matching=dbCon.collection('matching');
			if(allDatabaseAlerts.length==0){console.log('NEMA DUZINU')}
			for(var j=0;j<allDatabaseAlerts.length;j++)
	            {

	                if((typeof(Advert.kvadratura)!='number')||(typeof(allDatabaseAlerts[j].kvadraturalow)!='number'))console.log('PROBLEM SA TIPOVIBA PODATAKA')
	                	//console.log(Advert);
	             		//console.log(adressMatching.isDesiredAdress(Advert.lokacija,allDatabaseAlerts[j].lokacija));
	                   if((adressMatching.isDesiredAdress(Advert.lokacija,allDatabaseAlerts[j].lokacija))&&(Advert.kvadratura>=allDatabaseAlerts[j].kvadraturalow)&&(Advert.kvadratura<=allDatabaseAlerts[j].kvadraturahigh)&&(Advert.cena<=allDatabaseAlerts[j].cenahigh)&&(Advert.cena>=allDatabaseAlerts[j].cenalow))
	                   {
	                   			console.log('Usao da dodam  alert');
		                       //console.log(Advert);
		                       var copy=clone(allDatabaseAlerts[j]);
		                       //delete copy.kvadraturalow;delete copy.kvadraturahigh;delete copy.cenalow;delete copy.cenahigh;
		                      /* var matched=0,total=0;
		                       for(i in copy)
		                       {
		                       		total++;
		                       		if(!Advert[i]){matched++;continue;}
		                       		console.log(i);
		                       		for(var k=0;k<copy[i].length;k++)
		                       		{
		                       			if(!copy[i][k]){matched++;break;}
		                       			if(copy[i][k]==Advert[i])
		                       			{
		                       				matched++;
		                       				break;
		                       			}
		                       		}
		                       }
		                       var percentage=(matched/total)*100;
		                       //console.log(Advert);
		                       //console.log(allDatabaseAlerts[j]);
		                       //console.log(matched,' ',total);
		                       console.log('verovatnoca je:'+percentage);
		                       //process.exit(0)
		                       if(percentage>=CONST_PERCENTAGE)
		                       {*/
		                       	  // console.log(Advert);
			                       var obj={}
			                       obj.idalert=allDatabaseAlerts[j]._id;
			                       obj.idogl=Advert.link;
			                       obj.websitename=Advert.nacinkupovine+Advert.type;
			                       //console.log(obj)
			                       delete obj._id;
			                   		
				                   matching.update({idalert:obj.idalert,idogl:obj.idogl},obj,{upsert:true},function(err,result)
				                   {
				                       console.log('UBACIO U MATCHING');
				                       if(err)console.log(err);
				                   });
				             //  }
	               		}
	                    
	             }
          
}
module.exports={insert}