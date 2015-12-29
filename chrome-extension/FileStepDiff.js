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
                originalType: "unchanged",
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
        var lOriginal = lhs.originalLineNumber, rOriginal = rhs.originalLineNumber;
        var lOld = lhs.oldLineNumber, rOld = rhs.oldLineNumber;
        var lNew = lhs.newLineNumber, rNew = rhs.newLineNumber;
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
                    originalType: line.currentType,
                    currentType: "unchanged",
                });
            });
        this._setCompoundType();
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
                this._addNewLine(currentLineNumber, currentLine);
            } else {
                // There should only be one
                var previousLine = previousLines[0];
                this._combineLine(currentLineNumber, previousLine, currentLine);
            }
        }
        this._createLinesFromLookupByOldLineNumber();
        this._setCompoundType();
        this._createLookupsFromLines();
    }
    _addNewLine (currentLineNumber, currentLine) {
        this.linesByOldLineNumber[currentLineNumber] =
            [Object.assign({}, currentLine, {
                oldLineNumber: currentLineNumber,
                newLineNumber: currentLineNumber,
            })];
    }
    _combineLine (currentLineNumber, previousLine, currentLine) {
        if (currentLine.currentType === "deletion") {
            this._combineDeletion(currentLineNumber, previousLine, currentLine);
        } else if (currentLine.currentType === "unchanged") {
            this._combineUnchanged(currentLineNumber, previousLine, currentLine);
        } else {
            this._combineAddition(currentLineNumber, previousLine, currentLine);
        }
    }
    _combineDeletion (currentLineNumber, previousLine, currentLine) {
        this.linesByOldLineNumber[currentLineNumber] =
            [Object.assign({}, currentLine, {
                originalLineNumber: previousLine.originalLineNumber,
                originalType: previousLine.originalType,
            })];
    }
    _combineUnchanged (currentLineNumber, previousLine, currentLine) {
        if (currentLineNumber in this.linesByOldLineNumber) {
            return;
        }

        this.linesByOldLineNumber[currentLineNumber] =
            [Object.assign({}, currentLine, {
                originalLineNumber: 0,
            })];
    }
    _combineAddition (currentLineNumber, previousLine, currentLine) {
        var lines = this.linesByOldLineNumber[currentLineNumber] =
            this.linesByOldLineNumber[currentLineNumber] || [];
        lines.push(Object.assign({}, currentLine, {
            originalLineNumber: previousLine.originalLineNumber,
        }));
    }
}
