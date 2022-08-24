console.log('background.js is running');

// this is pointless
const ALLOWED_TO_OPEN = ['/'];

const validateUrlIsAllowed = async (tabUrl) => {
    console.log(tabUrl);
    const isAllowedUrl = ALLOWED_TO_OPEN.some(url => tabUrl.includes(url));
    if (!isAllowedUrl) {
        console.log('background: url is not allowed, ', tabUrl);
        return false;
    }
    chrome.storage.local.set({ isAllowedUrl, tabUrl });
}

chrome.tabs.onActivated.addListener(async response => {
    const tab = await chrome.tabs.get(response.tabId);
    validateUrlIsAllowed(tab.url);
});
