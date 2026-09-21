// Data
const letters = ['A', 'B', 'C', 'D'];
const symbols = ['●', '▲', '■', '★'];
let currentTable = [];
let currentCode = [];
let correctAnswer = '';
let timeLeft = 12;
let timerInterval = null;
let questionCount = 0;
let correctCount = 0;
let answered = false;

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

// Generate new question
function generateQuestion() {
    answered = false;
    timeLeft = 12;
    
    // Generate table
    const numbers = generateRandomNumbers();
    const randomSymbols = generateRandomSymbols();
    
    currentTable = [
        [...letters],
        [...numbers],
        [...randomSymbols]
    ];
    
    // Display table
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
            document.getElementById(`cell${row}${col}`).textContent = currentTable[row][col];
        }
    }
    
    // Generate code
    currentCode = [];
    for (let i = 0; i < 3; i++) {
        const randLetter = letters[randomNum(0, 3)];
        currentCode.push(randLetter);
    }
    document.getElementById('code').textContent = currentCode.join(' ');
    
    // Generate correct answer
    correctAnswer = currentCode.map(letter => {
        const index = letters.indexOf(letter);
        return currentTable[1][index];
    }).join(' ');
    
    // Generate options
    const options = [correctAnswer];
    
    // Generate wrong answers
    while (options.length < 5) {
        const wrongOption = currentCode.map(() => {
            return randomNum(1, 9);
        }).join(' ');
        
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
        const btn = document.getElementById(`opt${i}`);
        btn.textContent = options[i];
        btn.parentElement.onclick = () => checkAnswer(i);
        btn.parentElement.classList.remove('selected');
        btn.parentElement.disabled = false;
    }
    
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('nextBtn').style.display = 'none';
    
    // Start timer
    startTimer();
}

// Check answer
function checkAnswer(optionIndex) {
    if (answered) return;
    
    answered = true;
    clearInterval(timerInterval);
    
    const selectedOption = document.getElementById(`opt${optionIndex}`).textContent;
    const isCorrect = selectedOption === correctAnswer;
    
    if (isCorrect) {
        correctCount++;
        document.getElementById('feedback').textContent = '✓ Correct!';
        document.getElementById('feedback').className = 'feedback correct';
        document.getElementById(`opt${optionIndex}`).parentElement.classList.add('selected');
        document.getElementById(`opt${optionIndex}`).parentElement.style.background = '#22c55e';
    } else {
        document.getElementById('feedback').textContent = '✗ Incorrect. Answer: ' + correctAnswer;
        document.getElementById('feedback').className = 'feedback incorrect';
        document.getElementById(`opt${optionIndex}`).parentElement.classList.add('selected');
        document.getElementById(`opt${optionIndex}`).parentElement.style.background = '#ef4444';
        
        // Show correct answer
        for (let i = 0; i < 5; i++) {
            if (document.getElementById(`opt${i}`).textContent === correctAnswer) {
                document.getElementById(`opt${i}`).parentElement.style.background = '#22c55e';
                document.getElementById(`opt${i}`).parentElement.style.color = 'white';
            }
        }
    }
    
    // Disable all buttons
    for (let i = 0; i < 5; i++) {
        document.getElementById(`opt${i}`).parentElement.disabled = true;
    }
    
    questionCount++;
    updateStats();
    document.getElementById('nextBtn').style.display = 'block';
}

// Timer
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        
        if (timeLeft <= 3) {
            document.getElementById('timer').classList.add('warning');
        } else {
            document.getElementById('timer').classList.remove('warning');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeOutAnswer();
        }
    }, 1000);
}

// Time out
function timeOutAnswer() {
    if (answered) return;
    
    answered = true;
    document.getElementById('feedback').textContent = '⏱ Time\'s up! Answer: ' + correctAnswer;
    document.getElementById('feedback').className = 'feedback incorrect';
    
    // Show correct answer
    for (let i = 0; i < 5; i++) {
        if (document.getElementById(`opt${i}`).textContent === correctAnswer) {
            document.getElementById(`opt${i}`).parentElement.style.background = '#22c55e';
            document.getElementById(`opt${i}`).parentElement.style.color = 'white';
        }
        document.getElementById(`opt${i}`).parentElement.disabled = true;
    }
    
    questionCount++;
    updateStats();
    document.getElementById('nextBtn').style.display = 'block';
}

// Next question
function nextQuestion() {
    generateQuestion();
    document.getElementById('questionNumber').textContent = questionCount + 1;
}

// Update stats
function updateStats() {
    document.getElementById('score').textContent = correctCount + '/' + questionCount;
    const accuracy = questionCount === 0 ? 0 : Math.round((correctCount / questionCount) * 100);
    document.getElementById('accuracy').textContent = accuracy + '%';
}

// Start
generateQuestion();
