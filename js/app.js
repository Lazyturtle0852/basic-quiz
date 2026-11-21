import {
  loadQuestions,
  checkAnswer,
  getCorrectAnswerText,
  renderQuestion,
  getUserAnswer,
  disableInputs,
} from './quiz.js';
import { renderSummary } from './summary.js';

const screens = {
  start: document.getElementById('screen-start'),
  quiz: document.getElementById('screen-quiz'),
  summary: document.getElementById('screen-summary'),
};

const els = {
  totalQuestions: document.getElementById('total-questions'),
  categoryList: document.getElementById('category-list'),
  progressLabel: document.getElementById('progress-label'),
  categoryBadge: document.getElementById('category-badge'),
  progressFill: document.getElementById('progress-fill'),
  questionArea: document.getElementById('question-area'),
  feedbackArea: document.getElementById('feedback-area'),
  btnSubmit: document.getElementById('btn-submit'),
  btnNext: document.getElementById('btn-next'),
  btnStart: document.getElementById('btn-start'),
  btnRestart: document.getElementById('btn-restart'),
  summaryScore: document.getElementById('summary-score'),
  summaryMessage: document.getElementById('summary-message'),
  categoryChart: document.getElementById('category-chart'),
  weakAreas: document.getElementById('weak-areas'),
  wrongList: document.getElementById('wrong-list'),
};

let quizData = null;
let currentIndex = 0;
let results = [];
let answered = false;

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove('active'));
  screens[name].classList.add('active');
}

function initStartScreen() {
  const { meta, categories, questions } = quizData;
  els.totalQuestions.textContent = questions.length;
  els.categoryList.innerHTML = '';

  for (const [, info] of Object.entries(categories)) {
    const li = document.createElement('li');
    li.textContent = `${info.label}（${info.count}問）`;
    els.categoryList.appendChild(li);
  }
}

function updateProgress() {
  const total = quizData.questions.length;
  const current = currentIndex + 1;
  els.progressLabel.textContent = `${current} / ${total}`;
  els.progressFill.style.width = `${(current / total) * 100}%`;

  const q = quizData.questions[currentIndex];
  const catLabel = quizData.categories[q.category]?.label || q.category;
  els.categoryBadge.textContent = catLabel;
}

function showQuestion() {
  answered = false;
  const q = quizData.questions[currentIndex];
  renderQuestion(q, els.questionArea);
  updateProgress();

  els.feedbackArea.classList.add('hidden');
  els.feedbackArea.classList.remove('correct', 'incorrect');
  els.btnSubmit.classList.remove('hidden');
  els.btnNext.classList.add('hidden');
  els.btnSubmit.disabled = false;
}

function showFeedback(question, isCorrect, userAnswer) {
  answered = true;
  disableInputs(els.questionArea);

  els.feedbackArea.classList.remove('hidden');
  els.feedbackArea.classList.toggle('correct', isCorrect);
  els.feedbackArea.classList.toggle('incorrect', !isCorrect);

  const correctText = getCorrectAnswerText(question);
  const userText = question.type === 'choice' ? question.choices[Number(userAnswer)] : userAnswer;
  els.feedbackArea.innerHTML = `
    <p class="feedback-result">${isCorrect ? '正解！' : '不正解'}</p>
    ${!isCorrect ? `<p>あなたの回答: ${escapeHtml(String(userText ?? '（未回答）'))}</p><p>正解: ${escapeHtml(correctText)}</p>` : ''}
    <p class="feedback-explanation"><strong>解説</strong>${escapeHtml(question.explanation)}</p>
  `;

  els.btnSubmit.classList.add('hidden');
  els.btnNext.classList.remove('hidden');

  results.push({
    index: currentIndex,
    id: question.id,
    category: question.category,
    question: question.question.replace(/\\n/g, ' '),
    correct: isCorrect,
    userAnswer,
    correctAnswer: correctText,
    explanation: question.explanation,
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function handleSubmit() {
  if (answered) return;

  const question = quizData.questions[currentIndex];
  const userAnswer = getUserAnswer(els.questionArea);

  if (userAnswer === null || userAnswer === '') {
    alert('回答を選ぶか、入力してください。');
    return;
  }

  const isCorrect = checkAnswer(question, userAnswer);
  showFeedback(question, isCorrect, userAnswer);
}

function handleNext() {
  currentIndex++;
  if (currentIndex >= quizData.questions.length) {
    finishQuiz();
  } else {
    showQuestion();
  }
}

function finishQuiz() {
  renderSummary(results, quizData.categories, quizData.meta, {
    score: els.summaryScore,
    message: els.summaryMessage,
    chart: els.categoryChart,
    weakAreas: els.weakAreas,
    wrongList: els.wrongList,
  });
  showScreen('summary');
}

function startQuiz() {
  currentIndex = 0;
  results = [];
  els.weakAreas.className = 'weak-areas';
  els.weakAreas.style.background = '';
  els.weakAreas.style.borderColor = '';
  showScreen('quiz');
  showQuestion();
}

async function init() {
  try {
    quizData = await loadQuestions(document.body.dataset.questions);
    initStartScreen();
  } catch (err) {
    els.categoryList.innerHTML = `<li style="color:red">${err.message}</li>`;
    els.btnStart.disabled = true;
  }
}

els.btnStart.addEventListener('click', startQuiz);
els.btnSubmit.addEventListener('click', handleSubmit);
els.btnNext.addEventListener('click', handleNext);
els.btnRestart.addEventListener('click', () => {
  showScreen('start');
});

els.questionArea.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !answered) {
    handleSubmit();
  } else if (e.key === 'Enter' && answered) {
    handleNext();
  }
});

init();
