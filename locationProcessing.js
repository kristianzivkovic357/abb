var request= require('request');
var fs= require('fs');
var allLocations={};
var conversionTable={};
// initial calls
fillInitialAccentConversionTable();
loadAllLocations()
/**
 * This module is used to classify given location into our location notation because of the better search.
 * It is important to note that this module is executing as clean javascript,
 *  no asychronous execution because the whole code is only relied to processor speed
 */

function downloadAllLocations()
{
    request("https://api.4zida.rs/v3/places?withAds=true",function(err,response,data)
    {
        fs.writeFile("allLocations.txt",data,function(err,r)
        {
            if(err)console.log(err)
        })
    });
}
function loadAllLocations()
{
    fs.readFile("allLocations.txt",{encoding:"utf8"},function(err,locations)
    {
        if(!err)
        {
            allLocations=JSON.parse(locations);
            for(var i in allLocations)
            {
                var arr=[allLocations[i].accentLessTitle];
                for(var j in allLocations[i].parents)
                {
                    arr.push(allLocations[i].parents[j].accentLessTitle);
                }
                allLocations[i]=arr;
            }
            var a={"lokacijaOptions":{"format":"$ulica;,$oblast;,$grad;,$drzava;", "charsToDelete":"()-_"},"lokacija":"Jovana Avakumovića,29. Novembra,11060 Beograd,Srbija"};
            processLocationOfAdvert(a); 
            console.log(a);
        }
        else
        {
            console.log(err);
            
        }
    })
}
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj)
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    return copy;
}
function fillInitialAccentConversionTable()
{
    conversionTable['č'.charCodeAt(0)]='c';
    conversionTable['ć'.charCodeAt(0)]='c';
    conversionTable['ž'.charCodeAt(0)]='z';
    conversionTable['š'.charCodeAt(0)]='s';
    conversionTable['đ'.charCodeAt(0)]='dj';

    conversionTable['Č'.charCodeAt(0)]='C';
    conversionTable['Ć'.charCodeAt(0)]='C';
    conversionTable['Ž'.charCodeAt(0)]='Z';
    conversionTable['Š'.charCodeAt(0)]='S';
    conversionTable['Đ'.charCodeAt(0)]='Dj';
}

function removeAccentFromString(string)
{
    var finalStr=''
    for(var i=0;i<string.length;i++)
    {
        if(conversionTable[string.charCodeAt(i)])
        {
            finalStr+=conversionTable[string.charCodeAt(i)];
        }
        else
        {
            finalStr+=string[i]
        }
    }
    return finalStr;   
}
function processLocationOfAdvert(Advert)
{
    if(!Advert.lokacija)
    {
        console.log('NEMA LOKACIJA ZA OGLAS:');
        console.log(Advert);
        return -1;
    }
    var variables=locateAllCharsInString(Advert.lokacijaOptions.format,"$");
    //console.log(variables);
    var finalDataObject={};
    var allLocationTypes=[];
    for(var i in variables)
    {
        var nameOfType='';
        for(var j=variables[i]+1;(Advert.lokacijaOptions.format[j]!=';')&&(j<Advert.lokacijaOptions.format.length);j++)
        {
            nameOfType+=Advert.lokacijaOptions.format[j];

        }
        finalDataObject[nameOfType]='';
        allLocationTypes.push(nameOfType);
    }
    
    var format=Advert.lokacijaOptions.format;//radi citljivosti
    var wasWrittenToThisType=0;
    var charToGet='';
    var tempDataArray=[];
    var currentLoc='';
    for(var i=0,j=0,numOfType=-1;i<Advert.lokacija.length;j++,i++)
    {
        //console.log(j)
        if(format[j]=='$')
        {
            
            wasWrittenToThisType=0;
            j=findNextPositionOfChar(format,';',j)+1;
            numOfType++;
        }
        
        charToGet=format[j];
            
            for(;(i<Advert.lokacija.length)&&(Advert.lokacija[i]!=charToGet);i++)
            {
                if(!wasWrittenToThisType)//This is used to prevent writing of special characters in location types
                {
                    currentLoc+=Advert.lokacija[i];
                    
                }
            }
            tempDataArray.push(currentLoc);
            currentLoc='';
           
            wasWrittenToThisType=1;

    }
   // console.log(tempDataArray);
    
    
    for(var i in tempDataArray)
    {
        tempDataArray[i]=deleteCharsFromString(tempDataArray[i],Advert.lokacijaOptions.charsToDelete);
        tempDataArray[i]=removeAccentFromString(tempDataArray[i]);
        tempDataArray[i]=tempDataArray[i].trim();
    }
    tempDataArray=tempDataArray.sort();
    var sortedDataArray=[];
    /*for(var i in tempDataArray)
    {
        sortedDataArray=tempDataArray[i].split(' ').concat(sortedDataArray);
        console.log(sortedDataArray);
    }
    var sortedDataArray=tempDataArray.sort();*/
    //console.log(tempDataArray);return;
    
    for(var i in allLocations)
    {
        var completeLocation=[];
        completeLocation.push(allLocations[i].accentLessTitle);
        for(var j in allLocations[i].parents)
        {
            completeLocation.push(allLocations[i].parents[j].accentLessTitle)
        }
    }
   /* fs.writeFile('allLocShort.txt',JSON.stringify(allLocations),function(err,resp)
{
    if(err)console.log(err);
})*/
       // console.log(allLocations)
        var maximumMatchings=0;
        for(var m in allLocations)
        {
            //console.log(allLocations[m]);break;

            var splitedLoc=tempDataArray;
            var temporary=match(allLocations[m],splitedLoc)
            /*if(allLocations[m][0]=='Novi Beograd')
            {
            //console.log(temporary);
            }*/
            if(temporary>maximumMatchings)
            {
                maximumMatchings=temporary;
                finalDataObject=allLocations[m];
            }
        
        }
        //console.log(maximumMatchings)
        Advert.lokacija=finalDataObject;
        return finalDataObject;// NE MORA;
    

    //console.log(tempDataArray);
    //handleLocationError(finalDataObject);
}

function match(locationA,locationB)
{
    //console.log(locationB);
    
    if(locationA.length>locationB.length)
    {
        bigger=clone(locationA);
        smaller=locationB;
    }
    else
    {
        bigger=clone(locationB);
        smaller=locationA;
    }
    var matched=0;
                    /*if(locationA[0]=='Blok 4')
                    {
                        console.log(locationA,locationB);

                        //console.log(locationB)
                    }*/
    for(var i in smaller)
    {
        var hadFoundThisSublocation=0;
        var indexOfMatched=0;
        var indexInsideStringOfMatched=-1;
        var maxAnswer=0;
        for(var j in bigger)//here "bigger"means bigger array of sublocations, but down it means string length of one single sublocation
        {
            var greaterStringLength,smallerStringLength;
            if(smaller[i].length>bigger[j].length)
            {
                greaterStringLength=smaller[i];
                smallerStringLength=bigger[j];
            }
            else
            {
                greaterStringLength=bigger[j];
                smallerStringLength=smaller[i];
            }
            var position=isSubstring(greaterStringLength.toLowerCase(), smallerStringLength.toLowerCase());
            var answer=smallerStringLength.length/greaterStringLength.length;

            if((bigger[j].length)&&(position!=-1))
            {
                
                
                /*if(locationA[0]=='Djeram')
                {
                        console.log(locationA);
                        console.log(locationB)
                        console.log(smaller[i]+'---'+bigger[j]+'---'+answer);
                        //console.log(locationB)
            }*/
                
                if(!hadFoundThisSublocation)
                {
                    matched+=answer;
                    maxAnswer=answer;
                    indexOfMatched=j;
                    indexInsideStringOfMatched=answer;
                }
                else
                {
                    
                    if(answer>maxAnswer)
                    {
                        indexOfMatched=j;
                        indexInsideStringOfMatched=answer;
                        matched-=maxAnswer;
                        matched+=answer;
                        maxAnswer=answer;
                    }
                    
                }
                hadFoundThisSublocation=1;
            }
        }
        if(indexOfMatched)
        {
            if(bigger[indexOfMatched].length>smaller[i].length)//smaller se sadrzi u bigger
            {
                bigger[indexOfMatched]=bigger[indexOfMatched].substr(indexInsideStringOfMatched,smaller[i].length);
            }
            else
            {
                bigger[indexOfMatched]='';
            }
        }

    }
    return matched;
}

/*function start()//testing only
{
    var obj=
    {
        "lokacija":"Đeram pijaca,11000 Beograd,Srbija",
        "lokacijaOptions":{"format":"$ulica;,$oblast;,$grad;,$drzava;", charsToDelete:"-/()"}
    }
    console.log(processLocationOfAdvert(obj));
}*/
function isSubstring(bigger,smaller)
{
    var index=bigger.indexOf(smaller)
    return index;
}

function handleLocationError(location)
{
    console.log('This Location couldnt be classified:');
    console.log(location);
    fs.appendFile('locationErrors.txt',location.drzava+','+location.grad+','+location.oblast+','+location.ulica,function(err)
    {
       if(err)console.log(err); 
    })
}


function findNextPositionOfChar(string,char,currentPos)
{
    for(var i=currentPos+1;i<string.length;i++)
    {
        if(string[i]==char)return i;
    }
    return -2;
}
function deleteCharsFromString(string,chars)
{
    var finalString='';
    for(var i=0;i<string.length;i++)
    {
        var exists=0;
        for(var w=0;w<chars.length;w++)
        {
            if(string[i]==chars[w])
            {
                exists=1;
                break;
            }
        }
        if(exists==0)
        {
            finalString+=string[i];
        } 
    }
    return finalString;
}
function locateAllCharsInString(string,char)
{
    var arrayOfOccurrences=[];
    for(var i=0;i<string.length;i++)
    {
        if(string[i]==char)
        {
            arrayOfOccurrences.push(i);
        }
    }
    return arrayOfOccurrences;
    
}
module.exports={processLocationOfAdvert};