// ===============================
// Home
// ===============================

const progress = loadProgress();

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

        const btn =
        document.createElement("button");

        btn.className = "menuCard categoryCard";

        btn.innerHTML =
        `<h3>${category}</h3>` +
        `<p>${total}問` +
        (rate === null ? "" : `　正答率${rate}%`) +
        `</p>`;

        btn.onclick = ()=>{

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

        categoryButtons.appendChild(btn);

    });

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

const homeProgress =
document.getElementById("homeProgress");

if(homeProgress){

    homeProgress.textContent =
    `${progress.current} / ${getQuestionCount()}`;

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
        : progress.current /
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