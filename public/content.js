// Function to listen for messages from the background script
function listenForMessages(handler) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        handler(message, sender, sendResponse);
        return true; // Return true to indicate that the response will be sent asynchronously
    });
}

// Log a message to the web page's console
console.log("Hello from content script!");

// Example: Add a custom element to the web page
const customElement = document.createElement('div');
customElement.style.position = 'fixed';
customElement.style.bottom = '10px';
customElement.style.right = '10px';
customElement.style.padding = '10px';
customElement.style.backgroundColor = 'yellow';
customElement.textContent = "Hello, world!";
document.body.appendChild(customElement);

// Listen for messages
listenForMessages((message, sender, sendResponse) => {
    console.log('Received message in content script:', message);

    if (message.type === 'GREETINGS') {
        sendResponse({ message: 'Hello from content script!' });
    }
});
