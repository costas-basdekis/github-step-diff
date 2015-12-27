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
                originalLineNumber: line.oldLineNumber,
                previousLineNumber: line.oldLineNumber,
                currentLineNumber: line.newLineNumber,
                originalType: "unchanged",
                previousType: "unchanged",
                currentType: line.type,
                compoundType: `unchanged-then-${line.type}`,
                codeHtml: line.codeHtml,
            }));
        this._fromLines();
    }
    _fromLines () {
        this.linesByOriginalLineNumber = listToMultiDict(this.lines, line => line.originalLineNumber);
        this.linesByPreviousLineNumber = listToMultiDict(this.lines, line => line.previousLineNumber);
        this.linesByCurrentLineNumber = listToMultiDict(this.lines, line => line.currentLineNumber);
    }
    copy () {
        return new FileStepDiff(this.file);
    }
    convertToPrevious () {
        this.lines = this.lines
            .forEach(function (line) {
                Object.assign(line, {
                    previousLineNumber: line.currentLineNumber,
                    previousType: line.currentType,
                    currentType: "unchanged",
                    compoundType: `${line.currentType}-then-unchanged`,
                });
            });
        this._fromLines();
    }
    copyAsPrevious () {
        var copy = this.copy();
        copy.convertToPrevious();

        return copy;
    }
    combine (previousStepDiff) {
    }
}
