let isRunning = false;
let elapsedTime = 0;
let lastTimestamp;

const stopwatchDisplay = document.getElementById('stopwatch');
const toggleButton = document.getElementById('toggle-button');
const resetButton = document.getElementById('reset-button');

// ȭ�鿡 �ð��� ǥ���ϴ� �Լ�
function updateDisplay() {
    const seconds = Math.floor(elapsedTime / 1000) % 60;
    const minutes = Math.floor(elapsedTime / 60000) % 60;
    const hours = Math.floor(elapsedTime / 3600000);
    stopwatchDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(number) {
    return number < 10 ? `0${number}` : number;
}

// ���� ���丮������ �����ġ ���¸� ����
function restoreState() {
    const storedState = JSON.parse(localStorage.getItem('stopwatchState'));
    if (storedState && storedState.running) {  // ������ �κ�: storedDuration -> storedState
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
        saveState();  // ���� ����
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
    saveState();  // ���� ����
});

// �����ġ ���¸� ���� ���丮���� ����
function saveState() {
    const state = {
        elapsedTime: elapsedTime,
        running: isRunning
    };
    localStorage.setItem('stopwatchState', JSON.stringify(state));
}

setInterval(fetchElapsedTime, 1000); // 1�ʸ��� �ð� ������Ʈ

// DOM�� �ε�� �� �����ġ ���� ����
document.addEventListener('DOMContentLoaded', restoreState);
