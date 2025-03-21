// Import configuration
import { QUESTION_API_URL_BASE } from './config.js';

// State management
let currentQuestions = [];
let currentQuestionIndex = 0;
let examTimer = 5400; // 90 minutes in seconds
let timerInterval;
let userAnswers = new Array(90).fill(null);

// DOM Elements
const questionContainer = document.getElementById('questionContainer');
const examTimerElement = document.getElementById('examTimer');
const questionNumberElement = document.getElementById('questionNumber');
const prevButton = document.getElementById('prevQuestion');
const nextButton = document.getElementById('nextQuestion'); // Fixed: was 'nextButton'
const submitButton = document.getElementById('submitExam');

// Initialize exam
async function initializeExam() {
    // Get exam parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('exam') || '1101'; // Default to 1101 if not specified
    const questionCount = urlParams.get('count') || 90; // Default to 90 if not specified
    
    // Get all domains for the exam
    const domains = ['1.1', '1.2', '1.3', '1.4', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', 
                    '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '4.1', '4.2', '5.1', '5.2', '5.3', 
                    '5.4', '5.5', '5.6', '5.7'];

    try {
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        // Make a single API call with all domains
        const apiUrl = `${QUESTION_API_URL_BASE}?domains=${encodeURIComponent(domains.join(','))}&limit=${encodeURIComponent(questionCount)}`;
        console.log('Fetching questions:', apiUrl); // Debug log
        
        const response = await fetch(apiUrl, requestOptions);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            console.error('Unexpected data format:', data);
            throw new Error('Invalid data format received from API');
        }
        
        // Shuffle and set current questions
        currentQuestions = shuffleArray(data);
        userAnswers = new Array(currentQuestions.length).fill(null);
        
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
            ${question.question || question['question-text']}
        </div>
        <div class="options-container">
            <div class="option-item ${userAnswers[index] === 'A' ? 'selected' : ''}" data-option="A">
                ${question.A || question['option-a']}
            </div>
            <div class="option-item ${userAnswers[index] === 'B' ? 'selected' : ''}" data-option="B">
                ${question.B || question['option-b']}
            </div>
            <div class="option-item ${userAnswers[index] === 'C' ? 'selected' : ''}" data-option="C">
                ${question.C || question['option-c']}
            </div>
            <div class="option-item ${userAnswers[index] === 'D' ? 'selected' : ''}" data-option="D">
                ${question.D || question['option-d']}
            </div>
        </div>
    `;

    // Update question number
    questionNumberElement.textContent = `Question ${index + 1} of ${currentQuestions.length}`;
    
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

    if (submitButton) {
        submitButton.addEventListener('click', showSubmitModal);
    }
}

function showSubmitModal() {
    const modal = document.getElementById('examSubmitModal');
    const answeredCount = userAnswers.filter(answer => answer !== null).length;
    
    document.getElementById('answeredCount').textContent = answeredCount;
    
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
    });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializeExam);

// Helper function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}



