"use strict";

window.bootstrap = (function initBootstrap() {
	function httpGet(url) {
		var httpRequest = new XMLHttpRequest();
		httpRequest.open("GET", url, false);
		httpRequest.send();
		return httpRequest.responseText;
	}
	function setElementText(element, text) {
		try {
			element.appendChild(document.createTextNode(text));
		} catch (e) {
			element.text = text;
		}
	}
	function createCodeElement(name, id, type, url) {
		var element = document.createElement(name);
		element.id = id;
		element.type = type;

		var code = httpGet(url);
		setElementText(element, code);

		document.head.appendChild(element);
	}
	function addScript(url, id) {
		createCodeElement('script', id, 'text/javascript', url);
	}
	function addCss(url, id) {
		createCodeElement('style', id, 'text/css', url);
	}

	function bootstrap(options) {
		if (!window.jQuery && ('jQuery' in options)) {
			var jQueryVersion = parseInt(options.jQueryVersion) || '2.1.4'
			var jQueryUrl = `https://ajax.googleapis.com/ajax/libs/jquery/${jQueryVersion}/jquery.min.js`;
			var jQueryId = "jqueryScript";
			addScript(jQueryUrl, jQueryId);
		}

		if (options.scriptUrls) {
			var index = 0;
			for (var scriptUrl of scriptUrls) {
				var scriptId = `script_${index}`;
				addScript(scriptUrl, scriptId);
			}
		}

		if (options.styleUrls) {
			var index = 0;
			for (var styleUrl of styleUrls) {
				var styleId = `style_${index}`;
				addCss(styleUrl, styleId);
			}
		}

		console.log("Bootstrapped!");
	}

	bootstrap.addScript = addScript;
	bootstrap.addCss = addCss;

	return bootstrap;
})();
