"use strict";

class FileStepDiff {
    constructor (file) {
        this.file = file;
        this.previousStepDiff = null;
        this.create();
    }
    create () {
        this._loadFromFile();
    }
    _loadFromFile () {
        this.lines = this.file.diffLines
            .map(line => ({
                originalLineNumber: line.oldLineNumber,
                oldLineNumber: line.oldLineNumber,
                newLineNumber: line.newLineNumber,
                originalType: line.type,
                previousType: "unchanged",
                currentType: line.type,
                codeHtml: line.codeHtml,
            }));
        this._setCompoundType();
        this._createLookupsFromLines();
    }
    _setCompoundType () {
        this.lines
            .forEach(function (line) {
                Object.assign(line, {
                    compoundType: `${line.originalType}-then-${line.currentType}`,
                });
            })
    }
    _createLookupsFromLines () {
        this.linesByOriginalLineNumber = listToMultiDict(this.lines, line => line.originalLineNumber);
        this.linesByOldLineNumber = listToMultiDict(this.lines, line => line.oldLineNumber);
        this.linesByNewLineNumber = listToMultiDict(this.lines, line => line.newLineNumber);
    }
    _createLinesFromLookupByOldLineNumber () {
        var linesLists = dictValues(this.linesByOldLineNumber);
        this.lines = [].concat.apply([], linesLists);
        this.lines.sort(FileStepDiff.compareLines);
    }
    static compareLines (lhs, rhs) {
        var lOriginal = parseInt(lhs.originalLineNumber), rOriginal = parseInt(rhs.originalLineNumber);
        var lOld = parseInt(lhs.oldLineNumber) || 0, rOld = parseInt(rhs.oldLineNumber) || 0;
        var lNew = parseInt(lhs.newLineNumber) || 0, rNew = parseInt(rhs.newLineNumber) || 0;
        return compareLists([lOriginal, lOld, lNew], [rOriginal, rOld, rNew]);
    }
    byNewLineNumber (lineNumber) {
        return this.linesByNewLineNumber[lineNumber];
    }
    copy () {
        return new FileStepDiff(this.file);
    }
    convertToPrevious () {
        this.lines
            .forEach(function (line) {
                Object.assign(line, {
                    oldLineNumber: line.newLineNumber,
                    previousType: line.currentType,
                    currentType: "unchanged",
                    compoundType: `${line.currentType}-then-unchanged`,
                });
            });
        this._createLookupsFromLines();
    }
    copyAsPrevious () {
        var copy = this.copy();
        copy.convertToPrevious();

        return copy;
    }
    combine (newFileDiff) {
        for (var currentLine of newFileDiff.lines) {
            var currentLineNumber = currentLine.oldLineNumber;
            var previousLines = this.byNewLineNumber(currentLineNumber);
            if (!previousLines) {
                this.linesByOldLineNumber[currentLineNumber] =
                    [Object.assign({}, currentLine, {
                        oldLineNumber: currentLineNumber,
                        newLineNumber: currentLineNumber,
                    })];
                continue;
            }

            // There should only be one
            var previousLine = previousLines[0];
            if (currentLine.currentType === "deletion") {
                this.linesByOldLineNumber[currentLineNumber] =
                    [Object.assign({}, currentLine, {
                        originalLineNumber: previousLine.originalLineNumber,
                        originalType: previousLine.currentType,
                    })];
            } else if (currentLine.currentType === "unchanged") {
                if (!(currentLineNumber in this.linesByOldLineNumber)) {
                    this.linesByOldLineNumber[currentLineNumber] =
                    [Object.assign({}, currentLine, {
                        originalLineNumber: 0,
                    })];
                }
            } else {
                var lines = this.linesByOldLineNumber[currentLineNumber] =
                    this.linesByOldLineNumber[currentLineNumber] || [];
                lines.push(Object.assign({}, currentLine, {
                    originalLineNumber: previousLine.originalLineNumber,
                }));
            }
        }
        this._createLinesFromLookupByOldLineNumber();
        this._createLookupsFromLines();
    }
}
