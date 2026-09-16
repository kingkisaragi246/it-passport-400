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

            dailyStatus: {},

            history: [],

            dailyQuestionCount: 10,

            reviewIds: [],

            isCarryover: false,

            appearanceLog: {}

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

// 1日の問題数の初期値（利用者が自由に変更できる）
const DAILY_DEFAULT_TOTAL = 10;

// 1日の中で「前日までに間違えた問題」の復習に充てる最大数
const DAILY_REVIEW_MAX = 5;

function todayDateString() {

    const d = new Date();

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${y}-${m}-${day}`;

}

// 合計問題数を3分野へできるだけ均等に振り分ける
// （割り切れない分はテクノロジ系→ストラテジ系の順に多めに配分する）
function splitTotalAcrossCategories(total) {

    const base = Math.floor(total / 3);

    let remainder = total - base * 3;

    const counts = {

        "ストラテジ系": base,

        "マネジメント系": base,

        "テクノロジ系": base

    };

    const order = ["テクノロジ系", "ストラテジ系", "マネジメント系"];

    for (let i = 0; i < remainder; i++) {

        counts[order[i % order.length]]++;

    }

    return counts;

}

// 指定分野から、まだ出していない問題を優先して指定数選ぶ
// （すべて出し切っていたら、その分野だけプールをリセットして再度巡回する）
function pickDailyQuestionsForCategory(category, count, usedPool, allQuestions, excludeIds) {

    if (count <= 0) {

        return { picked: [], poolWasReset: false };

    }

    const categoryQuestions =
    allQuestions.filter(q =>
        q.category === category &&
        !(excludeIds || []).includes(q.id)
    );

    const usedIds =
    usedPool[category] || [];

    let candidates =
    categoryQuestions.filter(q => !usedIds.includes(q.id));

    let poolWasReset = false;

    if (candidates.length < count) {

        // その分野を一巡したので、プールをリセットして再度全体から選び直す
        poolWasReset = true;

        candidates = categoryQuestions;

    }

    const shuffled =
    [...candidates].sort(() => Math.random() - 0.5);

    const picked =
    shuffled.slice(0, count);

    return { picked, poolWasReset };

}

// 「今日」の状態を確認し、必要であれば1日分の問題を用意する。
// 前日までに終わらなかった問題が残っている場合は、それを最優先で今日の課題とし、
// 新しい問題には手をつけない（すべて終わってから新しい問題に進む）。
// allQuestions（questions配列）を渡して呼び出す
function ensureDailyChallenge(progress, allQuestions) {

    if (!progress.dailyChallenge) {

        progress.dailyChallenge = defaultProgress().dailyChallenge;

    }

    if (!progress.dailyChallenge.dailyStatus) {

        progress.dailyChallenge.dailyStatus = {};

    }

    const daily = progress.dailyChallenge;

    if (typeof daily.dailyQuestionCount !== "number" || daily.dailyQuestionCount < 1) {

        daily.dailyQuestionCount = DAILY_DEFAULT_TOTAL;

    }

    const today = todayDateString();

    if (daily.date === today) {

        // 今日の分はすでに生成済み。
        // ただし、以下の条件をすべて満たす場合は、設定変更をすぐに反映するため
        // 今日の分を作り直す：
        // ・繰り越し（前日までの未消化分）ではない＝新規に生成された今日の分である
        // ・今日の問題数が、現在の設定と異なる
        // ・今日の問題に、まだ1問も回答（理解度の記録）がない
        //   （すでに一部でも取り組んでいる場合は、進行中の課題を壊さないよう
        //   そのまま維持し、次の新しい日から新しい設定を反映する）
        const notCarryover =
        daily.isCarryover !== true;

        const countMismatch =
        daily.questionIds.length !== daily.dailyQuestionCount;

        const nothingAnsweredYet =
        daily.questionIds.every(id =>
            !(id in (daily.dailyStatus || {}))
        );

        if (notCarryover && countMismatch && nothingAnsweredYet) {

            daily.date = null;

            return ensureDailyChallenge(progress, allQuestions);

        }

        return progress;

    }

    const dailyStatus = daily.dailyStatus || {};

    // -------------------------------
    // 前回分を履歴へ記録し、未消化分を把握する
    // （初回は date が null なのでスキップ）
    // 問題数の設定が途中で変わっても、その日に実際に取り組んだ問題数（count）を
    // そのまま履歴として残すので、カレンダー上の過去の記録は変化しない。
    // -------------------------------

    let carryoverIds = [];

    if (daily.date && daily.questionIds.length > 0) {

        // 「その日のタスクをクリアしたか」は、理解度の自己評価が「理解できた」かに
        // 関わらず、その日のうちに一度でも回答（理解度の記録）をしたかどうかで判定する。
        // 「理解できた」以外（普通・苦手）を選んだ問題は、その日のうちに
        // 再度やり直す必要はないが、翌日以降の「間違えた問題の復習」対象には含まれる。
        const cleared =
        daily.questionIds.every(id =>
            id in dailyStatus
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

        // 前回分のうち、まだ1度も回答していない問題だけを繰り越す
        // （回答済みなら、理解度に関わらずその日の分としては完了扱い）
        carryoverIds =
        daily.questionIds.filter(id =>
            !(id in dailyStatus)
        );

    }

    daily.date = today;

    // -------------------------------
    // 前回の未消化分が残っている場合は、それを最優先で今日の課題とする
    // （新しい問題は生成しない。usedPoolにはすでに記録済みなので触らない）
    // -------------------------------

    if (carryoverIds.length > 0) {

        daily.questionIds = carryoverIds;

        daily.isCarryover = true;

        recordDailyAppearances(daily);

        saveProgress(progress);

        return progress;

    }

    // -------------------------------
    // 前回分がすべて終わっている場合のみ、新しい1日分の問題を生成する。
    // まず「前日までに間違えた問題」の復習を最大5問まで組み込み、
    // 残りを新しい問題で埋める。間違えた問題が1つもなければ、
    // 全問が新しい問題になる。
    // -------------------------------

    if (!daily.usedPool) {

        daily.usedPool = {};

    }

    const totalCount = daily.dailyQuestionCount;

    const understanding = progress.understanding || {};

    // 復習対象とする問題：
    // ・4択で実際に間違えた問題（progress.weakQuestions）
    // ・4択には正解していても、「理解できた」以外（普通・苦手）を
    //   自己評価で選んだ問題
    // のいずれかに該当し、かつ、まだ「理解できた」になっていないもの。
    const selfAssessedNotGood =
    Object.keys(understanding).filter(id =>

        understanding[id] === "normal" ||
        understanding[id] === "bad"

    ).map(id => Number(id));

    const mistakePool =
    [...new Set([

        ...(progress.weakQuestions || []),
        ...selfAssessedNotGood

    ])].filter(id =>

        understanding[id] !== "good"

    );

    const shuffledMistakes =
    [...mistakePool].sort(() => Math.random() - 0.5);

    const reviewCount =
    Math.min(DAILY_REVIEW_MAX, totalCount, shuffledMistakes.length);

    const reviewIds =
    shuffledMistakes.slice(0, reviewCount);

    const remainingCount =
    totalCount - reviewIds.length;

    const categoryCounts =
    splitTotalAcrossCategories(remainingCount);

    let newQuestionIds = [...reviewIds];

    DAILY_CATEGORIES.forEach(category => {

        if (!daily.usedPool[category]) {

            daily.usedPool[category] = [];

        }

        const { picked, poolWasReset } =
        pickDailyQuestionsForCategory(
            category,
            categoryCounts[category],
            daily.usedPool,
            allQuestions,
            reviewIds
        );

        if (poolWasReset) {

            daily.usedPool[category] = [];

        }

        picked.forEach(q => {

            daily.usedPool[category].push(q.id);

            newQuestionIds.push(q.id);

        });

    });

    daily.questionIds = newQuestionIds;

    daily.reviewIds = reviewIds;

    daily.isCarryover = false;

    recordDailyAppearances(daily);

    saveProgress(progress);

    return progress;

}

// その日出題された問題について、「その日に初めて出題された」場合だけ
// 出現履歴（何日目に出たか）に日付を記録する。
// 同じ日に複数回（周回）出題されても、1日につき1回しかカウントしない。
function recordDailyAppearances(daily) {

    if (!daily.appearanceLog) {

        daily.appearanceLog = {};

    }

    daily.questionIds.forEach(id => {

        if (!daily.appearanceLog[id]) {

            daily.appearanceLog[id] = [];

        }

        if (!daily.appearanceLog[id].includes(daily.date)) {

            daily.appearanceLog[id].push(daily.date);

        }

    });

}

// 指定した問題が、毎日の学習の中でこれまで何日分（何回目）出題されたかを返す
function getQuestionAppearanceCount(progress, questionId) {

    const daily = progress.dailyChallenge;

    if (!daily || !daily.appearanceLog || !daily.appearanceLog[questionId]) {

        return 0;

    }

    return daily.appearanceLog[questionId].length;

}

// 1日の問題数を変更する（次回の新しい1日分から反映される）
function setDailyQuestionCount(progress, count) {

    if (!progress.dailyChallenge) {

        progress.dailyChallenge = defaultProgress().dailyChallenge;

    }

    const parsed = parseInt(count, 10);

    if (!isNaN(parsed) && parsed >= 1) {

        progress.dailyChallenge.dailyQuestionCount = parsed;

        saveProgress(progress);

    }

    return progress;

}

// 今日の問題のうち、まだ「理解できた」になっていない問題のID一覧
// （他の学習モードでの理解度とは独立した、毎日の学習専用の記録を参照する）
function getDailyRemainingIds(progress) {

    const daily = progress.dailyChallenge;

    if (!daily || !daily.questionIds) {

        return [];

    }

    const dailyStatus = daily.dailyStatus || {};

    // その日のうちにまだ1度も回答していない問題だけを「残り」とする。
    // 「理解できた」以外（普通・苦手）を選んだ問題も、その日の分としては
    // 完了扱いになる（その代わり、翌日以降の復習対象には含まれる）。
    return daily.questionIds.filter(id =>

        !(id in dailyStatus)

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

// -------------------------------
// 月間カレンダー（毎日の学習）
// -------------------------------

// year, month は省略時は「今月」。month は1〜12。
// 各日について { day, date, count, cleared, isToday, hasData } の配列を、
// カレンダーの週構成（先頭・末尾の空白セルも含む）で返す。
function getMonthCalendarData(progress, year, month) {

    const now = new Date();

    const targetYear =
    typeof year === "number" ? year : now.getFullYear();

    const targetMonth =
    typeof month === "number" ? month : now.getMonth() + 1;

    const daily = progress.dailyChallenge;

    const history = daily ? daily.history : [];

    const today = todayDateString();

    const historyByDate = {};

    history.forEach(h => {

        historyByDate[h.date] = h;

    });

    if (daily && daily.date === today) {

        historyByDate[today] = {

            date: today,

            count: daily.questionIds.length,

            cleared: isDailyComplete(progress)

        };

    }

    const firstDay =
    new Date(targetYear, targetMonth - 1, 1);

    const daysInMonth =
    new Date(targetYear, targetMonth, 0).getDate();

    const startWeekday =
    firstDay.getDay();

    const cells = [];

    // 月初の曜日調整用の空白セル
    for (let i = 0; i < startWeekday; i++) {

        cells.push(null);

    }

    for (let d = 1; d <= daysInMonth; d++) {

        const y = targetYear;
        const m = String(targetMonth).padStart(2, "0");
        const dd = String(d).padStart(2, "0");
        const dateStr = `${y}-${m}-${dd}`;

        const entry = historyByDate[dateStr];

        cells.push({

            day: d,

            date: dateStr,

            count: entry ? entry.count : 0,

            cleared: entry ? entry.cleared : false,

            hasData: !!entry,

            isToday: dateStr === today

        });

    }

    return {

        year: targetYear,

        month: targetMonth,

        cells: cells

    };

}

// -------------------------------
// 毎日の学習のリセット
// -------------------------------

// 「毎日の学習」に関する記録（今日の課題、履歴、カレンダー、出題プール、
// 3日間テストなど）だけをすべて初期状態に戻す。
// 通常学習・苦手問題・お気に入り・模擬試験など、他の学習記録には一切影響しない。
function resetDailyChallenge(progress) {

    const preservedCount =
    progress.dailyChallenge && progress.dailyChallenge.dailyQuestionCount
        ? progress.dailyChallenge.dailyQuestionCount
        : DAILY_DEFAULT_TOTAL;

    progress.dailyChallenge =
    defaultProgress().dailyChallenge;

    progress.dailyChallenge.dailyQuestionCount = preservedCount;

    saveProgress(progress);

    return progress;

}
