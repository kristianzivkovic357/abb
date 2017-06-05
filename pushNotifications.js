var FCM = require('fcm-node');
var SERVER_KEY='AAAAPwFS6QU:APA91bFdrfiFbwIhGezBWXMNuJHRmu4zucXHZXV7I2C6REx3RaveZ5suM7JoOEEp3qEa-LfLHajlwlHskmDoHSuLFwxdIgiOae3f_dWqt7S6U9gfg3WsE-g9qjrv2GSdbNWv-9qSt8h1';
var fcm = new FCM(SERVER_KEY);

function sendNotification(deviceID,message)
{
    var message = 
    {
        to: deviceID,
        data: 
        {
            title: {"locKey": "push_app_title"},
            message: message
            // Constant with formatted params
            // message: {"locKey": "push_message_fox", "locData": ["fox", "dog"]});
        }
    };


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
    });
}
