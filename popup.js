
const POSSIBLE_OBJECTS = ['isAllowedUrl', 'isOn', 'token', 'url', 'tabId']
document.addEventListener('DOMContentLoaded', () => {
    const toggleOnButton = document.getElementById('toggleOn');
    const currentUrlDiv = document.getElementById('currentUrl');

    const content = document.getElementById('content');
    const extensionContent = document.getElementById('extensionContent');
    const disallowedDiv = document.getElementById('disallowed');


    const onStart = async () => {
        const { isAllowedUrl, isOn, url } = await chrome.storage.local.get(POSSIBLE_OBJECTS);
        if (!isAllowedUrl) {
            extensionContent.classList.add('hidden');
            disallowedDiv.classList.remove('hidden');
        } else {
            extensionContent.classList.remove('hidden');
            disallowedDiv.classList.add('hidden');

            onClickToggleOn(isOn);
        }
    }

    onStart()

    const updateUrls = function(newText = '') {
        currentUrlDiv.innerText = newText
        fullUrl = `https://drive.google.com/file/d/${newText || '<linkId>'}/view`
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
    
});
