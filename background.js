
// Allow everything
const ALLOWED_TO_OPEN = ['.'];

const POSSIBLE_OBJECTS = ['isAllowedUrl', 'isOn', 'token', 'url', 'tabId']

const startOrStopCount = async () => {
    const { isAllowedUrl, isOn, token, url } = await chrome.storage.local.get(POSSIBLE_OBJECTS);
    console.log({ isAllowedUrl, isOn, token, url });
    if (isAllowedUrl && isOn) {
        // Restart it
        clearInterval(counter);
        counter = setInterval(() => {
            startCount();
        }, 1000);
    } else {
        clearInterval(counter); 
        chrome.storage.local.set({
            isOn: false,
        })
    }
}

chrome.tabs.onActivated.addListener(async response => {
    const tab = await chrome.tabs.get(response.tabId);
    const isAllowedUrl = ALLOWED_TO_OPEN.some(url => tab.url.includes(url));
    chrome.storage.local.set({ isAllowedUrl });
});



let currentDate = 0;
// tabId

const reloadTab = async () => {
    const { tabId } = await chrome.storage.local.get(POSSIBLE_OBJECTS);
    console.log('reloading...', tabId);
    chrome.tabs.reload(tabId);
}

let count = 0;
let counter;
const startCount = async () => {
    console.log(++count);
}

console.log('background.js loaded');
chrome.storage.onChanged.addListener(async function (changes, namespace) {
    console.log({ changes , namespace })
    if (changes.isOn) {
        startOrStopCount();
    }   
});



// onload? only run on particular pages? or when you say start.
// when you start on particular page.
// add count (number of times it ran) to storage.