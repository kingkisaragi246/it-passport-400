// ===============================
// 用語辞典（Glossary）
// ===============================

const glossarySearchInput =
document.getElementById("glossarySearchInput");

const glossaryCount =
document.getElementById("glossaryCount");

const glossaryList =
document.getElementById("glossaryList");

const glossaryDetailOverlay =
document.getElementById("glossaryDetailOverlay");

const glossaryDetailTitle =
document.getElementById("glossaryDetailTitle");

const glossaryDetailCount =
document.getElementById("glossaryDetailCount");

const glossaryDetailClose =
document.getElementById("glossaryDetailClose");

const glossaryStudyBtn =
document.getElementById("glossaryStudyBtn");

const glossaryQuestionList =
document.getElementById("glossaryQuestionList");

let currentTerm = null;

// -------------------------------
// 用語一覧の描画
// -------------------------------

function renderGlossaryList(entries) {

    glossaryCount.textContent =
    `${entries.length} 件`;

    if (entries.length === 0) {

        glossaryList.innerHTML =
        `<p class="glossaryEmpty">該当する用語が見つかりませんでした。</p>`;

        return;

    }

    glossaryList.innerHTML = "";

    entries.forEach(entry => {

        const item =
        document.createElement("button");

        item.className = "glossaryItem";

        item.innerHTML =
        `<span class="glossaryItemTerm">${entry.term}</span>` +
        `<span class="glossaryItemCount">${entry.questionIds.length}問</span>`;

        item.onclick = () => {

            openGlossaryDetail(entry.term);

        };

        glossaryList.appendChild(item);

    });

}

// -------------------------------
// 検索
// -------------------------------

function applyGlossarySearch() {

    const keyword =
    glossarySearchInput.value;

    const results =
    searchGlossaryTerms(keyword);

    renderGlossaryList(results);

}

if (glossarySearchInput) {

    glossarySearchInput.addEventListener("input", applyGlossarySearch);

}

// -------------------------------
// 用語の詳細（関連問題の一覧）表示
// -------------------------------

function openGlossaryDetail(term) {

    currentTerm = term;

    const relatedQuestions =
    getQuestionsForGlossaryTerm(term);

    glossaryDetailTitle.textContent =
    term;

    glossaryDetailCount.textContent =
    `この用語が関連する問題：${relatedQuestions.length}問`;

    glossaryQuestionList.innerHTML = "";

    relatedQuestions.forEach(q => {

        const item =
        document.createElement("div");

        item.className = "glossaryQuestionItem";

        item.innerHTML =
        `<span class="glossaryQuestionCategory">${q.category}${q.subcategory ? "　＞　" + q.subcategory : ""}</span>` +
        `<p class="glossaryQuestionText">${q.question}</p>`;

        glossaryQuestionList.appendChild(item);

    });

    glossaryDetailOverlay.classList.add("glossaryDetailOverlayOpen");

}

function closeGlossaryDetail() {

    glossaryDetailOverlay.classList.remove("glossaryDetailOverlayOpen");

    currentTerm = null;

}

if (glossaryDetailClose) {

    glossaryDetailClose.onclick = closeGlossaryDetail;

}

if (glossaryDetailOverlay) {

    glossaryDetailOverlay.addEventListener("click", (e) => {

        if (e.target === glossaryDetailOverlay) {

            closeGlossaryDetail();

        }

    });

}

// -------------------------------
// 「この用語の問題を解く」ボタン
// -------------------------------

if (glossaryStudyBtn) {

    glossaryStudyBtn.onclick = () => {

        if (!currentTerm) {

            return;

        }

        const relatedQuestions =
        getQuestionsForGlossaryTerm(currentTerm);

        if (relatedQuestions.length === 0) {

            return;

        }

        sessionStorage.setItem(
            "studyMode",
            "glossaryTerm"
        );

        sessionStorage.setItem(
            "glossaryTermQuestionIds",
            JSON.stringify(relatedQuestions.map(q => q.id))
        );

        sessionStorage.setItem(
            "glossaryTermName",
            currentTerm
        );

        location.href =
        "study.html";

    };

}

// -------------------------------
// 初期表示
// -------------------------------

renderGlossaryList(getAllGlossaryTerms());
