const removeModal = async () => {
  const interval = setInterval(async () => {
    const itemToRemove = document.querySelector('[class*=modal_modal-window-container]');
    if (itemToRemove) {
      itemToRemove.remove();
    } else {
      clearInterval(interval);
    }
  }, 1000);
}

const addScrollability = () => {
  const interval = setInterval(async () => {
    const itemToRemove = document.querySelector('[class*=mask_no-scroll');
    if (itemToRemove) {
      console.log('removing mask');
      // const classNames = [...document.querySelectorAll('[class^=mask_no-scroll')[0].classList.values()]
      const classNames = [...itemToRemove.classList.values()]
      classNamesToRemove = classNames.filter(className => className.includes('mask_no-scroll'));
      itemToRemove.classList.remove(...classNamesToRemove);
    } 
  }, 500);
}


const ListOfSites = [
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
  {
    urlSearchString: 'cooking.nytimes.com/',
    customScripts: [removeModal, addScrollability]
  },
];






const POSSIBLE_OBJECTS_2 = ['isOn', 'url'];

const findAndClick = async (selector) => {
  // Lazy solution for weird bug
  if (!selector) {
    return;
  }
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
const findAndRemove = async (selector) => {
  // Lazy solution for weird bug
  if (!selector) {
    return;
  }
  let element = await document.querySelector(selector);
  if (element) {
    console.log('found element and removed', selector);
    element.remove();
    // continuesly remove until element is not found
    const interval = setInterval(async () => {
      element = await document.querySelector(selector);
      if (element) {
        element.remove();
      } else {
        clearInterval(interval);
      }
    }, 100);
  }
};

const observeContainerAndButtons = async ({
  containerSelector,
  clickableSelectors = [],
}) => {
  const adsContainer = document.querySelector(containerSelector);
  clickableSelectors.forEach(findAndClick);

  if (adsContainer) {
    console.log('observer hapenning');
    observer = new MutationObserver((mutationList, observer) => {
      for (let i = 0; i < mutationList.length; i++) {
        clickableSelectors.forEach(findAndClick);
      }
    }).observe(adsContainer, { childList: true, subtree: false });
    // only check this if container is specificied
  } else if (containerSelector) {
    setTimeout(async () => {
      await observeContainerAndButtons({
        containerSelector,
        clickableSelectors,
      });
    }, 100);
  }
};

let observer = null;
const skipAds = async (ListOfSites) => {
  const tabUrl = window.location.href;
  ListOfSites.forEach(async (currentSite) => {
    if (tabUrl.includes(currentSite.urlSearchString)) {
      await chrome.storage.local.set({ url: tabUrl });
      console.log('Site is ', currentSite.urlSearchString);
      if (currentSite.customScripts && currentSite.customScripts.length > 0) {
        currentSite.customScripts.forEach(script => script())
      } else {
        await observeContainerAndButtons({
          containerSelector: currentSite.containerSelector,
          clickableSelectors: currentSite.clickableSelectors,
        });
      }
    }
  });
};

const startOrStop = async () => {
  const { isOn } = await chrome.storage.local.get(POSSIBLE_OBJECTS_2);
  if (isOn) {
    console.log('start!');
    skipAds(ListOfSites);
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
  const { isOn } = await chrome.storage.local.get(POSSIBLE_OBJECTS_2);
  await startOrStop(isOn);
};

onStart();
 