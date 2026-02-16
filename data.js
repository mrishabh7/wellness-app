// ===== Wellness Quiz Data =====
// Based on Harvard Health Publishing Self-Care booklet

const RATING_LABELS = {
    1: 'Never',
    2: 'Rarely',
    3: 'Sometimes',
    4: 'Often',
    5: 'Routinely'
};

const CATEGORIES = [
    {
        key: 'nutrition',
        label: 'Nutrition',
        icon: '🥗',
        color: '#22c55e',
        questions: [
            'I eat four servings of fruit a day.',
            'I eat five or more servings of vegetables a day.',
            'I know proper portions for various foods, and I eat those portions.',
            'I think about the food that I eat and ask myself if it is good for my body.',
            'I view food as fuel, as medicine, and as enjoyment.'
        ],
        tips: {
            excellent: 'Outstanding nutrition habits! You\'re fueling your body like a pro.',
            good: 'Solid nutrition foundation. Try adding one more vegetable serving daily.',
            needsWork: 'Focus on increasing fruit & vegetable intake. Start with one extra serving per day.',
            critical: 'Your nutrition needs attention. Start by tracking what you eat for a week.'
        }
    },
    {
        key: 'physicalActivity',
        label: 'Physical Activity',
        icon: '🏃',
        color: '#3b82f6',
        questions: [
            'I exercise five days a week for about 30 minutes per session.',
            'I enjoy myself when I exercise.',
            'I perform strength training exercises twice a week.',
            'I perform flexibility exercises routinely.',
            'I perform balance exercises routinely.'
        ],
        tips: {
            excellent: 'Amazing fitness routine! You\'re covering all bases — cardio, strength, flexibility, and balance.',
            good: 'Good activity level. Consider adding balance or flexibility exercises if you haven\'t already.',
            needsWork: 'Try to get at least 150 minutes of moderate exercise per week. Find an activity you enjoy!',
            critical: 'Start small — a 10-minute daily walk can make a huge difference. Build from there.'
        }
    },
    {
        key: 'sleep',
        label: 'Sleep',
        icon: '😴',
        color: '#8b5cf6',
        questions: [
            'I sleep seven to eight hours a night.',
            'I do not drink coffee after noon.',
            'I have a bedtime ritual in which I relax before bed.',
            'I keep my phone out of the bedroom when I go to sleep.',
            'I take 20-minute naps when I am overtired.'
        ],
        tips: {
            excellent: 'Excellent sleep hygiene! Quality rest is the foundation of wellness.',
            good: 'Good sleep habits. Consider creating a more consistent bedtime routine.',
            needsWork: 'Try setting a fixed sleep schedule. Avoid screens 1 hour before bed.',
            critical: 'Sleep is critical for health. Start by setting a consistent bedtime and removing your phone from the bedroom.'
        }
    },
    {
        key: 'attitude',
        label: 'Attitude',
        icon: '🌟',
        color: '#f59e0b',
        questions: [
            'I use mistakes as opportunities to learn and grow.',
            'I write thank-you notes or express my gratitude verbally.',
            'I celebrate success when it happens.',
            'I concentrate on the task at hand fully, without distractions.',
            'I am optimistic about the day.'
        ],
        tips: {
            excellent: 'Your positive mindset is a superpower! Keep practicing gratitude and growth.',
            good: 'Great attitude foundation. Try starting a daily gratitude journal.',
            needsWork: 'Practice reframing negative thoughts. Write down 3 things you\'re grateful for each night.',
            critical: 'Start with one small positive habit — express gratitude to one person today.'
        }
    },
    {
        key: 'purpose',
        label: 'Purpose',
        icon: '🧭',
        color: '#ec4899',
        questions: [
            'I feel that I have a clear purpose in life.',
            'I am using my strengths to fulfill my purpose.',
            'I have identified the people and activities that are most important to me.',
            'I am able to prioritize my activities and projects easily.',
            'I make sure that my activities and projects are in line with my values.'
        ],
        tips: {
            excellent: 'You have a strong sense of purpose! This drives meaning in everything you do.',
            good: 'Good clarity of purpose. Reflect on whether your daily activities align with your values.',
            needsWork: 'Take time to identify your core values. List 5 things that matter most to you.',
            critical: 'Finding purpose starts with self-reflection. Try journaling about what brings you fulfillment.'
        }
    },
    {
        key: 'resilience',
        label: 'Resilience',
        icon: '💪',
        color: '#06b6d4',
        questions: [
            'I recognize stress and its effects on my mind and body.',
            'I am familiar with stress reduction techniques, and I use at least one when I feel anxious, annoyed, or worried.',
            'I know about resilience, and I practice enhancing my resilience.',
            'I do not get angry easily.',
            'I meditate, take deep breaths, practice yoga, or do mindfulness-based stress reduction regularly.'
        ],
        tips: {
            excellent: 'Impressive resilience! You handle stress like a champion.',
            good: 'Good stress management. Try adding a daily mindfulness practice, even just 5 minutes.',
            needsWork: 'Learn to identify your stress triggers. Try box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s.',
            critical: 'Start with basic deep breathing exercises. Apps like Headspace or Calm can guide you.'
        }
    },
    {
        key: 'timeouts',
        label: 'Time-outs',
        icon: '⏸️',
        color: '#14b8a6',
        questions: [
            'If I sit for over an hour, I stand up and take a break for five minutes each hour.',
            'If I feel frustrated or annoyed, I take a few deep breaths to calm down.',
            'I take my vacation every year.',
            'When I am at home, I make sure to turn off my computer and put my work projects away for at least an hour at dinner time.',
            'After working on the same project for a few hours, I step away from it to get perspective on it.'
        ],
        tips: {
            excellent: 'Great work-life balance! You know when to pause and recharge.',
            good: 'Good break habits. Try the Pomodoro technique: 25 min work, 5 min break.',
            needsWork: 'Set hourly reminders to stand and stretch. Protect your dinner time from work.',
            critical: 'Burnout is real. Start by taking one 5-minute break every hour today.'
        }
    },
    {
        key: 'energy',
        label: 'Energy',
        icon: '⚡',
        color: '#f97316',
        questions: [
            'I have a friend who energizes me.',
            'I have identified at least one activity that brings me joy and energy.',
            'I am able to avoid situations and people that drain my energy.',
            'I drink no more than two cups of coffee a day.',
            'I do not rely on sugar for a quick energy fix.'
        ],
        tips: {
            excellent: 'Fantastic energy management! You know what fuels you and what drains you.',
            good: 'Good energy awareness. Identify one energy-draining habit you can reduce.',
            needsWork: 'List your top 3 energy boosters and top 3 energy drainers. Adjust accordingly.',
            critical: 'Start tracking what gives you energy and what takes it away. Reduce caffeine and sugar dependence.'
        }
    },
    {
        key: 'socialConnection',
        label: 'Social Connection',
        icon: '🤝',
        color: '#a855f7',
        questions: [
            'I can name at least one person who brings me strength.',
            'I am involved with at least one group (activity, exercise class, art class, religious organization, etc.).',
            'I visit with friends on the phone or in person at least five times a week.',
            'I have a healthy relationship with my spouse, partner, or best friend.',
            'I have a pet or plant that I can nurture and spend time with every day.'
        ],
        tips: {
            excellent: 'Wonderful social connections! Strong relationships are key to longevity.',
            good: 'Good social network. Try reaching out to one friend you haven\'t spoken to recently.',
            needsWork: 'Join a group activity or class. Even virtual communities count!',
            critical: 'Social connection is a health necessity. Start by calling or texting one person today.'
        }
    }
];

// Score thresholds
const SCORE_LEVELS = {
    excellent: { min: 21, max: 25, label: 'Excellent', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.15)' },
    good: { min: 16, max: 20, label: 'Good', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
    needsWork: { min: 11, max: 15, label: 'Needs Work', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
    critical: { min: 5, max: 10, label: 'Critical', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' }
};

function getScoreLevel(score) {
    if (score >= 21) return SCORE_LEVELS.excellent;
    if (score >= 16) return SCORE_LEVELS.good;
    if (score >= 11) return SCORE_LEVELS.needsWork;
    return SCORE_LEVELS.critical;
}

function getScoreLevelKey(score) {
    if (score >= 21) return 'excellent';
    if (score >= 16) return 'good';
    if (score >= 11) return 'needsWork';
    return 'critical';
}

// ===== Storage =====
const WELLNESS_STORAGE_PREFIX = 'wellness_';

function getWellnessStorageKey(year, month) {
    return `${WELLNESS_STORAGE_PREFIX}${year}_${String(month).padStart(2, '0')}`;
}

function saveWellnessData(year, month, data) {
    const key = getWellnessStorageKey(year, month);
    localStorage.setItem(key, JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
}

function loadWellnessData(year, month) {
    const key = getWellnessStorageKey(year, month);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function getSavedWellnessMonths() {
    const months = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(WELLNESS_STORAGE_PREFIX)) {
            const parts = key.replace(WELLNESS_STORAGE_PREFIX, '').split('_');
            if (parts.length === 2) {
                months.push({ year: parts[0], month: parts[1] });
            }
        }
    }
    return months.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
    });
}

function deleteWellnessData(year, month) {
    const key = getWellnessStorageKey(year, month);
    localStorage.removeItem(key);
}

function getMonthName(month) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    return months[parseInt(month) - 1];
}
