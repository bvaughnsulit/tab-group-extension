chrome.action.onClicked.addListener(
  () => {
    chrome.tabs.create({
      url: "manager.html",
    });
  },
);

// listen for commands
chrome.commands.onCommand.addListener((command) => {
  if (command === "collapseGroups") {
    collapseInactiveGroups();
  } else if (command === "openTabGroupSwitcher") {
    openTabGroupSwitcher();
  }
});

chrome.tabGroups.onUpdated.addListener((group) => {
  if (!group.collapsed) {
    collapseInactiveGroups(group.id);
  }
});

// save most recently viewed tab for each tab group
// every time tab is changed, update most recent tab for that tab's group
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const { tabId } = activeInfo;
  const { groupId } = await chrome.tabs.get(tabId);

  // don't save if not in a tab group
  if (groupId !== -1) {
    chrome.storage.local.set({ [groupId.toString()]: tabId });
  }
});

async function openTabGroupSwitcher() {
  const popupWidth = 400;
  const popupHeight = 250;
  let popupLeftPos, popupTopPos;

  try {
    const lastWindow = await chrome.windows.getCurrent();
    const { left, top, height, width } = lastWindow;
    popupLeftPos = parseInt(left + (width - popupWidth) / 2);
    popupTopPos = parseInt(top + (height - popupHeight) / 8);
  } catch (err) {
    console.log(err);
  }

  const newWindow = await chrome.windows.create({
    url: "popup.html",
    focused: true,
    height: popupHeight,
    width: popupWidth,
    top: popupTopPos,
    left: popupLeftPos,
    type: "popup",
  });
}

async function collapseInactiveGroups(groupToExclude = -1) {
  // get active tab
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  // get tab groups in active window
  const groups = await chrome.tabGroups.query({
    windowId: chrome.windows.WINDOW_ID_CURRENT,
  });

  // close all open, inactive tab groups
  groups.forEach((group) => {
    if (
      !group.collapsed &&
      group.id !== tab.groupId &&
      group.id !== groupToExclude
    ) {
      chrome.tabGroups.update(group.id, { collapsed: true });
    }
  });
}
