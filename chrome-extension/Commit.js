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
            .find(".diff-table > tbody > tr:not(.js-expandable-line):not([data-position=0])");
        var diffLines = $diffLines
            .toArray()
            .map(this.getDiffLineInfo.bind(this));
        this.fillDiffLineInfosOriginalOldLineNumber(diffLines);

        var $diffstat =$file
            .find(".file-header .diffstat")
            .attr("aria-label");
        var lineAdditions = 0, lineDeletions = 0;
        for (var text of $diffstat.split(' & ')) {
            if (text.search("addition") !== -1) {
                lineAdditions = parseInt(text);
            } else if (text.search("deletion") !== -1) {
                lineDeletions = parseInt(text);
            }
        }
        var lineChanges = lineAdditions + lineDeletions;

        return {
            filename: filename,
            diffLines: diffLines,
            lineAdditions: lineAdditions,
            lineDeletions: lineDeletions,
            lineChanges: lineChanges,
            blockDiffAddedCount: $file.find(".block-diff-added").length,
            blockDiffDeletedCount: $file.find(".block-diff-deleted").length,
            blockDiffNeutralCount: $file.find(".block-diff-neutral").length,
        };
    }
    getDiffLineInfo (e) {
        var $e = $(e);
        var $tds = $e.children();

        return {
            oldLineNumber: $($tds[0]).attr("data-line-number"),
            newLineNumber: $($tds[1]).attr("data-line-number"),
            type: this.getDiffLineType($($tds[2])),
            codeHtml: $($tds[2]).html(),
        };
    }
    getDiffLineType ($e) {
        for (var className in Commit.BLOB_NUM_TYPE) {
            var type = Commit.BLOB_NUM_TYPE[className];
            if ($e.hasClass(className)) {
                return type;
            }
        }
        return Commit.BLOB_NUM_TYPE[''];
    }
    fillDiffLineInfosOriginalOldLineNumber (diffLines) {
        var previousOldLineNumber = 0;
        for (var diffLine of diffLines) {
            if (diffLine.oldLineNumber === undefined) {
                diffLine.oldLineNumber = previousOldLineNumber;
            } else {
                previousOldLineNumber = diffLine.oldLineNumber;
            }
        }
    }
}
Commit.BLOB_NUM_TYPE = {
    'blob-code-addition': 'addition',
    'blob-code-deletion': 'deletion',
    '': 'unchanged',
};
Commit.PREVIOUS_BLOB_NUM_CLASSES = {
};
Commit.CURRENT_BLOB_NUM_CLASSES = {
};
Templates.default('BLOB_NUM_TYPE', Commit.BLOB_NUM_TYPE);
Templates.default('PREVIOUS_BLOB_NUM_CLASSES', Commit.PREVIOUS_BLOB_NUM_CLASSES);
Templates.default('CURRENT_BLOB_NUM_CLASSES', Commit.CURRENT_BLOB_NUM_CLASSES);
