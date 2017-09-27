var request= require('request');
var fs= require('fs');
function max(a,b)
{
    return a>b ?a:b
}

    request("https://api.4zida.rs/v3/places?withAds=true&limit=9999",function(err,resp,places)
    {
        places=JSON.parse(places);
        var parents=0;
        var parentObj;
        places=places.items;
        var globArr=[];
        for(var i in places)
        {
            var arrTemp=[];
            arrTemp.push(places[i].title);
            for(var j in places[i].allParentTitles)
            {
                arrTemp.push(places[i].allParentTitles[j]);
            }
            arrTemp.push('Srbija');
            globArr.push(arrTemp);
        }
        fs.writeFile('allLocShortAccent.json',JSON.stringify(globArr),function(err)
        {
            if(err)console.log(err);
        });
        //console.log(parentObj);
    })
