# Racer Doge

## About
Web / Chrome / Firefox racing game, featuring a Doge! Wow.

## Project Structure
This project is organized to make use of the Cordova command line tools (version 3.1).
* `www`					- common web assets
* `merges/android`		- Android specific web assets to override those in `www`
* `merges/wp8`			- Windows Phone 8 specific web assets to override those in `www`
* `platforms/android`	- Android specific files
* `platforms/wp8`		- Windows Phone 8 specific files
* `webapp`				- files for hosted web app (Chrome, Firefox OS)
* `webapp/chrome`		- metadata files for the Chrome hosted web app, including the manifest and icons

## Building and Running
To upload it to Amazon s3 bucket
`webapp/packageAndMerge.sh`		- copy relevant files into `webapp/www` directory
`webapp/syncWebApp.sh`			- upload files into Amazon s3 bucket, using aws command line tools

## Prerequisite for running syncWebApp.sh
Installing Amazon AWS command line tools. On Ubuntu Linux:
`$ sudo apt-get -y install python-pip`
`$ pip install --upgrade --user awscli`
`$ aws configure`				- enter AWS Access Key ID and/or AWS Secret Access Key 

## Author
Drake Emko - drakee (a) gmail.com
* [@DrakeEmko](https://twitter.com/DrakeEmko)
* [Wolfgirl Band](http://wolfgirl.bandcamp.com/)
