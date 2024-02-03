whenDOMReady(() => {
  for (const tabContainer of document.getElementsByClassName("tab-container")) {
    for (const handle of tabContainer.querySelectorAll(".tab-handles>a")) {
      handle.addEventListener("click", e => {
        e.preventDefault();
        const tabID = handle.dataset.tabId;
        for (const handle of tabContainer.querySelectorAll(".tab-handles>a")) {
          handle.classList.toggle("selected", handle.dataset.tabId == tabID);
        }
        for (const panel of tabContainer.querySelectorAll(".tab-panels>*")) {
          panel.classList.toggle("selected", panel.id == tabID);
        }
      });
    }
  }
});
