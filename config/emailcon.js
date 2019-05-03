const nodemailer = require('nodemailer');
const path = require('path').join(__dirname, '../');

function sendAward(awardInfo, cb){
    // set up the transporter 
    var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "happypawsizar",
            pass: "TeamIzar2019"
        }
    });

    // set up html body content for email
    var content_body = "<p>Dear " + awardInfo.to_name + ",</p>" +
        "<p>Congratualtions! You have been recognized by the Happy Paws Management Team! Please see attached for your award certificate.</p>" +
        "<p>Sincerely,</p>" +
        "The Happy Paws Management Team";

    // send the email
    transporter.sendMail({
        from: "happypawsizar",
        to: awardInfo.to_email,
        subject: "Congratulations! You have been awarded by " + awardInfo.from_name + "!",
        html: content_body
        // attachments: [
        //     {
        //         filename: 'test.png',
        //         path: "C:/Users/ricke_000/Desktop/CS 467/capstone_project/public/signatures/1556168671238test.png"
        //     }
        // ]
    }, function(err){
        if(err){ console.log(err); }
        cb(); //callback function
    });
}

module.exports = sendAward;

