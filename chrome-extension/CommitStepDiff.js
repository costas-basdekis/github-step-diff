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
			var previousFileDiffAsPrevious = previousFileDiff.copyAsPrevious();

			var previousFile = previousFileDiff.file;
			var fileDiff = this.byFilename(previousFile.filename);
			if (fileDiff) {
				previousFileDiffAsPrevious.combine(fileDiff);
				var index = this.filesList.indexOf(fileDiff);
				this.filesList[index] = previousFileDiffAsPrevious;
			} else {
				this.filesList.push(previousFileDiffAsPrevious);
			}
		}
		this._fromFilesList();
	}
}
