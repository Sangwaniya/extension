// const API_KEY = 'AIzaSyCerzLmhbHu_WOGwTaPw4yz3zYFZ52sgOM'; // Add your API key here
// const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

// let audioStream = null;
// let mediaRecorder = null;
// let audioChunks = [];
// let isAutoMode = false;

// chrome.action.onClicked.addListener((tab) => {
//   chrome.windows.create({
//     url: chrome.runtime.getURL("interface.html"),
//     type: "popup",
//     width: 400,
//     height: 600
//   });
// });

// chrome.runtime.onMessage.addListener((message) => {
//   if (message.type === 'startRecording') {
//     startTabCaptureRecording(message.mode);
//   } else if (message.type === 'stopRecording') {
//     stopRecording();
//   } else if (message.type === 'setMode') {
//     isAutoMode = message.mode === 'auto';
//   }
// });

// function startTabCaptureRecording(mode) {
//   try {
//     chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
//       if (chrome.runtime.lastError || !stream) {
//         console.error('Error starting tab capture:', chrome.runtime.lastError);
//         return;
//       }
//       audioStream = stream;
//       mediaRecorder = new MediaRecorder(audioStream);

//       mediaRecorder.ondataavailable = (event) => {
//         audioChunks.push(event.data);
//       };
//       console.log('Tab capture recording  completed, mode:', mode, "data:", audioChunks);


//       mediaRecorder.onstop = processAudioData;



//       // if (mode === 'auto') {
//       //   setupVoiceActivityDetection(audioStream);
//       // } else {
//       //   mediaRecorder.start();
//       // }
      
//       updateRecordingState(true);
//     });
//   } catch (error) {
//     console.error('Error starting tab capture recording:', error);
//     chrome.runtime.sendMessage({ type: 'error', message: 'Error starting tab capture recording: ' + error.message });
//   }
// }

// function stopRecording() {
//   if (mediaRecorder && mediaRecorder.state !== 'inactive') {
//     mediaRecorder.stop();
//   }
//   if (audioStream) {
//     audioStream.getTracks().forEach(track => track.stop());
//   }
//   updateRecordingState(false);
//   console.log('Tab capture recording stopped');
// }

// function updateRecordingState(isRecording) {
//   chrome.runtime.sendMessage({ type: 'updateRecordingState', isRecording });
// }

// async function processAudioData() {
//   const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
//   audioChunks = [];

//   try {
//     const base64Audio = await blobToBase64(audioBlob);
//     const response = await callGeminiAPI(base64Audio);
//     chrome.runtime.sendMessage({ type: 'updateResponse', text: response });
//   } catch (error) {
//     console.error('Error calling Gemini API:', error);
//     chrome.runtime.sendMessage({ type: 'updateResponse', text: 'Error: Failed to call Gemini API.' });
//   }
// }

// async function callGeminiAPI(base64Audio) {
//   const requestBody = {
//     contents: [{
//       parts: [
//         { text: "Listen to this audio and provide a summary:" },
//         { inline_data: { mime_type: "audio/webm", data: base64Audio } }
//       ]
//     }]
//   };

//   const response = await fetch(`${API_ENDPOINT}?key=${API_KEY}`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(requestBody),
//   });

//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }

//   const data = await response.json();
//   return data.candidates[0].content.parts[0].text;
// }

// function blobToBase64(blob) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onloadend = () => resolve(reader.result.split(',')[1]);
//     reader.onerror = reject;
//     reader.readAsDataURL(blob);
//   });
// }

// function setupVoiceActivityDetection(stream) {
//   const audioContext = new AudioContext();
//   const source = audioContext.createMediaStreamSource(stream);
//   const analyzer = audioContext.createAnalyser();
//   source.connect(analyzer);

//   const bufferLength = analyzer.frequencyBinCount;
//   const dataArray = new Uint8Array(bufferLength);

//   let silenceStart = performance.now();
//   let isRecording = false;

//   function checkAudioLevel() {
//     analyzer.getByteFrequencyData(dataArray);
//     const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;

//     if (average > 30 && !isRecording) {
//       mediaRecorder.start();
//       isRecording = true;
//       silenceStart = performance.now();
//       updateRecordingState(true);
//     } else if (average <= 30 && isRecording) {
//       if (performance.now() - silenceStart > 1500) {
//         mediaRecorder.stop();
//         isRecording = false;
//         updateRecordingState(false);
//       }
//     } else if (isRecording) {
//       silenceStart = performance.now();
//     }

//     requestAnimationFrame(checkAudioLevel);
//   }

//   checkAudioLevel();
// }
