class SubwayGrammarGame {
    constructor() {
        // Game state
        this.score = 0;
        this.lives = 3;
        this.currentTrack = 1;
        this.gameSpeed = 1;
        this.isGameRunning = false;
        this.isPaused = false;
        this.currentQuestion = null;
        this.streak = 0;
        this.level = 1;
        this.canAnswer = true;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.questionsAnswered = 0;
        this.maxStreak = 0;
        this.baseTime = 60;
        this.timeLeft = this.baseTime;
        this.timerInterval = null;
        this.gameInterval = null;
        this.usedQuestions = new Set();
        this.questionsPerLevel = 3; // Number of questions needed to complete a level

        // Movement control
        this.canMove = true; // Flag to control movement throttling
        this.moveCooldown = 300; // Cooldown period in milliseconds between moves

        // Initialize DOM elements
        this.initializeDOM();

        // Initialize event listeners
        this.initializeEventListeners();

        // Initialize sounds
        this.initializeSounds();

        // Initialize game elements
        this.initializeGame();
    }

    initializeDOM() {
        this.menuScreen = document.getElementById('menu-screen');
        this.instructionsScreen = document.getElementById('instructions-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.player = document.getElementById('player');
        this.scoreDisplay = document.getElementById('score');
        this.livesDisplay = document.getElementById('lives');
        this.streakDisplay = document.getElementById('streak');
        this.levelDisplay = document.getElementById('level');
        this.timerDisplay = document.getElementById('timer').querySelector('span');
        this.questionContainer = document.getElementById('question-container');
        this.tracks = document.querySelectorAll('.track');
    }

    initializeEventListeners() {
        // Menu buttons
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('restart-button').addEventListener('click', () => this.startGame());
        document.getElementById('instructions-button').addEventListener('click', () => this.showScreen('instructions-screen'));
        document.getElementById('back-to-menu').addEventListener('click', () => this.showScreen('menu-screen'));
        document.getElementById('resume-button')?.addEventListener('click', () => this.togglePause());
        document.getElementById('quit-button')?.addEventListener('click', () => this.quitGame());

        // Share button
        document.getElementById('share-button').addEventListener('click', () => this.shareScore());

        // Get game area element
        const gameArea = document.getElementById('game-area');

        // Enhanced keyboard controls with both keydown and keyup events
        const handleKeyEvent = (e) => {
            // Prevent default behavior for arrow keys to avoid page scrolling
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Enter') {
                e.preventDefault();
            }
            this.handleKeyPress(e);
        };

        // Add event listeners to multiple elements to ensure key events are captured
        [document, window, gameArea].forEach(element => {
            // Remove existing listeners to prevent duplicates
            element.removeEventListener('keydown', handleKeyEvent);
            element.addEventListener('keydown', handleKeyEvent);

            // Optional: Handle keyup events if needed
            element.removeEventListener('keyup', this.handleKeyUpEvent);
            element.addEventListener('keyup', this.handleKeyUpEvent.bind(this));
        });

        // Focus handling with improved reliability
        const focusGameArea = () => {
            if (this.isGameRunning && !this.isPaused) {
                gameArea.focus();
            }
        };

        [document, window, gameArea].forEach(element => {
            element.removeEventListener('click', focusGameArea);
            element.addEventListener('click', focusGameArea);
            element.removeEventListener('touchstart', focusGameArea);
            element.addEventListener('touchstart', focusGameArea);
        });

        // Touch controls for mobile
        let touchStartX = 0;
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.addEventListener('touchmove', (e) => {
            if (!this.isGameRunning || this.isPaused) return;
            const touchEndX = e.touches[0].clientX;
            const diffX = touchEndX - touchStartX;
            
            if (Math.abs(diffX) > 50) {
                if (diffX > 0 && this.currentTrack < 2) {
                    this.movePlayer(this.currentTrack + 1);
                } else if (diffX < 0 && this.currentTrack > 0) {
                    this.movePlayer(this.currentTrack - 1);
                }
                touchStartX = touchEndX;
            }
        });
        document.removeEventListener('touchend', this.handleTouchEnd);
        document.addEventListener('touchend', () => {
            if (this.canAnswer && this.isGameRunning && !this.isPaused) {
                this.checkAnswer(this.currentTrack);
            }
        });

        // Store game area for focus
        this.gameArea = gameArea;
    }

    handleKeyUpEvent(e) {
        // Placeholder for any keyup handling if needed
        // Currently not used
    }

    initializeSounds() {
        this.sounds = {
            background: new Audio('assets/background.mp3'),
            correct: new Audio('assets/correct.mp3'),
            wrong: new Audio('assets/wrong.mp3'),
            powerup: new Audio('assets/powerup.mp3')
        };
        
        // Loop background music
        this.sounds.background.loop = true;
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.3;
        });
    }

    initializeGame() {
        // Initialize tracks
        this.tracks = document.querySelectorAll('.track');
        this.player = document.getElementById('player');
        
        // Set initial player position
        this.currentTrack = 1;
        this.movePlayer(this.currentTrack);
        
        // Initialize HUD elements
        this.scoreDisplay = document.getElementById('score');
        this.livesDisplay = document.getElementById('lives');
        this.streakDisplay = document.getElementById('streak');
        this.levelDisplay = document.getElementById('level');
        this.timerDisplay = document.getElementById('timer').querySelector('span');

        console.log(`Game initialized. Starting at track ${this.currentTrack}`);
    }

    initializeGameElements() {
        // Reset player position
        this.currentTrack = 1;
        this.player.setAttribute('data-position', '1');
        
        // Initialize tracks
        this.tracks.forEach(track => {
            track.classList.remove('active', 'correct', 'wrong');
        });
        
        // Set initial active track
        this.tracks[1].classList.add('active');

        // Reset player state
        const playerBall = this.player.querySelector('.player-ball');
        playerBall.classList.remove('moving');
    }

    startGame() {
        // Reset game state
        this.score = 0;
        this.lives = 3;
        this.currentTrack = 1;
        this.streak = 0;
        this.level = 1;
        this.baseTime = 60;
        this.timeLeft = this.baseTime;
        this.questionsAnswered = 0;
        this.maxStreak = 0;
        this.usedQuestions.clear();
        this.isGameRunning = true;

        // Update display
        this.updateHUD();
        this.showScreen('game-screen');

        // Focus the game area
        if (this.gameArea) {
            setTimeout(() => {
                this.gameArea.focus();
            }, 100);
        }

        // Start background music
        this.sounds.background.currentTime = 0;
        this.sounds.background.play();

        // Generate first question
        this.generateQuestion();
        
        // Start timer
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        
        // Start game loop
        this.gameLoop();
    }

    checkAnswer(trackIndex) {
        if (!this.canAnswer || !this.currentQuestion) return;
        this.canAnswer = false;

        const isCorrect = trackIndex === this.currentQuestion.correct;
        const selectedTrack = this.tracks[trackIndex];
        const correctTrack = this.tracks[this.currentQuestion.correct];

        if (isCorrect) {
            selectedTrack.classList.add('correct', 'correct-animation');
            this.handleCorrectAnswer();
        } else {
            selectedTrack.classList.add('wrong', 'wrong-animation');
            correctTrack.classList.add('correct');
            this.handleWrongAnswer();
        }

        // Show explanation
        this.showExplanation(this.currentQuestion.explanation);

        // Setup next question or end game
        setTimeout(() => {
            this.tracks.forEach(track => track.classList.remove('correct', 'wrong', 'active', 'correct-animation', 'wrong-animation'));
            this.hideExplanation();
            if (this.lives > 0 && this.timeLeft > 0) {
                this.canAnswer = true;
                this.generateQuestion();
            } else {
                this.gameOver();
            }
        }, 2000);
    }

    createParticleEffect(element, color) {
        const particleCount = 30;
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = (element.getBoundingClientRect().left + window.scrollX + element.offsetWidth / 2) + 'px';
        container.style.top = (element.getBoundingClientRect().top + window.scrollY + element.offsetHeight / 2) + 'px';
        container.style.width = '0';
        container.style.height = '0';
        container.style.zIndex = '1000';
        document.body.appendChild(container);

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = 3 + Math.random() * 7;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.background = color;
            particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
            
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = 2 + Math.random() * 3;
            const distance = 50 + Math.random() * 100;
            
            particle.animate([
                { 
                    transform: 'translate(0, 0) scale(1)',
                    opacity: 1
                },
                { 
                    transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 1000 + Math.random() * 500,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                fill: 'forwards'
            });
            
            container.appendChild(particle);
        }
        
        setTimeout(() => container.remove(), 2000);
    }

    showExplanation(text) {
        this.hideExplanation(); // Remove any existing explanation

        const explanation = document.createElement('div');
        explanation.className = 'explanation';
        explanation.style.display = 'block';
        explanation.style.position = 'fixed';
        explanation.style.left = '50%';
        explanation.style.top = '40%';
        explanation.style.transform = 'translate(-50%, -50%)';
        explanation.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        explanation.style.color = 'white';
        explanation.style.padding = '8px 12px';
        explanation.style.borderRadius = '6px';
        explanation.style.zIndex = '1000';
        explanation.style.maxWidth = '60%';
        explanation.style.maxHeight = '40px';
        explanation.style.textAlign = 'center';
        explanation.style.fontSize = '13px';
        explanation.style.lineHeight = '1.2';
        explanation.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        explanation.style.overflow = 'auto';
        
        const textWrapper = document.createElement('div');
        textWrapper.textContent = text;
        explanation.appendChild(textWrapper);
        
        document.body.appendChild(explanation);
        
        // Store the explanation element reference
        this.currentExplanation = explanation;
    }

    hideExplanation() {
        if (this.currentExplanation) {
            this.currentExplanation.remove();
            this.currentExplanation = null;
        }
    }

    handleCorrectAnswer() {
        // Update score and streak
        const baseScore = 100;
        const streakBonus = Math.floor(this.streak * 0.5) * 100;
        this.score += baseScore + streakBonus;
        this.streak++;
        this.questionsAnswered++;

        if (this.streak > this.maxStreak) {
            this.maxStreak = this.streak;
        }

        // Check for level completion
        const currentLevelQuestions = grammarQuestions[`level${this.level}`];
        if (currentLevelQuestions && this.usedQuestions.size >= Math.min(this.questionsPerLevel, currentLevelQuestions.length)) {
            this.levelUp();
        }

        // Play sound and create particles
        this.sounds.correct.play();
        
        // Create multiple particle effects for more impact
        const colors = ['#4CAF50', '#81C784', '#A5D6A7'];
        colors.forEach((color, i) => {
            setTimeout(() => {
                this.createParticleEffect(this.player, color);
            }, i * 100);
        });

        // Add a quick scale up effect to the player
        this.player.style.transform = `translateX(-50%) scale(1.2)`;
        setTimeout(() => {
            this.player.style.transform = `translateX(-50%) scale(1)`;
        }, 200);

        this.updateHUD();
    }

    handleWrongAnswer() {
        this.lives--;
        this.streak = 0;
        this.sounds.wrong.play();
        
        // Create multiple particle effects for more impact
        const colors = ['#FF4444', '#EF5350', '#E57373'];
        colors.forEach((color, i) => {
            setTimeout(() => {
                this.createParticleEffect(this.player, color);
            }, i * 100);
        });

        // Add a shake effect to the player
        this.player.classList.add('shake-wrong');
        setTimeout(() => {
            this.player.classList.remove('shake-wrong');
        }, 500);

        this.updateHUD();
    }

    updateHUD() {
        this.scoreDisplay.querySelector('span').textContent = this.score;
        this.livesDisplay.querySelector('span').textContent = this.lives;
        this.streakDisplay.querySelector('span').textContent = this.streak;
        this.levelDisplay.querySelector('span').textContent = this.level;
        this.timerDisplay.textContent = this.timeLeft;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.sounds.background.pause();
            clearInterval(this.timerInterval);
            this.showScreen('pause-screen');
        } else {
            this.sounds.background.play();
            this.showScreen('game-screen');
            // Restart timer
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        }
    }

    quitGame() {
        this.isGameRunning = false;
        this.isPaused = false;
        this.sounds.background.pause();
        this.sounds.background.currentTime = 0;
        clearInterval(this.timerInterval);
        this.showScreen('menu-screen');
    }

    gameOver() {
        this.isGameRunning = false;
        this.isPaused = false;
        this.sounds.background.pause();
        this.sounds.background.currentTime = 0;
        clearInterval(this.timerInterval);

        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.score);
        }

        // Update game over screen
        document.getElementById('final-score').querySelector('span').textContent = this.score;
        document.getElementById('questions-answered').textContent = this.questionsAnswered || 0;
        document.getElementById('max-streak').textContent = this.maxStreak || this.streak;
        document.getElementById('final-level').textContent = this.level;
        
        this.showScreen('game-over-screen');
    }

    showScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.toggle('hidden', screen.id !== screenId);
        });

        // Update high score in main menu
        if (screenId === 'menu-screen') {
            const highScoreDisplay = document.getElementById('high-score').querySelector('span');
            highScoreDisplay.textContent = this.highScore;
        }
    }

    generateQuestion() {
        const currentLevelQuestions = grammarQuestions[`level${this.level}`];
        if (!currentLevelQuestions) return;

        // Filter out questions that have been used
        const availableQuestions = currentLevelQuestions.filter(q => !this.usedQuestions.has(q.question));

        // If all questions have been used, reset the tracking
        if (availableQuestions.length === 0) {
            this.usedQuestions.clear();
            this.currentQuestion = currentLevelQuestions[Math.floor(Math.random() * currentLevelQuestions.length)];
        } else {
            // Select a random question from available questions
            this.currentQuestion = availableQuestions[Math.floor(Math.random() * availableLevelQuestions.length)];
        }

        // Track this question
        this.usedQuestions.add(this.currentQuestion.question);

        // Display the question
        this.displayQuestion();
    }

    displayQuestion() {
        if (!this.currentQuestion) return;
        
        const questionText = document.getElementById('question-text');
        const answersContainer = document.getElementById('answers');
        
        questionText.textContent = this.currentQuestion.question;
        answersContainer.innerHTML = '';
        
        this.currentQuestion.options.forEach((option, index) => {
            const answerElement = document.createElement('div');
            answerElement.className = 'answer';
            answerElement.textContent = option;
            answerElement.dataset.track = index;
            answerElement.addEventListener('click', () => {
                this.checkAnswer(index);
            });
            answersContainer.appendChild(answerElement);
        });
    }

    levelUp() {
        this.level++;
        this.usedQuestions.clear(); // Clear used questions for the new level
        
        // Add bonus time for leveling up
        const timeBonus = 10 + (this.level * 5); // More time for higher levels
        this.timeLeft += timeBonus;
        
        // Increase base time for the new level
        this.baseTime = 60 + ((this.level - 1) * 10); // 10 seconds more per level
        
        // Play level up sound
        this.sounds.powerup.play();
        
        // Create celebratory particle effects
        const colors = ['#FFD700', '#FFA500', '#FF8C00'];
        colors.forEach((color, i) => {
            setTimeout(() => {
                this.createParticleEffect(this.player, color);
            }, i * 100);
        });
        
        // Show level up message
        const levelUpMsg = document.createElement('div');
        levelUpMsg.className = 'level-up-message';
        levelUpMsg.style.position = 'fixed';
        levelUpMsg.style.top = '30%';
        levelUpMsg.style.left = '50%';
        levelUpMsg.style.transform = 'translate(-50%, -50%)';
        levelUpMsg.style.color = '#FFD700';
        levelUpMsg.style.fontSize = '24px';
        levelUpMsg.style.fontWeight = 'bold';
        levelUpMsg.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
        levelUpMsg.style.zIndex = '1000';
        levelUpMsg.textContent = `Level ${this.level}! +${timeBonus}s`;
        
        document.body.appendChild(levelUpMsg);
        
        // Animate and remove the message
        levelUpMsg.animate([
            { opacity: 0, transform: 'translate(-50%, -30%)' },
            { opacity: 1, transform: 'translate(-50%, -50%)' },
            { opacity: 1, transform: 'translate(-50%, -50%)' },
            { opacity: 0, transform: 'translate(-50%, -70%)' }
        ], {
            duration: 2000,
            easing: 'ease-out'
        }).onfinish = () => levelUpMsg.remove();
        
        this.updateHUD();
    }

    gameLoop() {
        if (!this.isGameRunning || this.isPaused) return;

        // Update track movement based on game speed
        this.tracks.forEach(track => {
            track.style.animationDuration = `${2 / this.gameSpeed}s`;
        });

        // Call game loop again
        requestAnimationFrame(() => this.gameLoop());
    }

    updateTimer() {
        if (this.isPaused) return;

        this.timeLeft--;
        this.updateTimerDisplay();

        if (this.timeLeft <= 0) {
            clearInterval(this.timerInterval);
            this.gameOver();
        }
    }

    updateTimerDisplay() {
        this.timerDisplay.textContent = this.timeLeft;
    }

    shareScore() {
        const shareText = `I scored ${this.score} points in Subway Grammar Runner! Can you beat my score?`;
        if (navigator.share) {
            navigator.share({
                title: 'Subway Grammar Runner',
                text: shareText,
                url: window.location.href
            }).then(() => {
                console.log('Thanks for sharing!');
            })
            .catch(console.error);
        } else {
            // Fallback if navigator.share is not supported
            prompt('Copy your score and share it!', shareText);
        }
    }

    movePlayer(newTrack) {
        console.log(`Attempting to move to track ${newTrack}`);
        if (newTrack < 0 || newTrack > 2) {
            console.warn(`Invalid track index: ${newTrack}`);
            return;
        }

        if (newTrack >= 0 && newTrack <= 2 && !this.isPaused && this.isGameRunning) {
            // Remove active class from all tracks
            this.tracks.forEach(track => track.classList.remove('active'));
            
            // Add active class to new track
            this.tracks[newTrack].classList.add('active');
            
            // Update player position
            this.currentTrack = newTrack;
            this.player.dataset.position = newTrack;
            
            console.log(`Moved to track ${this.currentTrack}`);
        }
    }

    handleKeyPress(e) {
        if (!this.isGameRunning || this.isPaused || !this.canMove) return;

        switch(e.key) {
            case 'ArrowLeft':
                if (this.currentTrack > 0) {
                    console.log(`Moving left from track ${this.currentTrack} to ${this.currentTrack - 1}`);
                    this.movePlayer(this.currentTrack - 1);
                    this.canMove = false;
                    setTimeout(() => this.canMove = true, this.moveCooldown);
                }
                break;
            case 'ArrowRight':
                if (this.currentTrack < 2) {
                    console.log(`Moving right from track ${this.currentTrack} to ${this.currentTrack + 1}`);
                    this.movePlayer(this.currentTrack + 1);
                    this.canMove = false;
                    setTimeout(() => this.canMove = true, this.moveCooldown);
                }
                break;
            case 'Enter':
                if (this.canAnswer) {
                    this.checkAnswer(this.currentTrack);
                }
                break;
            case 'Escape':
                this.togglePause();
                break;
        }
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new SubwayGrammarGame();
});

