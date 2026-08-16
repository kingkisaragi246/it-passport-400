// ===============================
// Result（模擬試験の結果表示）
// ===============================

const examResultRaw =
sessionStorage.getItem("examResult");

if (!examResultRaw) {

    alert("模擬試験の結果が見つかりません。ホームから模擬試験を開始してください。");

    location.href = "../index.html";

    throw new Error("STOP_NO_EXAM_RESULT");

}

const examResult =
JSON.parse(examResultRaw);

// -------------------------------
// 合否・スコア表示
// -------------------------------

const passFailTitle =
document.getElementById("passFailTitle");

const scoreCircle =
document.getElementById("scoreCircle");

const totalScoreText =
document.getElementById("totalScoreText");

const passFailMessage =
document.getElementById("passFailMessage");

if (examResult.passed) {

    passFailTitle.textContent = "🎉 合格ライン到達！";
    passFailTitle.className = "pass";

    scoreCircle.className = "scoreCircle pass";

    passFailMessage.textContent =
    "すべての分野で300点以上、合計600点以上に到達しました。この調子で本番に臨みましょう！";

} else {

    passFailTitle.textContent = "もう一歩！";
    passFailTitle.className = "fail";

    scoreCircle.className = "scoreCircle fail";

    passFailMessage.textContent =
    "合計600点、かつ各分野300点以上が合格ラインです。下の分野別スコアを見て、苦手な分野を重点的に復習しましょう。";

}

totalScoreText.textContent =
examResult.totalScore;

// -------------------------------
// 分野別スコア表示
// -------------------------------

const fieldScoreArea =
document.getElementById("fieldScoreArea");

const categoryOrder =
["ストラテジ系", "マネジメント系", "テクノロジ系"];

categoryOrder.forEach(cat=>{

    const stat = examResult.stats[cat];

    if (!stat) return;

    const row =
    document.createElement("div");

    row.className = "fieldScoreRow";

    const barClass =
    stat.score < 300 ? "fieldScoreBar low" : "fieldScoreBar";

    row.innerHTML =
        `<div class="fieldScoreLabel">${cat}</div>` +
        `<div class="fieldScoreBarWrap"><div class="${barClass}" style="width:${Math.min(stat.score/10,100)}%"></div></div>` +
        `<div class="fieldScoreValue">${stat.score}点（${stat.correct}/${stat.total}）</div>`;

    fieldScoreArea.appendChild(row);

});

// -------------------------------
// 振り返りアドバイス
// -------------------------------

const adviceArea =
document.getElementById("adviceArea");

const weakFields =
categoryOrder.filter(cat=>

    examResult.stats[cat] && examResult.stats[cat].score < 300

);

if (weakFields.length === 0) {

    adviceArea.textContent =
    "特に弱点は見当たりません。引き続き満遍なく復習を続けましょう。";

} else {

    adviceArea.textContent =
    `特に「${weakFields.join("」「")}」の正答率が低めです。ホーム画面の「分野別に学ぶ」から、この分野を重点的に復習することをおすすめします。`;

}

// -------------------------------
// ボタン
// -------------------------------

const reviewMistakesBtn =
document.getElementById("reviewMistakesBtn");

if (examResult.incorrectIds.length === 0) {

    reviewMistakesBtn.disabled = true;

    reviewMistakesBtn.textContent = "全問正解でした！";

} else {

    reviewMistakesBtn.textContent =
    `間違えた問題を復習する（${examResult.incorrectIds.length}問）`;

    reviewMistakesBtn.onclick = () => {

        sessionStorage.setItem(
            "examMistakeIds",
            JSON.stringify(examResult.incorrectIds)
        );

        sessionStorage.setItem(
            "studyMode",
            "examMistakes"
        );

        location.href = "study.html";

    };

}

const retryExamBtn =
document.getElementById("retryExamBtn");

retryExamBtn.onclick = () => {

    sessionStorage.setItem(
        "studyMode",
        "exam"
    );

    location.href = "study.html";

};

const backHomeBtn =
document.getElementById("backHomeBtn");

backHomeBtn.onclick = () => {

    location.href = "../index.html";

};
