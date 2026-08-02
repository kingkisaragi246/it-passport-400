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

        lastStudy: null

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

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(progress)

    );

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