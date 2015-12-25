"use strict";

console.log("github-step-diff loaded");

function init() {
	var commitsUrls = prParser.getCommitUrls();
	prUi.addStepDiffTab(commitsUrls);

	console.log("github-step-diff is ready");
}

init();
