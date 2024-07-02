whenDOMReady(() => {
  const tabContainers = document.getElementsByClassName("tab-container");
  for (const tabContainer of tabContainers) {
    const handles = tabContainer.querySelectorAll(".tab-handles>[data-tab-id]");
    const panels = tabContainer.querySelectorAll(".tab-panels>*");

    function selectTab(id) {
      for (const handle of handles) {
        handle.classList.toggle("selected", handle.dataset.tabId == id);
      }
      for (const panel of panels) {
        panel.classList.toggle("selected", panel.id == id);
      }
      tabContainer.querySelector("[data-tab-id=\"" + id + "\"]").focus();
    }

    for (let i = 0; i < handles.length; i++) {
      const handle = handles[i];
      handle.addEventListener("click", e => {
        selectTab(handle.dataset.tabId);
      }, { passive: true });
      handle.addEventListener("keydown", e => {
        if (e.key == "Enter") clickHandler(e);
        if (e.key == "ArrowLeft") {
          const prevId = i == 0 ? handles.length - 1 : i - 1;
          selectTab(handles[prevId].dataset.tabId);
        }
        if (e.key == "ArrowRight") {
          const nextId = i == handles.length - 1 ? 0 : i + 1;
          selectTab(handles[nextId].dataset.tabId);
        }
      }, { passive: true });
    }
  }
});
