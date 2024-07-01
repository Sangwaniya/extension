function createSidebar() {
  const sidebar = document.createElement('div');
  sidebar.id = 'extension-sidebar';
  sidebar.classList.add('collapsed');

  const toggle = document.createElement('button');
  toggle.id = 'sidebar-toggle';
  toggle.textContent = '◀';
  toggle.onclick = () => sidebar.classList.toggle('collapsed');

  sidebar.appendChild(toggle);

  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('sidebar.html');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';

  sidebar.appendChild(iframe);
  document.body.appendChild(sidebar);
}

createSidebar();

// Listen for messages from the sidebar iframe
window.addEventListener('message', function(event) {
  if (event.data.type === 'FROM_SIDEBAR') {
      chrome.runtime.sendMessage(event.data.message);
  }
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TO_SIDEBAR') {
      const iframe = document.querySelector('#extension-sidebar iframe');
      if (iframe) {
          iframe.contentWindow.postMessage({ type: 'FROM_CONTENT', message: message }, '*');
      }
  }
});

// Add global shortcut listener
document.addEventListener('keydown', (event) => {
  if (event.shiftKey && event.key === 'A') {
      const iframe = document.querySelector('#extension-sidebar iframe');
      if (iframe) {
          iframe.contentWindow.postMessage({ type: 'FROM_CONTENT', message: { type: 'toggleRecording' } }, '*');
      }
  }
});