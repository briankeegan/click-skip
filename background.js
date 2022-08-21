// Select the node that will be observed for mutations
const targetNode = document.getElementById('some-id');

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

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

// Later, you can stop observing
observer.disconnect();

// ====

// Allow everything
const ALLOWED_TO_OPEN = ['/'];

const POSSIBLE_OBJECTS = ['isAllowedUrl', 'isOn', 'token', 'url', 'tabId']

const startOrStop = async () => {
    const { isAllowedUrl, isOn, token, url } = await chrome.storage.local.get(POSSIBLE_OBJECTS);
    console.log({ isAllowedUrl, isOn, token, url });
    if (isAllowedUrl && isOn) {
        // Do start here
    } else {
        // Stop stuff here
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


const getCurrentTab = async () => {
    const tabs = await chrome.tabs.query({
        active: true, currentWindow: true
    });
    return tabs[0];
}



chrome.storage.onChanged.addListener(async function (changes, namespace) {
    if (changes.isOn) {
        startOrStop();
    }   
});

const onStart = async () => {
    const currentTab = await getCurrentTab();
    await validateUrlIsAllowed(currentTab.url)

    startOrStop();
}

onStart();