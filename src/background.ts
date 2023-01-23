chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "collapseGroups") {
    collapseInactiveGroups(tab.groupId);
  }
});

chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    // collapseInactiveGroups(tab.groupId)
  })
})

chrome.tabGroups.onUpdated.addListener((group) => console.log(group));

function collapseInactiveGroups(activeGroupId: number) {
  chrome.tabGroups.query(
    { windowId: chrome.windows.WINDOW_ID_CURRENT },
    (groups) => {
      groups.forEach((group) => {
        if (!group.collapsed && group.id !== activeGroupId) {
          chrome.tabGroups.update(group.id, { collapsed: true });
        }
      });
    }
  );
}
