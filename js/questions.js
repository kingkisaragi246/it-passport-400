// ===============================
// Questions
// ===============================

const questions = [

    ...(typeof securityQuestions !== "undefined"
        ? securityQuestions
        : []),

    ...(typeof networkQuestions !== "undefined"
        ? networkQuestions
        : []),

    ...(typeof databaseQuestions !== "undefined"
        ? databaseQuestions
        : []),

    ...(typeof strategyQuestions !== "undefined"
        ? strategyQuestions
        : []),

    ...(typeof projectManagementQuestions !== "undefined"
        ? projectManagementQuestions
        : []),

    ...(typeof systemDevelopmentQuestions !== "undefined"
        ? systemDevelopmentQuestions
        : []),

    ...(typeof systemHardwareQuestions !== "undefined"
        ? systemHardwareQuestions
        : []),

    ...(typeof algorithmQuestions !== "undefined"
        ? algorithmQuestions
        : []),

    ...(typeof lawQuestions !== "undefined"
        ? lawQuestions
        : []),

    ...(typeof serviceManagementQuestions !== "undefined"
        ? serviceManagementQuestions
        : []),

    ...(typeof aiCloudQuestions !== "undefined"
        ? aiCloudQuestions
        : []),

    ...(typeof reviewQuestions !== "undefined"
        ? reviewQuestions
        : []),

    ...(typeof calculationQuestions !== "undefined"
        ? calculationQuestions
        : []),

    ...(typeof latestTrendQuestions !== "undefined"
        ? latestTrendQuestions
        : []),

    ...(typeof businessDesignQuestions !== "undefined"
        ? businessDesignQuestions
        : [])

];

// ===============================
// Utility
// ===============================

function getQuestionById(id){

    return questions.find(q => q.id === id);

}

function getQuestionsByCategory(category){

    return questions.filter(q => q.category === category);

}

function getRandomQuestions(count){

    const copy = [...questions];

    for(let i = copy.length - 1; i > 0; i--){

        const j = Math.floor(Math.random() * (i + 1));

        [copy[i], copy[j]] = [copy[j], copy[i]];

    }

    return copy.slice(0, count);

}

function searchQuestions(keyword){

    keyword = keyword.trim();

    if(keyword === ""){

        return [];

    }

    return questions.filter(q=>{

        if(q.question.includes(keyword)){

            return true;

        }

        if(q.category.includes(keyword)){

            return true;

        }

        if(typeof q.explanation !== "string"){

            if(q.explanation.related){

                return q.explanation.related.some(word=>

                    word.includes(keyword)

                );

            }

        }

        return false;

    });

}

// ===============================
// Statistics
// ===============================

function getCategoryList(){

    return [...new Set(

        questions.map(q => q.category)

    )];

}

function getQuestionCount(){

    return questions.length;

}

function getCategoryCount(category){

    return questions.filter(q =>

        q.category === category

    ).length;

}

function getSubcategoryList(category){

    return [...new Set(

        questions
        .filter(q => q.category === category)
        .map(q => q.subcategory)

    )];

}

function getSubcategoryCount(category, subcategory){

    return questions.filter(q =>

        q.category === category &&
        q.subcategory === subcategory

    ).length;

}

function getLevelCount(level){

    return questions.filter(q =>

        q.level === level

    ).length;

}

// ===============================
// 用語辞典（Glossary）
// ===============================

// 各問題の explanation.related（関連用語）を集計して、
// 「用語名 → その用語が関連する問題ID一覧」の索引を作る。
// 一度作った索引はキャッシュして使い回す。
let _glossaryIndexCache = null;

function buildGlossaryIndex() {

    if (_glossaryIndexCache) {

        return _glossaryIndexCache;

    }

    const index = {};

    questions.forEach(q => {

        const relatedTerms =
        (q.explanation && q.explanation.related) || [];

        relatedTerms.forEach(term => {

            const key = term.trim();

            if (!key) return;

            if (!index[key]) {

                index[key] = {

                    term: key,

                    questionIds: []

                };

            }

            if (!index[key].questionIds.includes(q.id)) {

                index[key].questionIds.push(q.id);

            }

        });

    });

    _glossaryIndexCache =
    Object.values(index);

    return _glossaryIndexCache;

}

// 全用語を五十音（文字コード）順に並べて返す
function getAllGlossaryTerms() {

    const index = buildGlossaryIndex();

    return [...index].sort((a, b) =>

        a.term.localeCompare(b.term, "ja")

    );

}

// キーワードで用語を絞り込む（用語名の部分一致）
function searchGlossaryTerms(keyword) {

    const all = getAllGlossaryTerms();

    if (!keyword || keyword.trim() === "") {

        return all;

    }

    const kw = keyword.trim().toLowerCase();

    return all.filter(entry =>

        entry.term.toLowerCase().includes(kw)

    );

}

// 指定した用語に関連する問題の一覧（本文抜粋つき）を返す
function getQuestionsForGlossaryTerm(term) {

    const index = buildGlossaryIndex();

    const entry = index.find(e => e.term === term);

    if (!entry) {

        return [];

    }

    return entry.questionIds
        .map(id => questions.find(q => q.id === id))
        .filter(q => !!q);

}
