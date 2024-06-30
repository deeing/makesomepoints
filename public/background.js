// background.js

// Listen for messages from the popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message in service worker:', message);

    if (message.type === 'GREETINGS') {
        sendResponse({ message: 'Hello from service worker!' });
    }

    // Return true to indicate that the response will be sent asynchronously
    return true;
});
