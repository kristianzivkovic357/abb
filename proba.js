var fs=require('fs');
var cheerio=require('cheerio')
var request=require('request')
var crawl=require('./crawl');
var sizeof = require('object-sizeof');
var getData=require('./GetData');
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj)
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    return copy;
}

var FindData=function (ch,th,str) 
{
    var arrOfCom=[];

    arrOfCom=str.split('.');
    //console.log(arrOfCom)
    for(var i=0;i<arrOfCom.length;i++) 
    {
        var otv=arrOfCom[i].indexOf('(');
        var zatv=arrOfCom[i].indexOf(')');
        //if(!th){console.log('Nije pronadjena putanja');return -1;}
        
        if(arrOfCom[i].indexOf('eq(')!=-1) 
        {
            var string=arrOfCom[i].substr(otv+1,zatv-1);
            string=string.substr(0,string.length-1);
            th=ch(th).eq(Number(string));

            continue;
        }
        else if(arrOfCom[i].indexOf('children(')!=-1) 
        {//console.log('1');
            th=ch(th).children();
        }
        else if(arrOfCom[i].indexOf('attr(')!=-1) 
        {//console.log('2');
            var string=arrOfCom[i].substr(otv+1,arrOfCom[i].length-1);
            string=string.substr(0,string.length-1);
            th=ch(th).attr(string);
            //if(typeof th==='undefined')return "012";//Ovo je uvedeno u trenutku kad smo ubacili nekretnine.rs TREBA RAZMOTRITI PRI DODAVANJU DRUGIH SAJTOVA
            return th;
        }
        else if(arrOfCom[i].indexOf('text(')!=-1) 
        {//console.log('3');
            if (typeof th != 'string') { th=ch(th).text(); }
            return th;
        }
        else if(arrOfCom[i].indexOf('split(')!=-1) 
        {//console.log('4');
            var string=arrOfCom[i].substr(otv+1,arrOfCom[i].length-2);
            string=string.substr(0,string.length-1);
            string = string.split(' ');
            th = ch(th).text().split(string[0])[string[1]];
            continue;
        }
        else if(arrOfCom[i].indexOf('kk(')!=-1) 
        {//console.log('5');
            var string=arrOfCom[i].substr(otv+1,arrOfCom[i].length-2);
            string=string.substr(0,string.length-1);
            if (typeof th != 'string') 
            { 
                th = ch(th).text().substr(0,ch(th).text().indexOf(string)-1)
            }
            else {
                //console.log(th.indexOf(string));
                th = th.substr(0,th.indexOf(string)-1);
            }
            continue;
        }
        else if(arrOfCom[i].indexOf('id(')!=-1)
        {//console.log('6');
            var string=arrOfCom[i].substr(otv+1,arrOfCom[i].length-2);
            string=string.substr(0,string.length-1);
            th=ch('#'+string);
            continue;
        }
        else if(arrOfCom[i].indexOf('class(')!=-1)
        {
        	//console.log('ddqwdqd');

          var string=arrOfCom[i].substr(otv+1,arrOfCom[i].length-2);
          
          string=string.substr(0,string.length-1)
          string =string.replace(/[' ']/g,".");
          string='.'+string;
    
            th=ch(string);
            continue;
        }
        else if(arrOfCom[i].indexOf('html(')!=-1)
        {
            var b = ch(th).html().toString('utf-8')
            
            return b;//RADI SAMO AKO JE ZADNJI U x.txt
        }

        else 
        {
            console.log('Funckija FindData dobija parametar koji ne valja!');
        }
    }

    return ch(th);
}

function start()
{
	var string="fotorama__wrap fotorama__wrap--css3 fotorama__wrap--slide kure palac";
	//console.log(string.replace(/[' ']/g,""));
 getData.GetRawData('https://www.halooglasi.com/nekretnine/izdavanje-stanova/super-ponuda-dvosoban-stan-kod-botanicke-bast/5425480483604','true',function(err,resp,body)
    {
    	var $=cheerio.load(body);
    	$= FindData($,null,'id(fotorama)');
    	console.log($.html());
    	var links=[];
    	function domRecursion($)
    	{
    		var p=$.children();
    		var len=p.length;

    		if(!len)
    		{
    			if($.attr('src'))
    			{
    				links.push($.attr('src'));
    			}
    			return;
    		}
    		for(var i=0;i<len;i++)
    		{
    			domRecursion(p.eq(i));
    		}
    	}
    	domRecursion($);
    	console.log(links);

    	//console.log($('*').html());
    })
}
function restart()
{
	request('http://www.nekretnine.rs/stambeni-objekti/stanovi/969933/novogradnja34-47kvm-svi-kreditidirektna-prodaja/?cat=prodaja&premium=true',function(err,resp,body)
    {
    	var $=cheerio.load(body);
    	$= FindData($,null,'id(images).children()');
    	console.log($.length);
    	for(var i=0;i<$.length;i++)
    	{
    		console.log($.eq(i).html());
    	}
    	
    	//console.log($('*').html());
    })
}
start();