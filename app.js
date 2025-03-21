/********************************************************
 * APP.JS - COMPREHENSIVE GUIDE
 * 
 * This JavaScript file powers the interactive functionality of the CompTIA Bible dashboard.
 * It handles exam selection, domain population, question generation, and the chat interface.
 * 
 * KEY COMPONENTS:
 * 1. Data structures for exam domains
 * 2. DOM element references
 * 3. Event listeners for user interactions
 * 4. Question generation and display
 * 5. Chat functionality
 ********************************************************/

/********************************************************
 * EXAM DOMAIN DATA
 * 
 * Maps each exam ID to its array of domains
 * This data structure defines what domains are available for each exam selection
 * 
 * MODIFICATION IMPACT:
 * - Add new exams by creating additional properties (e.g., "1103": [...])
 * - Update domain lists by modifying the arrays
 * - Changing these affects what users can select in the Domain dropdown
 ********************************************************/
import { QUESTION_API_URL_BASE, CHAT_API_URL } from './config.js';

console.log("app.js loaded");

const domainOptions = {
  "1101": [
    "1.1","1.2","1.3","1.4",
    "2.1","2.2","2.3","2.4","2.5","2.6","2.7","2.8",
    "3.1","3.2","3.3","3.4","3.5","3.6","3.7",
    "4.1","4.2",
    "5.1","5.2","5.3","5.4","5.5","5.6","5.7"
  ],
  "1102": [
    "1.1","1.2","1.3","1.4","1.5","1.6","1.7","1.8","1.9","1.10","1.11",
    "2.1","2.2","2.3","2.4","2.5","2.6","2.7","2.8","2.9","2.10",
    "3.1","3.2","3.3","3.4","3.5",
    "4.1","4.2","4.3","4.4","4.5","4.6","4.7","4.8","4.9"
  ]
}; // You can add more exams by adding new properties to this object
// For example: "Net+": ["1.1", "1.2", ...] would add the Network+ exam


/********************************************************
 * DOM ELEMENT REFERENCES
 * 
 * Get references to all interactive elements used throughout the application
 * These variables provide shortcuts to HTML elements we'll need to manipulate
 * 
 * MODIFICATION IMPACT:
 * - If you rename any HTML element IDs, update the corresponding references here
 * - Missing or incorrect references will cause features to break
 * - You'll add new references if you add new interactive elements
 ********************************************************/
const examSelect       = document.getElementById("examSelect");      // The dropdown for choosing the exam (e.g. 1101, 1102)
const domainSelect     = document.getElementById("domainSelect");    // The dropdown for choosing the domain (e.g. 1.1, 1.2, etc.)
const generateButton   = document.getElementById("generateButton");  // The "Generate" button that triggers the fetch
const outputCard       = document.getElementById("outputCard");      // The <div> (initially hidden) that will display questions
const questionContainer= document.getElementById("questionContainer");// The container where generated questions are inserted

// Chat interface elements
const chatWindow       = document.getElementById("chatWindow");      // The scrollable area where chat messages appear
const userInput        = document.getElementById("userInput");       // The text input field where users type questions
const sendButton       = document.getElementById("sendButton");      // The button users click to send chat messages

// Practice Exam Generator Elements
const practiceExamSelect = document.getElementById("practiceExamSelect");
const practiceDomainSelect = document.getElementById("practiceDomainSelect");
const questionCountSelect = document.getElementById("questionCountSelect");
const generatePracticeExamButton = document.getElementById("generatePracticeExamButton");
const practiceExamOutput = document.getElementById("practiceExamOutput");

// Theme toggle button
const themeToggle = document.getElementById("themeToggle");

// Initialize Practice Exam controls
practiceExamSelect.addEventListener("change", function() {
    questionCountSelect.disabled = false;
    populateQuestionCount();
});

questionCountSelect.addEventListener("change", function() {
    generatePracticeExamButton.disabled = false;
});

async function generatePracticeExam() {
    const exam = practiceExamSelect.value;
    const count = questionCountSelect.value;
    
    console.log('Generating practice exam:', { exam, count }); // Debug log
    
    // Open exam in new window/tab
    const examUrl = `exam.html?exam=${exam}&count=${count}`;
    console.log('Opening URL:', examUrl); // Debug log
    
    window.open(examUrl, '_blank');
}

function displayPracticeExam(questions) {
    // Implementation for displaying the practice exam
    // You'll need to create this based on how you want to present the questions
}


/********************************************************
 * EVENT LISTENERS SETUP
 * 
 * Connect user interactions to their respective handler functions
 * These listeners "watch" elements and trigger functions when events occur
 * 
 * MODIFICATION IMPACT:
 * - Adding new event listeners enables additional user interactions
 * - Modifying existing ones changes how the app responds to user actions
 * - The 'DOMContentLoaded' event ensures the page is fully loaded before setup
 ********************************************************/
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM loaded");
  console.log("examSelect element:", examSelect);
  
  // Test if the examSelect exists and has options
  if (examSelect) {
    console.log("Available exam options:", Array.from(examSelect.options).map(opt => opt.value));
  }
  
  // Add change event listener with console log
  examSelect.addEventListener("change", function(e) {
    console.log("Exam selection changed to:", e.target.value);
    populateDomains();
  });
  
  // Initially disable the domain select
  domainSelect.disabled = true;
  
  // Set up generate button click handler
  generateButton.addEventListener("click", generateQuestion);
  
  // Set up chat input and send button
  userInput.addEventListener("keypress", function(event) {
    // Allow Enter key to submit chat message (keyCode 13 = Enter)
    if (event.keyCode === 13) {
      sendChatMessage();
    }
  });
  
  // Set up send button click handler
  sendButton.addEventListener("click", sendChatMessage);

  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.textContent = savedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';

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

  // Add this new event listener
  generatePracticeExamButton.addEventListener("click", generatePracticeExam);
});


/********************************************************
 * DOMAIN DROPDOWN POPULATION
 * 
 * Updates the domain dropdown options based on the selected exam
 * Called whenever the exam selection changes
 * 
 * PARAMETERS: 
 * - None (uses the current value of examSelect)
 * 
 * MODIFICATION IMPACT:
 * - Changes to this function affect how domains are displayed
 * - Adding additional logic here could filter or sort domains
 ********************************************************/
function populateDomains() {
  console.log("populateDomains called");
  
  // Clear existing options (except the placeholder)
  while (domainSelect.options.length > 1) {
    domainSelect.remove(1);
  }
  
  // Get the selected exam value
  const selectedExam = examSelect.value;
  console.log("Selected exam:", selectedExam);
  console.log("Available domains for this exam:", domainOptions[selectedExam]);
  
  // If no exam is selected or the exam doesn't exist in our data, exit
  if (!selectedExam || !domainOptions[selectedExam]) {
    console.log("No exam selected or invalid exam");
    return;
  }
  
  // Add domain options based on the selected exam
  domainOptions[selectedExam].forEach(domain => {
    const option = document.createElement("option");
    option.value = domain;
    option.textContent = domain;
    domainSelect.appendChild(option);
    console.log("Added domain option:", domain);
  });
  
  // Enable the domain select dropdown
  domainSelect.disabled = false;
  console.log("Domain select enabled");
}


/********************************************************
 * QUESTION GENERATION
 * 
 * Fetches and displays a question based on the selected exam and domain
 * Called when the Generate button is clicked
 * 
 * PARAMETERS:
 * - None (uses values from exam and domain selects)
 * 
 * MODIFICATION IMPACT:
 * - This is the core functionality of generating questions
 * - Modifying this affects how questions are fetched and displayed
 * - Could be expanded to cache questions, track history, etc.
 ********************************************************/
async function generateQuestion() {
  const selectedExam = examSelect.value;
  const selectedDomain = domainSelect.value;
  
  if (!selectedExam || !selectedDomain) {
    alert("Please select an exam and domain.");
    return;
  }
  
  questionContainer.innerHTML = "<p>Loading question...</p>";
  outputCard.style.display = "block";
  
  try {
    console.log('Fetching question for domain:', selectedDomain);
    
    // Modified to use domains instead of domain
    const apiUrl = `${QUESTION_API_URL_BASE}?domains=${selectedDomain}&limit=1`;

    console.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl);
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data && data.length > 0) {
      const question = data[0];
      displayQuestion(question);
    } else {
      questionContainer.innerHTML = "<p>No questions found for this domain.</p>";
    }
  } catch (error) {
    console.error('Detailed error:', error);
    questionContainer.innerHTML = "<p>Error loading question. Please try again.</p>";
  }
}


/********************************************************
 * QUESTION DISPLAY
 * 
 * Renders a question object into the question container
 * Creates the HTML structure for the question and answer options
 * 
 * PARAMETERS:
 * - question: Object containing prompt, options array, and correct answer
 * 
 * MODIFICATION IMPACT:
 * - Changes to this function affect how questions appear visually
 * - Could be enhanced to add explanation sections, images, etc.
 ********************************************************/
let currentQuestionContext = null;

function displayQuestion(question) {
  // Store the current question context
  currentQuestionContext = {
    question: question["question-text"],
    options: {
      A: question["option-a"],
      B: question["option-b"],
      C: question["option-c"],
      D: question["option-d"]
    },
    correctAnswer: question["correct answer"],
    domain: question["domain"]
  };

  // Add debug logging
  console.log('Setting question context:', currentQuestionContext);

  const questionDiv = document.createElement("div");
  
  // Add the question prompt
  const promptEl = document.createElement("h3");
  promptEl.textContent = question["question-text"];
  questionDiv.appendChild(promptEl);
  
  // Create container for options
  const optionsContainer = document.createElement("div");
  optionsContainer.className = "options-container";
  
  // Create explanation container (hidden initially)
  const explanationDiv = document.createElement("div");
  explanationDiv.className = "explanation-container";
  explanationDiv.style.display = "none";
  
  // Add each answer option
  const options = [
    question["option-a"],
    question["option-b"],
    question["option-c"],
    question["option-d"]
  ];
  
  const explanations = [
    question["explanation-a"],
    question["explanation-b"],
    question["explanation-c"],
    question["explanation-d"]
  ];

  // Fix: Use "correct answer" instead of "correctAnswer"
  const correctAnswer = question["correct answer"].toLowerCase().charCodeAt(0) - 97;

  options.forEach((option, index) => {
    const label = document.createElement("label");
    
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "questionOption";
    radio.value = index;
    
    // Add click handler for each radio button
    radio.addEventListener("change", () => {
      // Remove previous highlighting
      optionsContainer.querySelectorAll("label").forEach(l => {
        l.classList.remove("correct-answer", "incorrect-answer");
      });

      // Highlight selected answer
      if (index === correctAnswer) {
        label.classList.add("correct-answer");
      } else {
        label.classList.add("incorrect-answer");
      }

      // Show explanation
      explanationDiv.innerHTML = `
        <h4 class="${index === correctAnswer ? 'feedback-correct' : 'feedback-incorrect'}">
            ${index === correctAnswer ? "Correct!" : "Incorrect"}
        </h4>
        <p>${explanations[index]}</p>
      `;
      explanationDiv.style.display = "block";
    });
    
    label.appendChild(radio);
    label.appendChild(document.createTextNode(" " + option));
    
    optionsContainer.appendChild(label);
  });
  
  questionDiv.appendChild(optionsContainer);
  questionDiv.appendChild(explanationDiv);

  // Add Next button
  const nextButton = document.createElement("button");
  nextButton.textContent = "Next Question";
  nextButton.className = "next-button";
  nextButton.onclick = generateQuestion;
  questionDiv.appendChild(nextButton);
  
  // Clear previous questions and add the new one
  questionContainer.innerHTML = "";
  questionContainer.appendChild(questionDiv);
  
  // Ensure the output card is visible
  outputCard.style.display = "block";
}


/********************************************************
 * CHAT MESSAGE SENDING
 * 
 * Processes user input from the chat box and displays it
 * Called when Send button is clicked or Enter key is pressed
 * 
 * PARAMETERS:
 * - None (uses value from userInput element)
 * 
 * MODIFICATION IMPACT:
 * - Central to the chat functionality
 * - Can be expanded for more sophisticated chat features
 * - Consider adding error handling, input validation, etc.
 ********************************************************/
async function sendChatMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;

    // Add debug logging
    console.log('Current question context:', currentQuestionContext);

    // Display user message
    addMessageToChat("user", message);
    userInput.value = "";

    const payload = {
        message: message,
        context: {
            currentQuestion: currentQuestionContext,
            instruction: "The user is looking at a CompTIA practice question. Use this context to provide more relevant answers. Don't directly reveal the correct answer unless explicitly asked."
        }
    };

    // Debug log the payload
    console.log('Sending payload:', payload);

    try {
        const response = await fetch(CHAT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (data.reply) {
            addMessageToChat("assistant", data.reply);
        } else if (data.error) {
            throw new Error(data.error);
        } else {
            throw new Error('Invalid response format');
        }

    } catch (error) {
        console.error('Error:', error);
        addMessageToChat("assistant", "Sorry, I encountered an error. Please try again.");
    }
}


/********************************************************
 * CHAT MESSAGE DISPLAY
 * 
 * Adds a new message to the chat window with appropriate styling
 * Used by both user and assistant messages
 * 
 * PARAMETERS:
 * - role: String ("user" or "assistant") determining styling
 * - text: String content of the message to display
 * 
 * MODIFICATION IMPACT:
 * - Controls the visual appearance of chat messages
 * - Could be enhanced to support different message types, formatting
 * - Consider adding timestamps, avatar icons, or other visual elements
 ********************************************************/
function addMessageToChat(role, text) {
  const msgDiv = document.createElement("div");

  // Assign a CSS class based on the role
  if (role === "user") {
    msgDiv.classList.add("chat-message-user");
  } else if (role === "assistant") {
    msgDiv.classList.add("chat-message-assistant");
  }

  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  
  // Auto-scroll to the bottom of the chat window
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/********************************************************
 * UTILITY FUNCTIONS
 * 
 * Any helper functions that support the main functionality
 * Keeps the code modular and easier to maintain
 * 
 * MODIFICATION IMPACT:
 * - These functions can be reused throughout the application
 * - Consider adding more utility functions for common operations
 ********************************************************/

// Example utility function for formatting domain numbers
function formatDomainLabel(domain) {
  // Converts "1.1" to "Domain 1.1"
  return `Domain ${domain}`;
}

// Example utility function to sanitize user input
function sanitizeInput(input) {
  // Basic sanitization to prevent XSS
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function populateQuestionCount() {
    // Clear ALL options including the first one
    questionCountSelect.innerHTML = '';
    
    // Add the default option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select Count";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    questionCountSelect.appendChild(defaultOption);
    
    // Add options in increments of 15
    const questionCounts = [15, 30, 45, 60, 75, 90];
    
    questionCounts.forEach(count => {
        const option = document.createElement("option");
        option.value = count;
        option.textContent = count.toString();
        questionCountSelect.appendChild(option);
    });
}
