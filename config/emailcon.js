const nodemailer = require('nodemailer');
const proj_dir = require('path').join(__dirname, '../'); //get the project dir file path

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
        html: content_body,
        attachments: [
            {
                filename: awardInfo.to_lName + "-" + awardInfo.awardType + ".pdf",
                path: proj_dir + "awards/" + awardInfo.awardId + "-" + awardInfo.to_lName + ".pdf"
            }
        ]
    }, function(err){
        cb(err); //callback function
    });
}

module.exports = sendAward;

