var fs=require("fs");
var defaultPriceUnit='EUR';
var priceUnits;
var kvadraturaUnits;
function initialize()
{
    fs.readFile("units.txt",{encoding:"utf8"},function(err,data)
    {
        if(err)console.log(err)
        else
        {
            data=JSON.parse(data);
            priceUnits=data.priceUnits;
            kvadraturaUnits=data.kvadraturaUnits;
            console.log(priceUnits);
            //getKvadraturaInDefaultUnit('0 m2');
            //console.log("kvadrati:"+getKvadraturaInDefaultUnit("65 m2"));

        }
    })
}
initialize();
function getPriceInDefaultUnit(value)
{
   // console.log(value)
    var unit=getCharsFromString(value).trim();
    
    var priceNumber=null;
    var shouldBreak=0;
    if(unit.length==0)
    {
        return (Math.round(Number(leaveOnlyDigits(value))*10)/10);
    }
    for(var i in priceUnits)
    {
        for(var j in priceUnits[i].possibleMarks)
        {
            if(unit.indexOf(priceUnits[i].possibleMarks[j])!=-1)
            {
                var priceRatio=priceUnits[i].convertRatio;
                
                value=value.replace(priceUnits[i].possibleMarks[j],'');//erase
               
                priceNumber=Number(leaveOnlyDigits(value));
                
                priceNumber*=priceRatio;
                //if(!priceNumber)console.log("Cena je NaN za value:"+value);
                if((priceNumber)||(priceNumber==0))return (Math.round(priceNumber*10)/10);
                 
            }
        }
    }
    return "Po Dogovoru";

}

function getKvadraturaInDefaultUnit(value)
{
    //console.log(value);
    var unit=value.trim();//diferent from price match
    
    var kvadraturaNumber=null;
    //console.log(unit)
    for(var i in kvadraturaUnits)
    {
        
        for(var j in kvadraturaUnits[i].possibleMarks)
        {
           // console.log(kvadraturaUnits[i].possibleMarks[j]);
            if(unit.indexOf(kvadraturaUnits[i].possibleMarks[j])!=-1)
            {
                //console.log('aaa')
                value=value.replace(kvadraturaUnits[i].possibleMarks[j],'');
                var kvadraturaRatio=kvadraturaUnits[i].convertRatio;
               var digits=leaveOnlyDigitsAndDots(value);
               
               digits=digits.replace(new RegExp(/\,/g),".");
               //console.log(digits)
                var kvadraturaNumber=Number(digits);

                kvadraturaNumber*=kvadraturaRatio;
                if((kvadraturaNumber)||(kvadraturaNumber==0))return (Math.round(kvadraturaNumber*10)/10);
                
            }
        }
    }
    //console.log("kvadratura unit isnt found: "+value);
    return undefined;

}



var specialChars='. ,/-()';//ima i space
function getCharsFromString(value)
{
    
    var letters='';
    for(var i in value)
    {
        if((value[i]<'0')||(value[i]>'9'))
        {
            if(specialChars.indexOf(value[i])==-1)
            {
                letters+=value[i];
            }
        }
    }
    return letters;
}
function leaveOnlyDigits(string)// leaves the '.' and ','
{
    var len=string.length;
    var returnString='';
    for(var i=0;i<len;i++)
    {
        if((string[i]>='0')&& (string[i]<='9'))
        {
            returnString+=string[i];
        }
       
    }
    //console.log(returnString)
    //console.log(returnString)
    return returnString;
}
function leaveOnlyDigitsAndDots(string)// leaves the '.' and ','
{
    var len=string.length;
    var returnString='';
    for(var i=0;i<len;i++)
    {
        if((string[i]>='0')&& (string[i]<='9'))
        {
            returnString+=string[i];
        }
        else if((string[i]==','))
        {
            returnString+=string[i];
        }
    }
    //console.log(returnString)
    //console.log(returnString)
    return returnString;
}
//console.log(getKvadraturaInDefaultUnit("8.200 m2"));
//process.exit();
//console.log('aaaa:'+isNaN(' '))
module.exports=
{
getPriceInDefaultUnit,
getKvadraturaInDefaultUnit
}