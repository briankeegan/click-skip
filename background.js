console.log('background.js is running');

const ALLOWED_TO_OPEN = ['/'];

const validateUrlIsAllowed = async (tabUrl) => {
    console.log(tabUrl);
    const isAllowedUrl = ALLOWED_TO_OPEN.some(url => tabUrl.includes(url));
    chrome.storage.local.set({ isAllowedUrl, tabUrl });
}

chrome.tabs.onActivated.addListener(async response => {
    const tab = await chrome.tabs.get(response.tabId);
    validateUrlIsAllowed(tab.url);
});
