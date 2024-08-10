let isAutoMode = false;
let recording = false;

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'startRecording') {
    const existingContexts = await chrome.runtime.getContexts({});
    const offscreenDocument = existingContexts.find(
      (c) => c.contextType === 'OFFSCREEN_DOCUMENT'
    );

    if (!offscreenDocument) {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['USER_MEDIA'],
        justification: 'Recording from chrome.tabCapture API'
      });
    } else {
      recording = offscreenDocument.documentUrl.endsWith('#recording');
    }

    if (recording) {
      chrome.runtime.sendMessage({
        type: 'stopRecording',
        target: 'offscreen'
      });
      chrome.action.setIcon({ path: 'icons/not-recording.png' });
      return;
    }

    const streamId = await chrome.tabCapture.getMediaStreamId({
      targetTabId: message.tabId
    });

    chrome.runtime.sendMessage({
      type: 'startRecording',
      target: 'offscreen',
      data: streamId
    });

    chrome.action.setIcon({ path: '/icons/recording.png' });
  } else if (message.type === 'stopRecording') {
    chrome.runtime.sendMessage({
      type: 'stopRecording',
      target: 'offscreen'
    });
    chrome.action.setIcon({ path: 'icons/not-recording.png' });
  } else if (message.type === 'setMode') {
    isAutoMode = message.mode === 'auto';
  }
});

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.target === 'offscreen') {
    switch (message.type) {
      case 'startRecording':
        recording = true;
        startRecording(message.data);
        break;
      case 'stopRecording':
        recording = false;
        stopRecording();
        break;
      default:
        console.error('Unrecognized message:', message.type);
        break;
    }
  } else if (message.type === 'updateResponse') {
    chrome.runtime.sendMessage({
      type: 'updateResponse',
      text: message.text
    });
  }
});
