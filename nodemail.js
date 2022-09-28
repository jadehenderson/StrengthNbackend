const nodemailer = require('nodemailer');

// Create the transporter with the required email configuration 
let transporter = nodemailer.createTransport({
    service: '', 
    auth: {
        type: '',
        user: '',
        pass: ''
    }
});

// setup e-mail data
let mailOptions = {
    from: '', 
    to: '',
    subject: '',
    text: '',
    html: '' // hmtl version of email optional
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, success){
    if(error){
        console.log("Error: " + error);
    } else {
        console.log("Message sent successfully!");
    }
});
