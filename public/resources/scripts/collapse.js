whenDOMReady(() => {
  const toggles = document.getElementsByClassName("collapse-toggle");
  for (const toggle of toggles) {
    toggle.addEventListener("click", () => { toggleCollapse(toggle) });
  }
});

function toggleCollapse(toggleEl, force) {
  const contract = force ?? toggleEl.classList.contains("open");
  const expand = !contract;

  const container = toggleEl.parentElement;
  const collapsibles = container.getElementsByClassName("collapsible");

  container.style.height = collapsibles[+contract].clientHeight + "px";
  toggleEl.classList.toggle("open", expand);

  collapsibles[0].classList.toggle("collapsed", expand);
  collapsibles[1].classList.toggle("collapsed", contract);

  container.addEventListener("transitionend", () => {
    container.classList.remove("transitioning");
  });
  container.classList.add("transitioning");
  container.style.height = collapsibles[+expand].clientHeight + "px";
}
