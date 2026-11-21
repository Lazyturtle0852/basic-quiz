const CATEGORY_TIPS = {
  cli: 'cd / ls と絶対パス・相対パスの違いを復習しましょう',
  html: 'a タグ・form の name 属性（params との対応）を確認しましょう',
  css: 'セレクタ（class）と padding/margin の違いを復習しましょう',
  ruby: '変数・条件分岐・each・def メソッド定義をもう一度確認しましょう',
  sinatra: 'app.rb、erb/<%= @var %>、post+params、redirect の流れを復習しましょう',
};

function getLevel(rate) {
  if (rate >= 80) return { label: 'OK', class: 'ok' };
  if (rate >= 60) return { label: 'もう一度確認', class: 'review' };
  return { label: '要復習', class: 'weak' };
}

export function computeCategoryStats(results, categories) {
  const stats = {};

  for (const [key, info] of Object.entries(categories)) {
    stats[key] = { label: info.label, correct: 0, total: 0 };
  }

  for (const r of results) {
    if (stats[r.category]) {
      stats[r.category].total++;
      if (r.correct) stats[r.category].correct++;
    }
  }

  return stats;
}

export function renderSummary(results, categories, meta, elements) {
  const msg = meta?.messages || {};
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const rate = total > 0 ? Math.round((correct / total) * 100) : 0;

  elements.score.textContent = `${correct} / ${total} 問正解（${rate}%）`;

  if (rate >= 80) {
    elements.message.textContent = msg.high || 'よくできました！Basic コースの内容はしっかり身についています。';
  } else if (rate >= 60) {
    elements.message.textContent = msg.mid || 'おおむね理解できています。苦手分野を中心にもう一度復習してみましょう。';
  } else {
    elements.message.textContent = msg.low || '復習のチャンスです。解説を読みながら、もう一度挑戦してみましょう。';
  }

  const stats = computeCategoryStats(results, categories);
  elements.chart.innerHTML = '<h3>カテゴリ別スコア</h3>';

  const weakList = [];

  for (const [key, stat] of Object.entries(stats)) {
    if (stat.total === 0) continue;

    const catRate = Math.round((stat.correct / stat.total) * 100);
    const level = getLevel(catRate);

    const row = document.createElement('div');
    row.className = 'chart-row';
    row.innerHTML = `
      <div class="chart-label">
        <span>${stat.label}</span>
        <span>${stat.correct}/${stat.total}（${catRate}%）${level.label}</span>
      </div>
      <div class="chart-bar-bg">
        <div class="chart-bar-fill ${level.class}" style="width: ${catRate}%"></div>
      </div>
    `;
    elements.chart.appendChild(row);

    if (catRate < 80) {
      weakList.push({ label: stat.label, tip: categories[key].tip || CATEGORY_TIPS[key] || '' });
    }
  }

  elements.weakAreas.innerHTML = '';
  if (weakList.length > 0) {
    elements.weakAreas.innerHTML = '<h3>苦手分野のアドバイス</h3><ul></ul>';
    const ul = elements.weakAreas.querySelector('ul');
    for (const item of weakList) {
      const li = document.createElement('li');
      li.textContent = `${item.label}：${item.tip}`;
      ul.appendChild(li);
    }
  } else {
    elements.weakAreas.innerHTML = `<h3>すべてのカテゴリで良好です</h3><p>${escapeHtml(msg.allGood || 'この調子で Step Up コースに進みましょう。')}</p>`;
    elements.weakAreas.classList.remove('weak-areas');
    elements.weakAreas.style.background = '#d4edda';
    elements.weakAreas.style.borderColor = '#28a745';
  }

  const wrong = results.filter((r) => !r.correct);
  elements.wrongList.innerHTML = '';

  if (wrong.length === 0) {
    elements.wrongList.innerHTML = '<h3>間違えた問題</h3><p>全問正解です！</p>';
  } else {
    elements.wrongList.innerHTML = '<h3>間違えた問題</h3>';
    wrong.forEach((r, i) => {
      const div = document.createElement('div');
      div.className = 'wrong-item';
      div.innerHTML = `
        <div class="q-num">問題 ${r.index + 1} · ${categories[r.category]?.label || r.category}</div>
        <div class="q-text">${escapeHtml(r.question)}</div>
        <p class="explanation">正解: ${escapeHtml(r.correctAnswer)}<br>${escapeHtml(r.explanation)}</p>
      `;
      elements.wrongList.appendChild(div);
    });
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
