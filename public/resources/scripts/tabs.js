whenDOMReady(() => {
  const tabContainers = document.getElementsByClassName("tab-container");
  for (const tabContainer of tabContainers) {
    const handles = tabContainer.querySelectorAll(".tab-handles>[data-tab-id]");
    const panels = tabContainer.querySelectorAll(".tab-panels>*");

    tabContainer.selectTab = function(id, dispatchEvent = true) {
      if (tabContainer.querySelector("#" + id) === null) return;
      for (const handle of handles) {
        handle.classList.toggle("selected", handle.dataset.tabId == id);
      }
      for (const panel of panels) {
        panel.classList.toggle("selected", panel.id == id);
      }
      if (tabContainer.contains(document.activeElement)) tabContainer.querySelector(`[data-tab-id="${id}"`).focus();
      tabContainer.dataset.selectedTabId = id;
      if (dispatchEvent) tabContainer.dispatchEvent(new Event("change"));
    }

    for (let i = 0; i < handles.length; i++) {
      const handle = handles[i];
      handle.addEventListener("click", () => {
        tabContainer.selectTab(handle.dataset.tabId);
      }, { passive: true });
      handle.addEventListener("keydown", e => {
        if (e.key === "Enter") tabContainer.selectTab(handle.dataset.tabId);;
        if (e.key === "ArrowLeft") {
          const prevId = i === 0 ? handles.length - 1 : i - 1;
          tabContainer.selectTab(handles[prevId].dataset.tabId);
        }
        if (e.key === "ArrowRight") {
          const nextId = i === handles.length - 1 ? 0 : i + 1;
          tabContainer.selectTab(handles[nextId].dataset.tabId);
        }
      }, { passive: true });
    }
  }
});
