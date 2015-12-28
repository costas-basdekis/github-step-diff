"use strict";

class Router {
    constructor (routes) {
        this.routes = routes;
    }
    static routeToButtonHash (hash) {
        var button;

        button = $(hash);
        if (button.length) {
            button.click();
            return;
        }

        button = $(`[href='${hash}']`)
        if (button.length) {
            button.click();
            return;
        }
    }
    routeTo (hash) {
        hash = hash || window.location.hash;

        for (var route of this.routes) {
            var match = route.pattern.exec(hash);
            if (match) {
                route.method(hash, match);
                return true;
            }
        }

        return false;
    }
}
