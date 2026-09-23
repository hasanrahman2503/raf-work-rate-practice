// Data
const letters = ['A', 'B', 'C', 'D'];
const symbols = ['●', '▲', '■', '★'];

let currentTable = [];
let currentCode = [];
let correctAnswer = '';
let correctAnswerLetters = '';
let timeLeft = 240;
let timerInterval = null;
let questionCount = 0;
let correctCount = 0;
let answered = false;
let testActive = false;
let allQuestions = [];
let currentQuestionIndex = 0;

// Generate random number between min and max
function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random numbers (unique)
function generateRandomNumbers() {
    const nums = [];
    const availableNums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < 4; i++) {
        const randIndex = Math.floor(Math.random() * availableNums.length);
        nums.push(availableNums[randIndex]);
        availableNums.splice(randIndex, 1);
    }
    return nums;
}

// Generate random symbols (unique)
function generateRandomSymbols() {
    const syms = [...symbols];
    const selected = [];
    for (let i = 0; i < 4; i++) {
        const randIndex = Math.floor(Math.random() * syms.length);
        selected.push(syms[randIndex]);
        syms.splice(randIndex, 1);
    }
    return selected;
}

// Convert input to standardized format (letters)
function normalizeAnswer(input) {
    if (!input) return '';
    
    const clean = input.replace(/\s+/g, '').toUpperCase();
    const result = [];
    
    for (let char of clean) {
        if (letters.includes(char)) {
            result.push(char);
        }
        else if (symbols.includes(char)) {
            const index = symbols.indexOf(char);
            result.push(letters[index]);
        }
        else if (!isNaN(char) && char !== ' ') {
            const num = parseInt(char);
            const numIndex = currentTable[1].indexOf(num);
            if (numIndex !== -1) {
                result.push(letters[numIndex]);
            }
        }
    }
    
    return result.join('');
}

// Start test
function startTest() {
    testActive = true;
    questionCount = 0;
    correctCount = 0;
    allQuestions = [];
    timeLeft = 240;
    currentQuestionIndex = 0;
    
    // Hide start screen, show question screen
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('questionScreen').style.display = 'block';
    
    // Pre-generate all 20 questions
    for (let i = 0; i < 20; i++) {
        const numbers = generateRandomNumbers();
        const randomSymbols = generateRandomSymbols();
        
        const table = [
            [...letters],
            [...numbers],
            [...randomSymbols]
        ];
        
        const code = [];
        for (let j = 0; j < 3; j++) {
            code.push(letters[randomNum(0, 3)]);
        }
        
        const correctLetters = [...code];
        const answer = code.map(letter => {
            const index = letters.indexOf(letter);
            return table[1][index];
        }).join(' ');
        
        allQuestions.push({
            table: table,
            code: code,
            correctLetters: correctLetters,
            correctAnswer: answer,
            answered: false,
            userAnswer: null,
            correct: false
        });
    }
    
    startTimer();
    displayQuestion(0);
}

// Display question
function displayQuestion(index) {
    if (index >= 20) {
        endTest();
        return;
    }
    
    currentQuestionIndex = index;
    const question = allQuestions[index];
    currentTable = question.table;
    currentCode = question.code;
    correctAnswer = question.correctAnswer;
    correctAnswerLetters = question.correctLetters.join('');
    
    // Update question number
    document.getElementById('questionNumber').textContent = index + 1;
    
    // Display table
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
            document.getElementById(`cell${row}${col}`).textContent = currentTable[row][col];
        }
    }
    
    // Display code
    document.getElementById('code').textContent = currentCode.join(' ');
    
    // Generate options if not answered
    if (!question.answered) {
        const options = [correctAnswer];
        
        while (options.length < 5) {
            const wrongOption = currentCode.map(() => {
                return randomNum(1, 9);
            }).join(' ');
            
            if (!options.includes(wrongOption)) {
                options.push(wrongOption);
            }
        }
        
        // Shuffle
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        // Display options
        for (let i = 0; i < 5; i++) {
            const btn = document.getElementById(`opt${i}`);
            btn.textContent = options[i];
            btn.parentElement.classList.remove('selected');
            btn.parentElement.disabled = false;
            btn.parentElement.style.background = 'white';
            btn.parentElement.style.color = '#333';
        }
        
        document.getElementById('feedback').textContent = '';
        document.getElementById('feedback').className = 'feedback';
    } else {
        displayPreviousAnswer(question);
    }
    
    // Show/hide next button
    if (index === 19) {
        document.getElementById('nextBtn').textContent = 'Submit Test';
    } else {
        document.getElementById('nextBtn').textContent = 'Next Question';
    }
    
    questionCount = index + 1;
    updateStats();
    document.getElementById('nextBtn').style.display = 'block';
}

// Display previous answer
function displayPreviousAnswer(question) {
    const isCorrect = question.correct;
    
    for (let i = 0; i < 5; i++) {
        const btn = document.getElementById(`opt${i}`);
        const optionText = btn.textContent;
        
        btn.parentElement.disabled = true;
        
        if (normalizeAnswer(optionText) === normalizeAnswer(question.userAnswer)) {
            btn.parentElement.classList.add('selected');
            if (isCorrect) {
                btn.parentElement.style.background = '#22c55e';
                btn.parentElement.style.color = 'white';
            } else {
                btn.parentElement.style.background = '#ef4444';
                btn.parentElement.style.color = 'white';
            }
        } else if (isCorrect && normalizeAnswer(optionText) === correctAnswerLetters) {
            btn.parentElement.style.background = '#22c55e';
            btn.parentElement.style.color = 'white';
        }
    }
    
    if (isCorrect) {
        document.getElementById('feedback').textContent = '✓ Correct!';
        document.getElementById('feedback').className = 'feedback correct';
    } else {
        document.getElementById('feedback').textContent = '✗ Incorrect. Answer: ' + correctAnswer;
        document.getElementById('feedback').className = 'feedback incorrect';
    }
}

// Check answer
function checkAnswer(optionIndex) {
    const question = allQuestions[currentQuestionIndex];
    if (question.answered) return;
    
    const selectedOption = document.getElementById(`opt${optionIndex}`).textContent;
    const normalizedAnswer = normalizeAnswer(selectedOption);
    
    const isCorrect = normalizedAnswer === correctAnswerLetters;
    
    question.answered = true;
    question.userAnswer = selectedOption;
    question.correct = isCorrect;
    
    if (isCorrect) {
        correctCount++;
        document.getElementById('feedback').textContent = '✓ Correct!';
        document.getElementById('feedback').className = 'feedback correct';
        document.getElementById(`opt${optionIndex}`).parentElement.classList.add('selected');
        document.getElementById(`opt${optionIndex}`).parentElement.style.background = '#22c55e';
        document.getElementById(`opt${optionIndex}`).parentElement.style.color = 'white';
    } else {
        document.getElementById('feedback').textContent = '✗ Incorrect. Answer: ' + correctAnswer;
        document.getElementById('feedback').className = 'feedback incorrect';
        document.getElementById(`opt${optionIndex}`).parentElement.classList.add('selected');
        document.getElementById(`opt${optionIndex}`).parentElement.style.background = '#ef4444';
        document.getElementById(`opt${optionIndex}`).parentElement.style.color = 'white';
        
        // Show correct answer
        for (let i = 0; i < 5; i++) {
            if (normalizeAnswer(document.getElementById(`opt${i}`).textContent) === correctAnswerLetters) {
                document.getElementById(`opt${i}`).parentElement.style.background = '#22c55e';
                document.getElementById(`opt${i}`).parentElement.style.color = 'white';
            }
        }
    }
    
    // Disable all buttons
    for (let i = 0; i < 5; i++) {
        document.getElementById(`opt${i}`).parentElement.disabled = true;
    }
    
    updateStats();
}

// Timer
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endTest();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft <= 30) {
        document.getElementById('timer').classList.add('warning');
    } else {
        document.getElementById('timer').classList.remove('warning');
    }
}

// Next question
function nextQuestion() {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < 20) {
        displayQuestion(nextIndex);
    } else {
        endTest();
    }
}

// End test
function endTest() {
    testActive = false;
    clearInterval(timerInterval);
    
    correctCount = allQuestions.filter(q => q.correct).length;
    
    const accuracy = Math.round((correctCount / 20) * 100);
    const timeTaken = 240 - timeLeft;
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    
    document.getElementById('questionScreen').innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <h2 style="margin-bottom: 30px;">Test Complete!</h2>
            
            <div style="background: #f5f5f5; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
                <div style="margin-bottom: 20px;">
                    <p style="color: #666; font-size: 14px; margin-bottom: 5px;">SCORE</p>
                    <p style="font-size: 40px; font-weight:
