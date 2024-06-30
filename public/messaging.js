// Function to send a message to the content script
export function sendMessageToContentScript(message, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, message, callback);
        } else {
            console.error('No active tab found');
        }
    });
}