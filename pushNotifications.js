var FCM = require('fcm-node');
var SERVER_KEY='AAAAed4tRFc:APA91bH7W2xHMOuka3kAiyluIhXbAAhgjO4TvfT8rJxRjYS3UDQqpnP24SdoNUy8oK5Einglk-mErCpXCRzgId4k-3CabxNQpaAnCo216_YmkEStBs5NdrsXPj7Jd7dYmkdkj9Gi8HEW';
var fcm = new FCM(SERVER_KEY);
var mongo=require('./mongo');
var users=[];
function sendNotification(user,alert)
{
    /*var currentDate=new Date();
    var timeDifference;
    if(users[user.email])timeDifference=currentDate-users[user.email];
    else timeDifference=currentDate;

    
    var message = 
    {
        to: user.userId,
        data: 
        {
            title: "Savrsena nekretnina za vas!",
            message: "Upravo se pojavila nova nekretnina koja odgovara vasim potrebama!",
            alertId:alert._id,
            alertName:alert.nazivAlerta
        }
    };

    console.log(message);
    fcm.send(message, function(err, response)
    {
        if(err) 
        {
            console.log(err);
            console.log("Something has gone wrong!");
        } 
        else 
        {
            console.log("Successfully sent with response: ",response);
        }
    });*/
}
module.exports={sendNotification}
