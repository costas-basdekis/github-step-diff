"use strict";

console.log("github-step-diff loaded");

function init() {
	var commitsUrls = getCommitUrls();
	addStepDiffTab(commitsUrls);

	console.log("github-step-diff is ready");
}

function addStepDiffTab(commitsUrls) {
	var $stepDiffTabNav = createStepDiffTabNav();
	var $prTabNav = $(".tabnav-pr");
	$prTabNav
		.before($stepDiffTabNav);

	var $prBody = $stepDiffTabNav.nextAll();
	var $stepDiffTabContent = createStepDiffTabContent($prBody, commitsUrls 	);

	$stepDiffTabNav
		.after($stepDiffTabContent);

	bindNavTabs();
	bindStepDiffsCommits();
}

function createStepDiffTabNav() {
	var pathNamePartsList = document.location.pathname.split('/');
	var pathNameParts = {
		organisation: pathNamePartsList[1],
		project: pathNamePartsList[2],
		pr: pathNamePartsList[4],
	};
	var tabUrl = `/${pathNameParts.organisation}/${pathNameParts.project}/pull/${pathNameParts.pr}/step-diff`;
	var $newTabNav = $(`
		<div class="tabnav tabnav-step-diff" data-tab-group="step-diff">
			<div class="tabnav-tabs">
				<a
						href="#"
						class="tabnav-tab selected js-tabnav-tab js-step-pr"
						data-tab-group="step-diff"
						data-tab="step-pr"
					>
					Pull request
				</a>
				<a
						href="#"
						class="tabnav-tab js-tabnav-tab js-step-diff"
						data-tab-group="step-diff"
						data-tab="step-diff"
					>
					Step diff
				</a>
			</div>
		</div>
	`);

	return $newTabNav;
}

function createStepDiffTabContent ($prBody, commitsUrls) {
	var $prTabContent = $(`
		<div
				class="tabcontent pr-tab-content is-visible js-tab-content"
				data-tab-group="step-diff"
				data-tab="step-pr"
			>
		</div>
	`);
	$prTabContent.append($prBody);

	var $stepDiffTabContent = $(`
		<div
				class="tabcontent step-diff-tab-content js-tab-content"
				data-tab-group="step-diff"
				data-tab="step-diff"
			>
			<ul>
				${forIn(commitsUrls, url => `
					<li>
						<a
								href="#"
								class="js-step-diff-commit"
								data-url="${url}"
							>
							${url}
						</a>
					</li>
				`)}
			</ul>
		</div>
	`);

	return $()
		.add($prTabContent)
		.add($stepDiffTabContent);
}

function forIn(list, lambda) {
	return list
		.map(lambda)
		.join('\n');
}

function bindNavTabs () {
	$(".js-tabnav-tab").click(function () {
		var $tab = $(this);
		var tabGroup = $tab.attr("data-tab-group");
		var tabName = $tab.attr("data-tab");
		selectTabNav(tabGroup, tabName)
	});
}

function bindStepDiffsCommits () {
	$(".js-step-diff-commit").click(function () {
		var $e = $(this);
		var commitUrl = $e.attr("data-url");
		var commitInfo = getCommitInfo(commitUrl);
		$e.after($(`
			<div>
				<img
						alt="@${commitInfo.authorName}"
						class="avatar"
						height="24"
						src="${commitInfo.authorAvatarUrl}"
						width="24"
					>
				<a href="commitInfo.url">${commitInfo.hash.substring(0, 7)}</a>
				<strong>${commitInfo.title}</strong>
				(${commitInfo.filesList.length} files)
			</div>
		`));
		$e.remove();
	});
}

function selectTabNav (tabGroup, tabName) {
	var $tabContents = $(`.js-tab-content[data-tab-group="${tabGroup}"]`);
	$tabContents
		.removeClass("is-visible");
	var $thisTabContent = $tabContents
		.filter(`[data-tab="${tabName}"]`);
	$thisTabContent
		.addClass("is-visible");

	var $tabs = $(`.js-tabnav-tab[data-tab-group="${tabGroup}"]`);
	$tabs
		.removeClass("selected");
	var $thisTab = $tabs
		.filter(`[data-tab="${tabName}"]`);
	$thisTab
		.addClass("selected");
}

function getCommitUrls() {
    return jQuery(".timeline-commits .commit .commit-id")
	    .toArray()
	    .map(function (e) {
	        return 'https://' + window.location.hostname + $(e).attr("href");
	    });
}

function httpGet(url) {
	var httpRequest = new XMLHttpRequest();
	httpRequest.open("GET", url, false);
	httpRequest.send();
	return httpRequest.responseText;
}

function getCommitInfo (commitUrl) {
	var urlParts = splitCommitUrl(commitUrl);
	var commitHtml = httpGet(commitUrl);
	var $commitPage = $(commitHtml);

	var $$ = $commitPage.find.bind($commitPage);

	var filesDiffLines = $$(".diff-view .file.js-details-container")
		.toArray()
		.map(getFileDiffLines);

	return {
		url: commitUrl,
		hash: $$(".commit .sha").text(),
		title: $$(".commit .commit-title").text(),
		authorName: $$(".commit .commit-author-section .user-mention").text(),
		authorAvatarUrl: $$(".commit .commit-author-section .avatar").attr("src"),
		files: listToDict(filesDiffLines, diffLines => diffLines.filename),
		filesList: filesDiffLines,
	};
}

function listToDict (list, keyFunction) {
	var dict = {};

	for (var item of list) {
		var key = keyFunction(item);
		dict[key] = item;
	}

	return dict;
}

function getFileDiffLines (file) {
	var $file = $(file);
	var filename = $file
		.find(".file-header")
		.attr("data-path");
	var $diffLines = $file
		.find(".diff-table > tbody > tr:not(.js-expandable-line)");
	var diffLines = $diffLines
		.toArray()
		.map(getDiffLineInfo);
	fillDiffLineInfosOriginalLineNumber(diffLines);

	return {
		filename: filename,
		diffLines: diffLines,
	};
}

function getDiffLineInfo (e) {
	var $e = $(e);
	var $tds = $e.children();

	return {
		originalLineNumber: $($tds[0]).attr("data-line-number"),
		newLineNumber: $($tds[1]).attr("data-line-number"),
		type: getDiffLineType($($tds[2])),
	};
}

function getDiffLineType ($e) {
	if ($e.hasClass('blob-code-addition')) {
		return 'addition';
	} else if ($e.hasClass('blob-code-deletion')) {
		return 'deletion';
	} else {
		return 'unchanged';
	}
}

function fillDiffLineInfosOriginalLineNumber (diffLines) {
	var previousOriginalLineNumber = 0;
	for (var diffLine of diffLines) {
		if (diffLine.originalLineNumber === undefined) {
			diffLine.originalLineNumber = previousOriginalLineNumber;
		} else {
			previousOriginalLineNumber = diffLine.originalLineNumber;
		}
	}
}

function splitCommitUrl (url) {
	var partsList = url.split('/');
	return {
		protocol: partsList[0], // https:
		// partsList[1], //
		host: partsList[2],	// github.com
		organisation: partsList[3],
		project: partsList[4],
		// partsList[5], // commit
		hash: partsList[6],
	};
}

init();
