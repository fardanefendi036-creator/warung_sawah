const cartPanel = document.getElementById("cartPanel");
const cartItems = document.getElementById("cartItems");
const cartCount = document.querySelector(".cart-count");
const totalEl = document.getElementById("total");
const checkoutTotal = document.getElementById("checkoutTotal");

let items = [];
let total = 0;

function toggleCart() {
  cartPanel.classList.toggle("active");
}

function addToCart(name, price) {
  const found = items.find(i => i.name === name);
  if (found) found.qty++;
  else items.push({ name, price, qty: 1 });
  updateCart();
}

function updateCart() {
  cartItems.innerHTML = "";
  total = 0;
  let count = 0;
  items.forEach(i => {
    total += i.price * i.qty;
    count += i.qty;
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<span>${i.name} x${i.qty}</span><span>Rp${(i.price * i.qty).toLocaleString()}</span>`;
    cartItems.appendChild(div);
  });
  totalEl.textContent = total.toLocaleString();
  cartCount.textContent = count;
}

function openCheckout() {
  if (items.length === 0) return alert("Keranjang kosong!");
  checkoutTotal.textContent = total.toLocaleString();
  openPopup("checkoutPopup");
}

function confirmCheckout() {
  alert("Terima kasih! Pesanan Anda sedang diproses.");
  items = [];
  updateCart();
  closePopup("checkoutPopup");
  cartPanel.classList.remove("active");
}

// POPUP SISTEM
function openPopup(id) {
  document.getElementById(id).classList.add("active");
}
function closePopup(id) {
  document.getElementById(id).classList.remove("active");
}

// FILTER
function filterCategory(cat) {
  const products = document.querySelectorAll(".product");
  document.querySelectorAll(".categories button").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
  products.forEach(p => {
    if (cat === "all" || p.dataset.category === cat) p.style.display = "block";
    else p.style.display = "none";
  });
}

// SEARCH
function searchProduct() {
  const val = document.getElementById("searchInput").value.toLowerCase();
  const products = document.querySelectorAll(".product");
  products.forEach(p => {
    const name = p.querySelector("h3").textContent.toLowerCase();
    p.style.display = name.includes(val) ? "block" : "none";
  });
    }
