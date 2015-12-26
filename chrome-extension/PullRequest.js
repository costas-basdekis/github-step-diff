"use strict";

class PullRequest extends UrlBased {
    getCommits() {
        if (this._commits) {
            return;
        }

        this._commits = this.$(".timeline-commits .commit")
            .toArray()
            .map(function (e) {
                var $e = $(e);
                var url = `https://${window.location.hostname}${$e.find(".commit-id").attr("href")}`;
                return new Commit(url, {
                    url: url,
                    title: $e.find(".message").text(),
                    authorName: $e.find(".author").text(),
                    authorAvatarUrl: $e.find(".avatar").attr("src"),
                });
            });
        var previousCommit = null;
        for (var commit of this._commits) {
            commit.previousCommit = previousCommit;
            previousCommit = commit;
        }
        this._commitsByHash = listToDict(this._commits, commit => commit.hash);
    }
    get commits() {this.getCommits(); return this._commits;};
    get commitsByHash() {this.getCommits(); return this._commitsByHash;};

    byHash(hash) {
        return this.commitsByHash[hash];
    }
}
