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
const domainOptions = {
  "1101": [
    "1.1","1.2","1.3","1.4",              // Mobile devices domain options
    "2.1","2.2","2.3","2.4","2.5","2.6","2.7","2.8",  // Networking domain options
    "3.1","3.2","3.3","3.4","3.5","3.6","3.7",        // Hardware domain options
    "4.1","4.2",                                      // Virtualization & cloud computing
    "5.1","5.2","5.3","5.4","5.5","5.6","5.7"         // Hardware & network troubleshooting
  ],
  "1102": [
    "1.1","1.2","1.3","1.4","1.5","1.6","1.7","1.8","1.9","1.10","1.11",  // Operating systems
    "2.1","2.2","2.3","2.4","2.5","2.6","2.7","2.8","2.9","2.10",         // Security
    "3.1","3.2","3.3","3.4","3.5",                                        // Software troubleshooting
    "4.1","4.2","4.3","4.4","4.5","4.6","4.7","4.8","4.9"                 // Operational procedures
  ]
};
// You can add more exams by adding new properties to this object
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
  // Set up exam selection change handler
  examSelect.addEventListener("change", populateDomains);
  
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
  // Clear existing options (except the placeholder)
  while (domainSelect.options.length > 1) {
    domainSelect.remove(1);
  }
  
  // Get the selected exam value
  const selectedExam = examSelect.value;
  
  // If no exam is selected or the exam doesn't exist in our data, exit
  if (!selectedExam || !domainOptions[selectedExam]) {
    return;
  }
  
  // Add domain options based on the selected exam
  domainOptions[selectedExam].forEach(domain => {
    const option = document.createElement("option");
    option.value = domain;
    option.textContent = domain;
    domainSelect.appendChild(option);
  });
  
  // Enable the domain select dropdown (it might be disabled if no exam was selected)
  domainSelect.disabled = false;
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
function generateQuestion() {
  // Get the selected exam and domain
  const selectedExam = examSelect.value;
  const selectedDomain = domainSelect.value;
  
  // Validate selections
  if (!selectedExam) {
    alert("Please select an exam.");
    return;
  }
  
  if (!selectedDomain) {
    alert("Please select a domain.");
    return;
  }
  
  // Show loading state
  questionContainer.innerHTML = "<p>Loading question...</p>";
  outputCard.style.display = "block";
  
  // In a real application, you would fetch from an API
  // For this example, we'll simulate with a timeout
  setTimeout(() => {
    // Example question (in a real app, this would come from an API)
    const question = {
      prompt: `This is a sample ${selectedExam} question from domain ${selectedDomain}. Which of the following is correct?`,
      options: [
        "A) First possible answer that could be right",
        "B) Second possible answer that might be correct",
        "C) Third option that could be the answer",
        "D) Fourth option that might be selected"
      ],
      correct: 2  // Index of correct answer (0-based, so "C" is correct)
    };
    
    displayQuestion(question);
  }, 500);
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
function displayQuestion(question) {
  // Create the question container
  const questionDiv = document.createElement("div");
  
  // Add the question prompt
  const promptEl = document.createElement("h3");
  promptEl.textContent = question.prompt;
  questionDiv.appendChild(promptEl);
  
  // Create container for options
  const optionsContainer = document.createElement("div");
  optionsContainer.className = "options-container";
  
  // Add each answer option
  question.options.forEach((option, index) => {
    const label = document.createElement("label");
    
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "questionOption";
    radio.value = index;
    
    label.appendChild(radio);
    label.appendChild(document.createTextNode(" " + option));
    
    optionsContainer.appendChild(label);
  });
  
  questionDiv.appendChild(optionsContainer);
  
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
const OPENAI_API_KEY = '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'; // Replace with your actual API key

async function sendChatMessage() {
  const message = userInput.value.trim();
  
  if (!message) return;

  // Display user message
  addMessageToChat("user", message);
  userInput.value = "";

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: "You are a helpful CompTIA exam tutor. Provide detailed explanations for CompTIA exam topics."
        }, {
          role: "user",
          content: message
        }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      const aiResponse = data.choices[0].message.content;
      addMessageToChat("assistant", aiResponse);
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
