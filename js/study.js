

// -------------------------------
// Progress
// -------------------------------

const progress = loadProgress();

const studyMode =
sessionStorage.getItem("studyMode") || "normal";

// -------------------------------
// Question List
// -------------------------------

let studyQuestions = [...questions];

switch(studyMode){

    case "weak":

        studyQuestions = questions.filter(q=>

            progress.weakQuestions.includes(q.id)

        );

        break;

    case "favorite":

        studyQuestions = questions.filter(q=>

            progress.favoriteQuestions.includes(q.id)

        );

        break;

    case "category":

        const studyCategory =
        sessionStorage.getItem("studyCategory");

        studyQuestions = questions.filter(q=>

            q.category === studyCategory

        );

        break;

    case "random":

        studyQuestions = [...questions];

        for(let i=studyQuestions.length-1;i>0;i--){

            const j=Math.floor(Math.random()*(i+1));

            [studyQuestions[i],studyQuestions[j]]=
            [studyQuestions[j],studyQuestions[i]];

        }

        break;

    default:

        break;

}

if(studyQuestions.length===0){

    alert("問題がありません。");

    location.href="../index.html";

    throw new Error("STOP_NO_QUESTIONS");

}

// -------------------------------
// Current Status
// -------------------------------

let current =
Math.min(
    progress.current,
    studyQuestions.length-1
);

let correctCount =
progress.correct || 0;

let totalAnswered =
progress.totalAnswered || 0;

// ===============================
// Elements
// ===============================

const number =
document.getElementById("questionNumber");

const category =
document.getElementById("category");

const text =
document.getElementById("questionText");

const choices =
document.getElementById("choices");

const nextBtn =
document.getElementById("nextBtn");

const result =
document.getElementById("result");

const resultTitle =
document.getElementById("resultTitle");

const correctArea =
document.getElementById("correctArea");

const choiceArea =
document.getElementById("choiceArea");

const examArea =
document.getElementById("examArea");

const mistakeArea =
document.getElementById("mistakeArea");

const similarArea =
document.getElementById("similarArea");

const deepDiveArea =
document.getElementById("deepDiveArea");

const scoreText =
document.getElementById("scoreText");

const progressBar =
document.getElementById("progressBar");

// ===============================
// Initialize
// ===============================

if(current >= studyQuestions.length){

    current = 0;

}

showQuestion();

// ===============================
// Show Question
// ===============================

function showQuestion(){

    if(current >= studyQuestions.length){

        current = 0;

    }

    const q = studyQuestions[current];

    number.textContent =
    `問題 ${current + 1} / ${studyQuestions.length}`;

    const stars =
    "★".repeat(q.level);

    category.textContent =
    `${q.category}　${stars}`;

    text.textContent =
    q.question;

    choices.innerHTML = "";

    result.style.display = "none";

    q.choices.forEach((choice,index)=>{

        const button =
        document.createElement("button");

        button.className = "choice";

        button.textContent = choice;

        button.onclick = ()=>{

            answer(index);

        };

        choices.appendChild(button);

    });

    scoreText.textContent =
    `${correctCount} / ${totalAnswered} 正解`;

    progressBar.style.width =
    `${current / studyQuestions.length * 100}%`;

}

 // ===============================
// Answer
// ===============================

function answer(index){

    const q = studyQuestions[current];

    const buttons =
    document.querySelectorAll(".choice");

    // 二重回答防止
    buttons.forEach(button=>{

        button.disabled = true;

    });

    // 正解を緑表示
    buttons[q.answer].classList.add("correct");

    // 選択した答えが違う場合は赤表示
    if(index !== q.answer){

        buttons[index].classList.add("wrong");

    }

    // 結果表示
    result.style.display = "block";

    if(index === q.answer){

        correctCount++;
        totalAnswered++;

        result.className = "result correct";

        resultTitle.textContent = "⭕ 正解！";

    }else{

        totalAnswered++;

        if(!progress.weakQuestions.includes(q.id)){

            progress.weakQuestions.push(q.id);

        }

        result.className = "result wrong";

        resultTitle.textContent = "❌ 不正解";

    }

    // ===============================
    // 解説表示
    // ===============================

    if(typeof q.explanation === "string"){

        // 旧データ形式対応
        correctArea.textContent = q.explanation;

        choiceArea.innerHTML = "";
        examArea.innerHTML = "";
        mistakeArea.innerHTML = "";
        similarArea.innerHTML = "";
        deepDiveArea.innerHTML = "";

    }else{

        // 正解の理由
        correctArea.textContent =
        q.explanation.correct;

        // もっと詳しく（周辺知識・任意項目。正解の理由に続けて表示）
        deepDiveArea.innerHTML = "";

        if (q.explanation.deepDive) {

            q.explanation.deepDive.forEach(block=>{

                const wrapper =
                document.createElement("div");

                wrapper.className = "deepDiveBlock";

                if (block.heading) {

                    const h4 =
                    document.createElement("h4");

                    h4.textContent = block.heading;

                    wrapper.appendChild(h4);

                }

                if (block.text) {

                    const p =
                    document.createElement("p");

                    p.textContent = block.text;

                    wrapper.appendChild(p);

                }

                if (Array.isArray(block.list)) {

                    const ul =
                    document.createElement("ul");

                    block.list.forEach(item=>{

                        const li =
                        document.createElement("li");

                        li.textContent = item;

                        ul.appendChild(li);

                    });

                    wrapper.appendChild(ul);

                }

                deepDiveArea.appendChild(wrapper);

            });

        }

        // 各選択肢の解説
        choiceArea.innerHTML = "";

        q.explanation.choiceExplanation.forEach((item,i)=>{

            const div =
            document.createElement("div");

            div.className = "choiceExplanation";

            div.innerHTML =
            `<strong>${i+1}.</strong> ${item}`;

            choiceArea.appendChild(div);

        });

        // 試験ポイント
        examArea.innerHTML = "";

        q.explanation.examPoint.forEach(point=>{

            const li =
            document.createElement("li");

            li.textContent = point;

            examArea.appendChild(li);

        });

        // よくある勘違い
        mistakeArea.textContent =
        q.explanation.mistake;

        // 類題
        similarArea.innerHTML = "";

        q.explanation.similar.forEach(item=>{

            const li =
            document.createElement("li");

            li.textContent = item;

            similarArea.appendChild(li);

        });

    }

    // ===============================
    // 保存
    // ===============================

    progress.current = current;
progress.correct = correctCount;
progress.totalAnswered = totalAnswered;
progress.lastStudy = new Date().toISOString();

progress.studyHistory.push({
    id: q.id,
    correct: index === q.answer,
    level: progress.understanding[q.id] || null,
    date: new Date().toISOString()
});

if (progress.studyHistory.length > 5000) {
    progress.studyHistory.shift();
}

saveProgress(progress);

}

// ===============================
// Next Question
// ===============================

nextBtn.onclick = () => {

    current++;

    progress.current = current;
    progress.correct = correctCount;
    progress.totalAnswered = totalAnswered;
    progress.lastStudy = new Date().toISOString();

    saveProgress(progress);

    if (current >= studyQuestions.length) {

        const rate =
            totalAnswered === 0
                ? 0
                : Math.round(correctCount / totalAnswered * 100);

        alert(
`学習終了！

正答数
${correctCount} / ${totalAnswered}

正答率
${rate}%`
        );

        progress.current = 0;
progress.correct = correctCount;
progress.totalAnswered = totalAnswered;

saveProgress(progress);

location.href = "../index.html";

    }

    showQuestion();

};

// ===============================
// Understanding Buttons
// ===============================

const understandGood =
document.getElementById("understandGood");

const understandNormal =
document.getElementById("understandNormal");

const understandBad =
document.getElementById("understandBad");

function setUnderstanding(level){

    const qId = studyQuestions[current].id;

    progress.understanding[qId] = level;

    progress.lastStudy = new Date().toISOString();

    saveProgress(progress);

}

if (understandGood) {

    understandGood.onclick = () => {

        setUnderstanding("good");

    };

}

if (understandNormal) {

    understandNormal.onclick = () => {

        setUnderstanding("normal");

    };

}

if (understandBad) {

    understandBad.onclick = () => {

        setUnderstanding("bad");

        if (!progress.weakQuestions.includes(studyQuestions[current].id)) {

            progress.weakQuestions.push(
                studyQuestions[current].id
            );

            saveProgress(progress);

        }

    };

}