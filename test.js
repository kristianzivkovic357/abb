var async=require('async');
var a=['a','b','c']
var checker=0;
async.eachSeries(a,function(letter,callback)
{

        if(letter=='b'){callback('WRONG LETTER');}
        else
        {
            checker++;
            callback();
        }
    
   
    
    

},function(err)
{
    console.log(checker);
    console.log(err);
})