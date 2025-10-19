// قاعدة بيانات المنتجات في LocalStorage
let products = JSON.parse(localStorage.getItem("products")) || [];

// تحديث جدول المنتجات
function updateTable() {
  const tbody = document.querySelector("#products-table tbody");
  tbody.innerHTML = "";
  products.forEach((product, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${product.barcode}</td>
      <td>${product.name}</td>
      <td>${product.price}</td>
      <td>
        <button onclick="editProduct(${index})">تعديل</button>
        <button onclick="deleteProduct(${index})">حذف</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// حذف منتج
function deleteProduct(index) {
  products.splice(index, 1);
  localStorage.setItem("products", JSON.stringify(products));
  updateTable();
}

// تعديل منتج
function editProduct(index) {
  const product = products[index];
  document.getElementById("barcode-result").textContent = product.barcode;
  document.getElementById("name-input").value = product.name;
  document.getElementById("price-input").value = product.price;
  deleteProduct(index);
}

// إضافة منتج جديد
document.getElementById("add-btn").addEventListener("click", () => {
  const barcode = document.getElementById("barcode-result").textContent;
  const name = document.getElementById("name-input").value.trim();
  const price = document.getElementById("price-input").value.trim();

  if (!barcode || barcode === "الباركود: لم يتم المسح بعد") {
    alert("يرجى مسح الباركود أولاً!");
    return;
  }
  if (!name || !price) {
    alert("يرجى إدخال الاسم والسعر!");
    return;
  }

  products.push({ barcode, name, price });
  localStorage.setItem("products", JSON.stringify(products));
  updateTable();

  document.getElementById("barcode-result").textContent = "الباركود: لم يتم المسح بعد";
  document.getElementById("name-input").value = "";
  document.getElementById("price-input").value = "";

  alert("تمت إضافة المنتج بنجاح!");
});

// ----------------------------------------------------------------
// مسح الباركود لإضافة المنتج - Video Stream
// ----------------------------------------------------------------
function startScanner(targetDiv, callback) {
  Quagga.init({
    inputStream: {
      type: "LiveStream",
      target: targetDiv,
      constraints: {
        facingMode: "environment" // الكاميرا الخلفية
      }
    },
    decoder: {
      readers: ["code_128_reader","ean_reader","ean_8_reader"]
    },
    locate: true
  }, (err) => {
    if (err) {
      console.error(err);
      alert("حدث خطأ عند تشغيل الكاميرا");
      return;
    }
    Quagga.start();
  });

  Quagga.onDetected((data) => {
    const code = data.codeResult.code;
    Quagga.stop();
    callback(code);
  });
}

// مسح الباركود لإضافة منتج
document.getElementById("scan-barcode-btn").addEventListener("click", () => {
  startScanner(document.getElementById("video-container"), (code) => {
    document.getElementById("barcode-result").textContent = code;
  });
});

// مسح الباركود لإظهار السعر
document.getElementById("scan-price-btn").addEventListener("click", () => {
  startScanner(document.getElementById("video-price-container"), (code) => {
    const product = products.find(p => p.barcode === code);
    if (product) {
      document.getElementById("scan-result").textContent = `المنتج: ${product.name}, السعر: ${product.price}`;
    } else {
      document.getElementById("scan-result").textContent = "الباركود غير موجود!";
    }
  });
});

// عند تحميل الصفحة
window.addEventListener("load", () => {
  updateTable();
});
