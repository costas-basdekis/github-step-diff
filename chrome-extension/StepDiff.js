"use strict";

class StepDiff {
    constructor(pullRequest) {
        this.pullRequest = pullRequest || new PullRequest();
        this.addStepDiffTab();
    }
    addStepDiffTab() {
        var $stepDiffTabNav = this.createStepDiffTabNav();
        var $prTabNav = $(".tabnav-pr");
        $prTabNav
            .before($stepDiffTabNav);

        var $prBody = $stepDiffTabNav.nextAll();
        var $stepDiffTabContent = this.createStepDiffTabContent($prBody);

        $stepDiffTabNav
            .after($stepDiffTabContent);

        this.bindNavTabs();
        this.bindStepDiffsCommits();
    }
    createStepDiffTabNav() {
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
                        <span class="counter">${this.pullRequest.commits.length}</span>
                    </a>
                </div>
            </div>
        `);

        return $newTabNav;
    }
    createStepDiffTabContent ($prBody) {
        var $prTabContent = $(`
            <div
                    class="tabcontent pr-tab-content is-visible js-tab-content"
                    data-tab-group="step-diff"
                    data-tab="step-pr"
                >
            </div>
        `);

        var $stepDiffTabContent = $(`
            <div
                    class="tabcontent step-diff-tab-content js-tab-content"
                    data-tab-group="step-diff"
                    data-tab="step-diff"
                >
                <ul>
                    ${forIn(this.pullRequest.commits, commit => `
                        <li>
                            <div>
                                <a
                                        href="#"
                                        class="btn btn-sm js-view-step-diff"
                                        data-hash="${commit.hash}"
                                    >View step diff</a>
                                <img
                                        alt="@${commit.authorName}"
                                        class="avatar"
                                        height="24"
                                        src="${commit.authorAvatarUrl}"
                                        width="24"
                                        data-hash="${commit.hash}"
                                    >
                                <a href="${commit.url}">${commit.hash.substring(0, 7)}</a>
                                <strong>${commit.title}</strong>
                                (<a
                                        href="#"
                                        data-hash="${commit.hash}"
                                        class="js-step-diff-commit"
                                    >get files</a>)
                            </div>
                        </li>
                    `)}
                </ul>
                <div class="js-step-diff-container"></div>
            </div>
        `);

        $prTabContent.append($prBody);

        return $()
            .add($prTabContent)
            .add($stepDiffTabContent);
    }
    bindNavTabs () {
        $(".js-tabnav-tab").click(function (event) {
            var $tab = $(event.target);
            var tabGroup = $tab.attr("data-tab-group");
            var tabName = $tab.attr("data-tab");
            this.selectTabNav(tabGroup, tabName)
        }.bind(this));
    }
    bindStepDiffsCommits () {
        $(".js-view-step-diff").click(function (event) {
            var $e = $(event.target);
            var commitHash = $e.attr("data-hash");
            var commit = this.pullRequest.byHash(commitHash);

            var $stepDiffContainer= $(".js-step-diff-container");

            var filesHtml = Templates.render('step-diff/files', {
                commit: commit,
            });
            $stepDiffContainer
                .text("")
                .append(filesHtml);
        }.bind(this));
        $(".js-step-diff-commit").click(function (event) {
            var $e = $(event.target);
            var commitHash = $e.attr("data-hash");
            var commit = this.pullRequest.byHash(commitHash);
            $e.after(`<span>${commit.filesList.length} files</span>`);
            $e.remove();
        }.bind(this));
    }
    selectTabNav (tabGroup, tabName) {
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
}
StepDiff.templates = StepDiff.prototype.templates = {};
