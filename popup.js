const POSSIBLE_OBJECTS = ['isOn', 'url', 'listToSkip'];

const sortListsWithActiveUrlAtTop = ((listOfSites, tabUrl) => {
  return listOfSites.reduce((acc, currentSite) => {
    if (tabUrl.includes(currentSite.urlSearchString)) {
      return [currentSite, ...acc];
    }
    return [...acc, currentSite];
  }, []);
});

document.addEventListener('DOMContentLoaded', async () => {
  const toggleOnButton = document.getElementById('toggleOn');

  const content = document.getElementById('content');
  const contentBody = document.getElementById('contentBody');
  const extensionContent = document.getElementById('extensionContent');
  const disallowedDiv = document.getElementById('disallowed');

  const addContentToBody = (listToSkip, activeUrl) => {
    const areAnyActive = listToSkip.some(({ urlSearchString }) => {
      return activeUrl.includes(urlSearchString);
    }).length > 0;
    let newContent = '';
    if (!areAnyActive) {
      newContent += '<h3 class="popup-extensions-site-not-active">Doesn\'t run on this site.</h3>\n';
      newContent += '<p>To update, config, see <a href="https://github.com/briankeegan/click-skip#how-to-add-new-buttons-to-click" target="_blank">docs</a> </p>\n';
    }

    newContent += listToSkip
      .map((siteInfo) => {
        const { urlSearchString, containerSelector, clickableSelectors } =
          siteInfo;
          const isActive = activeUrl.includes(urlSearchString);
        return `
    <div class="popup-extensions-site ${isActive ? 'popup-extensions-site-active' : ''}">
      <div class="popup-extensions-label-thing-container">
        <div class="popup-extensions-site-url">${urlSearchString}</div>
      </div>
      <div class="popup-extensions-label-thing-container">
        <div class="popup-extension-label">Container:</div>
        <div class="popup-extensions-site-selector">${containerSelector}</div>
      </div>
      <div class="popup-extensions-label-thing-container">
        <div class="popup-extension-label">Clickables:</div>
        <div class="popup-extensions-site-selector-wrapper">
        ${clickableSelectors
          .map(
            (selector) =>
              `<div class="popup-extensions-site-selector">${selector}</div>`
          )
          .join('')}
          </div>
      </div>
    </div>`;
      })
      .join('\n');

    contentBody.innerHTML = newContent;
  };

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
    const { isOn, listToSkip, url } = await chrome.storage.local.get(
      POSSIBLE_OBJECTS
    );
    if (!Boolean(toggleOnButton)) {
      console.log("Didn't run here");
      return;
    }
    const [firstTab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    const listToSkipSorted = await sortListsWithActiveUrlAtTop(listToSkip, firstTab.url);
    addContentToBody(listToSkipSorted, (firstTab || {}).url);
    // ---------------------------------------------------------------,
    toggleOnButton.addEventListener('click', onClickToggle);
    extensionContent.classList.remove('popup-extension-hidden');
    disallowedDiv.classList.add('popup-extension-hidden');

    onClickToggleOn(isOn);
  };

  onStart();
});
