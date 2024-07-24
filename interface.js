let isRecording = false;
let isAutoMode = false;

document.addEventListener('DOMContentLoaded', function() {
    const recordButton = document.getElementById('recordButton');
    const modeSwitch = document.getElementById('modeSwitch');
    const speakerInput = document.getElementById('speakerInput');
    const responseArea = document.getElementById('responseArea');

    recordButton.addEventListener('click', toggleRecording);
    modeSwitch.addEventListener('change', toggleMode);
    speakerInput.addEventListener('input', updateSpeaker);

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'updateResponse') {
            responseArea.textContent += message.text + '\n';
        } else if (message.type === 'updateRecordingState') {
            isRecording = message.isRecording;
            updateRecordButton();
        }
    });

    function toggleRecording() {
        isRecording = !isRecording;
        updateRecordButton();
        chrome.runtime.sendMessage({ 
            type: isRecording ? 'startRecording' : 'stopRecording',
            mode: isAutoMode ? 'auto' : 'manual',
            speaker: speakerInput.value
        });
    }

    function updateRecordButton() {
        recordButton.textContent = isRecording ? 'Stop and send Recording' : 'Start Recording';
        recordButton.style.backgroundColor = isRecording ? '#ff4444' : '#4CAF50';
    }

    function toggleMode() {
        isAutoMode = modeSwitch.value === 'auto';
        chrome.runtime.sendMessage({ type: 'setMode', mode: isAutoMode ? 'auto' : 'manual' });
    }

    function updateSpeaker() {
        chrome.runtime.sendMessage({ type: 'setSpeaker', speaker: speakerInput.value });
    }

    // Initialize the UI
    updateRecordButton();
});

// Add global shortcut listener
document.addEventListener('keydown', (event) => {
    if (event.shiftKey && event.key === 'A') {
        document.getElementById('recordButton').click();
    }
});
