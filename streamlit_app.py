import streamlit as st
import json

st.set_page_config(
    page_title="Wellness Checker",
    page_icon="🧘",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Hide Streamlit's default UI for a clean app experience
st.markdown("""
<style>
    #MainMenu {visibility: hidden;}
    header {visibility: hidden;}
    footer {visibility: hidden;}
    .stApp > header {display: none;}
    .block-container {
        padding: 0 !important;
        max-width: 100% !important;
    }
    iframe {
        border: none !important;
    }
</style>
""", unsafe_allow_html=True)

# Read Firebase config from Streamlit secrets
firebase_config = dict(st.secrets["firebase"])

# Read all source files
def read_file(path):
    with open(path, 'r') as f:
        return f.read()

data_js = read_file('data.js')
app_js = read_file('app.js')
crypto_js = read_file('crypto.js')
sync_js = read_file('sync.js')
styles_css = read_file('styles.css')

# Read index.html and extract the body content
index_html = read_file('index.html')

# Build the firebase config JS dynamically from secrets
firebase_config_js = f"""
const firebaseConfig = {json.dumps(firebase_config)};

let app, auth, db;

function initializeFirebase() {{
    try {{
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        console.log('Firebase initialized successfully');
        return true;
    }} catch (error) {{
        console.error('Firebase initialization error:', error);
        return false;
    }}
}}

function isFirebaseConfigured() {{
    return firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10;
}}
"""

# Build a single self-contained HTML page
html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wellness Checker</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
    <style>
{styles_css}
    </style>
</head>
<body>
    <div class="app-container">
        <header class="header">
            <div class="header-content">
                <h1 class="logo">🧘 Wellness Checker</h1>
                <div class="header-controls">
                    <select id="monthSelect">
                        <option value="01">January</option>
                        <option value="02">February</option>
                        <option value="03">March</option>
                        <option value="04">April</option>
                        <option value="05">May</option>
                        <option value="06">June</option>
                        <option value="07">July</option>
                        <option value="08">August</option>
                        <option value="09">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                    </select>
                    <select id="yearSelect"></select>
                    <button id="loadBtn" class="btn btn-secondary">Load</button>
                    <button id="saveBtn" class="btn btn-primary">Save</button>
                    <button id="resetBtn" class="btn btn-danger" title="Reset Quiz">↺</button>
                    <button id="themeToggle" class="theme-toggle" title="Toggle Theme">🌙</button>
                </div>
                <div class="sync-container">
                    <button id="syncBtn" class="btn btn-sync" title="Cloud Sync">☁️ Sign In</button>
                    <span id="syncStatus" class="sync-status offline">Offline</span>
                    <span id="userInfo" class="user-info"></span>
                </div>
            </div>
        </header>

        <main class="main-content">
            <div class="quiz-column">
                <div class="quiz-intro card">
                    <h2>📋 Self-Care Assessment Quiz</h2>
                    <p>Rate each statement on a scale of 1 (Never) to 5 (Routinely). Be honest — there are no right or wrong answers.</p>
                    <div class="rating-legend">
                        <span class="legend-item">1 = Never</span>
                        <span class="legend-item">2 = Rarely</span>
                        <span class="legend-item">3 = Sometimes</span>
                        <span class="legend-item">4 = Often</span>
                        <span class="legend-item">5 = Routinely</span>
                    </div>
                </div>
                <div id="quizSections"></div>
            </div>

            <div class="results-column">
                <section class="card overall-section">
                    <h2 class="section-title"><span class="icon">🏆</span> Overall Wellness</h2>
                    <div class="overall-score">
                        <div class="score-ring">
                            <svg viewBox="0 0 120 120">
                                <circle class="ring-bg" cx="60" cy="60" r="54" />
                                <circle class="ring-progress" id="progressRing" cx="60" cy="60" r="54" transform="rotate(-90 60 60)" />
                            </svg>
                            <div class="ring-text"><span class="ring-percent" id="overallPercent">0%</span></div>
                        </div>
                        <div class="score-details">
                            <div class="score-line"><span>Score</span><strong><span id="overallScore">0</span>/<span id="overallMax">225</span></strong></div>
                            <div class="score-line muted"><span id="questionsAnswered">0/45 answered</span></div>
                        </div>
                    </div>
                </section>

                <section class="card wheel-section">
                    <h2 class="section-title"><span class="icon">🎯</span> Wellness Wheel</h2>
                    <div class="wheel-container">
                        <svg id="wellnessWheel" viewBox="0 0 400 400" class="wellness-wheel-svg"></svg>
                    </div>
                    <p class="wheel-caption">Based on Harvard Health Self-Care assessment</p>
                </section>

                <section class="card categories-section">
                    <h2 class="section-title"><span class="icon">📊</span> Category Scores</h2>
                    <div id="categoryResults"></div>
                </section>

                <section class="card feedback-section">
                    <h2 class="section-title"><span class="icon">💡</span> Personalized Feedback</h2>
                    <div id="feedbackList"><p class="no-data">Answer the quiz questions to see personalized feedback.</p></div>
                </section>

                <section class="card history-section">
                    <h2 class="section-title"><span class="icon">📅</span> Saved Assessments</h2>
                    <div id="historyList"><p class="no-data">No saved assessments yet</p></div>
                </section>
            </div>
        </main>
    </div>

    <div class="toast" id="toast"><span class="toast-message"></span></div>

    <div class="modal-overlay" id="encryptionModal">
        <div class="modal">
            <h3>🔐 Encryption Password</h3>
            <p>Enter your encryption password to sync data securely.</p>
            <input type="password" id="encryptionPassword" placeholder="Enter encryption password (min 6 chars)" autocomplete="off">
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="CloudSync.closePasswordModal()">Cancel</button>
                <button class="btn btn-primary" onclick="CloudSync.setPassword(document.getElementById('encryptionPassword').value, true)">Unlock</button>
            </div>
        </div>
    </div>

    <script>
{data_js}
    </script>
    <script>
{firebase_config_js}
    </script>
    <script>
{crypto_js}
    </script>
    <script>
{sync_js}
    </script>
    <script>
{app_js}
    </script>
</body>
</html>
"""

# Render the full app
st.components.v1.html(html, height=900, scrolling=True)
