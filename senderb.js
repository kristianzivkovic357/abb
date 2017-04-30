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
var UzmiSve=0;

var lastid=0;



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

 async.each(bin,function(Sajt,callback) 
 {
    var nizRuta=[];
    var brOdradjenihStranica=1;
     for(var i=0;i<bin.length;i++)
    {
        var klq=JSON.parse(bin[i]);
        var pravi=clone(klq);
        if(klq.special=='true')
            {
                nizRuta.push(clone(pravi));
            }
        else
        {
            for(j in klq.path) 
            {
                pravi.path=klq.path[j].put;
                pravi.type=klq.path[j].tip;
                pravi.nacinkupovine=klq.path[j].nacin;
                nizRuta.push(clone(pravi));
            }
           
        }
    }
    async.eachSeries(nizRuta,function(Route,krajRute)
    {
        var arr=[];
        
    SpecialCase.add(arr,Sajt,function(cont)
    {
        if(cont==-1){ubaci(arr);arr=[];krajRute();}
        if(cont!=-1)
        {
        console.log("Sending request so time is out!:"+Route.websitename);
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
                    if(typeof data != 'undefined' && data && data !=null) {
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
                            console.log('nastavljam');
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
    console.log('Zavrsena Faza Uzimanja Jedne Rute sa jednog Routea');
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
    console.log(arr);
   console.log('Pocinje ubacivanje u MONGO');
   if(UzmiSve)UzmiSve=0;
   var temparr=[]
   //if(err)console.log(err);
   var bro=arr.length-1;
    var exists=[];
    var num=0;
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
                                       
                                        //console.log({"ime1":(nacin+tip});
                                        insertNewInAlerts.insert(resp);
                                         //console.log(resp);
                                        //console.log(sizeof(resp));
                                        oglasi.update({"ime":(nacin+tip)},{"ime":(nacin+tip)},{upsert:true},function(err,res)
                                        {

                                            if(err)console.log(err);
                                            //else console.log(res);
                                            //callback3();
                                        });
                                        collection.insert(resp,function(err,res)
                                        {
                                           if(err)console.log(err);
                                           console.log('DODAJEMO U DATABASE');
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
    console.log('KRAJ MONGOA');
    process.exit();
    wrapper();
    Uprocesu=0;
}
    /*NoviOglasi.sort(compare);
    mongo.MongoWrapper(function(db)
    {
        var collection=db.collection('alerts');
        var matching=db.collection('matching');
        collection.find({}).toArray(function(err,res){


            var soll=0,sold=NoviOglasi.length
            for(var i=0;i<res.length;i++)
            {
                //console.log(res[i]);
                //return;
                var start=0;
                var end=NoviOglasi.length;
                var piv;
                var levo,desno;
                var temp;
                soll=0;sold=NoviOglasi.length;
                start=soll;
                end=sold;
                while(start<end)
                {
                    piv=Math.floor((start+end)/2)
                    if(temp==piv)break;
                    //if(end-start<=1)break;
                    if(NoviOglasi[piv].cena>res[i].cenalow)end=piv;
                    else if(NoviOglasi[piv].cena<res[i].cenalow)start=piv
                        else end=piv;
                    temp=piv;
                    if(NoviOglasi[piv].cena>=res[i].cenalow)levo=piv
                }
            if(levo==undefined)continue;
            start=soll-1;
            end=sold;
            temp=-1;

            while(start<end)
            {
                piv=Math.ceil((start+end)/2)
                if(temp==piv)break;
                    //if(end-start<=1)break;
                    if(NoviOglasi[piv].cena>res[i].cenahigh)end=piv;
                    else if(NoviOglasi[piv].cenahigh<res[i].cenahigh)start=piv
                        else start=piv;
                    temp=piv;
                    if(NoviOglasi[piv].cena<=res[i].cenahigh)desno=piv;

                }

                console.log(soll,' ',sold)
                console.log(NoviOglasi.length)
            //matching.createIndex( { "idalert": 1,"idogl":1,"websitename":1 }, { sparse: true } )
            for(var j=soll;j<sold;j++)
            {

                if((typeof(NoviOglasi[j].kvadratura)!='number')||(typeof(res[i].kvadraturalow)!='number'))console.log('PROBLEM SA TIPOVIBA PODATAKA')

                    if((NoviOglasi[j].kvadratura>=res[i].kvadraturalow)&&(NoviOglasi[j].kvadratura<=res[i].cenahigh))
                    {
                        console.log(NoviOglasi[j]);
                        var obj={}

                        obj.idalert=res[i]._id;
                        obj.idogl=NoviOglasi[j].id
                        obj.websitename=NoviOglasi[j].nacinkupovine+NoviOglasi[j].type;

                        delete obj._id;
                    //console.log(obj);
                    matching.update({idalert:obj.idalert,idogl:obj.idogl},obj,{upsert:true},function(err,result)
                    {
                        console.log('UBACIO U MATCHING');
                        if(err)console.log(err);
                    });
                   // sql.exec('INSERT INTO matching SET ?',obj);
               }
           }


       }

   })

    }) 
    
    console.log('Zavrseno Kompletno ubacivanje')
    if(!err) {

    }
    else console.log(err);
}*/

function poziv() { 
    Uprocesu=1;
    wrapper();
}
UzmiSve = 0;
poziv();
/*setInterval(function()
{
    if(!Uprocesu) {
        poziv();
    }
},1000*60*10);
setInterval(function()
{
    UzmiSve=1;
},1000*60*60*24)//na svaka 24 sata*/
