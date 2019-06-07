# Happy Paws Dog Daycare
## Employee Recognition Portal

This solution is a demo of a web application for the employees of the Happy Paws Doggie Daycare.  The portal offers managers and employees an easy-to-use tool that they can use to award certificates of recognition to members of their team. 

User features include:
- Profile management with secure user sessions
- Secure password storage, password reset functionality, and input validation
- Custom generation of LaTeX certificates featuring one of five award types, the recipient’s name, date, as well as the name and signature of the user who authorized the award.
- Automatic email delivery of the certificate as a PDF to the recipient
- Capability to view and delete previously generated awards

Admin features include:
- Authenticated admin sessions, secure password storage, and password reset functionality.
- User account management: functionality to add, delete, and update a user
- Admin account management: functionality to add, delete, and update an admin
- Analytics & reporting feature with customized bar charts and pie graphs that allow admins to understand how users engage with the portal. 
- Advanced table displays with column sorting, pagination, search, and option to export data to a CSV file for download and sharing. 

**Please view [userguide.pdf](/UserGuide.pdf) for more detailed instructions, screenshots, and the db schema**

The live site can be viewed at http://138.68.48.136:3000/

## Software Systems, Tools, API, etc
Development Tools
- Node.js for backend runtime environment
- Express.js for web framework
Languages
- HTML/CSS for front-end page structure and styling
- Javascript for front and back-end scripting
- SQL for database management
Libraries
- Bootstrap 
- jQuery
APIs
- Google chart tool for Business Intelligence reporting operations

## Set-up for Your Local Machine
1. Ensure if you have node js installed on your computer
		- You can verify by typing "node -v" in the terminal
2. Once you have verified and cloned the repo into a local directory, open the terminal from that directory.
3. Then type in 'npm install'
		- This will install all the dependencies from the package.json file
4. Run the code by typing: "node app.js"
		- You should see a message saying server has started at localhost:3000
4. Go into your browser and type in: 'localhost:3000' as the url to load the app

## Authors
- Samantha Burnside
- Rickey Patel
- Mark C Moore
