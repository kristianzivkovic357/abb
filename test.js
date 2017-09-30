var request=require('request')
var exec=require('child_process').exec;
exec('phantomjs --ssl-protocol=any --ignore-ssl-errors=true ./phantom.js '+'https://www.halooglasi.com/nekretnine/prodaja-zemljista?page=1',{maxBuffer:1024*10000},function(err,stdout,stderr)
{
    if((!stdout)||(stdout.length<=5000))
    {
        console.log('ne valja')
        console.log(stderr)
        /*if((countOfCalls % MAX_REQUEST_RETRY)==0)
            {
                console.log("***PHANTOMJS will delay for 60 seconds on: "+requestInfo.url+" because returned NO data***");
                setTimeout(function()
                {
                    regulatePhantomJSCall(requestInfo,countOfCalls+1);
                },1000*60);
                return;
            }
            else
            {
                console.log("Request returned INVALID webpage for "+countOfCalls+" times "+"on object:");
                console.log(JSON.stringify(requestInfo));
                console.log("Sending request again");
                regulatePhantomJSCall(requestInfo,countOfCalls+1);	
            }	*/
    }
    else
    {
        //balance--;
        //console.log("BALANCE:"+balance);
        console.log('vece od petiljada');
    }
})