function openLink(link) {
	// Android specific - open links using native browser
	navigator.app.loadUrl(link, { openExternal: true });
}

function trackPage(page) {
	if (typeof analytics !== "undefined") {
		analytics.trackView(page);
	}
}

function getPathMedia() {
    var path = window.location.pathname;
    var phoneGapPath = path.substring(0, path.lastIndexOf('/') + 1);
	return phoneGapPath;
};

var snd = {}; // each custom.js must define this
function doCustomActions() {
	if (typeof analytics !== "undefined") {
		alert('analytics:', analytics);
		analytics.startTrackerWithId('UA-52101670-2');
	}
	if (typeof snd !== 'undefined') { // using android device, so use Phonegap audio system
		snd['coin'] = new Media(getPathMedia() + 'snd/170147__timgormly__8-bit-coin.mp3');
		snd['bump'] = new Media(getPathMedia() + 'snd/170141__timgormly__8-bit-bump.mp3');
		snd['bumper'] = new Media(getPathMedia() + 'snd/170140__timgormly__8-bit-bumper.mp3');
		snd['explosion'] = new Media(getPathMedia() + 'snd/170144__timgormly__8-bit-explosion2.mp3');
		snd['powerup'] = new Media(getPathMedia() + 'snd/170169__timgormly__8-bit-powerup.mp3');
		snd['pickup'] = new Media(getPathMedia() + 'snd/170170__timgormly__8-bit-pickup.mp3');
	}
}

