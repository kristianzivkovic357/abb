var  async=require('async');
var https = require('https');
var http = require('http');
var request=require('request');
var fs=require('fs');
var crawl=require('./crawl');
var mongo=require('./mongo');
var cheerio=require('cheerio');
var SpecialCase=require('./SpecialCase');
var GetData=require('./GetData');
var insertNewInAlerts=require('./insertNewInAlerts');
var sizeof = require('object-sizeof');
var dateFunctions=require('./dateFunctions');
var locations=require('./locationProcessing');
var ObjectId = require('mongodb').ObjectId;
var MinOglasaKlase=30;
var NoviOglasi=[];
var Uprocesu=0;
var DEBUG_MODE="STANDARD_DEBUG";
var numberOfCrawlers=0;
var debugObj={};
var debugObjUzmiSve={};
var debugObjPrevious={}
var debugObjUzmiSvePrevious={}
var lastid=0;
var globalProcessTracker=[];
function standardDebugging()
{
    //console.log('\033[2J');//clrscr
    var print=1;
    /*for(var i in debugObjUzmiSve)
    {
        if(debugObjUzmiSve[i]!=debugObjUzmiSvePrevious[i])
        {
            print=1;
            debugObjUzmiSvePrevious=clone(debugObjUzmiSve);
            break;
        }
        
    }*/
    if(print)
    {
        console.log('***************************************************************')
        console.log("UZIMANJE SVEGA:")
        for(var i in debugObjUzmiSve)
        {
            console.log(i+":"+JSON.stringify(debugObjUzmiSve[i]));
        }
       
    }
    else
    {
        console.log("Identicni");
        console.log(debugObjUzmiSve);
        console.log(debugObjUzmiSvePrevious);
    }
    /*print=1;
    for(var i in debugObj)
    {
        if(debugObj[i]!=debugObjPrevious[i])
        {
            print=1;
            debugObjPrevious=clone(debugObj);
            break;
        }
            
    }*/
    if(print)
    {
        
        console.log("UZIMANJE ZA ALERTOVE:")
        for(var i in debugObj)
        {
            console.log(i+":"+JSON.stringify(debugObj[i]));
        }
        console.log('******************************************************************')
    }
    else
    {
            console.log("Identicni");
            console.log(debugObj);
            console.log(debugObjPrevious);
    }
    
}
if(DEBUG_MODE==='STANDARD_DEBUG')
{
    setInterval(standardDebugging,15000);
}
function leaveOnlyDigits(string)
{
    var len=string.length;
    var returnString='';
    for(var i=0;i<len;i++)
    {
        if(!isNaN(string[i]))
        {
            returnString+=string[i];
        }
    }
    //console.log(returnString)
    return returnString;
}
function deleteUnecessaryFields(obj)
{
    var listOfUnecessaryFields=["lokacijaOptions","datumSetup","shouldCrawl"];
    for(var i in listOfUnecessaryFields)
    {
        delete obj[listOfUnecessaryFields[i]];
    }
}
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj)
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    return copy;
}
var debug=[];
var NizRouteova=[];
var brPagea=0

function fromClassToString(cl)
{
     var a=cl.replace(new RegExp(/\./g)," ");
     a=a.trim();
     return a;
}
//console.log(fromClassToString("/./../.././."));process.exit();
function wrapper() {
    fs.readFile("q.txt",'utf-8',function(err,data)
    {
        
        data=data.substr(1,data.length);
        NizRouteova=[];
      var bin=data.split("&&||");
      var tempa=[]
mongo.MongoWrapper(function(db)
{ 
    var websites=db.collection('websites');
    
       // console.log(result);process.exit();

 async.each(bin,function(Sajt,callback) 
 {
      
   
    var UzmiSve=1;
    var nizRuta=[];
    
        var klq=JSON.parse(Sajt);
        var pravi=clone(klq);
            for(var j in klq.path) 
            {
                pravi.path=klq.path[j].put;
                pravi.type=klq.path[j].tip;
                pravi.nacinkupovine=klq.path[j].nacin;
                pravi.FiksniBrojStrana=klq.path[j].FiksniBrojStrana;
                nizRuta.push(clone(pravi));
            }
        
        Sajt=JSON.parse(Sajt);
        
         
        if(!debugObjUzmiSve[Sajt.websitename])debugObjUzmiSve[Sajt.websitename]={}; 
        if(!debugObj[Sajt.websitename]) debugObj[Sajt.websitename]={}; 


        var websiteList=db.collection('websiteList');
        websiteList.find().toArray(function(err,n)//moze ici sasvin van
        {
           
                for(var i in n)
                {
                    if(n[i].websitename==Sajt.websitename)
                    {
                        UzmiSve=0;
                    }
                }
            
            
            if(UzmiSve==0)//i have already finished scrapping whole db of this website ,see condiiton above
            {
                if(numberOfCrawlers==1)
                {
                    UzmiSve=0;
                }
                else
                {
                    callback();
                    return;
                }
            }
            else
            {
                if(numberOfCrawlers==1)
                {
                    UzmiSve=1;
                }
                else if(numberOfCrawlers==2)
                {
                    UzmiSve=0;
                }
                else
                {
                    console.log("Fatal error with multiple crawlers");
                }
            }
            console.log("UzmiSve detected as:"+UzmiSve);
           
          
            
    
            
    async.eachSeries(nizRuta,function(Route,krajRute)
    {
        
        //console.log(Route);process.exit();
        console.log('Zapoceta ruta:'+Route.websitename+' '+Route.nacinkupovine+Route.type);
        
        var arr=[];
    SpecialCase.add(arr,Sajt,function(cont)
    {
        if(cont==-1){ubaci(arr,UzmiSve);arr=[];krajRute();}
        if(cont!=-1)
        {
            var BrojOglasaKlase={}
            for(var klase=0;klase<Route.vrsta.UkupanBroj;klase++)//inicijalizacija na 0
            {
                BrojOglasaKlase[fromClassToString(Route.class[klase])]=0;
                //console.log(fromClassToString(Route.class[klase]));
            }
            //process.exit();
            //if(!UzmiSve)console.log(BrojOglasaKlase);
            function wrapp(PageNum) 
            {
                if(UzmiSve)
                {
                    debugObjUzmiSve[Route.websitename].pageNum=PageNum;//debug only
                    debugObjUzmiSve[Route.websitename].finishedAdsOnPage=0;
                }
                else
                {
                    debugObj[Route.websitename].pageNum=PageNum;
                    debugObj[Route.websitename].finishedAdsOnPage=0;
                }
               
            
                SpecialCase.addEveryTime(Route,PageNum,UzmiSve,function(specialArr)
                {
                        if(specialArr!=-1)
                        {
                            ubaci(specialArr,UzmiSve,trackCurrentState);
                        }
                        else//IZVRSAVA SE SAMO AKO SE SAJT NE OBRADJUJE KAO IZUZETAK
                        {
                    
                        var options =
                        {
                            host: Route.host,
                            path: Route.path+PageNum,
                            method: Route.request
                        };
                            var priority;//priority for getData
                            if(UzmiSve)
                            {
                                priority=0;
                            }
                            else
                            {
                                priority=1;
                            }
                            GetData.GetRawData('http://'+options.host+options.path,Route.phantomSupport,Route.websitename,priority,function(err,resp,body)
                            {
                                
                                var data=body;
                                var obj={}
                                //console.log(resp);
                                //process.exit();

                                if(typeof data != 'undefined' && data && data !=null) 
                                {
                                    var sm=cheerio.load(data,{ignoreWhitespace:true})
                                    for(klasa in Route.class) 
                                    {
                                    
                                        sm(Route.class[klasa]).each(function(i,j) 
                                        {
                                            obj=clone(Route);
                                            var vrsta=crawl.FindData(sm,this,Route.vrsta.putanja);
                                            if(vrsta==undefined)vrsta='012';
                                            if(BrojOglasaKlase[vrsta]==undefined)BrojOglasaKlase[vrsta]=0;
                                            BrojOglasaKlase[vrsta]++;
                                            //if(!UzmiSve){console.log(vrsta+' '+BrojOglasaKlase[vrsta]);}
                                           // BrojOglasaKlase[klasa]++;//THIS SHOULD BE A BUG
                                            
                                            for(var j in obj.pickInList)
                                            {
                                                obj[j]=crawl.FindData(sm,this,obj.pickInList[j]).replace(new RegExp(/\s\s+/g), ' ');
                                            }
                                            if(obj.slika)if(obj.slika.indexOf('http')==-1)obj.slika='http://'+Route.host+obj.slika;
                                            
                                            delete obj.class;
                                            obj.websitename=Route.websitename;
                                            //obj.link = crawl.FindData(sm,this,Route.link);
                                            if(((ttmp=obj.link.indexOf('sid'))!=-1)&&(Route.websitename=='halooglasi'))
                                            {
                                                obj.link=obj.link.substr(0,ttmp-1);
                                            }
                                            if(obj.cena)
                                            {
                                                obj.cena=leaveOnlyDigits(obj.cena);
                                            }
                                            if(obj.link[0]=='/')obj.link='http://'+Route.host+obj.link;
                                            obj.domain=Route.host;
                                            obj.type=Route.type;
                                            obj.nacinkupovine=Route.nacinkupovine;
                                            /*if(obj.websitename!='halooglasi')*/arr.push(clone(obj));
                                            //console.log('AAA')
                                        })
                                    }
                                 //console.log(BrojOglasaKlase);//process.exit();
                                 //if(!UzmiSve)console.log(BrojOglasaKlase);
                                    ubaci(arr,UzmiSve,BrojOglasaKlase,trackCurrentState);

                            }
                            else console.log('Stvari mnogo ne valjaju');
                        })//OD REQUESTA
                        
                        }
                })
                function trackCurrentState(brObradjenihOglasa,numOfInsertedInDb,BrojOglasaKlase)
                            {
                                console.log("trackCurrentState je pozvan");
                                //console.log(Route.websitename+' '+Route.nacinkupovine+' '+Route.type+' '+UzmiSve+' '+PageNum+'//////');
                                arr=[];
                                if(!brObradjenihOglasa)
                                {
                                    console.log(Route.websitename+' '+Route.nacinkupovine+' '+Route.type+"has finished on page:"+PageNum);
                                    krajRute();
                                    return;
                                }
                                if(!UzmiSve) 
                                {
                                    if(Route.isJSON)// it is set that JSON sites have only one class ('1'), that might not be true for every website
                                    {
                                        if(!BrojOglasaKlase['1'])BrojOglasaKlase['1']=0;
                                        BrojOglasaKlase['1']+=20;
                                        if(BrojOglasaKlase['1']>MinOglasaKlase)
                                        {
                                            krajRute();
                                            return;
                                        }
                                        else
                                        {
                                            wrapp(PageNum+1);
                                        }
                                       // console.log(BrojOglasaKlase['1']+'***');
                                    }
                                    else
                                    {
                                        //debugObj[Route.websitename].klase=clone(BrojOglasaKlase);
                                        var check=1;
                                        console.log(BrojOglasaKlase)
                                        var zadnjaKlasa=null;
                                        for(klasa in Route.class) //trazim zadnju klasu
                                            {
                                                zadnjaKlasa=fromClassToString(Route.class[klasa]);   
                                            }
                                            
                                            if(!BrojOglasaKlase)
                                            {
                                                    console.log("FATAL ERROR BrojOglasaKlase EMPTY");
                                                    process.exit();
                                            }
                                            if(BrojOglasaKlase[zadnjaKlasa]<MinOglasaKlase)
                                            {
                                                    check=0;//nastavi
                                            }
                                            if(check==0)wrapp(PageNum+1);
                                            else 
                                            {
                                                console.log("Alertovi zavrsili rutu");
                                                krajRute();
                                            }
                                    }
                                }
                                else
                                    {
                                        var stateCollection=db.collection('previousState');
                                        var obj={};
                                        obj.route=Route.host+Route.path;
                                        obj.page=PageNum;
                                        obj.websitename=Route.websitename;
                                        stateCollection.update({websitename:obj.websitename},obj,{upsert:true},function(err,res)
                                        {

                                        })
                                            
                                        if((PageNum>=Number(Route.FiksniBrojStrana))/*||(!numOfInsertedInDb)*/)
                                        {
                                            //if(!numOfInsertedInDb)console.log("Ruta prekinuta zbog neubacenih oglasa");
                                            krajRute();
                                            return;
                                        }
                                        else
                                        {   
                                            
                                            wrapp(PageNum+1);
                                        }
                                    }

                            }
            }
            
    }
//mongo.MongoWrapper(function(db)
//{
    //console.log(UzmiSve);
        if(UzmiSve==1)
        {
            var stateCollection=db.collection('previousState');
            stateCollection.findOne({route:Route.host+Route.path},function(err,n)
            {
                if(n)
                {
                   
                    wrapp(n.page+1);
                }
                else
                {
                    
                    wrapp(1);
                }
            })
        }
        else{/*console.log(Route.websitename+' '+Route.nacinkupovine+' '+Route.type+' '+UzmiSve+' '+1);*/ wrapp(1);}
      
    
//})

})//specialcase
},function(err)
{
     if(UzmiSve)
        {
            websiteList.insert({'websitename':Sajt.websitename},function(err,res)
            {
                if(err)console.log(err);
            })
        }
    console.log("Zavrsene sve rute jednog Routea");
    callback();
    return;
});
 })

},KRAJ)//drugi async
});
})
}
function compare (a,b)
{
   if(a.cena>b.cena)return -1;
   else if(a.cena<b.cena)return 1;
   else
   {
        if(a.kvadratura>b.kvadratura)return 1;
        else if(a.kvadratura<b.kvadratura)return -1;
        else
        {
            if(a.brojsoba>b.brojsoba)return 1
                else if(a.brojsoba<b.brojsoba)return -1;
            return 1
        }
    }
}

var GLOB;

function ubaci(arr,UzmiSve,BrojOglasaKlase,pozoviKraj)
{
    /**
     * function responsible for detailed information about every advert by sending another request to the link of the advert
     * and inserting into the database. Also calling insertIntoAlerts
     */
            //console.log(BrojOglasaKlase);
            var oglasi=GLOB.collection('oglasi');
            var pointer=-1;
            var numOfInsertedInDb=0;
            var len=arr.length;
            //console.log(arr.length);
            async.each(arr,function(singleAdvert,finish)
            {
                pointer++;
                //Only used for debugging purposes (STANDARD_DEBUG)
                var i=singleAdvert;
                if(UzmiSve)
                {
                    debugObjUzmiSve[i.websitename].websitename=i.websitename;
                    debugObjUzmiSve[i.websitename].nacin=i.nacinkupovine
                    debugObjUzmiSve[i.websitename].type=i.type
                    debugObjUzmiSve[i.websitename].finishedAdsOnPage=pointer; 
                }
                else
                {
                    debugObj[i.websitename].websitename=i.websitename;
                    debugObj[i.websitename].nacin=i.nacinkupovine
                    debugObj[i.websitename].type=i.type
                    debugObj[i.websitename].finishedAdsOnPage=pointer; 
                }
                
             var collection=GLOB.collection(i.nacinkupovine+i.type);

            if((!i.nacinkupovine)||(!i.type)||(!i.websitename)){console.log('Ne postoji tip ili nacinkupovine');process.exit(0);}
                var nacin=i.nacinkupovine;
                var tip=i.type;
                collection.findOne({link:i.link},function(err,n)
                 {
                       if((!i.nacinkupovine)||(!i.type))console.log('tip ili nacinkupovine ne postoji u JSON-u sto je velika greska'); 
                        if(err)console.log(err)
                            if(!n)
                            {
                                numOfInsertedInDb++;
                                if(i.shouldCrawl)
                                {
                                   
                                    if(UzmiSve)
                                    {
                                        priority=0;
                                    }
                                    else
                                    {
                                        priority=1;
                                    }
                                    crawl.find(i,priority,function(resp)
                                    {
                                        
                                        if(resp==-1)return;
                                        changeDataType(resp);
                                        locations.processLocationOfAdvert(resp);
                                        resp.datum=dateFunctions.fixDate(resp.datum,resp.datumSetup)//datum
                                        deleteUnecessaryFields(resp);

                                        
                                        if(DEBUG_MODE=="FULL_DEBUG")console.log(resp);
                                        if(UzmiSve==0)insertNewInAlerts.insert(resp);
                                        
                                        oglasi.update({"ime":(nacin+tip)},{"ime":(nacin+tip)},{upsert:true},function(err,res)
                                        {
                                            if(err)console.log(err);
                                            //else console.log(res);
                                            //callback3();
                                        });
                                        
                                        collection.insert(resp,function(err,res)
                                        {
                                           if(err)console.log(err);
                                           //console.log('DODAJEMO objekat U DATABASE');
                                        });
                                        finish();

                                        

                                    });
                                }
                                else
                                {
                                    changeDataType(i);
                                    //console.log('Usao sam');
                                    i.datum=dateFunctions.fixDate(i.datum,i.datumSetup)//datum
                                    locations.processLocationOfAdvert(i);//DISKUTABILNO
                                    deleteUnecessaryFields(i);

                                    if(DEBUG_MODE=="FULL_DEBUG")console.log(i)

                                    if(UzmiSve==0)insertNewInAlerts.insert(i);
                                    collection.insert(i,function(err,res)
                                        {
                                           if(err)console.log(err);
                                           //console.log('DODAJEMO U DATABASE');
                                        });
                  
                                    oglasi.update({"ime":(nacin+tip)},{"ime":(nacin+tip)},{upsert:true},function(err,res)
                                        {

                                            if(err)console.log(err);
                                            
                                        });
                                    finish();
                                    
                                }

                            }
                            else
                            {
                                //if(!UzmiSve)console.log('vec je u bazi');
                                finish();
                                
                            }
                           
                      
                    })
         },function()
        {
            pozoviKraj(pointer,numOfInsertedInDb,BrojOglasaKlase)
        })
       
}
var KRAJ=function(err) 
{
    console.log('KRAJ CELE RUNDE');
    numberOfCrawlers--;
    //process.exit();
    //wrapper();
}

function poziv() 
{
    if(numberOfCrawlers>2)
    {
        console.log("Fatal error, number of crawlers > 2");
    }
    else if(numberOfCrawlers==2)
    {
        console.log("Aborting this call for a crawler because there is two instances");
    }
    else
    {
        numberOfCrawlers++;
        console.log("Calling Crawler...");
        wrapper();
    }
    
}
poziv();
setInterval(poziv,1000*20);
var pq=0;
function getDbConnection()
{
    mongo.MongoWrapper(function(db)
    {
        if(!pq){GLOB=db;pq=1;}
        else
        {
            GLOB.close();
            GLOB=db;
        }
    })
}
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
getDbConnection();
//setInterval(getDbConnection,1000*60);

