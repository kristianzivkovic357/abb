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
var MinOglasaKlase=50;
var NoviOglasi=[];
var Uprocesu=0;

var lastid=0;
var globalProcessTracker=[];
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
    console.log(returnString)
    return returnString;
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
    var debugObj={};
    var UzmiSve=1;
    var nizRuta=[];
    var brOdradjenihStranica=1;
        var klq=JSON.parse(Sajt);
        var pravi=clone(klq);
        if(klq.special=='true')
        {
                nizRuta.push(clone(pravi));
        }
        else
        {
            for(var j in klq.path) 
            {
                pravi.path=klq.path[j].put;
                pravi.type=klq.path[j].tip;
                pravi.nacinkupovine=klq.path[j].nacin;
                nizRuta.push(clone(pravi));
            }
        }
        Sajt=JSON.parse(Sajt);

        var websiteList=db.collection('websiteList');
        websiteList.find().toArray(function(err,n)//moze ici sasvin van
        {
            for(var i in n)
            {
                if(n[i].websitename==Sajt.websitename)
                {
                        UzmiSve=0;
                        break;
                }
            }
        
       
        /*if(!globalProcessTracker[Sajt.websitename])
        {
             console.log(Sajt.websitename+' is set to doingAll');
             globalProcessTracker[Sajt.websitename]={};
            globalProcessTracker[Sajt.websitename].doingAll=1;
            UzmiSve=1;
        }
        else if(globalProcessTracker[Sajt.websitename].doingAlerts!=1)
        {
             console.log(Sajt.websitename+' is set to doingAlerts');
            globalProcessTracker[Sajt.websitename].doingAlerts=1;
            UzmiSve=0;
        }
        else 
        {
            console.log(Sajt.websitename+' is already doing alerts and therefore is escaped');
            callback();
            return;
        }*/
    async.eachSeries(nizRuta,function(Route,krajRute)
    {
        //console.log('Zapoceta ruta:'+Route.websitename+' '+Route.nacinkupovine+Route.type);
        
        var arr=[];
    SpecialCase.add(arr,Sajt,function(cont)
    {
        if(cont==-1){ubaci(arr);arr=[];krajRute();}
        if(cont!=-1)
        {
            var BrojOglasaKlase=[]
            function wrapp(PageNum) 
            {
                /*debugObj.route=Route.websitename+' '+Route.nacinkupovine+Route.type+' '+PageNum;
                debug[Route.websitename]=debugObj;
                for(var deb in debug)
                {
                    console.log(debug[deb].route);
                }
                console.log('\033[2J')*/
                SpecialCase.addEveryTime(Route,PageNum,function(specialArr)
                {
                        if(specialArr!=-1)
                        {
                            //console.log(specialArr);
                            ubaci(specialArr,trackCurrentState);
                        }
                        
                        else//IZVRSAVA SE SAMO AKO GA SE SAJT NE OBRADJUJE KAO IZUZETAK
                        {
                    
                        var options =
                        {
                            host: Route.host,
                            path: Route.path+PageNum,
                            method: Route.request
                        };
                            GetData.GetRawData('http://'+options.host+options.path,Route.phantomSupport,Route.websitename,0,function(err,resp,body)
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
                                            BrojOglasaKlase[klasa]++;
                                            //obj.cena=crawl.FindData(sm,this,Route.cena).replace('.','');
                                            //obj.kvadratura=crawl.FindData(sm,this,Route.kvadratura).trim()
                                            //obj.slika=crawl.FindData(sm,this,Route.slika);
                                            //console.log()
                                            for(var j in obj.pickInList)
                                            {
                                                obj[j]=crawl.FindData(sm,this,obj.pickInList[j]);
                                            }
                                            if(obj.slika)if(obj.slika.indexOf('http')==-1)obj.slika='http://'+Route.host+obj.slika;
                                            //obj.naslov=crawl.FindData(sm,this,Route.naslov);
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
                                // console.log(arr);
                                    ubaci(arr,trackCurrentState);

                            }
                            else console.log('Stvari mnogo ne valjaju');
                        })//OD REQUESTA
                        
                        }
                })
                function trackCurrentState(brObradjenihOglasa)
                            {
                                
                                console.log(Route.websitename+' '+Route.nacinkupovine+' '+Route.type+' '+UzmiSve+' '+PageNum+'//////');
                                arr=[];
                                
                                if(!UzmiSve) 
                                {
                                    if(Route.isJSON)
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
                                    var check=1;
                                    var iter=0;
                                    for(klasa in BrojOglasaKlase) 
                                        {
                                            iter++;
                                            if(BrojOglasaKlase[klasa]<MinOglasaKlase)
                                            {
                                                check=0;
                                            }
                                                
                                        }
                                        if((check==0)||(iter<Number(Route.vrsta.UkupanBroj)))wrapp(PageNum+1);
                                        else krajRute();
                                    }
                                }
                                else
                                    {
                                        var stateCollection=db.collection('previousState');
                                        var obj={};
                                        obj.route=Route.host+Route.path;
                                        obj.page=PageNum;
                                        stateCollection.update({'route':obj.route},obj,{upsert:true},function(err,res)
                                        {

                                        })
                                            
                                        if(brOdradjenihStranica>=Number(Route.FiksniBrojStrana))
                                        {
                                            stateCollection.remove({'route':obj.route},function(err,res)
                                            {
                                                if(err)console.log(err);
                                            })
                                            krajRute();
                                            return;
                                        }
                                        else
                                        {   
                                            brOdradjenihStranica++;
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
                    //console.log(n);
                    //process.exit();
                    console.log(Route.websitename+' '+Route.nacinkupovine+' '+Route.type+' '+UzmiSve+' '+n.page);
                    wrapp(n.page+1);
                }
                else
                {
                    console.log(Route.websitename+' '+Route.nacinkupovine+' '+Route.type+' '+UzmiSve+' '+1);
                    wrapp(1);
                }
            })
        }
        else{console.log(Route.websitename+' '+Route.nacinkupovine+' '+Route.type+' '+UzmiSve+' '+1); wrapp(1);}
      
    
//})

})//specialcase
},function(err)
{
     if(UzmiSve)
        {
            websiteList.insert({'websitename':Sajt.websitename},function(err,res)
            {
                if(err)

                console.log(err);
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

function ubaci(arr,pozoviKraj)
{
    //console.log(arr);
  // console.log('Pocinje ubacivanje u MONGO');
   
        //if(arr.length!=10){console.log('ne valja ');console.log(arr.length);}
        console.log('DOBIO DB');
        console.log(arr);
            var oglasi=GLOB.collection('oglasi');
            var pointer=-1;
            var len=arr.length;
            //console.log(arr.length);
            var insertOne=function()
            {
                pointer++;
                if(pointer>=len)
                {
                    clearInterval(interval);
                    pozoviKraj(arr.length);
                    return;
                }
                var i=arr[pointer];
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
                                if(i.shouldCrawl)
                                {
                                   //console.log(i.binders);
                                    crawl.find(i,function(resp)
                                    {
                                        
                                        if(resp==-1)return;
                                        insertNewInAlerts.insert(resp);
                                        console.log(resp);
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
                                        

                                    });
                                }
                                else
                                {
                                    console.log('Usao sam');
                                    insertNewInAlerts.insert(i);
                                    collection.insert(i,function(err,res)
                                        {
                                           if(err)console.log(err);
                                           console.log('DODAJEMO U DATABASE');
                                        });
                  
                                    oglasi.update({"ime":(nacin+tip)},{"ime":(nacin+tip)},{upsert:true},function(err,res)
                                        {

                                            if(err)console.log(err);
                                            
                                        });
                                }

                            }
                            else
                            {
                                console.log('vec je u bazi');
                            }
                      
                    })
         }
         insertOne();
         var interval=setInterval(insertOne,2000);
       
}
var KRAJ=function(err) 
{
    console.log('KRAJ CELE RUNDE');
    //process.exit();
    //wrapper();
}

function poziv() { 
    wrapper();
}
poziv();
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
getDbConnection();
//setInterval(getDbConnection,1000*60);
setInterval(poziv,1000*60*15);
