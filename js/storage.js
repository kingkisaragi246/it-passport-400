// ===============================
// Storage
// ===============================

const STORAGE_KEY = "itpassport400_progress";

// -------------------------------
// 初期データ
// -------------------------------

function defaultProgress() {

    return {

        current: 0,

        correct: 0,

        totalAnswered: 0,

        weakQuestions: [],

        favoriteQuestions: [],

        understanding: {},

        studyHistory: [],

        lastStudy: null,

        dailyChallenge: {

            date: null,

            questionIds: [],

            usedPool: {},

            history: [],

            threeDayTest: {

                available: false,

                questionIds: [],

                cycleStartDate: null

            }

        }

    };

}

// -------------------------------
// 読み込み
// -------------------------------

function loadProgress() {

    const saved =
        localStorage.getItem(STORAGE_KEY);

    if (!saved) {

        const progress =
            defaultProgress();

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(progress)
        );

        return progress;

    }

    try {

        const progress =
            JSON.parse(saved);

        return {

            ...defaultProgress(),

            ...progress

        };

    } catch {

        const progress =
            defaultProgress();

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(progress)
        );

        return progress;

    }

}

// -------------------------------
// 保存
// -------------------------------

function saveProgress(progress) {

    progress.updatedAt = Date.now();

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(progress)

    );

    if (typeof pushProgressToCloud === "function") {

        pushProgressToCloud(progress);

    }

}

// -------------------------------
// 全削除
// -------------------------------

function resetProgress() {

    localStorage.removeItem(

        STORAGE_KEY

    );

}

// -------------------------------
// 苦手問題追加
// -------------------------------

function addWeakQuestion(id) {

    const progress =
        loadProgress();

    if (!progress.weakQuestions.includes(id)) {

        progress.weakQuestions.push(id);

        saveProgress(progress);

    }

}

// -------------------------------
// 苦手問題削除
// -------------------------------

function removeWeakQuestion(id) {

    const progress =
        loadProgress();

    progress.weakQuestions =
        progress.weakQuestions.filter(

            q => q !== id

        );

    saveProgress(progress);

}

// -------------------------------
// お気に入り追加
// -------------------------------

function addFavorite(id) {

    const progress =
        loadProgress();

    if (!progress.favoriteQuestions.includes(id)) {

        progress.favoriteQuestions.push(id);

        saveProgress(progress);

    }

}

// -------------------------------
// お気に入り削除
// -------------------------------

function removeFavorite(id) {

    const progress =
        loadProgress();

    progress.favoriteQuestions =
        progress.favoriteQuestions.filter(

            q => q !== id

        );

    saveProgress(progress);

}

// -------------------------------
// 理解度保存
// -------------------------------

function saveUnderstanding(id, level) {

    const progress = loadProgress();

    progress.understanding[id] = level;

    progress.lastStudy =
        new Date().toISOString();

    saveProgress(progress);

}

// -------------------------------
// 学習履歴追加
// -------------------------------

function addStudyHistory(id, correct) {

    const progress =
        loadProgress();

progress.studyHistory.push({

    id,

    correct,

    level:
        progress.understanding[id] || null,

    date:
        new Date().toISOString()

});

    if (progress.studyHistory.length > 5000) {

        progress.studyHistory.shift();

    }

    saveProgress(progress);

}

// -------------------------------
// 正答率
// -------------------------------

function getCorrectRate() {

    const progress =
        loadProgress();

    if (progress.totalAnswered === 0) {

        return 0;

    }

    return Math.round(

        progress.correct /

        progress.totalAnswered *

        100

    );

}

// -------------------------------
// 学習日数
// -------------------------------

function getStudyDays() {

    const progress =
        loadProgress();

    const days = new Set();

    progress.studyHistory.forEach(item => {

        days.add(

            item.date.substring(0, 10)

        );

    });

    return days.size;

}

// ===============================
// 毎日の学習（Daily Challenge）
// ===============================

const DAILY_CATEGORIES =
["ストラテジ系", "マネジメント系", "テクノロジ系"];

const DAILY_QUESTIONS_PER_CATEGORY = 5;

function todayDateString() {

    const d = new Date();

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${y}-${m}-${day}`;

}

// 指定分野から、まだ出していない問題を優先して5問選ぶ
// （すべて出し切っていたら、その分野だけプールをリセットして再度巡回する）
function pickDailyQuestionsForCategory(category, usedPool, allQuestions) {

    const categoryQuestions =
    allQuestions.filter(q => q.category === category);

    const usedIds =
    usedPool[category] || [];

    let candidates =
    categoryQuestions.filter(q => !usedIds.includes(q.id));

    let poolWasReset = false;

    if (candidates.length < DAILY_QUESTIONS_PER_CATEGORY) {

        // その分野を一巡したので、プールをリセットして再度全体から選び直す
        poolWasReset = true;

        candidates = categoryQuestions;

    }

    const shuffled =
    [...candidates].sort(() => Math.random() - 0.5);

    const picked =
    shuffled.slice(0, DAILY_QUESTIONS_PER_CATEGORY);

    return { picked, poolWasReset };

}

// 「今日」の状態を確認し、必要であれば新しい1日分の問題を生成する
// allQuestions（questions配列）を渡して呼び出す
function ensureDailyChallenge(progress, allQuestions) {

    if (!progress.dailyChallenge) {

        progress.dailyChallenge = defaultProgress().dailyChallenge;

    }

    const daily = progress.dailyChallenge;

    const today = todayDateString();

    if (daily.date === today) {

        // 今日の分はすでに生成済み
        return progress;

    }

    // -------------------------------
    // 前回分を履歴へ記録（初回は date が null なのでスキップ）
    // -------------------------------

    if (daily.date && daily.questionIds.length > 0) {

        const cleared =
        daily.questionIds.every(id =>
            progress.understanding[id] === "good"
        );

        const dayOfWeek =
        new Date(daily.date + "T00:00:00").getDay();

        daily.history.push({

            date: daily.date,

            dayOfWeek: dayOfWeek,

            count: daily.questionIds.length,

            cleared: cleared,

            questionIds: [...daily.questionIds]

        });

        if (daily.history.length > 90) {

            daily.history.shift();

        }

        // 3日ごとに、直近3日分をまとめたテストを利用可能にする
        if (daily.history.length % 3 === 0) {

            const last3 =
            daily.history.slice(-3);

            const combinedIds =
            [...new Set(
                last3.flatMap(h => h.questionIds)
            )];

            daily.threeDayTest = {

                available: true,

                questionIds: combinedIds,

                cycleStartDate: last3[0].date

            };

        }

    }

    // -------------------------------
    // 今日の新しい15問（3分野×5問）を生成
    // -------------------------------

    if (!daily.usedPool) {

        daily.usedPool = {};

    }

    let newQuestionIds = [];

    DAILY_CATEGORIES.forEach(category => {

        if (!daily.usedPool[category]) {

            daily.usedPool[category] = [];

        }

        const { picked, poolWasReset } =
        pickDailyQuestionsForCategory(
            category,
            daily.usedPool,
            allQuestions
        );

        if (poolWasReset) {

            daily.usedPool[category] = [];

        }

        picked.forEach(q => {

            daily.usedPool[category].push(q.id);

            newQuestionIds.push(q.id);

        });

    });

    daily.date = today;
    daily.questionIds = newQuestionIds;

    saveProgress(progress);

    return progress;

}

// 今日の15問のうち、まだ「理解できた」になっていない問題のID一覧
function getDailyRemainingIds(progress) {

    const daily = progress.dailyChallenge;

    if (!daily || !daily.questionIds) {

        return [];

    }

    return daily.questionIds.filter(id =>

        progress.understanding[id] !== "good"

    );

}

// 今日の分がすべて「理解できた」になっているか
function isDailyComplete(progress) {

    return getDailyRemainingIds(progress).length === 0;

}

// 直近7日分の履歴（今日を含む）を、月曜始まりで並べて返す
function getWeeklyTable(progress) {

    const daily = progress.dailyChallenge;

    const history = daily ? daily.history : [];

    const today = todayDateString();

    const todayEntry = {

        date: today,

        dayOfWeek: new Date().getDay(),

        count: daily ? daily.questionIds.length : 0,

        cleared: isDailyComplete(progress),

        isToday: true

    };

    const combined = [...history, todayEntry];

    // 直近7日分だけを日付順に返す
    return combined.slice(-7);

}