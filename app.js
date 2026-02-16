// ===== Wellness Checker App =====

let currentAnswers = {};
let activeSection = null;

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initializeSelectors();
    buildQuiz();
    attachListeners();
    updateHistory();
    tryLoadCurrentMonth();
});

// ===== Selectors =====
function initializeSelectors() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    monthSelect.value = String(currentMonth).padStart(2, '0');

    for (let y = currentYear - 3; y <= currentYear + 1; y++) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        if (y === currentYear) opt.selected = true;
        yearSelect.appendChild(opt);
    }
}

// ===== Build Quiz =====
function buildQuiz() {
    const container = document.getElementById('quizSections');
    container.innerHTML = '';

    CATEGORIES.forEach((cat, catIdx) => {
        const section = document.createElement('section');
        section.className = 'card quiz-section';
        section.dataset.category = cat.key;

        section.innerHTML = `
            <div class="section-header" onclick="toggleQuizSection('${cat.key}')">
                <h2 class="section-title">
                    <span class="icon">${cat.icon}</span>
                    ${cat.label}
                </h2>
                <div class="section-meta">
                    <span class="section-score" id="score-${cat.key}">0/25</span>
                    <span class="toggle-icon">▼</span>
                </div>
            </div>
            <div class="section-content" id="content-${cat.key}">
                ${cat.questions.map((q, qIdx) => `
                    <div class="question-item">
                        <p class="question-text">${catIdx * 5 + qIdx + 1}. ${q}</p>
                        <div class="rating-buttons" id="rating-${cat.key}-${qIdx}">
                            ${[1, 2, 3, 4, 5].map(r => `
                                <button class="rating-btn" 
                                        data-category="${cat.key}" 
                                        data-question="${qIdx}" 
                                        data-rating="${r}"
                                        onclick="setRating('${cat.key}', ${qIdx}, ${r})"
                                        title="${RATING_LABELS[r]}">
                                    <span class="rating-number">${r}</span>
                                    <span class="rating-label">${RATING_LABELS[r]}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        container.appendChild(section);
    });
}

// ===== Toggle Section =====
function toggleQuizSection(key) {
    const section = document.querySelector(`.quiz-section[data-category="${key}"]`);
    if (activeSection && activeSection !== key) {
        const prev = document.querySelector(`.quiz-section[data-category="${activeSection}"]`);
        if (prev) prev.classList.remove('expanded');
    }
    section.classList.toggle('expanded');
    activeSection = section.classList.contains('expanded') ? key : null;
}

// ===== Set Rating =====
function setRating(categoryKey, questionIdx, rating) {
    if (!currentAnswers[categoryKey]) {
        currentAnswers[categoryKey] = {};
    }
    currentAnswers[categoryKey][questionIdx] = rating;

    // Update button states
    const container = document.getElementById(`rating-${categoryKey}-${questionIdx}`);
    container.querySelectorAll('.rating-btn').forEach(btn => {
        const btnRating = parseInt(btn.dataset.rating);
        btn.classList.toggle('selected', btnRating === rating);
        btn.classList.toggle('below-selected', btnRating < rating);
    });

    updateCategoryScore(categoryKey);
    updateResults();
}

// ===== Update Category Score =====
function updateCategoryScore(categoryKey) {
    const answers = currentAnswers[categoryKey] || {};
    let total = 0;
    Object.values(answers).forEach(v => total += v);
    const el = document.getElementById(`score-${categoryKey}`);
    const answeredCount = Object.keys(answers).length;
    el.textContent = `${total}/25`;

    if (answeredCount === 5) {
        const level = getScoreLevel(total);
        el.style.color = level.color;
    } else {
        el.style.color = '';
    }
}

// ===== Update Results =====
function updateResults() {
    const scores = [];
    let totalScore = 0;
    let totalAnswered = 0;

    CATEGORIES.forEach(cat => {
        const answers = currentAnswers[cat.key] || {};
        let catTotal = 0;
        Object.values(answers).forEach(v => catTotal += v);
        scores.push({ key: cat.key, label: cat.label, score: catTotal, color: cat.color, icon: cat.icon });
        totalScore += catTotal;
        totalAnswered += Object.keys(answers).length;
    });

    // Update overall score
    const maxScore = 225;
    const overallPercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    document.getElementById('overallScore').textContent = totalScore;
    document.getElementById('overallMax').textContent = maxScore;
    document.getElementById('overallPercent').textContent = overallPercent + '%';
    document.getElementById('questionsAnswered').textContent = `${totalAnswered}/45 answered`;

    // Update progress ring
    const ring = document.getElementById('progressRing');
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (overallPercent / 100) * circumference;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = offset;

    // Set ring color based on overall
    const avgScore = totalAnswered > 0 ? (totalScore / 9) : 0;
    const overallLevel = getScoreLevel(Math.round(avgScore));
    ring.style.stroke = overallLevel.color;

    // Update wellness wheel
    drawWellnessWheel(scores);

    // Update category results
    updateCategoryResults(scores);

    // Update feedback
    updateFeedback(scores);
}

// ===== Draw Wellness Wheel (SVG Radar Chart) =====
function drawWellnessWheel(scores) {
    const svg = document.getElementById('wellnessWheel');
    const cx = 200, cy = 200, maxR = 160;
    const n = scores.length;
    const angleStep = (2 * Math.PI) / n;

    // Clear previous data polygon
    const existingPolygon = svg.querySelector('.data-polygon');
    if (existingPolygon) existingPolygon.remove();
    const existingDots = svg.querySelectorAll('.data-dot');
    existingDots.forEach(d => d.remove());

    // Draw grid circles and labels (only once)
    if (!svg.querySelector('.grid-circle')) {
        // Grid circles at 5, 10, 15, 20, 25
        [5, 10, 15, 20, 25].forEach(val => {
            const r = (val / 25) * maxR;
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', cx);
            circle.setAttribute('cy', cy);
            circle.setAttribute('r', r);
            circle.setAttribute('class', 'grid-circle');
            svg.appendChild(circle);

            // Grid value label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', cx + 4);
            text.setAttribute('y', cy - r + 12);
            text.setAttribute('class', 'grid-label');
            text.textContent = val;
            svg.appendChild(text);
        });

        // Axis lines and category labels
        scores.forEach((s, i) => {
            const angle = angleStep * i - Math.PI / 2;
            const x2 = cx + maxR * Math.cos(angle);
            const y2 = cy + maxR * Math.sin(angle);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', cx);
            line.setAttribute('y1', cy);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('class', 'grid-line');
            svg.appendChild(line);

            // Category label
            const labelR = maxR + 35;
            const lx = cx + labelR * Math.cos(angle);
            const ly = cy + labelR * Math.sin(angle);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', lx);
            label.setAttribute('y', ly);
            label.setAttribute('class', 'category-label');
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('dominant-baseline', 'middle');
            label.textContent = `${s.icon} ${s.label}`;
            svg.appendChild(label);
        });
    }

    // Draw data polygon
    const points = scores.map((s, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const r = (s.score / 25) * maxR;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points);
    polygon.setAttribute('class', 'data-polygon');
    svg.appendChild(polygon);

    // Draw data dots
    scores.forEach((s, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const r = (s.score / 25) * maxR;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);

        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', y);
        dot.setAttribute('r', 4);
        dot.setAttribute('class', 'data-dot');
        dot.setAttribute('fill', s.color);
        svg.appendChild(dot);
    });
}

// ===== Update Category Results =====
function updateCategoryResults(scores) {
    const container = document.getElementById('categoryResults');
    container.innerHTML = scores.map(s => {
        const level = getScoreLevel(s.score);
        const percent = (s.score / 25) * 100;
        return `
            <div class="result-item">
                <div class="result-header">
                    <span class="result-icon">${s.icon}</span>
                    <span class="result-label">${s.label}</span>
                    <span class="result-score" style="color: ${level.color}">${s.score}/25</span>
                </div>
                <div class="result-bar">
                    <div class="result-progress" style="width: ${percent}%; background: ${s.color}"></div>
                </div>
                <span class="result-level" style="color: ${level.color}; background: ${level.bgColor}">${level.label}</span>
            </div>
        `;
    }).join('');
}

// ===== Update Feedback =====
function updateFeedback(scores) {
    const container = document.getElementById('feedbackList');

    // Sort: worst scores first
    const sorted = [...scores].sort((a, b) => a.score - b.score);
    const topConcerns = sorted.filter(s => s.score < 21).slice(0, 3);
    const strengths = sorted.filter(s => s.score >= 21);

    let html = '';

    if (topConcerns.length > 0) {
        html += '<h3 class="feedback-heading">🎯 Areas to Focus On</h3>';
        topConcerns.forEach(s => {
            const cat = CATEGORIES.find(c => c.key === s.key);
            const levelKey = getScoreLevelKey(s.score);
            const tip = cat.tips[levelKey];
            const level = getScoreLevel(s.score);
            html += `
                <div class="feedback-item" style="border-left-color: ${level.color}">
                    <div class="feedback-category">${s.icon} ${s.label} — <span style="color: ${level.color}">${level.label}</span></div>
                    <p class="feedback-tip">${tip}</p>
                </div>
            `;
        });
    }

    if (strengths.length > 0) {
        html += '<h3 class="feedback-heading">💪 Your Strengths</h3>';
        strengths.forEach(s => {
            const cat = CATEGORIES.find(c => c.key === s.key);
            html += `
                <div class="feedback-item strength" style="border-left-color: ${s.color}">
                    <div class="feedback-category">${s.icon} ${s.label} — <span style="color: #22c55e">Excellent</span></div>
                    <p class="feedback-tip">${cat.tips.excellent}</p>
                </div>
            `;
        });
    }

    if (html === '') {
        html = '<p class="no-data">Answer the quiz questions to see personalized feedback.</p>';
    }

    container.innerHTML = html;
}

// ===== Attach Listeners =====
function attachListeners() {
    document.getElementById('saveBtn').addEventListener('click', saveData);
    document.getElementById('loadBtn').addEventListener('click', loadData);
    document.getElementById('resetBtn').addEventListener('click', resetQuiz);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

// ===== Save Data =====
function saveData() {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    saveWellnessData(year, month, currentAnswers);
    updateHistory();
    showToast(`Saved wellness check for ${getMonthName(month)} ${year}`);

    // Trigger cloud sync if enabled
    if (typeof CloudSync !== 'undefined' && CloudSync.syncEnabled) {
        CloudSync.pushToCloud();
    }
}

// ===== Load Data =====
function loadData() {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const data = loadWellnessData(year, month);
    if (data) {
        delete data.savedAt;
        currentAnswers = data;
        restoreAnswers();
        updateResults();
        showToast(`Loaded wellness check for ${getMonthName(month)} ${year}`);
    } else {
        showToast(`No data found for ${getMonthName(month)} ${year}`);
    }
}

// ===== Try Load Current Month =====
function tryLoadCurrentMonth() {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const data = loadWellnessData(year, month);
    if (data) {
        delete data.savedAt;
        currentAnswers = data;
        restoreAnswers();
    }
    updateResults();
}

// ===== Restore Answers to UI =====
function restoreAnswers() {
    // Clear all selections first
    document.querySelectorAll('.rating-btn').forEach(btn => {
        btn.classList.remove('selected', 'below-selected');
    });

    Object.keys(currentAnswers).forEach(catKey => {
        const catAnswers = currentAnswers[catKey];
        Object.keys(catAnswers).forEach(qIdx => {
            const rating = catAnswers[qIdx];
            const container = document.getElementById(`rating-${catKey}-${qIdx}`);
            if (container) {
                container.querySelectorAll('.rating-btn').forEach(btn => {
                    const btnRating = parseInt(btn.dataset.rating);
                    btn.classList.toggle('selected', btnRating === rating);
                    btn.classList.toggle('below-selected', btnRating < rating);
                });
            }
        });
        updateCategoryScore(catKey);
    });
}

// ===== Reset Quiz =====
function resetQuiz() {
    if (confirm('Reset all answers? This will clear your current responses.')) {
        currentAnswers = {};
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.classList.remove('selected', 'below-selected');
        });
        CATEGORIES.forEach(cat => updateCategoryScore(cat.key));
        updateResults();
        showToast('Quiz reset');
    }
}

// ===== Update History =====
function updateHistory() {
    const container = document.getElementById('historyList');
    const months = getSavedWellnessMonths();

    if (months.length === 0) {
        container.innerHTML = '<p class="no-data">No saved assessments yet</p>';
        return;
    }

    container.innerHTML = months.map(({ year, month }) => {
        const data = loadWellnessData(year, month);
        let total = 0;
        if (data) {
            Object.keys(data).forEach(catKey => {
                if (catKey === 'savedAt') return;
                Object.values(data[catKey]).forEach(v => total += v);
            });
        }
        return `
            <div class="history-item" onclick="loadHistoryMonth('${year}', '${month}')">
                <span class="history-month">${getMonthName(month)} ${year}</span>
                <span class="history-score">${total}/225</span>
                <button class="history-delete" onclick="deleteHistory(event, '${year}', '${month}')" title="Delete">🗑️</button>
            </div>
        `;
    }).join('');
}

function loadHistoryMonth(year, month) {
    document.getElementById('yearSelect').value = year;
    document.getElementById('monthSelect').value = month;
    loadData();
}

function deleteHistory(event, year, month) {
    event.stopPropagation();
    if (confirm(`Delete wellness check for ${getMonthName(month)} ${year}?`)) {
        deleteWellnessData(year, month);
        updateHistory();
        showToast(`Deleted ${getMonthName(month)} ${year}`);
    }
}

// ===== Toast =====
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.querySelector('.toast-message').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== Theme =====
const THEME_KEY = 'wellness_theme';

function initializeTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light') {
        document.body.classList.add('light-theme');
        document.getElementById('themeToggle').textContent = '☀️';
    }
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    document.getElementById('themeToggle').textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
}

initializeTheme();
