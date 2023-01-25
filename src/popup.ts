const { debugMode } = await chrome.storage.sync.get("debugMode");

// esc closes the popup
window.addEventListener("keydown", (event) => {
  if (event.keyCode === 27) {
    close();
  }
});

// close popup if loses focus
window.addEventListener("blur", (event) => {
  if (!debugMode) {
    close();
  }
});

const form = document.getElementById("form");

const groups = await chrome.tabGroups.query({});

const select = document.createElement("select");
select.id = "tab-group-select";
select.size = groups.length;
select.autofocus = true;

groups.forEach((group) => {
  const option = document.createElement("option");
  option.value = String(group.id);
  option.innerText = group.title || "";
  select.append(option);
});

form.append(select);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const selectedGroupId = Number(event.target["tab-group-select"].value);

  // get window the selected group is in
  let windowId;
  try {
    const windowInfo = await chrome.tabGroups.get(selectedGroupId);
    windowId = windowInfo.windowId;
  } catch (err) {
    console.log(err);
  }

  // get most recently viewed tabId in selected group
  let storedTabId;
  try {
    const storageResult = await chrome.storage.local.get([
      String(selectedGroupId),
    ]);
    storedTabId = Object.values(storageResult)[0];
  } catch (err) {
    console.log(err);
  }

  let tabIdToFocus;

  if (storedTabId) {
    // make sure most recently viewed tab is still in selected tab group
    let tabInfo;
    try {
      tabInfo = await chrome.tabs.get(storedTabId);
      console.log(tabInfo, "tabinfo");
      if (tabInfo.groupId === selectedGroupId) {
        tabIdToFocus = storedTabId;
      }
    } catch (err) {
      console.log(err);
    }
  }

  if (!tabIdToFocus) {
    // if no most recently viewed tab is saved, get first tab in group
    let tabsInGroup;
    try {
      tabsInGroup = await chrome.tabs.query({
        groupId: selectedGroupId,
      });
    } catch (err) {
      console.log(err);
    }
    tabIdToFocus = tabsInGroup[0].id;
    console.log(tabIdToFocus, "negative case");
  }
  try {
    chrome.tabs.update(tabIdToFocus, { active: true });
    chrome.windows.update(windowId, { focused: true });
  } catch {
    console.log(err);
  }
});
