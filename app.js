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
      <td><button onclick="deleteProduct(${index})">حذف</button></td>
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

// إضافة منتج جديد
document.getElementById("add-btn").addEventListener("click", () => {
  const barcode = document.getElementById("barcode-result").textContent;
  const name = document.getElementById("name-input").value.trim();
  const price = document.getElementById("price-input").value.trim();

  if (!barcode || barcode === "الباركود: لم يتم المسح بعد") {
    alert("يرجى التقاط صورة الباركود أولاً!");
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
// مسح الباركود لإضافة المنتج من صورة
// ----------------------------------------------------------------
document.getElementById("scan-barcode-btn").addEventListener("click", () => {
  document.getElementById("barcode-image").click();
});

document.getElementById("barcode-image").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function() {
    Quagga.decodeSingle({
      src: reader.result,
      numOfWorkers: 0,
      decoder: { readers: ["code_128_reader","ean_reader","ean_8_reader"] }
    }, function(result) {
      if (result && result.codeResult) {
        document.getElementById("barcode-result").textContent = result.codeResult.code;
      } else {
        alert("لم يتم التعرف على الباركود!");
      }
    });
  };
  reader.readAsDataURL(file);
});

// ----------------------------------------------------------------
// مسح الباركود لإظهار السعر من صورة
// ----------------------------------------------------------------
document.getElementById("scan-price-btn").addEventListener("click", () => {
  document.getElementById("scan-image").click();
});

document.getElementById("scan-image").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function() {
    Quagga.decodeSingle({
      src: reader.result,
      numOfWorkers: 0,
      decoder: { readers: ["code_128_reader","ean_reader","ean_8_reader"] }
    }, function(result) {
      if (result && result.codeResult) {
        const code = result.codeResult.code;
        const product = products.find(p => p.barcode === code);
        if (product) {
          document.getElementById("scan-result").textContent = `المنتج: ${product.name}, السعر: ${product.price}`;
        } else {
          document.getElementById("scan-result").textContent = "الباركود غير موجود!";
        }
      } else {
        alert("لم يتم التعرف على الباركود!");
      }
    });
  };
  reader.readAsDataURL(file);
});

// عند تحميل الصفحة
window.addEventListener("load", () => {
  updateTable();
});
