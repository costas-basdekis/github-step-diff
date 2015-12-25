"use strict";

var prUi = {
    addStepDiffTab: function addStepDiffTab(commitsUrls) {
        var $stepDiffTabNav = this.createStepDiffTabNav();
        var $prTabNav = $(".tabnav-pr");
        $prTabNav
            .before($stepDiffTabNav);

        var $prBody = $stepDiffTabNav.nextAll();
        var $stepDiffTabContent = this.createStepDiffTabContent($prBody, commitsUrls    );

        $stepDiffTabNav
            .after($stepDiffTabContent);

        this.bindNavTabs();
        this.bindStepDiffsCommits();
    },
    createStepDiffTabNav: function createStepDiffTabNav() {
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
    },
    createStepDiffTabContent: function createStepDiffTabContent ($prBody, commitsUrls) {
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
    },
    bindNavTabs: function bindNavTabs () {
        $(".js-tabnav-tab").click(function (event) {
            var $tab = $(event.target);
            var tabGroup = $tab.attr("data-tab-group");
            var tabName = $tab.attr("data-tab");
            this.selectTabNav(tabGroup, tabName)
        }.bind(this));
    },
    bindStepDiffsCommits: function bindStepDiffsCommits () {
        $(".js-step-diff-commit").click(function (event) {
            var $e = $(event.target);
            var commitUrl = $e.attr("data-url");
            var commitInfo = commitParser.getCommitInfo(commitUrl);
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
        }.bind(this));
    },
    selectTabNav: function selectTabNav (tabGroup, tabName) {
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
    },
};
