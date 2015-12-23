"use strict";

function getAllFilenames () {
	return $(".file-header")
		.toArray()
		.map(function (e) {
			return $(e).attr("data-path");
		});
}

function addThirdLineColumn (filename) {
	widenExpandableLines(filename);
	createLineNumbers(filename);
}

function addAllThirdLineColumn () {
	var filenames = getAllFilenames();
	filenames.map(addThirdLineColumn);
}

function getFile$Blob (filename) {
	return 	$(`
		.file-header[data-path="${filename}"]
		+ div.data.highlight
	`);
}

function getFile$ExpandableLines (filename) {
	return getFile$Blob(filename).find(`
		tr.js-expandable-line
	`);
}

function getFile$CodeLines (filename) {
	return getFile$Blob(filename).find(`
		tr:not(.js-expandable-line)
	`);
}

function widenExpandableLines (filename) {
	getFile$ExpandableLines(filename).find(`
		[colspan=2]
	`).attr('colspan',3);
}

function lineTypeFrom$Element ($element, type) {
	if ($element.hasClass(`blob-${type}-addition`)) {
		return 'addition';
	} else if ($element.hasClass(`blob-${type}-deletion`)) {
		return 'deletion';
	} else {
		return 'unchanged';
	}
}

function lineTypeFrom$NumElement ($element) {
	return lineTypeFrom$Element($element, "num");
}

function lineTypeFrom$CodeElement ($element) {
	return lineTypeFrom$Element($element, "code");
}

function lineTypeTo$Element(lineType, $element, type) {
	if (lineType === 'addition') {
		$element
			.addClass(`blob-${type}-addition`)
			.removeClass(`blob-${type}-deletion`);
	} else if (lineType === 'deletion') {
		$element
			.removeClass(`blob-${type}-addition`)
			.addClass(`blob-${type}-deletion`);
	}
}

function lineTypeTo$NumElement (lineType, $element) {
	return lineTypeTo$Element(lineType, $element, "num");
}

function lineTypeTo$CodeElement (lineType, $element) {
	return lineTypeTo$Element(lineType, $element, "code");
}

function copyLineType ($from, $to) {
	var lineType = lineTypeFrom$NumElement($from);
	lineTypeTo$NumElement(lineType, $to);
}

function createLineNumbers (filename) {
	getFile$CodeLines(filename).find(`
		> td:nth-child(2)
	`).each(function (i,e){
		var $e = $(e);
		var $newColumn = $('<td>')
			.attr("data-line-number", $e.attr("data-line-number"))
			.addClass("blob-num blob-num-context js-linkable-line-number")
			.addClass("js-future-line-number");
		$e.after($newColumn);
	});
}

function getDiffLines (filename) {
	var lastOriginalLineNumber = 0;
	return getFile$CodeLines(filename)
		.toArray()
		.map(function (e) {
			var $e = $(e);
			var rawOriginalLineNumber = $e
				.children("td.blob-num:nth-child(1)")
				.attr("data-line-number");
			var newLineNumber = $e
				.children("td.blob-num:nth-child(2)")
				.attr("data-line-number");
			var originalLineNumber = rawOriginalLineNumber || lastOriginalLineNumber;
			lastOriginalLineNumber = originalLineNumber;
			var lineType;
			if (rawOriginalLineNumber && newLineNumber) {
				lineType = "unchanged";
			} else if (rawOriginalLineNumber) {
				lineType = "deletion";
			} else if (newLineNumber) {
				lineType = "addition";
			}
			var codeHTML = $e
				.children("td.blob-code")
				.html();
			return {
				originalLineNumber: originalLineNumber,
				newLineNumber: newLineNumber,
				lineType: lineType,
				codeHTML: codeHTML,
			};
		});
}

function getAllDiffLines () {
	var filenames = getAllFilenames();

	var allDiffLines = {};
	for (var filename of filenames) {
		allDiffLines[filename] = getDiffLines(filename);
	}

	return allDiffLines;
}

function getLinesByNumber (lines, numberAttributeName) {
	var linesByNumber = {};
	var lineNumber = 0
	for (var line of lines) {
		lineNumber = line[numberAttributeName] || lineNumber;
		linesByNumber[lineNumber] = linesByNumber[lineNumber] || [];
		linesByNumber[lineNumber].push(line);
	}

	return linesByNumber;
}

function getLinesByOriginalNumber (lines) {
	return getLinesByNumber(lines, "originalLineNumber");
}

function getLinesByNewNumber (lines) {
	return getLinesByNumber(lines, "newLineNumber");
}

function getDiffSection (filename, getLinesByNumberFunction) {
	var lines = getDiffLines(filename);
	return getLinesByNumberFunction(lines);
}

function getDiffSectionByOriginal (filename) {
	return getDiffSection(filename, getLinesByOriginalNumber);
}

function getDiffSectionByNew (filename) {
	return getDiffSection(filename, getLinesByNewNumber);
}

function getAllDiffSections (getLinesByNumberFunction) {
	var allDiffLines = getAllDiffLines();
	var allDiffSections = {};
	for (var filename in allDiffLines) {
		var lines = allDiffLines[filename];
		allDiffSections[filename] = getLinesByNumberFunction(lines);
	}

	return allDiffSections;
}

function getAllDiffSectionsByOriginal () {
	return getAllDiffSections(getLinesByOriginalNumber);
}

function getAllDiffSectionsByNew () {
	return getAllDiffSections(getLinesByNewNumber);
}

function mergeLinesByNumber (currentByNewNumber, futureByOriginalNumber) {
	var mergedLinesByNewNumber = {};
	for(var newLineNumber in futureByOriginalNumber) {
		var futureLines = futureByOriginalNumber[newLineNumber];
		if (!(newLineNumber in currentByNewNumber)) {
			continue;
		}
		var currentLines = currentByNewNumber[newLineNumber];

		// There should be exactly one line in currentLines
		var currentLine = currentLines[0];

		mergedLinesByNewNumber[newLineNumber] = [];
		for (var futureLine of futureLines) {
			mergedLinesByNewNumber[newLineNumber].push({
				originalLineNumber: currentLine.originalLineNumber,
				newLineNumber: newLineNumber,
				futureLineNumber: futureLine.newLineNumber,
				currentLineType: currentLine.lineType,
				futureLineType: futureLine.lineType,
				codeHTML: futureLine.codeHTML,
			});
		}
	}

	return mergedLinesByNewNumber;
}

function displayMergedLinesByNumber (filename, mergedLinesByNewNumber) {
	var $codeLines = getFile$CodeLines(filename);
	for (var newLineNumber in mergedLinesByNewNumber) {
		var mergedLines = mergedLinesByNewNumber[newLineNumber];

		var $codeLine = $codeLines.find(`
			td:nth-child(2)[data-line-number=${newLineNumber}]
		`).parent();
		if (!$codeLine.length) {
			continue;
		}

		var firstMergedLine = mergedLines[0];
		firstMergedLine.$codeLine = $codeLine;

		var $lastCodeLine = $codeLine;
		for (var mergedLine of mergedLines) {
			// Ignore the first one
			if (mergedLine === firstMergedLine) {
				continue;
			}

			var $newCodeLine = $codeLine.clone();
			$lastCodeLine.after($newCodeLine);
			$lastCodeLine = $newCodeLine;

			mergedLine.$codeLine = $newCodeLine;
		}

		for (var mergedLine of mergedLines) {
			var $codeLine = mergedLine.$codeLine;

			$codeLine.addClass(
				`js-was-${mergedLine.currentLineType}`
			);
			$codeLine.addClass(
				`js-then-${mergedLine.futureLineType}`
			);
			$codeLine.addClass(
				`js-was-${mergedLine.currentLineType}-then-${mergedLine.futureLineType}`
			);

			var $futureLineNumber = $codeLine
				.find('td.js-future-line-number');
			lineTypeTo$NumElement(mergedLine.futureLineType, $futureLineNumber);
			$futureLineNumber
				.attr("data-line-number", mergedLine.futureLineNumber);

			var $newLineNumber = $futureLineNumber.prev();
			$newLineNumber
				.attr("data-line-number", mergedLine.originalLineNumber);

			var $code = $codeLine
				.find('td.blob-code');
			$code.html(mergedLine.codeHTML);
			lineTypeTo$CodeElement(mergedLine.futureLineType, $code);
		}
	}
}

function mergeAndDisplaySections (currentByNewNumber, futureByOriginalNumber, filename) {
	var mergedDiffLinesByNumber =
		mergeLinesByNumber(currentByNewNumber, futureByOriginalNumber);
	displayMergedLinesByNumber(filename, mergedDiffLinesByNumber);
}

function mergeAndDisplayAllSections (allFutureByOriginalNumber) {
	var filenames = getAllFilenames();
	for (var filename of filenames) {
		var currentByNewNumber = getDiffSectionByNew(filename);
		var futureByOriginalNumber = allFutureByOriginalNumber[filename];
		mergeAndDisplaySections(currentByNewNumber, futureByOriginalNumber, filename);
	}
}
