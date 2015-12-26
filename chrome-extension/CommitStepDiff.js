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
		this.files = listToDict(this.filesList,
			fileStepDiff => fileStepDiff.file.filename);
	}
	byFilename (filename) {
		return this.files[filename];
	}
}
