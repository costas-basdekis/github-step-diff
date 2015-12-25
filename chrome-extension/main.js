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
						${url}
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

init();
