
const POSSIBLE_OBJECTS = ['isAllowedUrl', 'isOn', 'token', 'url'];

document.addEventListener('DOMContentLoaded', () => {
    const toggleOnButton = document.getElementById('toggleOn');

    const content = document.getElementById('content');
    const extensionContent = document.getElementById('extensionContent');
    const disallowedDiv = document.getElementById('disallowed');

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
    const onClickToggle = async function() {
        const { isOn } = await chrome.storage.local.get(POSSIBLE_OBJECTS);
        const willBeOn = !isOn;
        chrome.storage.local.set({ isOn: willBeOn }, function() {
            onClickToggleOn(willBeOn);
        });
    }


    const onStart = async () => {
        const { isAllowedUrl, isOn, url } = await chrome.storage.local.get(POSSIBLE_OBJECTS);
        if (!Boolean(toggleOnButton)) {
            console.log('Didn\'t run here');
            return;
        }
        console.log(toggleOnButton);
        // ---------------------------------------------------------------,
        toggleOnButton.addEventListener('click', onClickToggle);
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
});
