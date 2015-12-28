Templates.register('step-diff/tabnav.js', function (ctx) {with (ctx) {return (
`
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
                    href="#step-diff"
                    class="tabnav-tab js-tabnav-tab js-step-diff"
                    data-tab-group="step-diff"
                    data-tab="step-diff"
                >
                Step diff
                <span class="counter">${stepDiff.pullRequest.commits.length}</span>
            </a>
        </div>
    </div>
`)}});
