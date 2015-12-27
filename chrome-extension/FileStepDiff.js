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
                oldLineNumber: line.oldLineNumber,
                newLineNumber: line.newLineNumber,
                originalType: line.type,
                previousType: "unchanged",
                currentType: line.type,
                codeHtml: line.codeHtml,
            }));
        this.lines
            .forEach(function (line) {
                Object.assign(line, {
                    compoundType: `${line.originalType}-then-${line.currentType}`,
                });
            })
        this._fromLines();
    }
    _fromLines () {
        this.linesByOriginalLineNumber = listToMultiDict(this.lines, line => line.originalLineNumber);
        this.linesByPreviousLineNumber = listToMultiDict(this.lines, line => line.previousLineNumber);
        this.linesByOldLineNumber = listToMultiDict(this.lines, line => line.oldLineNumber);
        this.linesByNewLineNumber = listToMultiDict(this.lines, line => line.newLineNumber);
    }
    copy () {
        return new FileStepDiff(this.file);
    }
    convertToPrevious () {
        this.lines
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
        this.lines = previousStepDiff.lines;
        this._fromLines();
    }
}
