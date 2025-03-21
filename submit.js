// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const score = parseInt(urlParams.get('score')) || 0;
const total = parseInt(urlParams.get('total')) || 0;
const timeSpent = parseInt(urlParams.get('time')) || 0;

// Calculate percentage
const percentage = Math.round((score / total) * 100) || 0;

// Update DOM elements
document.querySelector('.progress-value').textContent = `${percentage}%`;
document.getElementById('score').textContent = `${score}/${total}`;

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
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

function generateNewTest() {
    const originalExam = urlParams.get('exam') || '1101';
    const originalCount = urlParams.get('count') || '90';
    window.location.href = `exam.html?exam=${originalExam}&count=${originalCount}`;
}

// Add event listener for theme toggle
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Update the theme
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Update button text
    themeToggle.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    
    // Save preference
    localStorage.setItem('theme', newTheme);
});

// Update the "Generate New Test" button to include original parameters
document.getElementById('generateNewTest').onclick = generateNewTest;

