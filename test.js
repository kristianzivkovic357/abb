var async=require('async')
var a=[1,2,3];
var br=0;
async.eachSeries(a,function(elem,call)
{
    br++;
    call('error');
},function(err)
{
    if(err)console.log(err);
    console.log(br)
})