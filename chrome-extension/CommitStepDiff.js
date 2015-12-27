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
		for (var previousFile of previousStepDiff.filesList) {
			var file = this.byFilename(previousFile.filename);
			if (file) {
				file.combine(previousFile);
			} else {
				file = previousFile.copyAsPrevious();
				this.filesList.push(file);
			}
		}
	}
}
