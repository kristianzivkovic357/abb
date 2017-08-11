var conversionTable={};
function fillInitialAccentConversionTable()
{
    conversionTable['č'.charCodeAt(0)]='c';
    conversionTable['ć'.charCodeAt(0)]='c';
    conversionTable['ž'.charCodeAt(0)]='z';
    conversionTable['š'.charCodeAt(0)]='s';
    conversionTable['đ'.charCodeAt(0)]='dj';
}
/*Djeram ne radi*/
fillInitialAccentConversionTable();
console.log(conversionTable);
function removeAccentFromString(string)
{
    console.log(conversionTable['č'.charCodeAt(0)]);
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
console.log(removeAccentFromString('đeram'))