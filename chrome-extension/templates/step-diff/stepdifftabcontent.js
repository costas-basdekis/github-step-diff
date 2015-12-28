Templates.register('step-diff/stepdifftabcontent.js', function (ctx) {with (ctx) {return (
`
    <div
            class="tabcontent step-diff-tab-content js-tab-content"
            data-tab-group="step-diff"
            data-tab="step-diff"
        >
        <ul>
            ${forIn(stepDiff.pullRequest.commits, commit => `
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
`)}});
