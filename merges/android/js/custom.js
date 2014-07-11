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
	doCordovaCustomActions(); // in main.js
}

