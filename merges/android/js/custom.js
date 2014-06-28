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
		analytics.startTrackerWithId('UA-52101670-2');
	}
	snd['hit'] = new Media(getPathMedia() + 'snd/Hit.mp3');
}

var usingDevice = true; // using android device
