const proj_dir = require('path').join(__dirname, '../../'); //get the project dir file path
const fs = require('fs'); //file stream
const latex = require('node-latex'); //node-latex middleware

// This function first generates a .csv file containing all award data
// then it uses the node-latex middleware to generate a pdf version of the award certificate from the .tex latex file
function generateAward(awardInfo){

    // sample data - TO DELETE
    awardInfo.awardId = 1;
    awardInfo.to_name = "Rickey Patel";
    awardInfo.to_title = "Employee"
    awardInfo.from_name = "Bob Hope";
    awardInfo.from_title = "Manager";
    awardInfo.awardType = "Employee of The Month";
    awardInfo.createdDate = "May-05-2019";
    awardInfo.userSig = proj_dir + 'public/signatures/1556168671238test.png'

    awardInfo.userSig = awardInfo.userSig.replace(/\\/g,"/"); //we have to replace backslashes for it to work in the .tex template file

    var data_filepath = proj_dir + "config/awardConfig/awardData.csv"; //file path for award data .csv file

    // put together the date for the .csv file
    var data = "fromName,fromTitle,toName,toTitle,awardType,fromSig,createdDate\n"; // these are the headers 
    data += awardInfo.from_name + "," + awardInfo.from_title + "," + awardInfo.to_name + "," + awardInfo.to_title + "," + awardInfo.awardType + "," +
            awardInfo.userSig + "," + awardInfo.createdDate;

    // this function creates the .csv file with the award data
    // the callback function then uses the node-latex middleware to generate the pdf certificate from the data in the .csv file
    fs.writeFile(data_filepath, data, function(err){
        if(err) { console.log(err) };
        
        // this next block of code is taken from the node-latex middleware docs
        const input = fs.createReadStream(proj_dir +"config/awardConfig/awardTemplate.tex"); //uses are award template latex file
        const output = fs.createWriteStream(proj_dir + "awards/award_test.pdf");
        const pdf = latex(input);
    
        pdf.pipe(output)
        pdf.on('error', err => console.error(err))
        pdf.on('finish', () => {
            console.log('PDF generated!')
        })
    })
    
}

// here for testing
var awardInfo = {}
generateAward(awardInfo);