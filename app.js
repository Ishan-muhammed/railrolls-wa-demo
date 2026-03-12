// ===== Rail Rolls CLT — WhatsApp Food Ordering Demo =====

// --- Menu Data ---
const WRAPS = [
  { id: 1, name: 'Classic Chicken Zinger Wrap', price: 166, image: 'images/chicken_zinger_wrap.png' },
  { id: 2, name: 'Mexican Tender Wrap', price: 179, image: 'images/mexican_tender_wrap.png' },
  { id: 3, name: 'Spicy Chicken Wrap', price: 175, image: 'images/spicy_chicken_wrap.png' },
];

const COMBOS = [
  { id: 4, name: 'Zinger Wrap + Fries + Drink', price: 249, image: 'images/chicken_zinger_wrap.png' },
  { id: 5, name: 'Mexican Wrap + Fries + Drink', price: 269, image: 'images/mexican_tender_wrap.png' },
  { id: 6, name: 'Spicy Wrap + Fries + Drink', price: 259, image: 'images/spicy_chicken_wrap.png' },
];

const DELIVERY_CHARGE = 20;
const GST_RATE = 0.05;

// --- State ---
let cart = [];
let customerDetails = null;
let selectedItem = null;
let selectedQty = 1;
let awaitingDetails = false;

// --- DOM Refs ---
const chatArea = document.getElementById('chatArea');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const qtyModal = document.getElementById('qtyModal');
const qtyItemName = document.getElementById('qtyItemName');
const qtyOptions = document.getElementById('qtyOptions');
const addItemBtn = document.getElementById('addItemBtn');
const qtyClose = document.getElementById('qtyClose');

const paymentModal = document.getElementById('paymentModal');
const paymentTitle = document.getElementById('paymentTitle');
const paymentAmount = document.getElementById('paymentAmount');
const paymentLoader = document.getElementById('paymentLoader');
const paymentIcon = document.getElementById('paymentIcon');
const paymentDoneBtn = document.getElementById('paymentDoneBtn');

// --- Helpers ---
function getTime() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatArea.scrollTop = chatArea.scrollHeight;
  });
}

function formatCurrency(n) {
  return '₹' + n.toLocaleString('en-IN');
}

// --- Message Rendering ---
function addMessage(content, sender = 'bot', isHTML = false) {
  const row = document.createElement('div');
  row.className = `msg-row ${sender}`;
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  if (isHTML) {
    bubble.innerHTML = content;
  } else {
    bubble.textContent = content;
  }
  // Timestamp
  const time = document.createElement('div');
  time.className = 'msg-time';
  time.textContent = getTime();
  bubble.appendChild(time);
  row.appendChild(bubble);
  chatArea.appendChild(row);
  scrollToBottom();
}

function addTypingIndicator() {
  const row = document.createElement('div');
  row.className = 'msg-row bot';
  row.id = 'typing-indicator';
  row.innerHTML = `<div class="msg-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
  chatArea.appendChild(row);
  scrollToBottom();
}

function removeTypingIndicator() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

function botReply(content, isHTML = false, delay = 1000) {
  return new Promise(resolve => {
    addTypingIndicator();
    setTimeout(() => {
      removeTypingIndicator();
      addMessage(content, 'bot', isHTML);
      resolve();
    }, delay);
  });
}

function addCustomElement(el) {
  chatArea.appendChild(el);
  scrollToBottom();
}

// --- Welcome Card ---
function createWelcomeCard() {
  const wrapper = document.createElement('div');
  wrapper.className = 'msg-row bot';
  wrapper.innerHTML = `
    <div class="welcome-card">
      <img src="images/firstmessage.png" alt="Rail Rolls CLT">
      <div class="welcome-card-body">
        <h3>Hi 🚊 Welcome to Rail Rolls Calicut (CLT)!</h3>
        <p>Fresh, hygienic wraps made for travellers.
Please choose your travel food Menu 👇</p>
        <div class="msg-time">${getTime()}</div>
      </div>
    </div>`;
  return wrapper;
}

// --- Carousel ---
function createCarouselSection(title, items) {
  const section = document.createElement('div');
  section.className = 'carousel-section';

  const header = document.createElement('div');
  header.className = 'carousel-header';
  header.textContent = title;
  section.appendChild(header);

  const scroller = document.createElement('div');
  scroller.className = 'carousel-scroller';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'food-card';
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="food-card-body">
        <div class="food-card-name">${item.name}</div>
        <div class="food-card-price">${formatCurrency(item.price)}</div>
        <button class="btn-order" data-id="${item.id}">Order Now</button>
      </div>`;
    card.querySelector('.btn-order').addEventListener('click', () => openQtyModal(item));
    scroller.appendChild(card);
  });

  section.appendChild(scroller);
  return section;
}

function createCarousel() {
  const container = document.createElement('div');
  container.className = 'carousel-container';
  container.appendChild(createCarouselSection('🌯 Wraps', WRAPS));
  container.appendChild(createCarouselSection('🍔 Combos', COMBOS));
  return container;
}

// --- Quantity Modal ---
function openQtyModal(item) {
  selectedItem = item;
  selectedQty = 1;
  qtyItemName.textContent = item.name;
  qtyOptions.innerHTML = '';

  for (let i = 1; i <= 5; i++) {
    const opt = document.createElement('div');
    opt.className = `qty-option${i === 1 ? ' selected' : ''}`;
    opt.innerHTML = `
      <span>${i} ${i === 1 ? 'piece' : 'pieces'}</span>
      <span class="qty-price">${formatCurrency(item.price * i)}</span>`;
    opt.addEventListener('click', () => {
      selectedQty = i;
      qtyOptions.querySelectorAll('.qty-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
    qtyOptions.appendChild(opt);
  }

  qtyModal.classList.add('active');
}

function closeQtyModal() { qtyModal.classList.remove('active'); }

qtyClose.addEventListener('click', closeQtyModal);

addItemBtn.addEventListener('click', () => {
  if (!selectedItem) return;

  // Add to cart (merge if same item)
  const existing = cart.find(c => c.id === selectedItem.id);
  if (existing) {
    existing.qty += selectedQty;
  } else {
    cart.push({ id: selectedItem.id, name: selectedItem.name, qty: selectedQty, unitPrice: selectedItem.price });
  }

  closeQtyModal();

  // Confirmation message
  const confirmText = `${selectedQty} ${selectedItem.name} added to your order.`;
  botReply(confirmText, false, 500).then(() => {
    showCartPreview();
  });
});

// --- Cart Preview ---
function showCartPreview() {
  const cartHTML = cart.map(c => `<li>${c.name} – ${c.qty}</li>`).join('');
  const el = document.createElement('div');
  el.className = 'msg-row bot';
  el.innerHTML = `
    <div class="msg-bubble">
      <div class="cart-preview">
        <h4>🛒 Your Cart</h4>
        <ul>${cartHTML}</ul>
      </div>
      <div class="quick-actions">
        <button class="quick-btn" id="btnAddMore">➕ Add More Items</button>
        <button class="quick-btn" id="btnCheckout">🧾 Checkout</button>
      </div>
      <div class="msg-time">${getTime()}</div>
    </div>`;
  chatArea.appendChild(el);
  scrollToBottom();

  el.querySelector('#btnAddMore').addEventListener('click', () => {
    // Disable buttons
    disableQuickBtns(el);
    addMessage('Add More Items', 'user');
    setTimeout(() => {
      addCustomElement(createCarousel());
      scrollToBottom();
    }, 400);
  });

  el.querySelector('#btnCheckout').addEventListener('click', () => {
    disableQuickBtns(el);
    addMessage('Checkout', 'user');
    startCheckout();
  });
}

function disableQuickBtns(parentEl) {
  parentEl.querySelectorAll('.quick-btn').forEach(b => {
    b.disabled = true;
    b.style.opacity = '0.4';
    b.style.cursor = 'default';
  });
}

// --- Checkout ---
function startCheckout() {
  const msg = `Great! 🎉 Please share the following details:

• Name:
• Train Number:
• Coach Number:
• Seat Number:
• Expected Time:
• Seat Delivery / Platform Pickup:`;

  botReply(msg, false, 800).then(() => {
    botReply("Once shared, we'll confirm service availability. ✅", false, 600).then(() => {
      awaitingDetails = true;
    });
  });
}

// --- Parse Customer Details from Message ---
function parseCustomerDetails(text) {
  const details = {};
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    const lower = line.toLowerCase();
    // Extract value after colon
    const colonIdx = line.indexOf(':');
    const val = colonIdx !== -1 ? line.substring(colonIdx + 1).trim() : '';

    if (lower.includes('name')) {
      details.name = val || '';
    } else if (lower.includes('train')) {
      details.train_number = val || '';
    } else if (lower.includes('coach')) {
      details.coach = val || '';
    } else if (lower.includes('seat') && !lower.includes('delivery') && !lower.includes('pickup')) {
      details.seat = val || '';
    } else if (lower.includes('time') || lower.includes('expected')) {
      // Parse number of minutes from the value
      const numMatch = val.match(/(\d+)/);
      if (numMatch) {
        let mins = parseInt(numMatch[1]);
        // If user says "1 hour" or "2 hours", convert
        if (lower.includes('hour') || val.toLowerCase().includes('hour')) {
          mins = mins * 60;
        }
        details.expected_time = mins;
      } else {
        details.expected_time = 0;
      }
    } else if (lower.includes('delivery') || lower.includes('pickup') || lower.includes('platform')) {
      if (lower.includes('platform') || val.toLowerCase().includes('platform')) {
        details.delivery_type = 'Platform Pickup';
      } else {
        details.delivery_type = 'Seat Delivery';
      }
    }
  }

  // Defaults
  if (!details.delivery_type) details.delivery_type = 'Seat Delivery';
  if (!details.expected_time) details.expected_time = 0;

  return details;
}

// --- Time Validation ---
function validateAndConfirm() {
  if (customerDetails.expected_time < 30) {
    botReply(
      '😔 Sorry sir, we cannot take orders under 30 minutes before arrival. Please try again with more time.',
      false, 1000
    );
    return;
  }

  showOrderConfirmation();
}

// --- Order Confirmation ---
function showOrderConfirmation() {
  const subtotal = cart.reduce((sum, c) => sum + c.unitPrice * c.qty, 0);
  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + gst + DELIVERY_CHARGE;

  const itemsHTML = cart.map(c =>
    `<div class="order-row"><span>${c.name}</span><span>× ${c.qty}</span></div>`
  ).join('');

  addTypingIndicator();
  setTimeout(() => {
    removeTypingIndicator();

    const el = document.createElement('div');
    el.className = 'msg-row bot';
    el.innerHTML = `
      <div class="msg-bubble" style="padding:0;background:transparent;">
        <div class="order-card">
          <h3>✅ ORDER CONFIRMATION</h3>
          <div style="color:#8696a0;font-size:12px;margin-bottom:10px;">Order Summary</div>
          ${itemsHTML}
          <hr class="order-divider">
          <div class="order-detail">📦 Delivery: ${customerDetails.delivery_type}</div>
          <div class="order-detail">🚉 Station: CLT</div>
          <div class="order-detail">🪑 Coach & Seat: ${customerDetails.seat} / ${customerDetails.coach}</div>
          <div class="order-detail">🧑 Name: ${customerDetails.name}</div>
          <div class="order-detail">🚂 Train: ${customerDetails.train_number}</div>
          <hr class="order-divider">
          <div style="display:flex;justify-content:space-between;color:#8696a0;font-size:12px;">
            <span>Subtotal</span><span>${formatCurrency(subtotal)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;color:#8696a0;font-size:12px;">
            <span>GST (5%)</span><span>${formatCurrency(gst)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;color:#8696a0;font-size:12px;">
            <span>Delivery</span><span>${formatCurrency(DELIVERY_CHARGE)}</span>
          </div>
          <div class="order-total">Total: ${formatCurrency(total)}</div>
          <button class="btn-primary" id="payNowBtn">💳 Pay Now</button>
        </div>
        <div class="msg-time">${getTime()}</div>
      </div>`;

    chatArea.appendChild(el);
    scrollToBottom();

    el.querySelector('#payNowBtn').addEventListener('click', () => {
      el.querySelector('#payNowBtn').disabled = true;
      el.querySelector('#payNowBtn').style.opacity = '0.5';
      startPayment(total);
    });
  }, 1200);
}

// --- Payment Simulation ---
function startPayment(total) {
  paymentTitle.textContent = 'Processing Payment...';
  paymentAmount.textContent = formatCurrency(total);
  paymentIcon.innerHTML = `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#25D366" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`;
  paymentLoader.style.display = 'block';
  paymentDoneBtn.style.display = 'none';

  // Reset animation
  const bar = paymentLoader.querySelector('.loader-bar');
  bar.style.animation = 'none';
  bar.offsetHeight; // force reflow
  bar.style.animation = '';

  paymentModal.classList.add('active');

  setTimeout(() => {
    paymentTitle.textContent = 'Payment Successful!';
    paymentIcon.innerHTML = `<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="#25D366" stroke-width="2.5" style="animation: successPop 0.4s ease-out"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>`;
    paymentLoader.style.display = 'none';
    paymentDoneBtn.style.display = 'block';
  }, 2500);
}

paymentDoneBtn.addEventListener('click', () => {
  paymentModal.classList.remove('active');
  showFinalConfirmation();
});

// --- Final Confirmation ---
function showFinalConfirmation() {
  botReply(
    `🎉 <strong>Thank you, ${customerDetails.name}!</strong><br><br>Your order is confirmed.<br><br>We'll deliver as per the train halt timing at <strong>CLT station</strong>.<br><br>📞 Please keep your phone reachable.<br><br>🚂 Have a safe journey!`,
    true,
    800
  );
}

// --- Welcome Flow ---
async function startWelcomeFlow() {
  userInput.disabled = true;
  sendBtn.disabled = true;

  await botReply('', true, 1000);
  // Replace last message with welcome card
  const lastRow = chatArea.querySelector('.msg-row.bot:last-of-type');
  if (lastRow) lastRow.remove();

  addCustomElement(createWelcomeCard());

  await new Promise(r => setTimeout(r, 600));
  addCustomElement(createCarousel());
  scrollToBottom();

  // Re-enable input for future messages
  userInput.disabled = false;
  sendBtn.disabled = false;
}

// --- Send Handler ---
function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  userInput.value = '';
  userInput.style.height = 'auto';

  // If awaiting delivery details, parse them
  if (awaitingDetails) {
    awaitingDetails = false;
    customerDetails = parseCustomerDetails(text);
    setTimeout(() => validateAndConfirm(), 600);
    return;
  }

  // Trigger welcome flow on first message
  if (cart.length === 0 && !document.querySelector('.welcome-card')) {
    startWelcomeFlow();
  }
}

sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    // If on mobile (width <= 768px), allow Enter to create a new line instead of sending.
    if (window.innerWidth <= 768) {
      return;
    }
    e.preventDefault();
    handleSend();
  }
});

// Auto-resize textarea
userInput.addEventListener('input', () => {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
});

// --- Focus input on load ---
userInput.focus();
