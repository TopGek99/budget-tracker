let db, BudgetStore, transaction;
const request = window.indexedDB.open("BudgetDB");

request.onupgradeneeded = function (event) {
  db = event.target.result;
  BudgetStore = db.createObjectStore("BudgetStore", {
    autoIncrement: true,
  });
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.error(event.target.result);
};

function saveRecord(record) {
  transaction = db.transaction(["BudgetStore"], "readwrite");
  BudgetStore = transaction.objectStore("BudgetStore");
  BudgetStore.add(record);
}

function checkDatabase() {
  transaction = db.transaction(["BudgetStore"], "readwrite");
  BudgetStore = transaction.objectStore("BudgetStore");
  const getAll = BudgetStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          transaction = db.transaction(["BudgetStore"], "readwrite");
          BudgetStore = transaction.objectStore("BudgetStore");
          BudgetStore.clear();
        });
    }
  };
}

window.addEventListener("online", checkDatabase);
