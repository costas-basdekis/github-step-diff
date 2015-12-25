"use strict";

class UrlBased {
    constructor(documentOrUrl) {
        var url, _document;
        if (typeof documentOrUrl === typeof 'string') {
            this.url = documentOrUrl;
        } else {
            this.__document = documentOrUrl || window.document;
            this.url = window.location;
        }
    }

    getDocument () {
        if (this.__document) {
            return;
        }

        var html = httpGet(this.url);
        this.__document = $("<html>").html(html)[0];
    }
    get _document() {this.getDocument(); return this.__document;};

    getJqeuery() {
        if (this._$document) {
            return;
        }

        this._$document = $(this._document);
        this._$ = this._$document.find.bind(this._$document);
    }
    get $document() {this.getJqeuery(); return this._$document;};
    get $() {this.getJqeuery(); return this._$;};
}
