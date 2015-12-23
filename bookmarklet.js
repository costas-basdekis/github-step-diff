(function () {
	function makeRepoFileFunction(repoUrl) {
		function repoFile(fileSubUrl) {
			return repoUrl + "/" + fileSubUrl;
		}

		return repoFile;
	}
	var gsdFile = makeRepoFileFunction("https://raw.githubusercontent.com/costas-basdekis/github-step-diff/");
	eval(
		function httpGet(url) {
			var httpRequest = new XMLHttpRequest();
			httpRequest.open("GET", url, false);
			httpRequest.send();
			return httpRequest.responseText;
		} (gsdFile("bootstrap.js"))
	);
	bootstrap({
		jQuery: true,
		scriptUrls: [
			gsdFile("main.js"),
		],
		styleUrls: [
			gsdFile("main.css"),
		],
	});
})();
