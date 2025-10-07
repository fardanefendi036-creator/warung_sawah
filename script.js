/* ===========================
   Demo data, utils & state
   =========================== */

const products = [
  { id: 'p1', title:'Nasi Goreng Spesial', price:25000, category:'Makanan', img:'https://images.unsplash.com/photo-1606755962773-0e6c4ef1bcbf', desc:'Nasi goreng dengan bumbu spesial.'},
  { id: 'p2', title:'Es Teh Manis', price:8000, category:'Minuman', img:'https://images.unsplash.com/photo-1582719478185-2c1b1d4c02ee', desc:'Es teh segar favorit.'},
  { id: 'p3', title:'Burger Daging', price:30000, category:'Makanan', img:'https://images.unsplash.com/photo-1586190848861-99aa4a171e90', desc:'Burger juicy dengan saus rahasia.'},
  { id: 'p4', title:'Kentang Goreng', price:15000, category:'Jajanan', img:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', desc:'Kentang goreng renyah.'},
  { id: 'p5', title:'Donat Coklat', price:12000, category:'Jajanan', img:'https://images.unsplash.com/photo-1589308078059-be1415eab4c3', desc:'Donat lembut dengan topping coklat.'},
  { id: 'p6', title:'Jus Jeruk Segar', price:14000, category:'Minuman', img:'https://images.unsplash.com/photo-1542444459-db3b5a0a2b7b', desc:'Jus jeruk asli peras.'}
];

const categories = ['Semua','Makanan','Minuman','Jajanan'];

/* State */
let cart = JSON.parse(localStorage.getItem('toko_cart') || '[]'); // [{id, qty}]
let notifications = JSON.parse(localStorage.getItem('toko_notifs') || '[]'); // [{title, body, time}]
let user = JSON.parse(localStorage.getItem('toko_user') || 'null'); // {name,email}

/* DOM refs */
const productsGrid = document.getElementById('productsGrid');
const categoryList = document.getElementById('categoryList');
const selectedCategory = document.getElementById('selectedCategory');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartBadge = document.getElementById('cartBadge');
const notifBadge = document.getElementById('notifBadge');
const userInfo = document.getElementById('userInfo');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

/* Modal elements */
const modalEls = {
  checkout: document.getElementById('checkoutModal'),
  notif: document.getElementById('notifModal'),
  profile: document.getElementById('profileModal'),
  login: document.getElementById('loginModal'),
  register: document.getElementById('registerModal')
};

/* init */
renderCategories();
renderProducts(products);
updateCartUI();
renderNotifs();
renderUserInfo();
attachEvents();

/* ===========================
   Rendering functions
   =========================== */

function renderCategories(){
  categoryList.innerHTML = '';
  categories.forEach(cat=>{
    const li = document.createElement('li');
    li.textContent = cat;
    li.onclick = () => {
      selectedCategory.textContent = cat;
      filterProducts(cat);
      document.querySelectorAll('#categoryList li').forEach(n=>n.classList.remove('active'));
      li.classList.add('active');
    };
    if(cat==='Semua') li.classList.add('active');
    categoryList.appendChild(li);
  });
}

function renderProducts(list){
  productsGrid.innerHTML = '';
  if(list.length===0) productsGrid.innerHTML = `<div class="card">Tidak ada produk.</div>`;
  list.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}" />
      <h4>${p.title}</h4>
      <div class="meta">
        <div class="price">Rp${p.price.toLocaleString()}</div>
        <div><small style="color:var(--muted)">${p.category}</small></div>
      </div>
      <p style="color:var(--muted);font-size:13px;margin-top:6px">${p.desc}</p>
      <div class="actions">
        <button class="btn outline small" data-id="${p.id}" onclick="viewDetails('${p.id}')">Detail</button>
        <button class="btn primary small" data-id="${p.id}" onclick="addToCart('${p.id}',1)">Tambah</button>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

function renderNotifs(){
  const notifListEl = document.getElementById('notifList');
  notifListEl.innerHTML = '';
  if(notifications.length===0){
    notifListEl.innerHTML = '<p>Tidak ada notifikasi baru.</p>';
    notifBadge.classList.add('hide');
    return;
  }
  notifications.slice().reverse().forEach(n=>{
    const div = document.createElement('div');
    div.style.padding='8px';
    div.style.borderBottom='1px solid #f1f5f9';
    div.innerHTML = `<strong>${escapeHtml(n.title)}</strong><div style="color:var(--muted);font-size:13px">${escapeHtml(n.body)}</div><small style="color:var(--muted)">${new Date(n.time).toLocaleString()}</small>`;
    notifListEl.appendChild(div);
  });
  notifBadge.textContent = notifications.length; notifBadge.classList.remove('hide');
}

function renderUserInfo(){
  if(user){
    userInfo.innerHTML = `<strong>${escapeHtml(user.name)}</strong><br><small>${escapeHtml(user.email)}</small>`;
    document.getElementById('profileBody').innerHTML = `<p>Nama: <strong>${escapeHtml(user.name)}</strong></p><p>Email: ${escapeHtml(user.email)}</p><div style="margin-top:12px"><button id="logoutBtn" class="btn outline small">Logout</button></div>`;
    document.getElementById('logoutBtn')?.addEventListener('click', ()=>{ logout(); closeModal('profile'); });
  } else {
    userInfo.textContent = 'Belum login';
    document.getElementById('profileBody').innerHTML = `<p>Silakan login atau daftar untuk pengalaman lebih baik.</p><div style="margin-top:12px"><button id="openLoginBtn" class="btn small">Login</button></div>`;
    document.getElementById('openLoginBtn')?.addEventListener('click', ()=>{ openModal('login'); closeModal('profile'); });
  }
}

/* ===========================
   Cart functions
   =========================== */

function saveCart(){ localStorage.setItem('toko_cart', JSON.stringify(cart)); }
function saveNotifs(){ localStorage.setItem('toko_notifs', JSON.stringify(notifications)); }
function saveUser(){ localStorage.setItem('toko_user', JSON.stringify(user)); }

function updateCartUI(){
  cartItemsEl.innerHTML = '';
  let total = 0;
  let qty = 0;
  if(cart.length===0) cartItemsEl.innerHTML = '<p style="color:var(--muted)">Keranjang kosong.</p>';
  cart.forEach(it=>{
    const prod = products.find(p=>p.id===it.id);
    if(!prod) return;
    total += prod.price * it.qty; qty += it.qty;
    const node = document.createElement('div');
    node.className = 'cart-item';
    node.innerHTML = `<div><strong>${prod.title}</strong><div style="color:var(--muted);font-size:13px">Rp${prod.price.toLocaleString()} × ${it.qty}</div></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px"><div><strong>Rp${(prod.price*it.qty).toLocaleString()}</strong></div><div><button class="btn small" onclick="changeQty('${it.id}',1)">＋</button> <button class="btn small outline" onclick="changeQty('${it.id}',-1)">−</button></div></div>`;
    cartItemsEl.appendChild(node);
  });
  cartTotalEl.textContent = `Rp${total.toLocaleString()}`;
  cartBadge.textContent = qty; (qty>0)?cartBadge.classList.remove('hide'):cartBadge.classList.add('hide');
  saveCart();
}

/* cart helpers */
function addToCart(id, qty=1){
  const found = cart.find(i=>i.id===id);
  if(found) found.qty += qty; else cart.push({id, qty});
  showToast('Produk ditambahkan ke keranjang');
  // push notif sample
  notifications.push({title:'Tambah ke keranjang', body:`Satu produk ditambahkan`, time:Date.now()});
  saveNotifs();
  updateCartUI(); renderNotifs();
}

function changeQty(id, delta){
  const it = cart.find(i=>i.id===id); if(!it) return;
  it.qty += delta;
  if(it.qty<=0) cart = cart.filter(x=>x.id!==id);
  updateCartUI();
}

function clearCart(){
  if(!confirm('Kosongkan keranjang?')) return;
  cart = [];
  updateCartUI();
}

/* ===========================
   Modal (popup) helpers
   =========================== */
function openModal(key){
  const m = modalEls[key];
  if(!m) return;
  m.setAttribute('aria-hidden','false');
}
function closeModal(key){
  const m = modalEls[key];
  if(!m) return;
  m.setAttribute('aria-hidden','true');
}

/* close buttons binding (data-close attributes) */
document.addEventListener('click', e=>{
  const closeAttr = e.target.closest('[data-close]');
  if(closeAttr){
    const id = closeAttr.getAttribute('data-close');
    const key = id.replace('Modal','').toLowerCase();
    closeModal(key);
  }
});

/* open/close cart */
document.getElementById('btnCart').addEventListener('click', ()=> toggleCartPanel());
document.getElementById('closeCart').addEventListener('click', ()=> toggleCartPanel());
document.getElementById('clearCart').addEventListener('click', ()=> clearCart());
function toggleCartPanel(){
  const panel = document.getElementById('cartPanel');
  panel.classList.toggle('open');
}

/* checkout flow */
document.getElementById('openCheckout').addEventListener('click', ()=>{
  if(cart.length===0) return alert('Keranjang kosong!');
  const total = cart.reduce((s,i)=>{ const p = products.find(x=>x.id===i.id); return s + (p?.price||0) * i.qty; },0);
  document.getElementById('checkoutSummary').textContent = `Total: Rp${total.toLocaleString()}`;
  document.getElementById('checkoutName').value = user?.name || '';
  document.getElementById('checkoutAddress').value = '';
  openModal('checkout');
});
document.getElementById('confirmCheckoutBtn').addEventListener('click', ()=>{
  const name = document.getElementById('checkoutName').value.trim();
  const addr = document.getElementById('checkoutAddress').value.trim();
  if(!name || !addr) return alert('Isi nama dan alamat.');
  const total = cart.reduce((s,i)=>{ const p = products.find(x=>x.id===i.id); return s + (p?.price||0) * i.qty; },0);
  // simulate order
  notifications.push({title:'Pesanan dibuat', body:`Pesanan ${name} senilai Rp${total.toLocaleString()} dibuat.`, time:Date.now()});
  saveNotifs();
  alert('Checkout berhasil — Terima kasih!');
  cart = []; updateCartUI(); renderNotifs();
  closeModal('checkout'); document.getElementById('cartPanel').classList.remove('open');
});

/* Notifications open */
document.getElementById('btnNotif').addEventListener('click', ()=> openModal('notif'));

/* Profile open */
document.getElementById('btnProfile').addEventListener('click', ()=> openModal('profile'));

/* Login/Register modals triggers */
document.getElementById('openLogin').addEventListener('click', ()=> openModal('login'));
document.getElementById('openRegister').addEventListener('click', ()=> openModal('register'));
document.getElementById('openRegister').addEventListener('click', ()=> closeModal('login')); // ensure only one open

/* Login/Register handlers */
document.getElementById('loginBtn').addEventListener('click', ()=>{
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  if(!email || !pass) return alert('Isi email & password.');
  // demo: check local users list (in localStorage)
  const users = JSON.parse(localStorage.getItem('toko_users') || '[]');
  const found = users.find(u=>u.email===email && u.pass===pass);
  if(!found) return alert('Login gagal: user tidak ditemukan atau password salah (demo).');
  user = {name: found.name, email: found.email};
  saveUser(); renderUserInfo(); closeModal('login'); showToast('Login berhasil');
});
document.getElementById('registerBtn').addEventListener('click', ()=>{
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value;
  if(!name || !email || !pass) return alert('Isi semua kolom.');
  const users = JSON.parse(localStorage.getItem('toko_users') || '[]');
  if(users.find(u=>u.email===email)) return alert('Email sudah terdaftar (demo).');
  users.push({name, email, pass});
  localStorage.setItem('toko_users', JSON.stringify(users));
  user = {name, email}; saveUser(); renderUserInfo(); closeModal('register'); showToast('Registrasi berhasil — Anda sudah login');
});

/* logout */
function logout(){
  user = null; saveUser(); renderUserInfo(); showToast('Logout berhasil');
}

/* misc: view details (opens profile modal showing product info) */
function viewDetails(id){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  // reuse profile modal for quick detail (or create a product detail modal in future)
  const profileBody = document.getElementById('profileBody');
  profileBody.innerHTML = `<img src="${p.img}" style="width:100%;border-radius:8px;margin-bottom:8px"/><h3>${p.title}</h3><p style="color:var(--muted)">${p.desc}</p><p class="price" style="color:var(--primary);font-weight:700">Rp${p.price.toLocaleString()}</p><div style="margin-top:8px"><button class="btn primary" onclick="addToCart('${p.id}',1); closeModal('profile')">Tambah ke keranjang</button></div>`;
  openModal('profile');
}

/* ===========================
   Filters & Search
   =========================== */

function filterProducts(cat){
  let list = products.slice();
  if(cat && cat!=='Semua') list = list.filter(p=>p.category === cat);
  renderProducts(list);
}

document.getElementById('btnSearch').addEventListener('click', ()=> {
  const q = (searchInput.value||'').toLowerCase().trim();
  const list = products.filter(p=> p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  renderProducts(list);
});
searchInput.addEventListener('keyup', (e)=> {
  if(e.key==='Enter'){ document.getElementById('btnSearch').click(); }
});

sortSelect.addEventListener('change', ()=>{
  const val = sortSelect.value;
  let arr = [...products];
  if(val==='price-asc') arr.sort((a,b)=>a.price-b.price);
  if(val==='price-desc') arr.sort((a,b)=>b.price-a.price);
  if(val==='name') arr.sort((a,b)=>a.title.localeCompare(b.title));
  if(val==='popular') arr = [...products];
  renderProducts(arr);
});

/* ===========================
   Simple toast helper
   =========================== */
let toastTimer = null;
function showToast(msg, t=1800){
  let existing = document.getElementById('toastEl');
  if(!existing){
    existing = document.createElement('div'); existing.id='toastEl';
    existing.style.position='fixed'; existing.style.right='20px'; existing.style.bottom='20px';
    existing.style.background='#0f172a'; existing.style.color='white'; existing.style.padding='10px 14px';
    existing.style.borderRadius='10px'; existing.style.boxShadow='0 8px 24px rgba(2,6,23,0.2)'; existing.style.zIndex=120;
    document.body.appendChild(existing);
  }
  existing.textContent = msg; existing.style.opacity='1';
  clearTimeout(toastTimer); toastTimer = setTimeout(()=> existing.style.opacity='0', t);
}

/* ===========================
   Utils
   =========================== */
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

/* ===========================
   Initial sample data (notifs) & finish init
   =========================== */
if(notifications.length===0){
  notifications.push({title:'Selamat datang!', body:'Selamat datang di TokoBlue — coba tambahkan produk ke keranjang.', time:Date.now()});
  saveNotifs(); renderNotifs();
}
updateCartUI();
renderUserInfo();

/* Close modal when clicking outside modal-card */
document.querySelectorAll('.modal').forEach(m=>{
  m.addEventListener('click', (e)=>{
    if(e.target === m){
      // allow closing by clicking backdrop but keep "Kembali" button option visible
      m.setAttribute('aria-hidden','true');
    }
  });
});
