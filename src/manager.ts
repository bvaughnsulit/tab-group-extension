const form = document.getElementById("form");
const opts = document.getElementById("optsForm") as HTMLFormElement;
const tabList = document.getElementById("tabList")!;

const SORT_OPTIONS = {
  default: "default",
  title: "title",
  url: "url",
  date: "date",
} as const;
const SHOW_OPTIONS = {
  all: "all",
  dupesOnly: "dupesOnly",
} as const;

document.addEventListener("DOMContentLoaded", async () => {
  const { sortBy, show } = await chrome.storage.sync.get({
    sortBy: "default",
    show: "all",
  });
  (document.getElementById("sortBy") as HTMLSelectElement).value = sortBy;
  (document.getElementById("show") as HTMLSelectElement).value = show;
  console.log(sortBy, show);
  renderTabTable({ sortBy, show });
});

opts.addEventListener("change", () => {
  const formData = new FormData(opts);
  const sortBy = formData.get(
    "sortBy",
  ) as typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS];
  const show = formData.get(
    "show",
  ) as typeof SHOW_OPTIONS[keyof typeof SHOW_OPTIONS];
  chrome.storage.sync.set({ sortBy, show });
  renderTabTable({ sortBy, show });
});

const renderTabTable = async ({ sortBy, show }: {
  sortBy: typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS];
  show: typeof SHOW_OPTIONS[keyof typeof SHOW_OPTIONS];
}) => {
  tabList.innerHTML = "";
  const tabs = await chrome.tabs.query({});
  const urlMap = tabs.reduce((map, tab) => {
    const url = tab.url;
    if (!url) return map;

    if (!map.has(url)) map.set(url, []);
    map.get(url)!.push(tab);
    return map;
  }, new Map<string, chrome.tabs.Tab[]>());

  tabs.forEach((tab) => {
    const tabId = String(tab.id);
    const dupes = urlMap.get(tab.url!) || [];
    if (show === SHOW_OPTIONS.dupesOnly && dupes.length <= 1) return;

    const el = document.createElement("div");
    el.id = tabId;
    el.classList.add("tab-info");

    const openBtn = document.createElement("button");
    openBtn.textContent = "open";
    openBtn.addEventListener("click", () => {
      chrome.tabs.get(tab.id!, (updatedTabInfo) => {
        chrome.windows.update(
          updatedTabInfo.windowId!,
          { focused: true },
        );
        chrome.tabs.highlight({
          tabs: updatedTabInfo.index!,
          windowId: updatedTabInfo.windowId!,
        });
      });
    });

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "X";
    closeBtn.addEventListener("click", async () => {
      chrome.tabs.remove(tab.id!, () => {
        console.log("tab closed");
        document.getElementById(tabId)?.remove();
      });
    });
    closeBtn.disabled = tab.url === window.location.href;

    const closeDupesBtn = document.createElement("button");
    closeDupesBtn.textContent = `close ${dupes.length - 1} dupes`;
    closeDupesBtn.addEventListener("click", async () => {
      dupes.forEach((dupe) => {
        if (dupe.id === tab.id) return;
        chrome.tabs.remove(dupe.id!, () => {
          document.getElementById(String(dupe.id!))?.remove();
        });
      });
      closeDupesBtn.remove();
    });

    const children = [
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
      closeBtn,
      openBtn,
      ...(dupes.length > 1 ? [closeDupesBtn] : []),
    ];

    children[0].textContent = tab.title || "";
    children[1].textContent = tab.url || "";
    children[2].textContent = tab.lastAccessed
      ? new Date(tab.lastAccessed).toLocaleString()
      : "";

    el.append(...children);
    tabList.appendChild(el);
  });
};

document.getElementById("exportBtn")?.addEventListener(
  "click",
  async () => {
    const tabs = await chrome.tabs.query({});
    const fomrattedData = tabs.map((tab) => {
      return {
        lastAccessed: tab.lastAccessed ? new Date(tab.lastAccessed) : null,
        title: tab.title,
        url: tab.url,
      };
    });
    const textArea = document.getElementById("exported");
    textArea!.textContent = JSON.stringify(fomrattedData, null, 2);
    console.log(fomrattedData);
  },
);

form.addEventListener("change", () => {
  const formData = new FormData(form);
  const debugMode = !!formData.get("debugMode");
  chrome.storage.sync.set({ debugMode });
});

document.addEventListener("DOMContentLoaded", async () => {
  const { debugMode } = await chrome.storage.sync.get("debugMode");
  if (debugMode) {
    const debugModeField = document.getElementById("debugMode");
    debugModeField.checked = true;
  }
});

document.getElementById("logLocalStorage").addEventListener(
  "click",
  async () => {
    const data = await chrome.storage.local.get(null);
    console.log(data);
  },
);

document.getElementById("clearLocalStorage").addEventListener(
  "click",
  async () => {
    chrome.storage.local.clear();
  },
);

document.getElementById("logSyncStorage").addEventListener(
  "click",
  async () => {
    const data = await chrome.storage.sync.get(null);
    console.log(data);
  },
);

document.getElementById("clearSyncStorage").addEventListener(
  "click",
  async () => {
    chrome.storage.sync.clear();
  },
);

export {};
