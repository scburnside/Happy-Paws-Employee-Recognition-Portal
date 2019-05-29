const proj_dir = require('path').join(__dirname, '../../'); //get the project dir file path
const fs = require('fs'); //file stream
const latex = require('node-latex'); //node-latex middleware

// This function first generates a .csv file containing all award data
// then it uses the node-latex middleware to generate a pdf version of the award certificate from the .tex latex file
function generateAward(awardInfo, cb){

    var data_filepath = proj_dir + "config/awardConfig/awardData.csv"; //file path for award data .csv file

    // put together the date for the .csv file
    var data = "fromName,fromTitle,toName,awardType,fromSig,createdDate\n"; // these are the headers 
    data += awardInfo.from_name + "," + awardInfo.from_title + "," + awardInfo.to_name + "," + awardInfo.awardType + "," +
            awardInfo.userSig + "," + awardInfo.createdDate;

    // this function creates the .csv file with the award data
    // the callback function then uses the node-latex middleware to generate the pdf certificate from the data in the .csv file
    fs.writeFile(data_filepath, data, function(err){
        if(err) { console.log(err) };
        
        // this next block of code is taken from the node-latex middleware docs
        const input = fs.createReadStream(proj_dir +"config/awardConfig/awardTemplate.tex"); //uses are award template latex file
        const output = fs.createWriteStream(proj_dir + "awards/" + awardInfo.awardId + "-" + awardInfo.to_lName + ".pdf");
        const pdf = latex(input);
    
        pdf.pipe(output)
        pdf.on('error', err => console.error(err))
        pdf.on('finish', () => {
            //console.log('PDF generated!');
            cb();
        })
    })
    
}

module.exports = generateAward;
// here for testing
// var awardInfo = {}
// generateAward(awardInfo);