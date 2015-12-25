"use strict";

var commitParser = {
	getCommitInfo: function getCommitInfo (commitUrl) {
		var urlParts = this.splitCommitUrl(commitUrl);
		var commitHtml = httpGet(commitUrl);
		var $commitPage = $(commitHtml);

		var $$ = $commitPage.find.bind($commitPage);

		var filesDiffLines = $$(".diff-view .file.js-details-container")
			.toArray()
			.map(this.getFileDiffLines.bind(this));

		return {
			url: commitUrl,
			hash: $$(".commit .sha").text(),
			title: $$(".commit .commit-title").text(),
			authorName: $$(".commit .commit-author-section .user-mention").text(),
			authorAvatarUrl: $$(".commit .commit-author-section .avatar").attr("src"),
			files: listToDict(filesDiffLines, diffLines => diffLines.filename),
			filesList: filesDiffLines,
		};
	},
	getFileDiffLines: function getFileDiffLines (file) {
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
	},
	getDiffLineInfo: function getDiffLineInfo (e) {
		var $e = $(e);
		var $tds = $e.children();

		return {
			originalLineNumber: $($tds[0]).attr("data-line-number"),
			newLineNumber: $($tds[1]).attr("data-line-number"),
			type: this.getDiffLineType($($tds[2])),
		};
	},
	getDiffLineType: function getDiffLineType ($e) {
		if ($e.hasClass('blob-code-addition')) {
			return 'addition';
		} else if ($e.hasClass('blob-code-deletion')) {
			return 'deletion';
		} else {
			return 'unchanged';
		}
	},
	fillDiffLineInfosOriginalLineNumber: function fillDiffLineInfosOriginalLineNumber (diffLines) {
		var previousOriginalLineNumber = 0;
		for (var diffLine of diffLines) {
			if (diffLine.originalLineNumber === undefined) {
				diffLine.originalLineNumber = previousOriginalLineNumber;
			} else {
				previousOriginalLineNumber = diffLine.originalLineNumber;
			}
		}
	},
	splitCommitUrl: function splitCommitUrl (url) {
		var partsList = url.split('/');
		return {
			protocol: partsList[0], // https:
			// partsList[1], //
			host: partsList[2],	// github.com
			organisation: partsList[3],
			project: partsList[4],
			// partsList[5], // commit
			hash: partsList[6],
		};
	},
};
