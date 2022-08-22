
console.log('content.js is started');


// Options for the observer (which mutations to observe)
const config = { childList: true, subtree: false };

let hasStartedObserving = false;




// Allow everything
const ALLOWED_TO_OPEN = ['/'];

const POSSIBLE_OBJECTS_2 = ['isAllowedUrl', 'isOn', 'token', 'url', 'tabId', 'tabUrl']

const observeYouTube = async () => {
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
            observer = new MutationObserver((mutationList, observer) => {
                for (let i = 0; i < mutationList.length; i++) {

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
                }
            })
            .observe(adsContainer, config)
        } else {
            setTimeout(() => {
                observeYouTube();
            }, 100);
        }
    }

let observer = null;
const skipAds = async () => {
    const { tabUrl } = await chrome.storage.local.get(POSSIBLE_OBJECTS_2);
    console.log(tabUrl.includes('youtube.com'))
    // youtube case:
    if (tabUrl.includes('youtube.com')) {
        observeYouTube();
    }
    
}
// https://www.youtube.com/watch?v=gHnuQZFxHt0
const startOrStop = async () => {
    const { isAllowedUrl, isOn } = await chrome.storage.local.get(POSSIBLE_OBJECTS_2);
    console.log({isAllowedUrl, isOn})
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