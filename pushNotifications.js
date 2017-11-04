var FCM = require('fcm-node');
var SERVER_KEY='AAAAed4tRFc:APA91bH7W2xHMOuka3kAiyluIhXbAAhgjO4TvfT8rJxRjYS3UDQqpnP24SdoNUy8oK5Einglk-mErCpXCRzgId4k-3CabxNQpaAnCo216_YmkEStBs5NdrsXPj7Jd7dYmkdkj9Gi8HEW';
var le='AAAAPwFS6QU:APA91bFdrfiFbwIhGezBWXMNuJHRmu4zucXHZXV7I2C6REx3RaveZ5suM7JoOEEp3qEa-LfLHajlwlHskmDoHSuLFwxdIgiOae3f_dWqt7S6U9gfg3WsE-g9qjrv2GSdbNWv-9qSt8h1'



var fcm = new FCM(SERVER_KEY);
var mongo=require('./mongo');
var users=[];
function sendNotification(user,alert)
{
    
    var currentDate=new Date();
    var timeDifference;
    //if(users[user.email])timeDifference=currentDate-users[user.email];
    //else timeDifference=currentDate;
    if(user && user.userId)
    {
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

        //console.log(message);
        fcm.send(message, function(err, response)
        {
            if(err) 
            {
                console.log(err);
                console.log("Something has gone wrong!");
            } 
            else 
            {
                //console.log("Successfully sent with response: ",response);
            }
        });
    }   
}
sendNotification({userId:'enGu8_530uU:APA91bFn4BG1vH8TDcd66f92I0Cl07xA1usjCs6hgWedB0YI24nzcUASMVJktQ12TQ4X2_91WSRszCUWTR8NHJkv7PzlEc-NSQZ1WBAmjrghDnghU_XOz-gx_Yzg4rrN4og5LoykN-tD'},{})
module.exports={sendNotification}
