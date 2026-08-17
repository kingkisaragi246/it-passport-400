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