"use strict";

console.log("github-step-diff loaded");

function init() {
    window.stepDiff = new StepDiff();

    console.log("github-step-diff is ready");

    window.stepDiff.routeTo();
}

init();
