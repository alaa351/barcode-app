let db;

// فتح قاعدة البيانات IndexedDB
const request = indexedDB.open("BarcodeDB", 1);

request.onupgradeneeded = function(event) {
  db = event.target.result;
  const objectStore = db.createObjectStore("products", { keyPath: "barcode" });
  objectStore.createIndex("name", "name", { unique: false });
  objectStore.createIndex("price", "price", { unique: false });
};

request.onsuccess = function(event) {
  db = event.target.result;
  displayProducts();
};

request.onerror = function(event) {
  console.error("Database error:", event.target.errorCode);
};

// ================== إضافة المنتج ==================
document.getElementById("scan-barcode-btn").addEventListener("click", function() {
  Quagga.init({
    inputStream : {
      name : "Live",
      type : "LiveStream",
      target: document.querySelector('body'),
      constraints: { facingMode: "environment" }
    },
    decoder : {
      readers : ["code_128_reader","ean_reader","ean_8_reader","code_39_reader","upc_reader"]
    }
  }, function(err) {
      if (err) { console.log(err); return; }
      Quagga.start();
  });

  Quagga.onDetected(function(result) {
    const code = result.codeResult.code;
    document.getElementById("barcode-result").innerText = "الباركود: " + code;
    window.scannedBarcode = code;
    Quagga.stop();
  });
});

document.getElementById("add-btn").addEventListener("click", function() {
  const barcode = window.scannedBarcode;
  const name = document.getElementById("name-input").value;
  const price = parseFloat(document.getElementById("price-input").value);

  if (!barcode || !name || !price) {
    alert("الرجاء مسح الباركود وإدخال جميع البيانات!");
    return;
  }

  const transaction = db.transaction(["products"], "readwrite");
  const store = transaction.objectStore("products");
  store.put({ barcode, name, price });

  transaction.oncomplete = function() {
    displayProducts();
    window.scannedBarcode = null;
    document.getElementById("barcode-result").innerText = "الباركود: لم يتم المسح بعد";
    document.getElementById("name-input").value = "";
    document.getElementById("price-input").value = "";
  };
});

// ================== عرض المنتجات ==================
function displayProducts() {
  const tbody = document.querySelector("#products-table tbody");
  tbody.innerHTML = "";

  const transaction = db.transaction(["products"], "readonly");
  const store = transaction.objectStore("products");

  store.openCursor().onsuccess = function(event) {
    const cursor = event.target.result;
    if (cursor) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${cursor.value.barcode}</td>
        <td>${cursor.value.name}</td>
        <td>${cursor.value.price}</td>
        <td>
          <button onclick='editProduct("${cursor.value.barcode}")'>تعديل</button>
          <button onclick='deleteProduct("${cursor.value.barcode}")'>حذف</button>
        </td>
      `;
      tbody.appendChild(tr);
      cursor.continue();
    }
  };
}

// ================== تعديل المنتج ==================
function editProduct(barcode) {
  const transaction = db.transaction(["products"], "readwrite");
  const store = transaction.objectStore("products");
  const request = store.get(barcode);

  request.onsuccess = function(event) {
    const data = event.target.result;
    const newName = prompt("عدل الاسم:", data.name);
    const newPrice = parseFloat(prompt("عدل السعر:", data.price));
    if (newName && !isNaN(newPrice)) {
      store.put({ barcode: data.barcode, name: newName, price: newPrice });
      transaction.oncomplete = displayProducts;
    }
  };
}

// ================== حذف المنتج ==================
function deleteProduct(barcode) {
  const transaction = db.transaction(["products"], "readwrite");
  const store = transaction.objectStore("products");
  store.delete(barcode);
  transaction.oncomplete = displayProducts;
}

// ================== مسح الباركود لعرض السعر ==================
document.getElementById("scan-price-btn").addEventListener("click", function() {
  Quagga.init({
    inputStream : {
      name : "Live",
      type : "LiveStream",
      target: document.querySelector('body'),
      constraints: { facingMode: "environment" }
    },
    decoder : {
      readers : ["code_128_reader","ean_reader","ean_8_reader","code_39_reader","upc_reader"]
    }
  }, function(err) {
      if (err) { console.log(err); return; }
      Quagga.start();
  });

  Quagga.onDetected(function(result) {
    const code = result.codeResult.code;
    Quagga.stop();

    const transaction = db.transaction(["products"], "readonly");
    const store = transaction.objectStore("products");
    const request = store.get(code);

    request.onsuccess = function(event) {
      const data = event.target.result;
      if (data) {
        document.getElementById("scan-result").innerText = `المنتج: ${data.name} - السعر: ${data.price}`;
      } else {
        document.getElementById("scan-result").innerText = "لم يتم العثور على المنتج";
      }
    };
  });
});

// ================== تسجيل Service Worker ==================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
  .then(() => console.log("Service Worker مسجل"))
  .catch(err => console.error("Service Worker خطأ:", err));
}
