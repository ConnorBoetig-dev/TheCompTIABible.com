// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const score = parseInt(urlParams.get('score')) || 0;
const total = parseInt(urlParams.get('total')) || 0;
const timeSpent = parseInt(urlParams.get('time')) || 0;
const originalExam = urlParams.get('exam') || '1101';
const originalCount = urlParams.get('count') || '90';

// Calculate percentage
const percentage = Math.round((score / total) * 100) || 0;

// Update DOM elements
document.querySelector('.progress-value').textContent = `${percentage}%`;
document.getElementById('correctCount').textContent = score;
document.getElementById('totalQuestions').textContent = total;

// Format and display time taken
const minutes = Math.floor(timeSpent / 60);
const seconds = timeSpent % 60;
document.getElementById('timeTaken').textContent = 
    `${minutes}:${seconds.toString().padStart(2, '0')}`;

// Animate the circular progress bar
const progressBar = document.querySelector('.circular-progress');
progressBar.style.background = 
    `conic-gradient(#4CAF50 ${percentage * 3.6}deg, #e0e0e0 ${percentage * 3.6}deg)`;

// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.dataset.theme = 
        document.body.dataset.theme === 'light' ? 'dark' : 'light';
    themeToggle.textContent = 
        document.body.dataset.theme === 'light' ? '🌙 Dark' : '☀️ Light';
});

// Update the "Generate New Test" button to include original parameters
document.getElementById('generateNewTest').onclick = () => {
    window.location.href = `exam.html?exam=${originalExam}&count=${originalCount}`;
};
