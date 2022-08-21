
// Allow everything
const ALLOWED_TO_OPEN = ['/'];

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


const validateUrlIsAllowed = async (tabUrl) => {
    const isAllowedUrl = ALLOWED_TO_OPEN.some(url => tabUrl.includes(url));
    chrome.storage.local.set({ isAllowedUrl });
}


chrome.tabs.onActivated.addListener(async response => {
    const tab = await chrome.tabs.get(response.tabId);
    validateUrlIsAllowed(tab.url);
});

let count = 0;
let counter;
const startCount = async () => {
    console.log(++count);
}


const getCurrentTab = async () => {
    const tabs = await chrome.tabs.query({
        active: true, currentWindow: true
    });
    return tabs[0];
}



chrome.storage.onChanged.addListener(async function (changes, namespace) {
    if (changes.isOn) {
        startOrStopCount();
    }   
});

const onStart = async () => {
    const currentTab = await getCurrentTab();
    await validateUrlIsAllowed(currentTab.url)

    startOrStopCount();
}

onStart();



// onload? only run on particular pages? or when you say start.
// when you start on particular page.
// add count (number of times it ran) to storage.