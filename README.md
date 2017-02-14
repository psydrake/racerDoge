# Racer Doge

## About
Web / Chrome / Firefox racing game, featuring a Doge! Wow.

## Project Structure
This project is organized to make use of the Cordova command line tools (version 3.1).
* `www`					- common web assets
* `webapp`				- files for hosted web app (Chrome, Firefox OS)
* `webapp/chrome`		- metadata files for the Chrome hosted web app, including the manifest and icons

## Building and Running
To run the app locally:

* `$ cd webapp/`						- go to webapp directory under project root
* `$ webapp/packageAndMerge.sh`			- copy relevant files into `webapp/www` directory
* `$ python -m SimpleHTTPServer 8000`	- run local web server on port 8000 (this works on MacOS - if you don't have this, run any web server, on any port)
* On your web browser, enter `http://localhost:8000` in the address bar

To upload it to the racerDoge Amazon s3 bucket (NOTE: you won't have credentials for this; change `webapp/syncWebApp.sh` to point to your s3 bucket if you want):

* `$ cd webapp/`					- go to webapp directory under project root
* `$ webapp/packageAndMerge.sh`		- copy relevant files into `webapp/www` directory
* `$ webapp/syncWebApp.sh`			- upload files into Amazon s3 bucket, using aws command line tools

## Prerequisite for running syncWebApp.sh
Install Amazon AWS command line tools. On Ubuntu Linux:

* `$ sudo apt-get -y install python-pip`
* `$ pip install --upgrade --user awscli`
* `$ aws configure`				- enter AWS Access Key ID and/or AWS Secret Access Key 

## Author
Drake Emko - drakee (a) gmail.com
* [@DrakeEmko](https://twitter.com/DrakeEmko)
* [Wolfgirl Band](http://wolfgirl.bandcamp.com/)
