# WhatsApp AI Food Ordering Demo (Rail Rolls CLT)

## Objective

Create a WhatsApp-like interactive demo interface to showcase a food ordering AI chatbot for Rail Rolls Calicut (CLT).

Since Meta verification for horizontal carousel cards takes 3 days, this demo will simulate the experience using a custom interactive UI built in Antogravity.

The demo replicates the WhatsApp user experience including welcome message card, horizontal food item carousel, order popup, quantity selection, chat confirmation message, customer details collection, order validation, payment button, and final confirmation message.

---

## User Journey

### Step 1 — User Starts Chat

User sends:

Hi

---

### Step 2 — Bot Sends Welcome Card

Bot displays a large card with image and welcome text.

Welcome to Rail Rolls Calicut (CLT)

Fresh, hygienic wraps made for travellers.

Prices exclude taxes. ₹20 delivery charge applies.

Instead of a menu button we show horizontal scrollable food cards.

---

## Horizontal Food Menu

Food items appear in a horizontal slider.

Each card contains:

* Food image
* Food name
* Price
* CTA button: Order Now

Example items:

Classic Chicken Zinger Wrap — ₹166
Mexican Tender Wrap — ₹179
Spicy Chicken Wrap — ₹175

---

## Quick Order Interaction (Reduced Steps)

To reduce the number of steps, ordering happens directly from the food card interaction.

When the user clicks **Order Now**, a small quantity selector appears immediately.

Title: Choose Quantity

Options:
1 piece – ₹166
2 pieces – ₹332
3 pieces – ₹498
4 pieces – ₹664
5 pieces – ₹830

Button: **Add Item**

Once selected, the system immediately updates the cart and shows a confirmation message inside the chat.

Example:

"2 Classic Chicken Zinger Wrap added to your order."

Immediately after this, the bot presents two quick options:

* ➕ Add More Items
* 🧾 Checkout

If the user clicks **Add More Items**, the horizontal food carousel appears again so the user can quickly select another wrap or combo.

If the user clicks **Checkout**, the bot proceeds directly to collecting delivery details.

### Add More Items Behavior

When the user clicks **➕ Add More Items**, the system shows the **same horizontal food carousel again** so the user can immediately select another item.

Flow:

Select Item → Choose Quantity → Item Added → Add More Items → Carousel Appears Again

Each time an item is added, it is stored in the backend cart session.

Example cart structure:

{
"cart": [
{
"item": "Classic Chicken Zinger Wrap",
"qty": 2,
"price": 166
},
{
"item": "Mexican Tender Wrap",
"qty": 1,
"price": 179
}
]
}

After every item addition the chat shows a small cart preview:

Your Cart:
• Classic Chicken Zinger Wrap – 2

Options:
➕ Add More Items
🧾 Checkout

This allows users to quickly build an order with multiple items while keeping the number of steps minimal.

---

## Customer Details Collection

Bot replies:

Great!

Please share the following details:

* Name
* Train Number
* Coach Number
* Seat Number
* Expected Time
* Seat Delivery or Platform Pickup

Once shared the system confirms service availability.

---

## Delivery Time Validation

If expected time is less than 30 minutes:

"Sorry sir, we cannot take orders under 30 minutes before arrival."

If valid the system proceeds to order confirmation.

---

## Order Confirmation

Bot sends:

ORDER CONFIRMATION

Order Summary:
Classic Chicken Zinger Wrap – 2

Delivery Type: Platform Pickup

Station: CLT

Coach & Seat: 25/D2

Total Amount: ₹332 (Including GST + delivery charges)

Please make the payment.

Button: Pay Now

---

## Payment Demo

For demo purposes Pay Now opens a fake payment success screen then returns to chat.

---

## Payment Confirmation

Bot sends:

Thank you!

Your order is confirmed.

We’ll deliver as per the train halt timing.

Please keep your phone reachable.

Have a safe journey!

---

## System Architecture

Frontend
Antogravity interactive WhatsApp style UI

Backend
ChatGPT API for conversation logic

Session memory to store order data

Temporary JSON storage for demo orders

---

## Components Needed

Chat interface
Message bubbles
Horizontal food carousel
Order popup modal
Quantity selector
Payment popup

---

## AI Logic

ChatGPT API handles conversation understanding and extracts structured order details.

Example extracted data:

{
"name": "Rahul",
"train_number": "12623",
"coach": "D2",
"seat": "25",
"time": "45",
"delivery_type": "Platform Pickup"
}

---

## Demo Mode

Since this is not connected to the WhatsApp API the interface simulates WhatsApp behavior for presentation purposes.

Goal: demonstrate menu browsing, ordering, passenger details collection, validation, payment flow, and order confirmation in a conversational interface.
