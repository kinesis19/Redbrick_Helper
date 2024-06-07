let isRunning = false;
let elapsedTime = 0;
let lastTimestamp;

function startStopwatch() {
    if (!isRunning) {
        isRunning = true;
        lastTimestamp = Date.now();
        step();
    }
}

function stopStopwatch() {
    if (isRunning) {
        elapsedTime += Date.now() - lastTimestamp;
        isRunning = false;
        saveState();  // 상태 저장
    }
}

function resetStopwatch() {
    elapsedTime = 0;
    isRunning = false;
    saveState();  // 상태 저장
}

function step() {
    if (isRunning) {
        const now = Date.now();
        elapsedTime += now - lastTimestamp;
        lastTimestamp = now;
        saveState();  // 주기적인 상태 저장
        setTimeout(step, 1000); // 갱신 주기를 1초로 설정
    }
}

function getElapsedTime() {
    return elapsedTime;
}

function isStopwatchRunning() {
    return isRunning;
}

function saveState() {
    const state = {
        elapsedTime: elapsedTime,
        running: isRunning
    };
    localStorage.setItem('stopwatchState', JSON.stringify(state));
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'start') {
        startStopwatch();
    } else if (message.command === 'stop') {
        stopStopwatch();
    } else if (message.command === 'reset') {
        resetStopwatch();
    } else if (message.command === 'getElapsedTime') {
        sendResponse({ elapsedTime: getElapsedTime(), isRunning: isStopwatchRunning() });
    }
});
