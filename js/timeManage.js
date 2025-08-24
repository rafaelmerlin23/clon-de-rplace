let timeLeft = 30;
let countdownInterval = null;
const timerElement = document.getElementById('uses');

function startCountdown() {

    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    timeLeft = 30;
    updateTimerDisplay();
    
    countdownInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            handleTimeUp();
        }
    }, 1000);
}

function updateTimerDisplay() {
    if (timerElement) {
        timerElement.textContent = `Regresando en: ${timeLeft}s`;
    }
}

function handleTimeUp() {
    localStorage.setItem("use",100)
    document.getElementById("changeMode").disabled = false;
    timerElement.textContent = "Usos: "+localStorage.getItem("use");
    

}

