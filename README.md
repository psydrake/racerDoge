# Racer Doge

## NOTE: This game is very much a work in progress

## About
Web / mobile racing game, featuring a Doge! Wow.

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
I originally wrote this using Apache Cordova 2.9 solely for Android. I later reorganized it to use [Apache Cordova 3.1](http://cordova.apache.org/docs/en/3.1.0/) for multiple Operating Systems, and have been building and running the project using the [Cordova 3.1 CLI](http://cordova.apache.org/docs/en/3.1.0/guide_cli_index.md.html#The%20Command-line%20Interface).

If you don't have Cordova 3.1 installed, follow the [CLI instructions](http://cordova.apache.org/docs/en/3.1.0/guide_cli_index.md.html#The%20Command-line%20Interface). If you have an older version, you can [upgrade](http://cordova.apache.org/blog/releases/2013/10/02/cordova-31.html). If, by the time you read this, there is a newer version of Cordova, you can probably use that :).

I have had success running the project on my physical Android phone. On the command line, within the project directory:
* Android (plug your phone into your computer) - `cordova run android --verbose`

**UPDATE:** I updated cordova to version 3.5. Here are some issues that I've seen since then:
* For Android: If you run `cordova build android` and get the error: "platforms/android/ant-build/AndroidManifest.xml:2: error: Error: Float types not allowed (at 'versionCode' with value 'NaN').",
	run the `./setVersion.sh` script to overwrite the NaN value in that file.

## Author
Drake Emko - drakee (a) gmail.com
* [@DrakeEmko](https://twitter.com/DrakeEmko)
* [Wolfgirl Band](http://wolfgirl.bandcamp.com/)
