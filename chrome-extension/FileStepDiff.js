"use strict";

class FileStepDiff {
    constructor (file) {
        this.file = file;
        this.previousStepDiff = null;
        this.create();
    }
    create () {
        this.lines = this.file.diffLines
            .map(line => ({
                originalLineNumber: undefined,
                previousLineNumber: line.oldLineNumber,
                currentLineNumber: line.newLineNumber,
                originalType: "unchanged",
                previousType: "unchanged",
                currentType: line.type,
                compoundType: `unchanged-then-${line.type}`,
                codeHtml: line.codeHtml,
            }));
    }
}
