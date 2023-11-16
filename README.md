# Language_TTRPG
Capstone Project for INFO8105

This application is known to run on Linux, MacOS, OpenBSD, and Windows.

It runs on JavaScript, node, Express, and EJS and uses SQLite for its database.
Make sure to run
```
npm install
```
```
node index
```
Then access the site at localhost:8000

You will also need SQLite installed. 
For MacOS:
```
brew install sqlite
```
For OpenBSD:
```
pkg_add sqlite
```
In Linux, check with your distro's package manager, but for Redhat/Fedora that would be:
```
dnf install sqlite
```

If you need to initialize the database run the initdb bash script. It will create some placeholder data with which you can verify everything is working correctly.
```
cd SQL
./initdb
```
You can also initialize specific tables using command-line flags. 
```
  -u for the Users table
  -g for the Groups table
  -r for the ratings table
  -R for the Rpg table
  -s for the Sessions table
  -i for all intermediary tables
  -a for all tables (the default)
```
You will need to run the script from the commandline with bash installed. In Linux and MacOS, bash is already installed. In OpenBSD, you will need to run 
```pkg_add bash```



You will also need to create a .env file in the root directory of the project. In there, you need to define two variables:
```
pass="your gmail password here"
url="the url for the application"
```
This will allow you to send password recovery emails. Without the above variables defined, you will get a warning message in the console.
