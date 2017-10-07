var nodemailer = require('nodemailer');
var fs=require('fs')
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'homehunterestates@gmail.com',
    pass: 'homehunterdevteam357'
  }
});


function sendMail(from,to,subject,html)
{
  var mailOptions = {}; 
  mailOptions.from=from;
  mailOptions.to=to;
  mailOptions.subject=subject;
  mailOptions.html=html;
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  }); 
}

var registerHtmlString;
fs.readFile('public/template.html',function(err,res)
{
  if(err)console.log(err);
  else registerHtmlString=res.toString();
  //console.log(registerHtmlString.toString())

sendMail('homehunterestates@gmail.com','filip.petroviccc@gmail.com','Uspesna Registracija!',registerHtmlString);
})
module.exports={sendMail}