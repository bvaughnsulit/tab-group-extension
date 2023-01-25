const form = document.getElementById("form");

form.addEventListener("change", () => {
  const formData = new FormData(form)
  const debugMode = !!formData.get('debugMode')
  chrome.storage.sync.set({ debugMode });
});

document.addEventListener('DOMContentLoaded', async () => {
  const { debugMode } = await chrome.storage.sync.get('debugMode')
  if (debugMode) {
    const debugModeField = document.getElementById('debugMode')
    debugModeField.checked = true
  }
})

document.getElementById('logLocalStorage').addEventListener('click', async () => {
  const data = await chrome.storage.local.get(null)
  console.log(data)
})

document.getElementById('clearLocalStorage').addEventListener('click', async () => {
  chrome.storage.local.clear()
})

document.getElementById('logSyncStorage').addEventListener('click', async () => {
  const data = await chrome.storage.sync.get(null)
  console.log(data)
})

document.getElementById('clearSyncStorage').addEventListener('click', async () => {
  chrome.storage.sync.clear()
})
