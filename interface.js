document.addEventListener('DOMContentLoaded', () => {
  const recordButton = document.getElementById('recordButton');
  // const modeSwitch = document.getElementById('modeSwitch');
  const responseArea = document.getElementById('responseArea');

  let isRecording = false;

  function updateButton() {
    recordButton.textContent = isRecording ? 'Stop Recording and Get Ans' : 'Start Recording';
  }

  function handleMessage(message) {
    if (message.type === 'updateRecordingState') {
      isRecording = message.isRecording;
      updateButton();
    } else if (message.type === 'updateResponse') {
      const newResponse = document.createElement('div');
      newResponse.textContent = message.text;
      responseArea.appendChild(newResponse);
    }
  }

  recordButton.addEventListener('click', () => {
    if (isRecording) {
      chrome.runtime.sendMessage({ type: 'stopRecording' });
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.runtime.sendMessage({ type: 'startRecording', tabId: tabs[0].id });
      });
    }
  });

  // modeSwitch.addEventListener('change', (event) => {
  //   chrome.runtime.sendMessage({ type: 'setMode', mode: event.target.value });
  // });

  chrome.runtime.onMessage.addListener(handleMessage);

  updateButton();
  // modeSwitch.value = 'manual';
});
