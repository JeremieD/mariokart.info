whenDOMReady(() => {
  const sortedTables = document.getElementsByClassName("sortable");

  for (const tableEl of sortedTables) {
    initSortedTable(tableEl);
  }
});

function initSortedTable(tableEl) {
  const headers = tableEl.getElementsByTagName("th");
  for (let col = 0; col < headers.length; col++) {
    if (headers[col].dataset.sort == "false") continue;
    headers[col].addEventListener("click", () => { sortTable(tableEl, col+1); });
  }
}

function sortTable(tableEl, sortByCol) {
  const tableBody = tableEl.querySelector("tbody");
  let rows = Array.from(tableBody.querySelectorAll("tr"));

  let sortDir = ">";
  if (tableEl.dataset.sortBy == sortByCol) {
    if (tableEl.dataset.sortDir == ">") {
      sortDir = "<";
    } else {
      sortByCol = tableEl.dataset.sortDefault ?? 1;
    }
  }
  tableEl.dataset.sortBy = sortByCol;
  tableEl.dataset.sortDir = sortDir;

  rows.sort((a, b) => {
    const sortedByCellA  = a.querySelector("td:nth-of-type(" + sortByCol + ")");
    const sortedByValueA = sortedByCellA.dataset.sortValue ??
                           sortedByCellA.dataset.value ??
                           sortedByCellA.innerText;
    const sortedByCellB  = b.querySelector("td:nth-of-type(" + sortByCol + ")");
    const sortedByValueB = sortedByCellB.dataset.sortValue ??
                           sortedByCellB.dataset.value ??
                           sortedByCellB.innerText;

    // Auto sorting order.
    const numberPattern = /^[+-\d\.,]+$/;
    if (numberPattern.test(sortedByValueA) && numberPattern.test(sortedByValueB)) {
      return parseFloat(sortedByValueB) - parseFloat(sortedByValueA);
    } else {
      return sortedByValueB.localeCompare(sortedByValueA);
    }
  });

  if (sortDir == "<") rows = rows.reverse();

  tableBody.innerHTML = "";
  tableBody.append(...rows);
}
