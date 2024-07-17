export const getChromeStorageData = (keys) => {
    return new Promise((resolve) => {
        chrome.storage.local.get(keys, (data) => {
            resolve(data);
        });
    });
};

export const setChromeStorageData = (data) => {
    return new Promise((resolve) => {
        chrome.storage.local.set(data, () => {
            resolve();
        });
    });
};

export const removeChromeStorageData = (keys) => {
    return new Promise((resolve) => {
        chrome.storage.local.remove(keys, () => {
            resolve();
        });
    });
};
