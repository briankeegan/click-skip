const listOfSites = [
  {
    // https://www.youtube.com/watch?v=gHnuQZFxHt0,
    urlSearchString: 'youtube.com',
    containerSelector: '.video-ads',
    clickableSelectors: ['.ytp-ad-skip-button', '.ytp-ad-overlay-close-button'],
  },
  {
    // https://www.youtube.com/watch?v=gHnuQZFxHt0,
    urlSearchString: 'hulu.com',
    containerSelector: '.ControlsContainer',
    // clickableSelectors: ['SkipButton'],
    clickableSelectors: [
      'SkipButton',
      '.SkipButton__button',
      `.SkipButton__button[data-automationid="player-skip-button"]`,
    ],
  },
];

const config = { childList: true, subtree: false };

let hasStartedObserving = false;

// Allow everything
const ALLOWED_TO_OPEN = ['/'];

const POSSIBLE_OBJECTS_2 = [
  'isAllowedUrl',
  'isOn',
  'token',
  'url',
  'tabId',
  'tabUrl',
];

const getIsElementHidden = (element) => {
  // return false;
  const cStyles = window.getComputedStyle(element);
  const bounds = element.getBoundingClientRect();
  const isOffScreen =
    bounds.top < 0 ||
    bounds.bottom > window.innerHeight ||
    bounds.left < 0 ||
    bounds.right > window.innerWidth;
  const isDisplayed =
    cStyles.getPropertyValue('display') === 'none' ||
    cStyles.getPropertyValue('visibility') === 'hidden';
  const isHidden = cStyles.getPropertyValue('visibility') === 'hidden';
  const noOpacity = cStyles.getPropertyValue('opacity') === '0';
  console.log({ isOffScreen, isDisplayed, isHidden, noOpacity }, element);
  return isDisplayed || isHidden || noOpacity || isOffScreen;
};

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
    }).observe(adsContainer, config);
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
const skipAds = async () => {
  const { tabUrl } = await chrome.storage.local.get(POSSIBLE_OBJECTS_2);
  listOfSites.forEach(async (currentSite) => {
    if (tabUrl.includes(currentSite.urlSearchString)) {
      console.log('Site is ', currentSite.urlSearchString);
      await observeContainerAndButtons({
        containerSelector: currentSite.containerSelector,
        clickableSelectors: currentSite.clickableSelectors,
      });
    }
  });
};

const startOrStop = async (isOn = true) => {
  if (isOn) {
    console.log('start!');
    skipAds();
  }
  if (!isOn) {
    console.log('stop!');
    if (Boolean(observer)) {
      observer.disconnect();
    }
  }
};

const validateUrlIsAllowed = async (tabUrl) => {
  const isAllowedUrl = ALLOWED_TO_OPEN.some((url) => tabUrl.includes(url));
  if (!isAllowedUrl) {
    console.log('content: url is not allowed, ', tabUrl);
    return false;
  }
  chrome.storage.local.set({ isAllowedUrl, tabUrl });
  return isAllowedUrl;
};

chrome.storage.onChanged.addListener(async function (changes, namespace) {
  if (changes.isOn) {
    await startOrStop(changes.isOn.newValue);
  }
});

const onStart = async () => {
  console.log('content.js is started');
  const isAllowedUrl = await validateUrlIsAllowed(window.location.href);
  const { isOn } = await chrome.storage.local.get(POSSIBLE_OBJECTS_2);
  await startOrStop(isOn && isAllowedUrl);
};

onStart();
