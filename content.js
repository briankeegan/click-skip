
console.log('content.js is started');


// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = (mutationList, observer) => {
  for (const mutation of mutationList) {
    if (mutation.type === 'childList') {
      console.log('A child node has been added or removed.');
    } else if (mutation.type === 'attributes') {
      console.log(`The ${mutation.attributeName} attribute was modified.`);
    }
  }
};


// ====,f



// Allow everything
const ALLOWED_TO_OPEN = ['/'];

const POSSIBLE_OBJECTS_2 = ['isAllowedUrl', 'isOn', 'token', 'url', 'tabId', 'tabUrl']

let observer = new MutationObserver(callback);
const skipAds = async () => {
    observer.disconnect();
    observer = new MutationObserver(callback);
    const { tabUrl } = await chrome.storage.local.get(POSSIBLE_OBJECTS_2);
    console.log({tabUrl})
    if (tabUrl.includes('youtube.com')) {
        const adsContainer = document.querySelector('.video-ads');
        if (adsContainer) {
            observer.observe(targetNode, config);
        }
    }
    
}

const startOrStop = async () => {
    const { isAllowedUrl, isOn } = await chrome.storage.local.get(POSSIBLE_OBJECTS_2);
    if (isAllowedUrl && isOn) {
        // Do start here
    } else {
        observer.disconnect();
    }
}



const validateUrlIsAllowed = async (tabUrl) => {
    console.log(tabUrl);
    const isAllowedUrl = ALLOWED_TO_OPEN.some(url => tabUrl.includes(url));
    chrome.storage.local.set({ isAllowedUrl, tabUrl });
}




chrome.storage.onChanged.addListener(async function (changes, namespace) {
    if (changes.isOn) {
        startOrStop();
    }   
});

const onStart = async () => {
    await validateUrlIsAllowed(window.location.href)

    startOrStop();
}
onStart()

// chrome.webNavigation.onCompleted.addListener(function(details) {
//     console.log(details);
//    onStart()
// });
// chrome.webNavigation.onCompleted.addListener(function(details) {
//     chrome.tabs.executeScript(details.tabId, {
//         code: ' if (document.body.innerText.indexOf("Cat") !=-1) {' +
//               '     alert("Cat not found!");' +
//               ' }'
//     });
// }, {
//     url: [{
//         // Runs on example.com, example.net, but also example.foo.com
//         hostContains: '.example.'
//     }],
// });
