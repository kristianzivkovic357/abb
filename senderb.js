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
var unit= require("./processUnitMeasurements.js");
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
    var a= new Date();
    //a.getMonth+a.getDay+a.getFullYear
    console.log('Current Time: '+a.getFullYear()+'/'+(a.getMonth()+1)+'/'+a.getDate()+' in '+a.getHours()+':'+a.getMinutes());
    
}
if((DEBUG_MODE==='STANDARD_DEBUG')||(DEBUG_MODE==='FULL_DEBUG'))
{
    setInterval(standardDebugging,15000);
}
function writeIntoFile(file,content,callback)
{
    fs.writeFile(file,content,function(err)
    {
        if(err)console.log(err);
        if(callback)callback();
    })
}
function deleteUnecessaryFields(obj)
{
    var listOfUnecessaryFields=["lokacijaOptions","datumSetup","shouldCrawl"];
    
    for(var i in listOfUnecessaryFields)
    {
        delete obj[listOfUnecessaryFields[i]];
    }
    if(!obj.kvadratura)
    {
        if(obj.povrsinaZemlje)
        {
            obj.kvadratura=obj.povrsinaZemlje;
        }
        else
        {
            console.log("povrsinZemlje and kvadratura both missing");
        }
        
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
function getCollectionsForPreviousState(collectionAll,collectionAlerts,db,websitename,callback)
{
   var all=db.collection(collectionAll);
   var alerts=db.collection(collectionAlerts);
   all.findOne({websitename:websitename},function(err,data)
    {
        alerts.findOne({websitename:websitename},function(err,resp)
        {
            callback(data,resp);

        })

    })
    
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
        Sajt=JSON.parse(Sajt);
        
         
        if(!debugObjUzmiSve[Sajt.websitename])debugObjUzmiSve[Sajt.websitename]={}; 
        if(!debugObj[Sajt.websitename]) debugObj[Sajt.websitename]={}; 


        var websiteList=db.collection('websiteList');
        websiteList.find().toArray(function(err,n)//moze ici sasvin van
        {
                var klq=Sajt;
                var pravi=clone(klq);
           
                for(var i in n)
                {
                    if(n[i].websitename==Sajt.websitename)
                    {
                        UzmiSve=0;
                    }
                }
                var stateCollection=db.collection('previousState');
        /*stateCollection.findOne({websitename:Sajt.websitename},function(err,whereCrawlerStopped)
        {*/
        getCollectionsForPreviousState('previousState','previousAlertState',db,Sajt.websitename,function(whereCrawlerStopped,alertCall)
        {
            /*console.log(whereCrawlerStopped);
            console.log(isFirstAlertCall);
            process.exit();*/
        //})
                var shouldAddTheRest=0;
                for(var j in klq.path) 
                {
                    if((UzmiSve)&&(whereCrawlerStopped))
                        {
                            if((whereCrawlerStopped.route==(klq.host+klq.path[j].put))||shouldAddTheRest)
                            {
                                shouldAddTheRest=1;//when find route matching every next route will be added
                                
                                pravi.path=klq.path[j].put;
                                //console.log(pravi.host+pravi.path);
                                pravi.type=klq.path[j].tip;
                                pravi.nacinkupovine=klq.path[j].nacin;
                                pravi.FiksniBrojStrana=klq.path[j].FiksniBrojStrana;
                                nizRuta.push(clone(pravi));
                            }
                        }
                    else
                        {
                            pravi.path=klq.path[j].put;
                            pravi.type=klq.path[j].tip;
                            pravi.nacinkupovine=klq.path[j].nacin;
                            pravi.FiksniBrojStrana=klq.path[j].FiksniBrojStrana;
                            nizRuta.push(clone(pravi));
                        }
                   
                }
                //console.log(nizRuta);
                //process.exit();
            //console.log(nizRuta);
            
          
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
            var addToMatching=0//used to disable crawler to fillmatchings when first alert called
            if(UzmiSve==0)
            {
                if(!alertCall)addToMatching=0;
                else addToMatching=1;
                
            }
            //addToMatching=1;///FOR DEBUGGING ONLY
            console.log("UzmiSve detected as:"+UzmiSve);
            console.log("addToMatching detected as:"+addToMatching);
           
          
            
    
            
    async.eachSeries(nizRuta,function(Route,krajRute)
    {
        
        //console.log(Route);process.exit();
            console.log('Zapoceta ruta:'+Route.websitename+' '+Route.nacinkupovine+Route.type);
        
            var arr=[];
   
            var BrojOglasaKlase={}
            for(var klase=0;klase<Route.vrsta.UkupanBroj;klase++)//inicijalizacija na 0
            {
                BrojOglasaKlase[fromClassToString(Route.existingPromoClasses[klase])]=0;
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
                            //ubaci(specialArr,UzmiSve,trackCurrentState);
                            ubaci(specialArr,UzmiSve,BrojOglasaKlase,addToMatching,trackCurrentState);
                        }
                        else//IZVRSAVA SE SAMO AKO SE SAJT NE OBRADJUJE KAO IZUZETAK
                        {
                    
                        var options =
                        {
                            host: Route.host,
                            path: Route.path+PageNum,
                            method: Route.request
                        };
                            
                            GetData.GetRawData('http://'+options.host+options.path,Route.phantomSupport,Route.websitename,UzmiSve,function(err,resp,body)
                            {
                                if(body==-1)
                                {
                                    //console.log('website wont respond finishing route');
                                    return krajRute('WEBSITE '+Sajt.websitename+' WONT RESPOND'); 
                                }
                                
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
                                            if((!vrsta)||(vrsta)=='')vrsta='012';
                                            if(BrojOglasaKlase[vrsta]==undefined)BrojOglasaKlase[vrsta]=0;
                                            BrojOglasaKlase[vrsta]++;
                                            //if(!UzmiSve){console.log(vrsta+' '+BrojOglasaKlase[vrsta]);}
                                           // BrojOglasaKlase[klasa]++;//THIS SHOULD BE A BUG
                                            
                                            for(var j in obj.pickInList)
                                            {
                                                
                                                obj[j]=crawl.FindData(sm,this,obj.pickInList[j]).replace(new RegExp(/\s\s+/g), ' ');
                                                
                                            }
                                            if(obj.slika)
                                            {
                                                if(obj.slika==obj.defaultImage)
                                                {
                                                    obj.doesntHaveImage=1;
                                                }
                                                else
                                                {
                                                    obj.doesntHaveImage=0;
                                                }
                                                if((obj.slika.indexOf('http://')==-1)&&((obj.slika.indexOf('https://')==-1)))obj.slika='http://'+Route.host+obj.slika;

                                            }
                                            
                                            delete obj.class;
                                            obj.websitename=Route.websitename;
                                            //obj.link = crawl.FindData(sm,this,Route.link);
                                            if(((ttmp=obj.link.indexOf('sid'))!=-1)&&(Route.websitename=='halooglasi'))
                                            {
                                                obj.link=obj.link.substr(0,ttmp-1);
                                            }
                                            /*if(obj.cena)
                                            {
                                                obj.cena=leaveOnlyDigits(obj.cena);
                                            }*/
                                            //console.log(obj.cena);
                                            var velikitemp=obj.cena;
                                            obj.cena=unit.getPriceInDefaultUnit(obj.cena);
                                            var malitemp=obj.kvadratura;
                                            obj.kvadratura=unit.getKvadraturaInDefaultUnit(obj.kvadratura);
                                            
                                            if(obj.link[0]=='/')obj.link='http://'+Route.host+obj.link;
                                            obj.domain=Route.host;
                                            obj.type=Route.type;
                                            obj.nacinkupovine=Route.nacinkupovine;
                                            /*if(obj.websitename!='halooglasi')*/arr.push(clone(obj));
                                            //console.log('AAA')
                                            if((!obj.cena)&&(obj.cena!=0))
                                                {
                                                    console.log('ne valja cena:'+obj.link);
                                                    console.log("cena string:"+velikitemp);
                                                    process.exit();
                                                }
                                                if(!obj.kvadratura&&(obj.kvadratura!=0))
                                                {
                                                    console.log('ne valja kvadratura:'+obj.link);
                                                    console.log("kvadratura str:"+malitemp);
                                                    process.exit();
                                                }
                                        })
                                    }
                                 //console.log(BrojOglasaKlase);//process.exit();
                                 if(!UzmiSve)console.log(BrojOglasaKlase);
                                    ubaci(arr,UzmiSve,BrojOglasaKlase,addToMatching,trackCurrentState);

                            }
                            else console.log('Stvari mnogo ne valjaju');
                        })//OD REQUESTA
                        
                        }
                })
                function trackCurrentState(brObradjenihOglasa,numOfInsertedInDb,BrojOglasaKlase)
                            {
                                arr=[];
                                var stateCollection=db.collection('previousState');
                                console.log("trackCurrentState je pozvan");
                                if(!PageNum)console.log("PageNum: "+PageNum);
                                if(PageNum>Route.FiksniBrojStrana)
                                {
                                    console.log(Route.websitename+' '+Route.nacinkupovine+' '+Route.type+"has exceeded max number of pages");
                                    krajRute();
                                    return;
                                }
                               
                               
                                if(!brObradjenihOglasa)
                                {
                                    console.log(Route.websitename+' '+Route.nacinkupovine+' '+Route.type+"has finished on page:"+PageNum);
                                    console.log("brObradjenihOglasa je nula");
                                    if(UzmiSve)
                                    {
                                        stateCollection.remove({websitename:Route.websitename},function(err,res)
                                        {
                                            if(err)console.log(err);
                                        })
                                    }
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
                                        if(BrojOglasaKlase.length>Route.vrsta.UkupanBroj)
                                        {
                                            console.log("Error: Detected more style classes then it should be, possibly the website: "+Route.websitename+" has been changed");
                                        }
                                        var check=1;
                                        //console.log(BrojOglasaKlase)
                                        var zadnjaKlasa=Route.existingPromoClasses[Route.existingPromoClasses.length-1]
                                        
                                            
                                        if(!BrojOglasaKlase)
                                        {
                                            console.log("FATAL ERROR BrojOglasaKlase EMPTY");
                                            process.exit();
                                        }
                                        if((!BrojOglasaKlase[fromClassToString(zadnjaKlasa)])&&(BrojOglasaKlase[fromClassToString(zadnjaKlasa)]!=0)){console.log("classes mismatch in alert detecting system");process.exit();}
                                        if(BrojOglasaKlase[fromClassToString(zadnjaKlasa)]<MinOglasaKlase)
                                        {
                                            check=0;//nastavi
                                        }
                                       /* console.log(BrojOglasaKlase[fromClassToString(zadnjaKlasa)]);
                                        console.log(check);
                                        console.log(BrojOglasaKlase);*/
                                       /* else
                                        {
                                            console.log(BrojOglasaKlase);
                                            console.log(zadnjaKlasa);
                                            process.exit();
                                        }*/
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
                                        
                                        var obj={};
                                        obj.route=Route.host+Route.path;
                                        obj.page=PageNum;
                                        obj.websitename=Route.websitename;
                                        stateCollection.update({websitename:obj.websitename},obj,{upsert:true},function(err,res)
                                        {
                                            if(err)console.log(err);
                                        })
                                            
                                        if((PageNum>=Number(Route.FiksniBrojStrana))/*||(!numOfInsertedInDb)*/)
                                        {
                                            stateCollection.remove({websitename:Route.websitename},function(err,res)
                                            {
                                                if(err)console.log(err);
                                            })
                                            console.log("Ruta je zavrsena jer je premasen fixni broj strana");
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
            
    
//mongo.MongoWrapper(function(db)
//{
    //console.log(UzmiSve);
        if(UzmiSve==1)
        {
           if(whereCrawlerStopped)
            {
                var temporary=whereCrawlerStopped.page;//this is done because recursion might not come back
                whereCrawlerStopped.page=1;
                wrapp(temporary);
                
            }
            else
            {
                wrapp(1);
            }
        }
        else{/*console.log(Route.websitename+' '+Route.nacinkupovine+' '+Route.type+' '+UzmiSve+' '+1);*/ wrapp(1);}
      
    
//})


},function(err)
{
    if(err)
    {
        console.log('ERROR OCCURED: PROABLY SOME WEBSITE HAVE CRASHED');
        console.log(err);
        callback();
        return; 
    }
    else
    {
        if(UzmiSve)
        {
            websiteList.insert({'websitename':Sajt.websitename},function(err,res)
            {
                if(err)console.log(err);
            })
            debugObjUzmiSve[Sajt.websitename].finishedAdsOnPage='FINISHED';
        }
        else
        {
            if(!addToMatching)
            {
                var obj={}
                obj.websitename=Sajt.websitename;
                var previousAlertState=db.collection('previousAlertState');
                previousAlertState.insert(obj,function(err,resp)
                {
                    if(err)console.log(err);
                });
            }
            debugObj[Sajt.websitename].finishedAdsOnPage='FINISHED'; 
        }
        console.log("Zavrsene sve rute jednog Routea");
        callback();
        return;
    }
});

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

function ubaci(arr,UzmiSve,BrojOglasaKlase,addToMatching,pozoviKraj)
{
    /**
     * function responsible for detailed information about every advert by sending another request to the link of the advert
     * and inserting into the database. Also calling insertIntoAlerts
     */
            //console.log(BrojOglasaKlase);
            ///if(!UzmiSve)console.log(arr[0].link)
            var oglasi=GLOB.collection('oglasi');
            var pointer=0;
            var numOfInsertedInDb=0;
            var len=arr.length;
            console.log("BROJ OGLASA U UBACI JE:"+len);
            async.each(arr,function(singleAdvert,finish)
            {
               
                //Only used for debugging purposes (STANDARD_DEBUG)
                var i=singleAdvert;
                function updateDebug()
                    {
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
                                   
                                    crawl.find(i,UzmiSve,function(resp)
                                    {
                                        
                                        if(resp==-1)return;
                                        changeDataType(resp);
                                        locations.processLocationOfAdvert(resp);
                                        resp.datum=dateFunctions.fixDate(resp.datum,resp.datumSetup)//datum
                                        deleteUnecessaryFields(resp);

                                        
                                        if(DEBUG_MODE=="FULL_DEBUG")console.log(resp);
                                        if(addToMatching)insertNewInAlerts.insert(resp);
                                        
                                        oglasi.update({"ime":(nacin+tip)},{"ime":(nacin+tip)},{upsert:true},function(err,res)
                                        {
                                            if(err)console.log(err);
                                            //else console.log(res);
                                            //callback3();
                                        });
                                        
                                        collection.insert(resp,function(err,res)
                                        {
                                           if(err)console.log(err);
                                           finish();
                                        });
                                        pointer++;
                                        updateDebug();
                                        //finish();

                                        

                                    });
                                }
                                else
                                {
                                    changeDataType(i);
                                    //console.log('Usao sam');
                                    i.datum=dateFunctions.fixDate(i.datum,i.datumSetup)//datum
                                    //locations.processLocationOfAdvert(i);//DISKUTABILNO
                                    deleteUnecessaryFields(i);

                                    if(DEBUG_MODE=="FULL_DEBUG")console.log(i)

                                    if(addToMatching)insertNewInAlerts.insert(i);
                                    collection.insert(i,function(err,res)
                                        {
                                           if(err)console.log(err);
                                           finish();
                                        });
                  
                                    oglasi.update({"ime":(nacin+tip)},{"ime":(nacin+tip)},{upsert:true},function(err,res)
                                        {

                                            if(err)console.log(err);
                                            
                                        });
                                    pointer++;
                                    updateDebug();
                                   // finish();
                                    
                                }

                            }
                            else
                            {
                                //if(!UzmiSve)console.log('vec je u bazi');
                                pointer++;
                                updateDebug();
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
    else /*if(numberOfCrawlers<1)*/
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
    if(Advert.cena!='Po Dogovoru')Advert.cena=Number(Advert.cena);
	Advert.kvadratura=Number(Advert.kvadratura);
	if(!Advert.brojsoba)
	{
		delete Advert.brojsoba;		
	}
	else Advert.brojsoba=Number(Advert.brojsoba);
	

}
getDbConnection();
//setInterval(getDbConnection,1000*60);

