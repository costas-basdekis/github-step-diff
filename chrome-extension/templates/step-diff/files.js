Templates.register('step-diff/files', ctx => ((commit, PREVIOUS_BLOB_NUM_CLASSES, CURRENT_BLOB_NUM_CLASSES) => forIn(commit.filesList, file => `
    <div
            id="diff-${file.uuid}"
            class="file js-details-container show-inline-notes"
        >
        <div class="file-header" data-path="${file.filename}">
            <div class="file-actions">
                <a
                        href="/${commit.organisation}/${commit.project}/blob/${commit.hash}/${file.filename}"
                        class="btn btn-sm tooltipped tooltipped-nw"
                        rel="nofollow"
                        aria-label="View the whole file at version ${commit.hash.substr(0, 7)}"
                    >View</a>
            </div>
            <div class="file-info">
                <span
                        class="diffstat tooltipped tooltipped-e"
                        aria-label="${
                            file.lineAdditions ? `${file.lineAdditions} additions` : ''
                            }${(file.lineAdditions && file.lineDeletions) ? ' & ' : ''
                            }${file.lineDeletions ? `${file.lineDeletions} deletions` : ''
                        }"
                    >
                    ${file.lineChanges}
                    ${[1, 2, 3, 4, 5]
                        .slice(0, file.blockDiffAddedCount)
                        .map(() => '<span class="block-diff-added"></span>')
                        .join('')
                    }${[1, 2, 3, 4, 5]
                        .slice(0, file.blockDiffDeletedCount)
                        .map(() => '<span class="block-diff-deleted"></span>')
                        .join('')
                    }${[1, 2, 3, 4, 5]
                        .slice(0, file.blockDiffNeutralCount)
                        .map(() => '<span class="block-diff-neutral"></span>')
                        .join('')
                    }
                </span>
                <span class="user-select-contain" title="${file.filename}">
                    ${file.filename}
                </span>
            </div>
        </div>

        <div class="data highlight blob-wrapper">
            <table class="diff-table tab-size" data-tab-size="8">
                <tbody>
                    ${forIn(file.diffLines, line => `
                        <tr>
                            <td
                                    data-line-number="${line.originalLineNumber || ''}"
                                    class="blob-num blob-num-context ${PREVIOUS_BLOB_NUM_CLASSES[line.compositeType]} js-linkable-line-number"></td>
                            <td
                                    data-line-number="${line.oldLineNumber || ''}"
                                    class="blob-num blob-num-context ${PREVIOUS_BLOB_NUM_CLASSES[line.compositeType]} js-linkable-line-number"></td>
                            <td
                                    data-line-number="${line.newLineNumber || ''}"
                                    class="blob-num blob-num-context ${CURRENT_BLOB_NUM_CLASSES[line.compositeType]} js-linkable-line-number"></td>
                            <td class="blob-code blob-code-context">${line.codeHtml}</td>
                        </tr>
                    `)}
                </tbody>
            </table>
        </div>
    </div>
`))(ctx.commit, ctx.PREVIOUS_BLOB_NUM_CLASSES, ctx.CURRENT_BLOB_NUM_CLASSES));
