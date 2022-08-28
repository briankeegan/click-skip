const POSSIBLE_OBJECTS = ['url']

const startOrStopCount = async () => {
    const { isAllowedUrl, isOn, token, url } = await chrome.storage.local.get(POSSIBLE_OBJECTS);
    console.log({ isAllowedUrl, isOn, token, url });
    if (isAllowedUrl && isOn) {
        // Restart it
        clearInterval(counter);
        counter = setInterval(() => {
            startCount();
            checkIfHasChanged(url, token);
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

const checkIfHasChanged = function(currentUrl, access_token) {
    fetch('https://www.googleapis.com/drive/v2/files/' + currentUrl,  {
        headers: {Authorization: 'Bearer ' + access_token}
    })
    .then((response) => {
        return response.json();
    })
    .then(function(data) {
        if (data.error) {
            console.log(data.error);
            chrome.identity.getAuthToken({ interactive: true}, function(token) {
                access_token = token;
                chrome.storage.local.set({ token });
                console.log({token})
            });
            // TODO: Surface error to user;
            return;
        }
        const newDate = +new Date(data.modifiedDate);
        if (currentDate === 0) {
            currentDate = newDate;
        }
        if (newDate > currentDate) {
            currentDate = newDate;
  
        } else {
            //  console.log('Hasn\'t changed')
        }
    })
}

let count = 0;
let counter;
const startCount = async () => {
    // Have checks as to when to
    if (count === 4) { 
        await reloadTab();
        count = 0;
    }
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