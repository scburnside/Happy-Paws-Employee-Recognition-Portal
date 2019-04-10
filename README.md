# Quick Start Guide

Install Git if you don't have it already 

Quick Git Guide: http://rogerdudler.github.io/git-guide/

Making a Local Clone
	1. Create a directory of your desired name on your local comp
	2. From inside the created directory open the Git Bash Terminal by right clicking and then selecting "Git Bash Here"
	3. In the terminal, type: "git clone 'https://gitlab.com/team-izar/happy-paws-erp.git'"
	4. The repo should be copied onto your local

Set up Remote
	1. Type command: "git remote -v"
	2. Ensure the origin is set to the url to our project in GitLab
	3. If not:
		- type in "git remote add origin 'https://gitlab.com/team-izar/happy-paws-erp.git'"

Start Working On Code
	1. Type command: "git checkout -b [new-branch-name]"
		-This will create a new branch cloned from the branch your're currently in (master)
	2. Add your code/edits into this branch.
		-This helps keep the master branch untouched as you may unknowingly introduce bugs

Create a Merge Request to Master Branch
	1. After you are done making your edits, commit them and then push them to the remote(GitLab) repo by typing: "git push origin <BRANCHNAME>"
	2. Then go to the GitLab and navigate to the project and click on "Merge Request"
	3. Then follow the instruction to submit the merge request

How to Run Starter Code
	1. Ensure if you have node js installed on your computer
		- you can verify by typing "node -v" in the terminal
	2. Once you have verified and cloned the repo into a local directory, open the terminal from that directory.
	3. Then type in 'npm install'
		- This will install all the dependencies from the package.json file
	4. Run the code by typing: "node app.js"
		- You should see a message saying server has started at localhost:3000
	4. Go into your browser and type in: 'localhost:3000' as the url to load the app

Notes:
	-keep your local repo up to date with the remote repo by typing: "git pull <REMOTENAME> <BRANCHNAME>"
	-do not push the node modules directory into the remote repo. This file is too big. You can add it into the .gitignore file


