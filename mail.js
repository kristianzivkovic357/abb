var nodemailer = require('nodemailer');

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
//sendMail('homehunterestates@gmail.com','kristiano9611@gmail.com','Uspesna Registracija!','<p>Uspeli ste da napravite svoj nalog za aplikaciju HomeHunter. Sada mozete da napravite alarme i da dobijate nove oglase po kriterijumima koje ste zadali cim se pojave bilo gde na internetu! Zar to nije sjajno? Molimo vas da potvrdite nalog klikom na link:</p> '+'<a href=\"173.249.1.30/confirmation/'+"obj.code"+'\">Confirm your account</a>');
module.exports={sendMail}