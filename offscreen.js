import { GoogleGenerativeAI } from "./node_modules/@google/generative-ai";
// import axios from './node_modules/axios/dist/axios.min.js';
// import axios from 'https://cdn.jsdelivr.net/npm/axios@1.1.2/dist/axios.min.js';

<<<<<<< HEAD
const genAI = new GoogleGenerativeAI('YOUR_API_KEY');
=======
const genAI = new GoogleGenerativeAI('Your gemini api key');
>>>>>>> 3d2fd8693a6288cb3b2c7be8aa109da1877e7650
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.target === 'offscreen') {
    switch (message.type) {
      case 'startRecording':
        startRecording(message.data);
        break;
      case 'stopRecording':
        stopRecording();
        break;
      default:
        console.error('Unrecognized message:', message.type);
        break;
    }
  }
});

let recorder;
let data = [];

async function startRecording(streamId) {
  if (recorder?.state === 'recording') {
    throw new Error('Called startRecording while recording is in progress.');
  }

  const media = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId
      }
    },
    video: false
  });

  const output = new AudioContext();
  const source = output.createMediaStreamSource(media);
  source.connect(output.destination);

  recorder = new MediaRecorder(media, { mimeType: 'audio/webm' });
  recorder.ondataavailable = (event) => data.push(event.data);
  recorder.onstop = async () => {
    const blob = new Blob(data, { type: 'audio/webm' });
    const file = new File([blob], 'recording.webm', { type: 'audio/webm' });

    const response = await sendToGemini(file);
    chrome.runtime.sendMessage({ type: 'updateResponse', text: response });

    recorder = undefined;
    data = [];
  };
  recorder.start();

  window.location.hash = 'recording';
  chrome.runtime.sendMessage({ type: 'updateRecordingState', isRecording: true });
}

async function stopRecording() {
  recorder.stop();
  recorder.stream.getTracks().forEach((t) => t.stop());
  window.location.hash = '';
  chrome.runtime.sendMessage({ type: 'updateRecordingState', isRecording: false });
}

async function sendToGemini(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: file.type,
          fileUri: URL.createObjectURL(file)
        }
      },
      { text: "Answer the audio file." }
    ]);

    return result.response.text();
  } catch (error) {
    console.error('Error sending to Gemini:', error);
    return 'Error processing the audio file.';
  }
}
