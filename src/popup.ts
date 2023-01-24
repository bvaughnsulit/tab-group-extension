// esc closes the popup
window.addEventListener("keydown", (event) => {
  if (event.keyCode === 27) {
    close();
  }
});

// close popup if loses focus
window.addEventListener("blur", (event) => {
  close();
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

  // focus the window of the tab group
  const { windowId } = await chrome.tabGroups.get(selectedGroupId);

  // get most recently viewed tabId in selected group
  const storageResult = await chrome.storage.local.get([String(selectedGroupId)]);
  const [tabId] = Object.values(storageResult);
  let tabIdToFocus

  if (tabId) {
    // make sure most recently viewed tab is still in selected tab group
    const { groupId } = await chrome.tabs.get(tabId)
    if (groupId === selectedGroupId){ tabIdToFocus = tabId }
  }

  if (!tabIdToFocus) {
    // if no most recently viewed tab is saved, get first tab in group
    const tabsInGroup = await chrome.tabs.query({
      groupId: selectedGroupId,
    });
    tabIdToFocus = tabsInGroup[0].id
  } 
  chrome.tabs.update(tabIdToFocus, { active: true });
  chrome.windows.update(windowId, { focused: true });
});
