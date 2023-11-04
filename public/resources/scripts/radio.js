function initRadioGroup(parentEl) {
  for (const button of parentEl.querySelectorAll("button[value]")) {
    button.addEventListener("click", e => {
      for (const button2 of parentEl.querySelectorAll("button")) {
        button2.checked = false;
        button2.classList.remove("selected");
      }
      button.checked = true;
      button.classList.add("selected");
      parentEl.dataset.value = button.value;
      parentEl.dispatchEvent(new Event("change"));
    });
  }
  return parentEl;
}
