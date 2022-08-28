const POSSIBLE_OBJECTS = ['isOn', 'token', 'url'];

document.addEventListener('DOMContentLoaded', () => {
  const toggleOnButton = document.getElementById('toggleOn');

  const content = document.getElementById('content');
  const extensionContent = document.getElementById('extensionContent');
  const disallowedDiv = document.getElementById('disallowed');

  const onClickToggleOn = async (isOn) => {
    if (Boolean(isOn)) {
      content.classList.remove('popup-extension-hidden');
      toggleOnButton.classList.add('popup-extension-isOff');
      toggleOnButton.innerText = 'TURN OFF';
    } else {
      content.classList.add('popup-extension-hidden');
      toggleOnButton.classList.remove('popup-extension-isOff');
      toggleOnButton.innerText = 'TURN ON';
    }
  };
  const onClickToggle = async function () {
    const { isOn } = await chrome.storage.local.get(POSSIBLE_OBJECTS);
    const willBeOn = !isOn;
    chrome.storage.local.set({ isOn: willBeOn }, function () {
      onClickToggleOn(willBeOn);
    });
  };

  const onStart = async () => {
    const { isOn, url } = await chrome.storage.local.get(POSSIBLE_OBJECTS);
    if (!Boolean(toggleOnButton)) {
      console.log("Didn't run here");
      return;
    }
    console.log(toggleOnButton);
    // ---------------------------------------------------------------,
    toggleOnButton.addEventListener('click', onClickToggle);
    extensionContent.classList.remove('popup-extension-hidden');
    disallowedDiv.classList.add('popup-extension-hidden');

    onClickToggleOn(isOn);
  };

  onStart();
});
