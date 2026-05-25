const state = {
  questions: [],
  filtered: [],
  index: 0,
  answers: JSON.parse(localStorage.getItem('quizAnswers') || '{}'),
  showAnswer: false,
};

const els = {
  status: document.getElementById('status'),
  questionView: document.getElementById('questionView'),
  questionId: document.getElementById('questionId'),
  questionText: document.getElementById('questionText'),
  choices: document.getElementById('choices'),
  answerBox: document.getElementById('answerBox'),
  searchInput: document.getElementById('searchInput'),
  jumpInput: document.getElementById('jumpInput'),
  jumpBtn: document.getElementById('jumpBtn'),
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn'),
  showAnswerBtn: document.getElementById('showAnswerBtn'),
  resetBtn: document.getElementById('resetBtn'),
  totalCount: document.getElementById('totalCount'),
  currentPosition: document.getElementById('currentPosition'),
  answeredCount: document.getElementById('answeredCount'),
  filterInfo: document.getElementById('filterInfo'),
};

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function getQuestionSearchText(question) {
  return [
    question.question_id,
    question.question_text,
    ...Object.entries(question.choices || {}).flat(),
    question.answer,
  ].join(' ');
}

function saveAnswers() {
  localStorage.setItem('quizAnswers', JSON.stringify(state.answers));
}

function applySearch() {
  const keyword = normalizeText(els.searchInput.value);
  state.filtered = keyword
    ? state.questions.filter((q) => normalizeText(getQuestionSearchText(q)).includes(keyword))
    : [...state.questions];
  state.index = 0;
  state.showAnswer = false;
  render();
}

function getCurrentQuestion() {
  return state.filtered[state.index];
}

function selectChoice(key) {
  const question = getCurrentQuestion();
  if (!question) return;
  state.answers[question.question_id] = key;
  state.showAnswer = true;
  saveAnswers();
  render();
}

function renderChoices(question) {
  els.choices.innerHTML = '';
  const selected = state.answers[question.question_id];
  const correctAnswers = String(question.answer || '').split('').map((x) => x.trim()).filter(Boolean);
  const entries = Object.entries(question.choices || {}).sort(([a], [b]) => a.localeCompare(b));

  entries.forEach(([key, text]) => {
    const choice = document.createElement('button');
    choice.type = 'button';
    choice.className = 'choice';
    choice.setAttribute('aria-label', `選項 ${key}`);

    const isSelected = selected === key;
    const isCorrect = correctAnswers.includes(key);
    if (isSelected) choice.classList.add('selected');
    if (state.showAnswer && isCorrect) choice.classList.add('correct');
    if (state.showAnswer && isSelected && !isCorrect) choice.classList.add('incorrect');

    choice.innerHTML = `<span class="choice-key">${key}</span><span>${text}</span>`;
    choice.addEventListener('click', () => selectChoice(key));
    els.choices.appendChild(choice);
  });
}

function render() {
  els.totalCount.textContent = state.questions.length;
  els.answeredCount.textContent = Object.keys(state.answers).length;

  if (!state.filtered.length) {
    els.status.textContent = state.questions.length ? '找不到符合條件的題目。' : '載入題庫中...';
    els.questionView.hidden = true;
    els.status.hidden = false;
    els.currentPosition.textContent = '0';
    els.prevBtn.disabled = true;
    els.nextBtn.disabled = true;
    return;
  }

  const question = getCurrentQuestion();
  els.status.hidden = true;
  els.questionView.hidden = false;
  els.questionId.textContent = `第 ${question.question_id} 題`;
  els.questionText.textContent = question.question_text;
  els.currentPosition.textContent = `${state.index + 1}/${state.filtered.length}`;
  els.filterInfo.textContent = state.filtered.length === state.questions.length ? '' : `搜尋結果 ${state.filtered.length} 題`;

  renderChoices(question);

  const answerText = `正確答案：${question.answer}`;
  els.answerBox.textContent = answerText;
  els.answerBox.hidden = !state.showAnswer;
  els.showAnswerBtn.textContent = state.showAnswer ? '隱藏答案' : '顯示答案';

  els.prevBtn.disabled = state.index <= 0;
  els.nextBtn.disabled = state.index >= state.filtered.length - 1;
}

async function loadQuestions() {
  try {
    const response = await fetch('questions.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    state.questions = Array.isArray(data) ? data : [];
    state.filtered = [...state.questions];
    render();
  } catch (error) {
    els.status.textContent = '題庫載入失敗。請確認 questions.json 與 index.html 位於同一層，並透過網站伺服器開啟。';
    console.error(error);
  }
}

els.searchInput.addEventListener('input', applySearch);
els.prevBtn.addEventListener('click', () => {
  state.index = Math.max(0, state.index - 1);
  state.showAnswer = false;
  render();
});
els.nextBtn.addEventListener('click', () => {
  state.index = Math.min(state.filtered.length - 1, state.index + 1);
  state.showAnswer = false;
  render();
});
els.showAnswerBtn.addEventListener('click', () => {
  state.showAnswer = !state.showAnswer;
  render();
});
els.resetBtn.addEventListener('click', () => {
  if (!confirm('確定要清除目前瀏覽器中的作答紀錄？')) return;
  state.answers = {};
  saveAnswers();
  render();
});
els.jumpBtn.addEventListener('click', () => {
  const id = Number(els.jumpInput.value);
  const foundIndex = state.filtered.findIndex((q) => Number(q.question_id) === id);
  if (foundIndex >= 0) {
    state.index = foundIndex;
    state.showAnswer = false;
    render();
  } else {
    alert('目前清單中找不到這個題號。若有使用搜尋，請先清除搜尋條件。');
  }
});
els.jumpInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') els.jumpBtn.click();
});

document.addEventListener('keydown', (event) => {
  if (event.target instanceof HTMLInputElement) return;
  if (event.key === 'ArrowLeft') els.prevBtn.click();
  if (event.key === 'ArrowRight') els.nextBtn.click();
  if (event.key.toLowerCase() === 'a') els.showAnswerBtn.click();
});

loadQuestions();
