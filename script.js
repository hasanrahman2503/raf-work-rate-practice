// Data
const letters = ['A', 'B', 'C', 'D'];
const symbols = ['●', '▲', '■', '★'];

let currentTable = [];
let currentCode = [];
let correctAnswer = '';
let correctAnswerLetters = '';
let timeLeft = 240;
let timerInterval = null;
let correctCount = 0;
let allQuestions = [];
let currentQuestionIndex = 0;

function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
        else if (!isNaN(char)) {
            const num = parseInt(char);
            const numIndex = currentTable[1].indexOf(num);
            if (numIndex !== -1) {
                result.push(letters[numIndex]);
            }
        }
    }
    return result.join('');
}

function startTest() {
    console.log('Start Test clicked');
    
    // Hide start, show question
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('questionScreen').style.display = 'block';
    
    correctCount = 0;
    allQuestions = [];
    timeLeft = 240;
    currentQuestionIndex = 0;
    
    // Generate all 20 questions
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
        
        const correctLetters = code.join('');
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
    
    console.log('Questions generated:', allQuestions.length);
    
    // Start timer and display first question
    displayQuestion(0);
    startTimer();
}

function displayQuestion(index) {
    console.log('Displaying question:', index);
    
    if (index >= 20) {
        endTest();
        return;
    }
    
    currentQuestionIndex = index;
    const question = allQuestions[index];
    currentTable = question.table;
    currentCode = question.code;
    correctAnswer = question.correctAnswer;
    correctAnswerLetters = question.correctLetters;
    
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
    
    // Generate and display options
    if (!question.answered) {
        const options = [correctAnswer];
        
        while (options.length < 5) {
            const wrongOption = currentCode.map(() => randomNum(1, 9)).join(' ');
            if (!options.includes(wrongOption)) {
                options.push(wrongOption);
            }
        }
        
        // Shuffle options
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        // Display options
        for (let i = 0; i < 5; i++) {
            document.getElementById(`opt${i}`).textContent = options[i];
            document.getElementById(`opt${i}`).parentElement.disabled = false;
            document.getElementById(`opt${i}`).parentElement.style.background = 'white';
            document.getElementById(`opt${i}`).parentElement.style.color = '#333';
        }
        
        document.getElementById('feedback').textContent = '';
        document.getElementById('feedback').className = 'feedback';
    }
    
    // Update button text
    if (index === 19) {
        document.getElementById('nextBtn').textContent = 'Submit Test';
    } else {
        document.getElementById('nextBtn').textContent = 'Next Question';
    }
    
    // Update stats
    document.getElementById('score').textContent = correctCount + '/' + (index + 1);
    const accuracy = (index + 1) === 0 ? 0 : Math.round((correctCount / (index + 1)) * 100);
    document.getElementById('accuracy').textContent = accuracy + '%';
    
    document.getElementById('nextBtn').style.display = 'block';
}

function checkAnswer(optionIndex) {
    const question = allQuestions[currentQuestionIndex];
    if (question.answered) return;
    
    const selectedOption = document.getElementById(`opt${optionIndex}`).textContent;
    const isCorrect = normalizeAnswer(selectedOption) === normalizeAnswer(correctAnswerLetters);
    
    question.answered = true;
    question.userAnswer = selectedOption;
    question.correct = isCorrect;
    
    if (isCorrect) {
        correctCount++;
        document.getElementById('feedback').textContent = '✓ Correct!';
        document.getElementById('feedback').className = 'feedback correct';
        document.getElementById(`opt${optionIndex}`).parentElement.style.background = '#22c55e';
        document.getElementById(`opt${optionIndex}`).parentElement.style.color = 'white';
    } else {
        document.getElementById('feedback').textContent = '✗ Incorrect. Answer: ' + correctAnswer;
        document.getElementById('feedback').className = 'feedback incorrect';
        document.getElementById(`opt${optionIndex}`).parentElement.style.background = '#ef4444';
        document.getElementById(`opt${optionIndex}`).parentElement.style.color = 'white';
        
        // Show correct answer
        for (let i = 0; i < 5; i++) {
            if (normalizeAnswer(document.getElementById(`opt${i}`).textContent) === normalizeAnswer(correctAnswerLetters)) {
                document.getElementById(`opt${i}`).parentElement.style.background = '#22c55e';
                document.getElementById(`opt${i}`).parentElement.style.color = 'white';
            }
        }
    }
    
    // Disable all buttons
    for (let i = 0; i < 5; i++) {
        document.getElementById(`opt${i}`).parentElement.disabled = true;
    }
    
    document.getElementById('score').textContent = correctCount + '/' + (currentQuestionIndex + 1);
    const accuracy = Math.round((correctCount / (currentQuestionIndex + 1)) * 100);
    document.getElementById('accuracy').textContent = accuracy + '%';
}

function startTimer() {
    console.log('Timer started');
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endTest();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft <= 30) {
        document.getElementById('timer').classList.add('warning');
    }
