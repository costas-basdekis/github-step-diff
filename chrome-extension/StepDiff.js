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
        var $newTabNav = $(Templates.render('step-diff/tabnav.js', {
            stepDiff: this,
        }));

        return $newTabNav;
    }
    createStepDiffTabContent ($prBody) {
        var $prTabContent = $(Templates.render('step-diff/prtabcontent.js'));

        var $stepDiffTabContent = $(Templates.render('step-diff/stepdifftabcontent.js', {
            stepDiff: this,
        }));

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

            var filesHtml = Templates.render('step-diff/files.js', {
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
