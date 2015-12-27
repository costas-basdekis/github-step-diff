"use strict";

function httpGet(url, useCache) {
    if (!useCache && useCache !== undefined) {
        return httpGetUncached(url);
    }

    var cachedPages = JSON.parse(
        localStorage.getItem('cachedPages') || JSON.stringify({}));

    if (!(url in cachedPages)) {
        cachedPages[url] = httpGetUncached(url);
        localStorage.setItem('cachedPages', JSON.stringify(cachedPages));
    }

    return cachedPages[url];
}

function httpGetUncached(url) {
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

    for (var item of list) {
        var key = keyFunction(item);
        if (!(key in dict)) {
            dict[key] = [];
        }
        dict[key].push(item);
    }

    return dict;
}

function reverseDict (dict) {
    var reversed = {};

    for (var key in dict) {
        var value = dict[key];
        reversed[value] = key;
    }

    return reversed;
}

function dictKeys (dict) {
    var keys = [];

    for (var key in dict) {
        keys.push(key);
    }

    return keys;
}

function dictValues (dict, sortKeyFunction) {
    sortKeyFunction = sortKeyFunction || ((key, value) => key);
    var list = [];
    for (var key in dict) {
        var value = dict[key];
        var sortKey = key;
        if (sortKeyFunction) {
            sortKey = sortKeyFunction(key, value);
        }
        list.push([sortKey, value]);
    }
    list.sort(sortKeyValueTuple => sortKeyValueTuple[0]);
    var sorted = list.map(sortKeyValueTuple => sortKeyValueTuple[1]);
    return sorted;
}

function forIn(list, lambda) {
    return list
        .map(lambda)
        .join('\n');
}
