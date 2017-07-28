var fixDate=function(date, setup)
{
    if(!setup)return date;
    /**
     * Our default time format in DB is m/d/y
     */
    var ourDate=['m','d','y'];
    var finalDate;
    if(setup.spliter)
    {
        finalDate=date.split(setup.spliter.splitString)[setup.spliter.index];
    }
    else finalDate=date;
    finalDate=finalDate.split(setup.deliminator);
    var format= setup.format.split('/');
    for(var i=0;i<3;i++)
        {
            fixPosition(finalDate,format,ourDate[i],i);
        }
        return new Date(finalDate.join('/'));
    
}
function fixPosition(date,format,simbol,index)//these are arrays
{
    for(var i=0;i<3;i++)
        {
            if(format[i]==simbol)
                {
                    var temp=date[i];
                    date[i]=date[index];
                    date[index]=temp;

                    temp=format[i];
                    format[i]=format[index];
                    format[index]=temp;
                }
        }
}
//console.log(f("25.7.2017",{"date":"class(publish-date).text()","deliminator":".","format":"d/m/y"}));
module.exports={fixDate};