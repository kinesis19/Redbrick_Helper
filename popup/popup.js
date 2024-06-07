let isRunning = false;
let elapsedTime = 0;
let lastTimestamp;

const stopwatchDisplay = document.getElementById('stopwatch');
const toggleButton = document.getElementById('toggle-button');
const resetButton = document.getElementById('reset-button');

// 화면에 시간을 표시하는 함수
function updateDisplay() {
    const seconds = Math.floor(elapsedTime / 1000) % 60;
    const minutes = Math.floor(elapsedTime / 60000) % 60;
    const hours = Math.floor(elapsedTime / 3600000);
    stopwatchDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(number) {
    return number < 10 ? `0${number}` : number;
}

// 로컬 스토리지에서 스톱워치 상태를 복원
function restoreState() {
    const storedState = JSON.parse(localStorage.getItem('stopwatchState'));
    if (storedState && storedState.running) {  // 수정된 부분: storedDuration -> storedState
        elapsedTime = storedState.elapsedTime;
        lastTimestamp = Date.now();
        isRunning = true;
        toggleButton.textContent = 'Stop';
        requestAnimationFrame(step);
    } else {
        elapsedTime = storedState ? storedState.elapsedTime : 0;
        updateDisplay();
    }
}


function fetchElapsedTime() {
    chrome.runtime.sendMessage({ command: 'getElapsedTime' }, (response) => {
        updateDisplay(response.elapsedTime);
    });
}   


toggleButton.addEventListener('click', () => {
    if (!isRunning) {
        isRunning = true;
        lastTimestamp = Date.now();
        toggleButton.textContent = 'Stop';
        requestAnimationFrame(step);
    } else {
        isRunning = false;
        elapsedTime += Date.now() - lastTimestamp;
        toggleButton.textContent = 'Start';
        saveState();  // 상태 저장
    }
});

function step() {
    if (isRunning) {
        const now = Date.now();
        elapsedTime += now - lastTimestamp;
        lastTimestamp = now;
        updateDisplay();
        requestAnimationFrame(step);
    }
}

resetButton.addEventListener('click', () => {
    elapsedTime = 0;
    isRunning = false;
    toggleButton.textContent = 'Start';
    // stopwatchDisplay.textContent = '00:00:00';
    updateDisplay();
    saveState();  // 상태 저장
});

// 스톱워치 상태를 로컬 스토리지에 저장
function saveState() {
    const state = {
        elapsedTime: elapsedTime,
        running: isRunning
    };
    localStorage.setItem('stopwatchState', JSON.stringify(state));
}

setInterval(fetchElapsedTime, 1000); // 1초마다 시간 업데이트

// DOM이 로드될 때 스톱워치 상태 복원
document.addEventListener('DOMContentLoaded', restoreState);
