var findData=require('./crawl')
var request=require('request');
var cheerio=require('cheerio')
var GetData=require('./GetData')

var override=[];
 override['ć']='c';override['č']='c';override['đ']="dj";override['ž']='z';
var convert=function(a)
{ 
	var b=[]
	for(var i=0;i<a.length;i++)
	{
		if(override[a[i]]!=undefined)
		{
			b+=override[a[i]];
		}
		else
		{
			b+=a[i];
		}
	}
	return b;
}
var isDesiredAdress=function(a,b)
{
	if((!a)||(!b))return true;
	var min,max,minl,maxl;
	if(a.length>b.length){max=a;maxl=a.length;min=b;minl=b.length;}
	else{max=b;maxl=b.length;min=a;minl=a.length;}
	max=max.toLowerCase();
	max=convert(max)
	min=min.toLowerCase();
	min=convert(min);
	var words=min.toLowerCase();
	var words=min.split(' ');
	for(word in words)
	{
		if(max.indexOf(words[word])==-1)return false;
	}
		
	return true;
}
//console.log(isDesiredAdress('Srbija, Novi Beograd, Vinca','Srbija Beograd VINCA'));
module.exports={isDesiredAdress,convert};
