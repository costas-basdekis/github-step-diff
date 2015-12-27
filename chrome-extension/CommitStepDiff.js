"use strict";

class CommitStepDiff {
	constructor (commit) {
		this.commit = commit;
		this.previousStepDiff = null;
		this.create();
	}
	create () {
		this.filesList = this.commit.filesList
			.map(file => new FileStepDiff(file));
		this._fromFilesList();
	}
	_fromFilesList () {
		this.files = listToDict(this.filesList,
			fileStepDiff => fileStepDiff.file.filename);
	}
	byFilename (filename) {
		return this.files[filename];
	}
	combine (previousStepDiff) {
		for (var previousFileDiff of previousStepDiff.filesList) {
			var previousFile = previousFileDiff.file;
			var fileDiff = this.byFilename(previousFile.filename);
			if (fileDiff) {
				fileDiff.combine(previousFileDiff);
			} else {
				fileDiff = previousFileDiff.copyAsPrevious();
				this.filesList.push(fileDiff);
			}
		}
		this._fromFilesList();
	}
}
