var  async=require('async');
var https = require('https');
var fs=require('fs')

var cheerio=require('cheerio');
var sql=require('./sql');
var MinOglasaKlase=20;
var arr=[];
var NoviOglasi=[];
var Uprocesu=0;
var UzmiSve=0;
var brOdradjenihStranica=0;
var lastid=0;


function FindData(ch,th,str) {
    var arrOfCom=[];

    arrOfCom=str.split('.');
    for(var i=0;i<arrOfCom.length;i++) {
        var otv=arrOfCom[i].indexOf('(');
        var zatv=arrOfCom[i].indexOf(')');
        if(arrOfCom[i].indexOf('eq')!=-1) {
            var string=arrOfCom[i].substr(otv+1,zatv-1);
            string=string.substr(0,string.length-1);
            th=ch(th).eq(Number(string));
            continue;
        }
        else if(arrOfCom[i].indexOf('children')!=-1) {
            th=ch(th).children();
        }
        else if(arrOfCom[i].indexOf('attr')!=-1) {
            var string=arrOfCom[i].substr(otv+1,arrOfCom[i].length-1);
            string=string.substr(0,string.length-1);
            th=ch(th).attr(string);
            return th;
        }
        else if(arrOfCom[i].indexOf('text')!=-1) {
            if (typeof th != 'string') { th=ch(th).text(); }
            return th;
        }
        else if(arrOfCom[i].indexOf('kk')!=-1) {
            var string=arrOfCom[i].substr(otv+1,arrOfCom[i].length-2);
            string=string.substr(0,string.length-1);
            th = ch(th).text().substr(0,ch(th).text().indexOf(string)-1)
            continue;
        }
        else {
            console.log('Funckija FindData dobija parametar koji ne valja!');
        }
    }
    return ch(th);
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj)
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    return copy;
}

function download(opt,callback) {
 https.get(opt, function(res) {
    var data = "";
    res.on('data', function (chunk) {
      data += chunk;
  });
    res.on("end", function() {
       callback(data);
   });
}).on("error", function() {
    callback(null);
});
}
var NizSajtova=[];
var brPagea=0
function wrapper() {
    fs.readFile("t.txt","utf8",function(err,data) {
        NizSajtova=[];
        var bin=data.split("!");
        var tempa=[]
        for(var i=0;i<bin.length;i++) {
            var klq=JSON.parse(bin[i]);
            var pravi=clone(klq);
            for(j in klq.path) {
               pravi.path=klq.path[j].put;
               pravi.type=klq.path[j].tip;
               pravi.nacinkupovine=klq.path[j].nacin;
               NizSajtova.push(clone(pravi));
           }
       }
       async.each(NizSajtova,function(Sajt,callback) {
        //sadasnji=Sajt;
        console.log("Sending request so time is out!");
        var BrojOglasaKlase=[]
        for(k in Sajt.class)
            BrojOglasaKlase[k]=0;
        var brPagea=[]
        for(var k=0;k<1;k++)
            brPagea[k]=k;

        async.each(brPagea,function(Page,callback2) {
            function wrapp(PageNum) {
               for(var qw=0;qw<Number(Sajt.FiksniBrojStrana);qw++) {
                if(!UzmiSve)qw=Number(Sajt.FiksniBrojStrana);
                var options = {
                    host: Sajt.host,
                    path: Sajt.path+Sajt.page+PageNum,
                    method: Sajt.request
                };
                download(options,function(data) {
                    var obj={}
                    if(typeof data != 'undefined' && data && data !=null) {
                        var sm=cheerio.load(data,{ignoreWhitespace:true})
                        for(klasa in Sajt.class) {
                            sm(Sajt.wrapper[klasa]).each(function(i,j) {
                                
                                BrojOglasaKlase[klasa]++;
                                obj=clone(Sajt)
                                obj.id=FindData(sm,this,Sajt.id);
                                obj.cena=FindData(sm,this,Sajt.cena).replace('.','');
                                obj.naslov=FindData(sm,this,Sajt.naslov)
                                obj.grad=FindData(sm,this,Sajt.grad)
                                obj.opstina=FindData(sm,this,Sajt.opstina)
                                obj.mesto=FindData(sm,this,Sajt.mesto)
                                obj.ulica=FindData(sm,this,Sajt.ulica)
                                obj.kvadratura=FindData(sm,this,Sajt.kvadratura).trim()
                                obj.brojsoba=FindData(sm,this,Sajt.brojsoba).trim()
                                delete obj.class;
                                obj.websitename=Sajt.websitename;
                                obj.link = FindData(sm,this,Sajt.link)
                                obj.slika = FindData(sm,this,Sajt.slika)
                                obj.domain=Sajt.host;
                                delete obj.host;
                                delete obj.path;
                                delete obj.page;
                                delete obj.request;
                                delete obj.FiksniBrojStrana;
                                arr.push(clone(obj));
                            })
                        } 
                        if(!UzmiSve) {
                            var check=1;
                            var doslidokraja=1
                            for(klasa in BrojOglasaKlase) {
                                if(BrojOglasaKlase[klasa]<20)check=0;
                                if(BrojOglasaKlase[klasa]>0)doslidokraja=0;
                            }
                            if(doslidokraja)callback2();
                            if(check==0) wrapp(PageNum+1);
                            else callback2();
                        }
                        if((brOdradjenihStranica>=Sajt.FiksniBrojStrana)&&(UzmiSve)) callback2();
                        brOdradjenihStranica++;
                    }
                })
            }
        } 
        wrapp(1)
    },function(err) {
        console.log('Zavrsena Faza Uzimanja Jedne Branse sa jednog sajta');
        if(!err) callback();
        else console.log(err);
    })
    },ubaci)
   });
}
function ubaci(err) {    
    console.log('Pocinje ubacivanje u SQL')
    if(UzmiSve)UzmiSve=0;
    var temparr=[]
    if(err)console.log(err);
    var bro=0;
    for(i in arr)
        temparr[bro++]=clone(arr[i]);
    var exists=[];
    async.eachSeries(temparr,function(i,callback3) {
      var check="SHOW TABLES LIKE "+"'"+i.websitename+"'";
      sql.exec(check,null,function(res) {
         if(res.length) {   
           sql.select('SELECT ulica from '+i.websitename+' WHERE ulica=\''+i.ulica+'\'',function(res) {
            if(!res.length) {
                sql.exec('INSERT INTO '+i.websitename+' SET ?',i,function(data) {
                    sql.select('SELECT MAX(ids) AS ids FROM '+i.websitename+';',function(hj) {
                       i.ids=hj[0].ids;
                       NoviOglasi.push(i);
                   })
                    sql.select('SELECT COUNT(id) AS broj FROM opstine WHERE naziv LIKE "%'+i.opstina+'%";',function(br) {
                        if(!br[0].broj) sql.exec("INSERT INTO opstine SET naziv='"+i.opstina+"'",null,function(a){});
                    });
                    callback3();
                });
            }
            else {
                callback3();
            }
        });
       }
       else {
         i.ids=1;
         NoviOglasi.push(i);
         sql.CreateTable(i.websitename,function(res) {
            sql.exec('INSERT INTO '+i.websitename+' SET ?',i,
               function(data) {
                sql.select('SELECT COUNT(id) AS broj FROM opstine WHERE naziv LIKE "%'+i.opstina+'%";',function(br) {
                    if(!br[0].broj) sql.exec("INSERT INTO opstine SET naziv='"+i.opstina+"'",null,function(a){});
                });
                callback3();
            });
        });
     }
 })
  },function(err) {
    
    Uprocesu=0;
    sql.select('SELECT * FROM alerts',function(res) {
        //console.log(res[0]);
        //console.log('PREKID');
        //console.log('KRECE FOR')
        for(var i=0;i<NoviOglasi.length;i++) {
            NoviOglasi[i].cena=Number(NoviOglasi[i].cena);
            NoviOglasi[i].kvadratura=Number(NoviOglasi[i].kvadratura)
            
            //else continue;
            for(var j=0;j<res.length;j++) {
                res[j].cenalow=Number(res[j].cenalow);
                res[j].cenahigh=Number(res[j].cenahigh);
                res[j].kvadraturalow=Number(res[j].kvadraturalow);
                res[j].kvadraturahigh=Number(res[j].kvadraturahigh);
                var proso=1;
                console.log(NoviOglasi[i].cena)
                if(((NoviOglasi[i].cena<res[j].cenalow)||(NoviOglasi[i].cena>res[j].cenahigh))&&(res[j].cenahigh)&&(res[j].cenalow)){proso=0;console.log('PAO CENA');}
                if(((NoviOglasi[i].kvadratura<res[j].kvadraturalow)||(NoviOglasi[i].kvadratura>res[j].kvadraturahigh))&&(res[j].kvadraturahigh)&&(res[j].kvadraturalow)){proso=0;console.log('PAO KVADR');}

                
                if(proso) {
                    var obj={}
                    obj.idalert=res[j].id;
                    obj.idogl=NoviOglasi[i].ids
                    obj.websitename=NoviOglasi[i].websitename;
                    console.log(NoviOglasi[i])
                }
            }
        }
    })
    console.log('Zavrseno Kompletno ubacivanje')
    if(!err) {

    }
    else console.log(err);
})
}
function poziv() { 
    Uprocesu=1;
    wrapper();
}
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

