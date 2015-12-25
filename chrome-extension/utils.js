"use strict";

function httpGet(url) {
	var httpRequest = new XMLHttpRequest();
	httpRequest.open("GET", url, false);
	httpRequest.send();
	return httpRequest.responseText;
}

function listToDict (list, keyFunction) {
	var dict = {};

	for (var item of list) {
		var key = keyFunction(item);
		dict[key] = item;
	}

	return dict;
}

function forIn(list, lambda) {
	return list
		.map(lambda)
		.join('\n');
}
