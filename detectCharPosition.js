
var fs=require("fs");

var charPosition=1374;
var ans='';
fs.readFile("q.txt",{encoding:"utf8"},function(err,data)
{
   
    for(var i=0;i<data.length;i++)
    {
        if(i>charPosition)
        {
            ans+=data[i];
        }
    }
    //console.log(ans);
})