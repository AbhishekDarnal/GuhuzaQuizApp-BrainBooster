"use client";
import React, { useState, useEffect } from "react";
import QuizCard from "./quizCard";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { toast } from "react-hot-toast";

type quizeType = {
question: string;
comment: string;
test_answer: number;
answers: string[];
};

export default function QuizPageSection({ Quizes, levelNumber, levelTitle, player }: any) {
const len = Quizes.length;
const router = useRouter();
const [score, setScore] = useState<number>(0);
const [questionNumber, setQuestionNumber] = useState(0);
const [selectedAnswer, setSelectedAnswer] = useState(-1);
const [answerChecked, setAnswerChecked] = useState(false);
const [ansCorrect, setAnsCorrect] = useState(false);
const [usedHint, setUsedHint] = useState(false);
const [retried, setRetried] = useState(false);
const [timeLeft, setTimeLeft] = useState(600);
const [showTimeUpModal, setShowTimeUpModal] = useState(false);
const [showIntroModal, setShowIntroModal] = useState(true);

const quizer: quizeType = Quizes[questionNumber];

const setDefault = () => {
setSelectedAnswer(-1);
setAnswerChecked(false);
setAnsCorrect(false);
setUsedHint(false);
setRetried(false);
};

useEffect(() => {
if (!showIntroModal) {
const timer = setInterval(() => {
setTimeLeft((prev) => prev - 1);
}, 1000);
return () => clearInterval(timer);
}
}, [showIntroModal]);

useEffect(() => {
if (timeLeft === 300) {
toast("⚠️ You only have 5 minutes left. The quiz will auto-submitted after 5 minutes.", {
duration: 6000,
position: "top-center",
});
}
if (timeLeft <= 0) {
handleAutoSubmit();
}
}, [timeLeft]);

const handleAutoSubmit = async () => {
setAnswerChecked(true);
if (player?.Player_ID) {
try {
const nextLevel = Number(levelNumber) + 1;
const finalScore = score + (player?.Playerpoint || 0);
const playerId = player?.Player_ID;
const newlevel = Math.max(player.Level_Id, nextLevel);

await fetch("/api/updateScore", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ playerId, finalScore, newlevel }),
});
} catch (err) {
console.error("Auto-save failed:", err);
}
}
setShowTimeUpModal(true);
setQuestionNumber(len);
};

const handleNextLevel = async () => {
if (!player.Playerpoint) {
setCookie("tempScore", score);
router.push("/");
} else {
const nextLevel = Number(levelNumber) + 1;
const finalScore = score + player?.Playerpoint;
const playerId = player?.Player_ID;
const newlevel = Math.max(player.Level_Id, nextLevel);

try {
const response = await fetch("/api/updateScore", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ playerId, finalScore, newlevel }),
});

if (response.ok) {
router.push(`/quiz/${newlevel}`);
} else {
const errorData = await response.json();
console.error("Update failed:", errorData.message);
}
} catch (error) {
console.error("An error occurred during update:", error);
}
}
};

const handleScore = () => {
setAnswerChecked(true);
if (selectedAnswer === quizer.test_answer) {
setScore(score + (retried ? 10 : 30));
}
};

const handleNextQuestion = () => {
if (questionNumber < len) {
setQuestionNumber(questionNumber + 1);
setDefault();
}
};

const handleRetry = () => {
setScore(0);
setQuestionNumber(0);
router.push("/quiz/" + levelNumber);
};

const handleShareScore = () => {
console.log(score, player, levelTitle);
};

return (
<>
{showIntroModal && (
<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
<div className="bg-white p-8 rounded-lg shadow-lg max-w-lg text-center">
<h2 className="text-2xl font-bold mb-4">🚀 Ready to Begin?</h2>
<p className="mb-6">
This Beginning Level quiz consists of 10 questions and lasts 10 minutes. 
Spend about 1 minute per question. Once completed, you cannot change it or go back.
The quiz will auto-submit when time is up.
</p>
<button
onClick={() => setShowIntroModal(false)}
className="quizPbtn px-6 py-2 text-white bg-blue-600 rounded-lg"
>
Start Quiz
</button>
</div>
</div>
)}

<div className={showIntroModal ? "blur-sm pointer-events-none select-none" : ""}>
{questionNumber < len ? (
<div className="md:py-16 pt-8 pb-28">
<div className="container flex justify-between flex-wrap">
<h2 className="md:mb-16 mb-4 title">
Level {levelNumber} : {levelTitle}
</h2>
<div className="text-right text-red-600 font-bold text-lg mb-2 w-full md:w-auto">
⏳ Time Left: {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
{(timeLeft % 60).toString().padStart(2, "0")}
</div>
<p className="mb-6">
Question : {questionNumber + 1}/{len}
</p>
</div>
<div className="container flex justify-start md:gap-20">
<div className="flex-1">
<QuizCard
Question={quizer.question}
CorrectAns={quizer.test_answer}
Answers={quizer.answers}
selectedAnswer={selectedAnswer}
setSelectedAnswer={setSelectedAnswer}
checked={answerChecked || timeLeft === 0}
setAnsCorrect={setAnsCorrect}
/>
<div className="mt-10">
{timeLeft === 0 ? (
<button className="quizPbtn opacity-50 cursor-not-allowed" disabled>
Time's up
</button>
) : answerChecked ? (
<div className="w-full">
{!ansCorrect ? (
<div>
<div className="flex gap-10">
<button
className="quizPbtn"
onClick={() => {
setSelectedAnswer(-1);
setAnswerChecked(false);
setRetried(true);
}}
disabled={usedHint}
>
Retry
</button>
<button
className="quizSbtn"
onClick={() => {
setSelectedAnswer(quizer.test_answer);
setUsedHint(true);
}}
>
Display Answer
</button>
</div>
<p className="mt-6 text-sm absolute">
You can use Display Answer to force move to next question without any point
</p>
</div>
) : (
<div className="flex">
<button
className="quizPbtn ml-auto"
onClick={handleNextQuestion}
>
{questionNumber < len - 1 ? "Next Question" : "Finish Quiz"}
</button>
</div>
)}
</div>
) : (
<button
className="quizPbtn"
onClick={handleScore}
disabled={selectedAnswer === -1}
>
Check Answer
</button>
)}
</div>
</div>
<div className="hidden md:block flex-1/2 w-100">
{answerChecked ? (
<Image
src={ansCorrect ? "/mascot/greetingMascot.svg" : "/mascot/sadMascot.svg"}
alt="Guhuza Mascot"
height={100}
width={200}
/>
) : (
<Image
src="/mascot/proudMascot.svg"
alt="Guhuza Mascot"
height={100}
width={200}
/>
)}
</div>
</div>
</div>
) : (
<div className="md:py-16 py-8">
<div className="container">
<div className="flex flex-col items-center">
<h1 className="title text-center">Lesson Complete!</h1>
<div className="flex flex-wrap-reverse justify-center gap-8 items-center">
<div className="flex flex-col gap-8 mt-6 justify-center">
<div className="bg-yellow-50 rounded border-2 border-yellow-300 gap-4 flex flex-col items-center px-6 py-4">
<p className="mt-4 text-xl">⭐ PTS GAINED</p>
<h1 className="text-6xl font-bold">{score}</h1>
</div>
<div className="bg-blue-50 rounded border-2 border-blue-100 flex flex-col gap-4 items-center px-6 py-4">
<p className="mt-4 text-xl">🏆 TOTAL SCORE</p>
<h1 className="text-6xl font-bold">
{player?.Playerpoint ? player?.Playerpoint + score : score}
</h1>
</div>
</div>
<Image
src={"/mascot/proudMascot.svg"}
className="mt-8"
width={250}
alt="Guhuza Bird"
height={30}
/>
</div>
<button className="quizPbtn mt-20" onClick={handleNextLevel}>
Save Score
</button>
<div className="flex flex-wrap justify-center gap-6 mt-8">
<button className="flex gap-4" onClick={handleRetry}>
🔁 Retry Same Lesson
</button>
<button className="flex gap-4" onClick={handleShareScore}>
📤 Share Score on Social Media
</button>
</div>
</div>
</div>
</div>
)}
</div>

{showTimeUpModal && (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
<div className="bg-white rounded-xl p-8 text-center shadow-xl max-w-md w-full">
<h2 className="text-2xl font-bold text-red-600 mb-4">⏰ Time's Up!</h2>
<p className="text-gray-700 mb-6">
Your quiz time has ended. Your score has been saved.
</p>
<button className="quizPbtn" onClick={() => setShowTimeUpModal(false)}>
Close
</button>
</div>
</div>
)}
</>
);
}
