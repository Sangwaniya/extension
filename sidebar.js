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

    function toggleRecording() {
        isRecording = !isRecording;
        updateRecordButton();
        sendMessage({ 
            type: isRecording ? 'startRecording' : 'stopRecording',
            mode: isAutoMode ? 'auto' : 'manual',
            speaker: speakerInput.value
        });
    }

    function updateRecordButton() {
        recordButton.textContent = isRecording ? 'Stop Recording' : 'Start Recording';
        recordButton.style.backgroundColor = isRecording ? '#ff4444' : '#4CAF50';
    }

    function toggleMode() {
        isAutoMode = modeSwitch.value === 'auto';
        sendMessage({ type: 'setMode', mode: isAutoMode ? 'auto' : 'manual' });
    }

    function updateSpeaker() {
        sendMessage({ type: 'setSpeaker', speaker: speakerInput.value });
    }

    function sendMessage(message) {
        window.parent.postMessage({ type: 'FROM_SIDEBAR', message: message }, '*');
    }

    // Listen for messages from the content script
    window.addEventListener('message', function(event) {
        if (event.data.type === 'FROM_CONTENT') {
            const message = event.data.message;
            if (message.type === 'updateResponse') {
                responseArea.textContent += message.text + '\n';
            } else if (message.type === 'updateRecordingState') {
                isRecording = message.isRecording;
                updateRecordButton();
            } else if (message.type === 'toggleRecording') {
                toggleRecording();
            }
        }
    });

    // Initialize the UI
    updateRecordButton();
});