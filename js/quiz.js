export async function loadQuestions(path = 'data/questions.json') {
  const res = await fetch(path);
  if (!res.ok) throw new Error('問題データの読み込みに失敗しました');
  return res.json();
}

export function checkAnswer(question, userAnswer) {
  if (question.type === 'choice') {
    return Number(userAnswer) === question.answer;
  }

  if (question.type === 'text') {
    const normalized = normalizeTextAnswer(userAnswer);
    return question.answer.some(
      (a) => normalizeTextAnswer(a) === normalized
    );
  }

  return false;
}

function normalizeTextAnswer(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/^:/, '');
}

export function getCorrectAnswerText(question) {
  if (question.type === 'choice') {
    return question.choices[question.answer];
  }
  if (question.type === 'text') {
    return question.answer[0];
  }
  return '';
}

export function renderQuestion(question, container) {
  container.innerHTML = '';

  const textEl = document.createElement('p');
  textEl.className = 'question-text';
  textEl.textContent = question.question;
  container.appendChild(textEl);

  if (question.code) {
    const pre = document.createElement('pre');
    pre.className = 'question-code';
    pre.textContent = question.code;
    container.appendChild(pre);
  }

  if (question.type === 'choice') {
    const ul = document.createElement('ul');
    ul.className = 'choices';

    question.choices.forEach((choice, i) => {
      const li = document.createElement('li');
      const label = document.createElement('label');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'answer';
      radio.value = String(i);

      const span = document.createElement('span');
      span.textContent = choice;
      if (choice.includes('\n')) span.className = 'choice-code';

      label.appendChild(radio);
      label.appendChild(span);
      li.appendChild(label);
      ul.appendChild(li);

      radio.addEventListener('change', () => {
        ul.querySelectorAll('label').forEach((l) => l.classList.remove('selected'));
        label.classList.add('selected');
      });
    });

    container.appendChild(ul);
  } else if (question.type === 'text') {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'text-input';
    input.name = 'answer';
    input.placeholder = '空欄に入る語句を入力';
    input.autocomplete = 'off';
    input.spellcheck = false;
    container.appendChild(input);
    input.focus();
  }
}

export function getUserAnswer(container) {
  const radio = container.querySelector('input[name="answer"]:checked');
  if (radio) return radio.value;

  const textInput = container.querySelector('.text-input');
  if (textInput) return textInput.value;

  return null;
}

export function disableInputs(container) {
  container.querySelectorAll('input').forEach((input) => {
    input.disabled = true;
  });
  container.querySelectorAll('label').forEach((label) => {
    label.style.cursor = 'default';
  });
}
