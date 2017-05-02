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
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj)
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    return copy;
}

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
    websites.find().toArray(function(err,result)
    {
    
       // console.log(result);process.exit();
 async.each(bin,function(Sajt,callback) 
 {

    var UzmiSve=0;
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
        if(!globalProcessTracker[Sajt.websitename])
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
        }
    async.eachSeries(nizRuta,function(Route,krajRute)
    {
        console.log('Zapoceta ruta:'+Route.websitename+' '+Route.nacinkupovine+Route.type);
        var arr=[];
    SpecialCase.add(arr,Sajt,function(cont)
    {
        if(cont==-1){ubaci(arr);arr=[];krajRute();}
        if(cont!=-1)
        {
            
        var BrojOglasaKlase=[]
            var brPagea=[]
            for(var k=0;k<1;k++)
                brPagea[k]=k;
       async.each(brPagea,function(Page,callback2)
        {
        function wrapp(PageNum) 
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
                    if(typeof data != 'undefined' && data && data !=null) 
                     {
                        var sm=cheerio.load(data,{ignoreWhitespace:true})
                        for(klasa in Route.class) 
                        {
                           
                            sm(Route.class[klasa]).each(function(i,j) 
                            {
                                obj=clone(Route)
                                var vrsta=crawl.FindData(sm,this,Route.vrsta.putanja);
                                if(vrsta==undefined)vrsta='012';
                                if(BrojOglasaKlase[vrsta]==undefined)BrojOglasaKlase[vrsta]=0;

                                BrojOglasaKlase[vrsta]++;
                                BrojOglasaKlase[klasa]++;
                                
                                obj.cena=crawl.FindData(sm,this,Route.cena).replace('.','');
                                obj.kvadratura=crawl.FindData(sm,this,Route.kvadratura).trim()
                                obj.slika=crawl.FindData(sm,this,Route.slika);
                                if(obj.slika.indexOf('http')==-1)obj.slika='http://'+Route.host+obj.slika;
                                obj.naslov=crawl.FindData(sm,this,Route.naslov);
                                delete obj.class;
                                obj.websitename=Route.websitename;
                                obj.link = crawl.FindData(sm,this,Route.link);
                                if(((ttmp=obj.link.indexOf('sid'))!=-1)&&(Route.websitename=='halooglasi'))
                                {
                                    obj.link=obj.link.substr(0,ttmp-1);
                                }
                                if(obj.link[0]=='/')obj.link='http://'+Route.host+obj.link;
                                obj.domain=Route.host;
                                obj.type=Route.type;
                                obj.nacinkupovine=Route.nacinkupovine;
                                /*if(obj.websitename!='halooglasi')*/arr.push(clone(obj));
                            })
                        }
                        ubaci(arr,function()//kada se zavrsi svaka strana nastavlja se dalje
                        {
                           // console.log('nastavljam');
                            arr=[];
                            if(!UzmiSve) 
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
                                else callback2();
                            }
                            else
                            {
                                if(brOdradjenihStranica>=Number(Route.FiksniBrojStrana))
                                {
                                    callback2();
                                    return;
                                }
                                else
                                {   
                                    brOdradjenihStranica++;
                                    wrapp(PageNum+1);
                                }
                            }

                        })

                }
                else console.log('Stvari mnogo ne valjaju');
            })//OD REQUESTA
} 
wrapp(1)
},function(err) {
    //console.log('Zavrsena Faza Uzimanja Jedne Rute sa jednog Routea');
    if(!err) krajRute();
    else console.log(err);
})//prvi async
}
})//specialcase
},function(err)
{
    console.log("Zavrsene sve rute jednog Routea");
    callback();
    return;
});

},KRAJ)//drugi async
});
});

});//fs readifle
}//wrapper

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
    mongo.MongoWrapper(function(db)
    {
        GLOB=db;
        console.log('DOBIO DB');
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
                    pozoviKraj();
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
                                if((i.websitename!='cityexpert'))
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
                      
                    })
         }
         insertOne();
         var interval=setInterval(insertOne,2000);
       })
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
setInterval(poziv,1000*60*15);
