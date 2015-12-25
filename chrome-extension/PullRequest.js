"use strict";

class PullRequest extends UrlBased {
    getCommitUrls() {
        if (this._commitUrls) {
            return;
        }

        this._commitUrls = this.$(".timeline-commits .commit .commit-id")
            .toArray()
            .map(function (e) {
                return 'https://' + window.location.hostname + $(e).attr("href");
            });

        delete this._document;
    }
    get commitUrls() {this.getCommitUrls(); return this._commitUrls;};

    getCommits() {
        if (this._commits) {
            return;
        }

        this._commits = this.commitUrls
            .map(url => new Commit(url));
        this._commitsByHash = listToDict(this._commits, commit => commit.hash);
    }
    get commits() {this.getCommits(); return this._commits;};
    get commitsByHash() {this.getCommits(); return this._commitsByHash;};

    byHash(hash) {
        return this.commitsByHash[hash];
    }
}
