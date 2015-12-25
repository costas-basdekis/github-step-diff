"use strict";

class Commit extends UrlBased {
    constructor(documentOrUrl, info) {
        super(documentOrUrl);
        if (info) {
            this._title = info.title;
            this._authorName = info.authorName;
            this._authorAvatarUrl = info.authorAvatarUrl;
        }
    }
    splitCommitUrl () {
        if (this._hash) {
            return;
        }

        var partsList = this.url.split('/');

        this._protocol = partsList[0];
        //
        this._host = partsList[2]
        this._organisation = partsList[3]
        this._project = partsList[4]
        // commit
        this._hash = partsList[6]
    }
    get protocol() {this.splitCommitUrl(); return this._protocol;};
    get host() {this.splitCommitUrl(); return this._host;};
    get organisation() {this.splitCommitUrl(); return this._organisation;};
    get project() {this.splitCommitUrl(); return this._project;};
    get hash() {this.splitCommitUrl(); return this._hash;};

    getCommitInfo () {
        if (this._title) {
            return;
        }

        this._title = this.$(".commit .commit-title").text();
        this._authorName = this.$(".commit .commit-author-section .user-mention").text();
        this._authorAvatarUrl = this.$(".commit .commit-author-section .avatar").attr("src");
    }
    get title() {this.getCommitInfo(); return this._title;};
    get authorName() {this.getCommitInfo(); return this._authorName;};
    get authorAvatarUrl() {this.getCommitInfo(); return this._authorAvatarUrl;};

    getCommitFiles () {
        this.getCommitInfo();

        if (this._filesList) {
            return;
        }

        this._filesList = this.$(".diff-view .file.js-details-container")
            .toArray()
            .map(this.getFileDiffLines.bind(this));
        this._files = listToDict(this._filesList, diffLines => diffLines.filename);

        delete this.__document;
        delete this._$document;
        delete this._$;
    }
    get files() {this.getCommitFiles(); return this._files;};
    get filesList() {this.getCommitFiles(); return this._filesList;};

    getFileDiffLines (file) {
        var $file = $(file);
        var filename = $file
            .find(".file-header")
            .attr("data-path");
        var $diffLines = $file
            .find(".diff-table > tbody > tr:not(.js-expandable-line)");
        var diffLines = $diffLines
            .toArray()
            .map(this.getDiffLineInfo.bind(this));
        this.fillDiffLineInfosOriginalLineNumber(diffLines);

        return {
            filename: filename,
            diffLines: diffLines,
        };
    }
    getDiffLineInfo (e) {
        var $e = $(e);
        var $tds = $e.children();

        return {
            originalLineNumber: $($tds[0]).attr("data-line-number"),
            newLineNumber: $($tds[1]).attr("data-line-number"),
            type: this.getDiffLineType($($tds[2])),
        };
    }
    getDiffLineType ($e) {
        if ($e.hasClass('blob-code-addition')) {
            return 'addition';
        } else if ($e.hasClass('blob-code-deletion')) {
            return 'deletion';
        } else {
            return 'unchanged';
        }
    }
    fillDiffLineInfosOriginalLineNumber (diffLines) {
        var previousOriginalLineNumber = 0;
        for (var diffLine of diffLines) {
            if (diffLine.originalLineNumber === undefined) {
                diffLine.originalLineNumber = previousOriginalLineNumber;
            } else {
                previousOriginalLineNumber = diffLine.originalLineNumber;
            }
        }
    }
};
