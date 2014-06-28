function openLink(link) {
	// Android specific - open links using native browser
	navigator.app.loadUrl(link, { openExternal: true });
}

function trackPage(page) {
	if (typeof analytics !== "undefined") {
		analytics.trackView(page);
	}
}

function doCustomActions() {
	if (typeof analytics !== "undefined") {
		analytics.startTrackerWithId('UA-52101670-2');
	}
	//sndHit = new Media("snd/Hit.mp3");
	//alert(sndHit);
}

var getPathMedia = function () {
    var path = window.location.pathname;
    var phoneGapPath = path.substring(0, path.lastIndexOf('/') + 1);
	return phoneGapPath;
};

//alert(getPathMedia() + 'snd/Hit.mp3');
//sndHit = new Media(getPathMedia() + 'snd/Hit.mp3');
var usingDevice = true;
var snd = {hit: new Media('snd/Hit.mp3')};

