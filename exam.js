// Import configuration
import { QUESTION_API_URL_BASE } from './config.js';

// State management
let currentQuestions = [];
let currentQuestionIndex = 0;
let examTimer = 5400; // 90 minutes in seconds
let timerInterval;
let userAnswers = new Array(90).fill(null);
let flaggedQuestions = new Set();

// DOM Elements
const questionContainer = document.getElementById('questionContainer');
const examTimerElement = document.getElementById('examTimer');
const questionNumberElement = document.getElementById('questionNumber');
const prevButton = document.getElementById('prevQuestion');
const nextButton = document.getElementById('nextQuestion'); // Fixed: was 'nextButton'
const flagButton = document.getElementById('flagQuestion');
const submitButton = document.getElementById('submitExam');

// Initialize exam
async function initializeExam() {
    // Get exam parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('exam');
    const questionCount = urlParams.get('count') || 90; // Default to 90 if not specified

    try {
        // Fetch questions from API
        const response = await fetch(`${QUESTION_API_URL_BASE}?exam=${examId}&count=${questionCount}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        currentQuestions = data;
        
        // Display first question
        displayQuestion(currentQuestionIndex);
        
        // Start timer
        startTimer();
        
        // Set up event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Failed to initialize exam:', error);
        questionContainer.innerHTML = '<p>Failed to load exam questions. Please try again.</p>';
    }
}

function displayQuestion(index) {
    const question = currentQuestions[index];
    if (!question) return;

    questionContainer.innerHTML = `
        <div class="question-text">
            ${question['question-text']}
        </div>
        <div class="options-container">
            <div class="option-item ${userAnswers[index] === 'A' ? 'selected' : ''}" data-option="A">
                ${question['option-a']}
            </div>
            <div class="option-item ${userAnswers[index] === 'B' ? 'selected' : ''}" data-option="B">
                ${question['option-b']}
            </div>
            <div class="option-item ${userAnswers[index] === 'C' ? 'selected' : ''}" data-option="C">
                ${question['option-c']}
            </div>
            <div class="option-item ${userAnswers[index] === 'D' ? 'selected' : ''}" data-option="D">
                ${question['option-d']}
            </div>
        </div>
    `;

    // Update question number
    questionNumberElement.textContent = `Question ${index + 1} of ${currentQuestions.length}`;
    
    // Update flag button state
    flagButton.classList.toggle('flagged', flaggedQuestions.has(index));
    
    // Add click handlers for options
    const options = questionContainer.querySelectorAll('.option-item');
    options.forEach(option => {
        option.addEventListener('click', () => selectAnswer(option.dataset.option));
    });
}

function selectAnswer(option) {
    userAnswers[currentQuestionIndex] = option;
    displayQuestion(currentQuestionIndex);
}

function startTimer() {
    timerInterval = setInterval(() => {
        examTimer--;
        const minutes = Math.floor(examTimer / 60);
        const seconds = examTimer % 60;
        examTimerElement.textContent = `Time Remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (examTimer <= 0) {
            clearInterval(timerInterval);
            submitExam();
        }
    }, 1000);
}

function setupEventListeners() {
    // Check if elements exist before adding listeners
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                displayQuestion(currentQuestionIndex);
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentQuestionIndex < currentQuestions.length - 1) {
                currentQuestionIndex++;
                displayQuestion(currentQuestionIndex);
            }
        });
    }

    if (flagButton) {
        flagButton.addEventListener('click', () => {
            if (flaggedQuestions.has(currentQuestionIndex)) {
                flaggedQuestions.delete(currentQuestionIndex);
            } else {
                flaggedQuestions.add(currentQuestionIndex);
            }
            displayQuestion(currentQuestionIndex);
        });
    }

    if (submitButton) {
        submitButton.addEventListener('click', showSubmitModal);
    }
}

function showSubmitModal() {
    const modal = document.getElementById('examSubmitModal');
    const answeredCount = userAnswers.filter(answer => answer !== null).length;
    
    document.getElementById('answeredCount').textContent = answeredCount;
    document.getElementById('flaggedCount').textContent = flaggedQuestions.size;
    
    modal.style.display = 'block';
    
    // Set up modal button handlers
    document.getElementById('confirmSubmit').onclick = submitExam;
    document.getElementById('cancelSubmit').onclick = () => modal.style.display = 'none';
}

function submitExam() {
    // TODO: Implement exam submission logic
    clearInterval(timerInterval);
    // You'll need to implement the logic to submit answers to your backend
    console.log('Exam submitted:', {
        answers: userAnswers,
        timeRemaining: examTimer,
        flaggedQuestions: Array.from(flaggedQuestions)
    });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializeExam);
