chrome.runtime.onInstalled.addListener(function () {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError);
            return;
        }
        // Store the token in chrome.storage
        chrome.storage.local.set({ token: token });
    });
});

chrome.runtime.onStartup.addListener(function () {
    // Retrieve the token from chrome.storage
    chrome.storage.local.get("token", function (data) {
        if (data.token) {
            console.log("Token retrieved from storage:", data.token);
            // You can use the token to make API calls
        } else {
            console.log("No token found. Please log in.");
        }
    });
});
