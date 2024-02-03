whenDOMReady(() => {
  for (const tabContainer of document.getElementsByClassName("tab-container")) {
    for (const handle of tabContainer.querySelectorAll(".tab-handles>a")) {
      const handler = e => {
        e.preventDefault();
        const tabID = handle.dataset.tabId;
        for (const handle of tabContainer.querySelectorAll(".tab-handles>a")) {
          handle.classList.toggle("selected", handle.dataset.tabId == tabID);
        }
        for (const panel of tabContainer.querySelectorAll(".tab-panels>*")) {
          panel.classList.toggle("selected", panel.id == tabID);
        }
      };
      handle.addEventListener("click", handler);
      handle.addEventListener("keydown", e => {
        if (e.key == "Enter") handler(e);
      });
    }
  }
});
