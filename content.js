const listOfSites = [
  {
    urlSearchString: 'youtube.com',
    containerSelector: '.video-ads',
    clickableSelectors: ['.ytp-ad-skip-button', '.ytp-ad-overlay-close-button'],
  },
  {
    urlSearchString: 'hulu.com',
    containerSelector: '.ControlsContainer',
    clickableSelectors: [
      'SkipButton',
      '.SkipButton__button',
      '[data-automationid="player-skip-button"]',
    ],
  },
  {
    urlSearchString: 'netflix.com',
    containerSelector: '.watch-video',
    clickableSelectors: ['.watch-video--skip-content-button'],
  },
];

const POSSIBLE_OBJECTS_2 = ['isOn', 'url', 'listToSkip'];

const findAndClick = async (selector) => {
  let element = await document.querySelector(selector);
  if (element) {
    console.log('found element and clicked', selector);
    element.click();
    // continuesly click until element is not found
    const interval = setInterval(async () => {
      element = await document.querySelector(selector);
      if (element) {
        element.click();
      } else {
        clearInterval(interval);
      }
    }, 100);
  }
};

const observeContainerAndButtons = async ({
  containerSelector,
  clickableSelectors,
}) => {
  const adsContainer = document.querySelector(containerSelector);
  // await clickableSelectors.forEach(findAndClick);
  clickableSelectors.forEach(findAndClick);

  if (adsContainer) {
    console.log('observer hapenning');
    observer = new MutationObserver((mutationList, observer) => {
      for (let i = 0; i < mutationList.length; i++) {
        clickableSelectors.forEach(findAndClick);
      }
    }).observe(adsContainer, { childList: true, subtree: false });
  } else {
    setTimeout(async () => {
      await observeContainerAndButtons({
        containerSelector,
        clickableSelectors,
      });
    }, 100);
  }
};

let observer = null;
const skipAds = async (listToSkip) => {
  const tabUrl = window.location.href;
  listToSkip.forEach(async (currentSite) => {
    if (tabUrl.includes(currentSite.urlSearchString)) {
      console.log('Site is ', currentSite.urlSearchString);
      await observeContainerAndButtons({
        containerSelector: currentSite.containerSelector,
        clickableSelectors: currentSite.clickableSelectors,
      });
    }
  });
};

const startOrStop = async () => {
  const { isOn, listToSkip } = await chrome.storage.local.get(POSSIBLE_OBJECTS_2);
  if (isOn) {
    console.log('start!');
    skipAds(listToSkip);
  }
  if (!isOn) {
    console.log('stop!');
    if (Boolean(observer)) {
      observer.disconnect();
    }
  }
};

chrome.storage.onChanged.addListener(async function (changes, namespace) {
  if (changes.isOn) {
    await startOrStop(changes.isOn.newValue);
  }
});

const onStart = async () => {
  console.log('content.js is started');
  const { isOn, listToSkip } = await chrome.storage.local.get(POSSIBLE_OBJECTS_2);
  if (!listToSkip) {
    await chrome.storage.local.set({ listToSkip: listOfSites });
  }
  await startOrStop(isOn);
};

onStart();
