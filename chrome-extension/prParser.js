"use strict";

var prParser = {
    getCommitUrls: function getCommitUrls() {
        return jQuery(".timeline-commits .commit .commit-id")
            .toArray()
            .map(function (e) {
                return 'https://' + window.location.hostname + $(e).attr("href");
            });
    },
};
