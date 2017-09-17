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
	for(var i in a)
	{
		isTrue=0;
		for(var j in b)
		{
			if(a[i]==b[j])
			{
				isTrue=1;
				break;
			}
		}
		if(!isTrue)//every sublocation must match
		{
			return false;
		}
	}
	return true;
}
//console.log(isDesiredAdress('Srbija, Novi Beograd, Vinca','Srbija Beograd VINCA'));
module.exports={isDesiredAdress,convert};
