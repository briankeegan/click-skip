
console.log('content.js is started');


// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = (mutationList, observer) => {
  for (const mutation of mutationList) {

    const skipButton = document.querySelector('.ytp-ad-skip-button');
    const closeAdButtom = document.querySelector('.ytp-ad-overlay-close-button');
    if (skipButton) {
        console.log('skipButton is found');
        skipButton.click();
    }
    if (closeAdButtom) {
        console.log('closeAdButtom is found');
        closeAdButtom.click();
    }
    // const className = mutation?.target?.className
    // if (
    //     className?.includes('ytp-ad-skip-button') 
    //     || className?.includes('ytp-ad-overlay-close-button'
    // )) {
    //     console.log('skipped add!');
    //     mutation.target.click();
    // }
    // // 
    // if (mutation.type === 'childList') {
    //     console.log(mutation);
    //   console.log('A child node has been added or removed.');
    // } else if (mutation.type === 'attributes') {
    //      console.log(mutation);
    //   console.log(`The ${mutation.attributeName} attribute was modified.`);
    // }
  }
};


// ====,f



// Allow everything
const ALLOWED_TO_OPEN = ['/'];

const POSSIBLE_OBJECTS_2 = ['isAllowedUrl', 'isOn', 'token', 'url', 'tabId', 'tabUrl']

const observer = new MutationObserver(callback);
const skipAds = async () => {
    const { tabUrl } = await chrome.storage.local.get(POSSIBLE_OBJECTS_2);
    console.log(tabUrl.includes('youtube.com'))
    // youtube case:
    if (tabUrl.includes('youtube.com')) {
        // const adsContainer = document.querySelector('.ytp-ad-message-container');
        const adsContainer = document.querySelector('.video-ads');
        const skipButton = document.querySelector('.ytp-ad-skip-button');
        const closeAdButtom = document.querySelector('.ytp-ad-overlay-close-button');
        if (skipButton) {
            console.log('skipButton is found');
            skipButton.click();
        }
        if (closeAdButtom) {
            console.log('closeAdButtom is found');
            closeAdButtom.click();
        }
        if (adsContainer) {
            console.log('observer hapenning');
            observer.observe(adsContainer, config);
        } else {
            setTimeout(() => {
                skipAds();
            }, 100);
        }
    }
    
}
// https://www.youtube.com/watch?v=gHnuQZFxHt0
const startOrStop = async () => {
    const { isAllowedUrl, isOn } = await chrome.storage.local.get(POSSIBLE_OBJECTS_2);
    console.log({isAllowedUrl, isOn})
    if (isAllowedUrl && isOn) {
        observer = new MutationObserver(callback);
        skipAds();
    } 
    if (!isOn) {
        observer.disconnect();
    }
}



const validateUrlIsAllowed = async (tabUrl) => {
    if (!isAllowedUrl) {
        console.log('content: url is not allowed, ', tabUrl);
        return false;
    }
    const isAllowedUrl = ALLOWED_TO_OPEN.some(url => tabUrl.includes(url));
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