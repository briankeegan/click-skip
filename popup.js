
const POSSIBLE_OBJECTS = ['isAllowedUrl', 'isOn', 'token', 'url', 'tabId']
document.addEventListener('DOMContentLoaded', () => {
    const toggleOnButton = document.getElementById('toggleOn');
    const urlInput = document.getElementById('urlInput');
    const updateButton = document.getElementById('updateButton');
    const cancelButton = document.getElementById('cancelButton');
    const loginButton = document.getElementById('loginButton');
    const currentUrlDiv = document.getElementById('currentUrl');
    const fullUrlDiv = document.getElementById('fullUrl');

    const content = document.getElementById('content');
    const extensionContent = document.getElementById('extensionContent');
    const disallowedDiv = document.getElementById('disallowed');
    // const clickFetchUrl = document.getElementById('fetchUrl');

    const enableButtons = function() {
         updateButton.removeAttribute('disabled');
         cancelButton.removeAttribute('disabled');
    }

    const disableButtons = function() {
         updateButton.setAttribute('disabled', true);
         cancelButton.setAttribute('disabled', true);
    }

    const onStart = async () => {
        const { isAllowedUrl, isOn, url } = await chrome.storage.local.get(POSSIBLE_OBJECTS);
        if (!isAllowedUrl) {
            extensionContent.classList.add('hidden');
            disallowedDiv.classList.remove('hidden');
        } else {
            extensionContent.classList.remove('hidden');
            disallowedDiv.classList.add('hidden');

            onClickToggleOn(isOn);
            disableButtons();
            updateUrls(url);
        }
    }

    onStart()

    const updateUrls = function(newText = '') {
        urlInput.value = newText
        currentUrlDiv.innerText = newText
        fullUrl = `https://drive.google.com/file/d/${newText || '<linkId>'}/view`
        fullUrlDiv.innerText = fullUrl
    }

    const getCurrentTabId = async () => {
        const tabs = await chrome.tabs.query({
            active: true, currentWindow: true
        });
        return tabs.length > 0 ? tabs[0].id : null;
    }


    const onClickToggleOn = async (isOn) => {
        if (Boolean(isOn)) {
            content.classList.remove('hidden');
            toggleOnButton.classList.add('isOff');
            toggleOnButton.innerText = 'TURN OFF';
        } else {
            content.classList.add('hidden');
            toggleOnButton.classList.remove('isOff');
            toggleOnButton.innerText = 'TURN ON';
        }
    }

    toggleOnButton.addEventListener('click', async function() {
        const { isOn } = await chrome.storage.local.get(POSSIBLE_OBJECTS);
        const tabId = getCurrentTabId();
        const willBeOn = !isOn;
        chrome.storage.local.set({ isOn: willBeOn, tabId: willBeOn ? tabId : null }, function() {
            onClickToggleOn(willBeOn);
        });
    });
    
    updateButton.addEventListener('click', function() {
        const url = urlInput.value;
        chrome.storage.local.set({ url }, function() {
            disableButtons();
            updateUrls(url);
        });
    });

    cancelButton.addEventListener('click', async function() {
        const { url } = await chrome.storage.local.get(POSSIBLE_OBJECTS);
        urlInput.value = url;
        disableButtons();
    });
    loginButton.addEventListener('click', async function() {
        chrome.identity.getAuthToken({interactive: true}, function(token) {
            chrome.storage.local.set({ token });
        });
    });

    urlInput.addEventListener('input', function() {
        if (currentUrl !== this.value) {
            enableButtons()
        } else {
            disableButtons()
        }
    });
});



