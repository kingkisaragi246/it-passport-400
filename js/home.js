// ===============================
// Home
// ===============================

const progress = loadProgress();

// クラウド同期（設定されていれば、最新データが他端末にあった場合だけ再読み込み）
if (typeof syncOnLoad === "function") {

    syncOnLoad(() => location.reload());

}

// -------------------------------
// Buttons
// -------------------------------

const studyBtn =
document.getElementById("studyBtn");

const weakBtn =
document.getElementById("weakBtn");

const favoriteBtn =
document.getElementById("favoriteBtn");

const randomBtn =
document.getElementById("randomBtn");

// -------------------------------
// Study
// -------------------------------

if(studyBtn){

    studyBtn.onclick = ()=>{

        sessionStorage.setItem(
            "studyMode",
            "normal"
        );

        location.href =
        "pages/study.html";

    };

}

// -------------------------------
// Weak
// -------------------------------

if(weakBtn){

    weakBtn.onclick = ()=>{

        sessionStorage.setItem(
            "studyMode",
            "weak"
        );

        location.href =
        "pages/study.html";

    };

}

// -------------------------------
// Favorite
// -------------------------------

if(favoriteBtn){

    favoriteBtn.onclick = ()=>{

        sessionStorage.setItem(
            "studyMode",
            "favorite"
        );

        location.href =
        "pages/study.html";

    };

}

// -------------------------------
// Random
// -------------------------------

if(randomBtn){

    randomBtn.onclick = ()=>{

        sessionStorage.setItem(
            "studyMode",
            "random"
        );

        location.href =
        "pages/study.html";

    };

}

// -------------------------------
// Review（理解できた以外の復習）
// -------------------------------

const reviewBtn =
document.getElementById("reviewBtn");

if(reviewBtn){

    reviewBtn.onclick = ()=>{

        sessionStorage.setItem(
            "studyMode",
            "review"
        );

        location.href =
        "pages/study.html";

    };

}

// -------------------------------
// Category Study
// -------------------------------

const categoryButtons =
document.getElementById("categoryButtons");

if(categoryButtons){

    const categories = getCategoryList();

    categories.forEach(category=>{

        const total =
        getCategoryCount(category);

        const historyForCategory =
        progress.studyHistory.filter(h=>{

            const q = questions.find(x=>x.id===h.id);

            return q && q.category === category;

        });

        const answeredCount =
        historyForCategory.length;

        const correctCount =
        historyForCategory.filter(h=>h.correct).length;

        const rate =
        answeredCount === 0
        ? null
        : Math.round(correctCount / answeredCount * 100);

        // この分野で「理解できた」以外（普通・苦手・未評価ではない）の問題数
        const categoryReviewCount =
        questions.filter(q=>{

            if (q.category !== category) return false;

            const level = progress.understanding[q.id];

            return level === "normal" || level === "bad";

        }).length;

        const card =
        document.createElement("div");

        card.className = "menuCard categoryCard";

        card.innerHTML =
        `<h3>${category}</h3>` +
        `<p>${total}問` +
        (rate === null ? "" : `　正答率${rate}%`) +
        `</p>`;

        card.onclick = ()=>{

            sessionStorage.setItem(
                "studyMode",
                "category"
            );

            sessionStorage.setItem(
                "studyCategory",
                category
            );

            location.href =
            "pages/study.html";

        };

        if (categoryReviewCount > 0) {

            const reviewLink =
            document.createElement("button");

            reviewLink.className = "categoryReviewLink";

            reviewLink.textContent =
            `🔁 この分野を復習（${categoryReviewCount}問）`;

            reviewLink.onclick = (e)=>{

                e.stopPropagation();

                sessionStorage.setItem(
                    "studyMode",
                    "categoryReview"
                );

                sessionStorage.setItem(
                    "studyCategory",
                    category
                );

                location.href =
                "pages/study.html";

            };

            card.appendChild(reviewLink);

        }

        categoryButtons.appendChild(card);

    });

}

// -------------------------------
// Sync Code UI
// -------------------------------

const syncCodeDisplay =
document.getElementById("syncCodeDisplay");

const syncCodeInput =
document.getElementById("syncCodeInput");

const syncCodeButton =
document.getElementById("syncCodeButton");

const syncStatus =
document.getElementById("syncStatus");

if (syncCodeDisplay && typeof getSyncCode === "function") {

    syncCodeDisplay.textContent = getSyncCode();

}

if (syncCodeButton) {

    syncCodeButton.onclick = () => {

        const code = syncCodeInput.value.trim();

        if (code.length < 4) {

            syncStatus.textContent =
            "コードを正しく入力してください。";

            syncStatus.className = "syncStatus error";

            return;

        }

        syncStatus.textContent = "連携しています…";

        syncStatus.className = "syncStatus";

        relinkSyncCode(code, (found) => {

            syncCodeDisplay.textContent = getSyncCode();

            if (found) {

                syncStatus.textContent =
                "連携できました。この端末のデータを更新します。";

                setTimeout(()=>location.reload(), 1000);

            } else {

                syncStatus.textContent =
                "そのコードにはまだデータがありません。この端末のデータで新規開始します。";

                saveProgress(loadProgress());

            }

        });

    };

}

// -------------------------------
// Home Status
// -------------------------------

const homeQuestionCount =
document.getElementById("homeQuestionCount");

if(homeQuestionCount){

    homeQuestionCount.textContent =
    `${getQuestionCount()}問`;

}

// 「現在位置」は、シャッフルされたセッション内の一時的な位置ではなく、
// これまでに一度でも解答したことのある問題数（累計・重複なし）を表示する
function getUniqueAnsweredCount(){

    const answeredIds = new Set(

        progress.studyHistory.map(h => h.id)

    );

    return answeredIds.size;

}

const homeProgress =
document.getElementById("homeProgress");

if(homeProgress){

    homeProgress.textContent =
    `${getUniqueAnsweredCount()} / ${getQuestionCount()}`;

}

const homeCorrect =
document.getElementById("homeCorrect");

if(homeCorrect){

    homeCorrect.textContent =
    progress.correct;

}

const homeAnswered =
document.getElementById("homeAnswered");

if(homeAnswered){

    homeAnswered.textContent =
    progress.totalAnswered;

}

const homeRate =
document.getElementById("homeRate");

if(homeRate){

    homeRate.textContent =
    `${getCorrectRate()}%`;

}

const studyDays =
document.getElementById("studyDays");

if(studyDays){

    studyDays.textContent =
    getStudyDays();

}

const weakCount =
document.getElementById("weakCount");

if(weakCount){

    weakCount.textContent =
    progress.weakQuestions.length;

}

const favoriteCount =
document.getElementById("favoriteCount");

if(favoriteCount){

    favoriteCount.textContent =
    progress.favoriteQuestions.length;

}

const reviewCount =
document.getElementById("reviewCount");

if(reviewCount){

    reviewCount.textContent =
    Object.values(progress.understanding).filter(
        level => level === "normal" || level === "bad"
    ).length;

}

const homeLastStudy =
document.getElementById("homeLastStudy");

if(homeLastStudy){

    if(progress.lastStudy){

        homeLastStudy.textContent =
        new Date(
            progress.lastStudy
        ).toLocaleString("ja-JP");

    }else{

        homeLastStudy.textContent =
        "まだ学習していません";

    }

}

// -------------------------------
// Progress Bar
// -------------------------------

const homeProgressBar =
document.getElementById("homeProgressBar");

if(homeProgressBar){

    const percent =
        getQuestionCount() === 0
        ? 0
        : getUniqueAnsweredCount() /
          getQuestionCount() * 100;

    homeProgressBar.style.width =
    `${percent}%`;

}

// -------------------------------
// Daily Message
// -------------------------------

const dailyMessage =
document.getElementById("dailyMessage");

if(dailyMessage){

    const messages=[

        "今日も一歩ずつ頑張ろう！",

        "復習すると記憶が定着します。",

        "苦手問題を減らそう！",

        "継続は合格への近道です。",

        "今日もITパスポートを1問解こう！"

    ];

    const index =
    new Date().getDate()
    % messages.length;

    dailyMessage.textContent =
    messages[index];

}