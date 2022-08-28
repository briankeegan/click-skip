# Button Clicker

All this really does, is checks the url of a page, and searches cotainer for s
## How to use (at your own risk)

I'm likely never gonna bother publishing this.
Use at your own risk. (just read the code, its minimal)

- Go to [chrome://extensions/](chrome://extensions/)
- Turn on developer mode
![Turn on developer mode screenshot](screenshots/turn_on_developer_mode.png)
- Click Load unpacked
- Select this repo. 
- Enable the extension
![enable the extension screenshot](screenshots/enable_extnension.png)
- Pin the extensions (for easier turning on and off)
![pin extension screenshot](screenshots/pin_extension.png)


## How to add new buttons to click

- To open and close the [chrome dev tools](https://developer.chrome.com/docs/devtools/) open cmd-shift-i mac, otherwise ctrl-shift-i.
- You can also right click (ctrl-right-click) and click inspect, to go directly to the element info.
- Double click on the css (in inspector) and copy the class name.

<details> <summary>Click to expand screenshots</summary>
![](screenshots/inspect.png)
![](screenshots/inspect2.png) 
![](screenshots/inspect3.png)
</details>

In this example, it was
 
 `class="SkipButton__button muse-size-medium css-1al8zze",`

 
- You've got the clickable selector.  Use `SkipButton__button` as that's the most specific.  

- Go a up a couple parents, and find one.  I you could just add "body", but then it would run constantly.  So try to find a closer parent, that doesn't disappear.  Trial and error was my technique.  

- Once you got the `containerSelector`, add a new object to the listOfSites.

e.g.

```
  {
    urlSearchString: 'hulu.com',
    containerSelector: '.ControlsContainer',
    clickableSelectors: [
      'SkipButton',
      '.SkipButton__button',
      '[data-automationid="player-skip-button"]',
    ],
  },
```


