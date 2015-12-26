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

function listToMultiDict (list, keyFunction) {
    var dict = {};

    for (var item in list) {
        var key = keyFunction(item);
        if (!(key in dict)) {
            dict[key] = [];
        }
        dict[key].push(item);
    }

    return dict;
}

function forIn(list, lambda) {
    return list
        .map(lambda)
        .join('\n');
}
