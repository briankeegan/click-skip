
console.log('content.js is started');


// Options for the observer (which mutations to observe)
const config = { childList: true, subtree: false };

let hasStartedObserving = false;




// Allow everything
const ALLOWED_TO_OPEN = ['/'];

const POSSIBLE_OBJECTS_2 = ['isAllowedUrl', 'isOn', 'token', 'url', 'tabId', 'tabUrl']



// Make this into reusable
// take array of possible things to skip
// array of container(s) to observe.

const youTubeContainerSelector = '.video-ads';
const youTubeClickableSelectors = ['.ytp-ad-skip-button', '.ytp-ad-overlay-close-button'];

const findAndClick = async (selector) => {
    const element = await document.querySelector(selector);
    if (element) {
        console.log('found element and clicked', selector);
        element.click();
    }
}

const observeContainerAndButtons = async ({
    containerSelector,
    clickableSelectors,
}) => {
    const adsContainer = document.querySelector(containerSelector);
    // await clickableSelectors.forEach(findAndClick);
    clickableSelectors.forEach(findAndClick);
    
    if (adsContainer) {
        console.log('observer hapenning');
        observer = new MutationObserver((mutationList, observer) => {
            for (let i = 0; i < mutationList.length; i++) {
                clickableSelectors.forEach(findAndClick);
            }
        })
        .observe(adsContainer, config)
    } else {
        setTimeout(() => {
            observeContainerAndButtons({
                containerSelector,
                clickableSelectors,
            });
        }, 100);
    }
}

let observer = null;
const skipAds = async () => {
    const { tabUrl } = await chrome.storage.local.get(POSSIBLE_OBJECTS_2);
    // youtube case:
    if (tabUrl.includes('youtube.com')) {
        observeContainerAndButtons({
            containerSelector: youTubeContainerSelector,
            clickableSelectors: youTubeClickableSelectors,
        });
    }
    
}


// https://www.youtube.com/watch?v=gHnuQZFxHt0
const startOrStop = async () => {
    const { isAllowedUrl, isOn } = await chrome.storage.local.get(POSSIBLE_OBJECTS_2);
    if (isAllowedUrl && isOn) {
        skipAds();
    } 
    if (!isOn) {
        if (Boolean(observer)) {
            observer.disconnect();
        }
    }
}



const validateUrlIsAllowed = async (tabUrl) => {
    const isAllowedUrl = ALLOWED_TO_OPEN.some(url => tabUrl.includes(url));
    if (!isAllowedUrl) {
        console.log('content: url is not allowed, ', tabUrl);
        return false;
    }
    chrome.storage.local.set({ isAllowedUrl, tabUrl });
}




chrome.storage.onChanged.addListener(async function (changes, namespace) {
    if (changes.isOn) {
        await startOrStop();
    }   
});

const onStart = async () => {
    console.log('start!')
    await validateUrlIsAllowed(window.location.href)

    await startOrStop();
}

onStart();