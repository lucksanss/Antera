const services = [
  { name: "Repair Kit", price: 2500 },
  { name: "Cleaning Kit", price: 1500 },
  { name: "Performance", price: 166000 },
  { name: "Respray", price: 10000 },
  { name: "Tyre Smoke Kit", price: 10000 },
  { name: "Cosmetic", price: 10000 },
  { name: "Lighting", price: 10000 },
  { name: "Extras Kit", price: 10000 },
  { name: "Vehicle Wheel", price: 10000 },
];

const state = {};

const servicesList = document.getElementById("servicesList");

services.forEach(service => {

  state[service.name] = 0;

  const row = document.createElement("div");
  row.className = "service-row";

  row.innerHTML = `
  
    <div class="service-info">
      <h3>${service.name}</h3>
      <div class="service-price">$${service.price.toLocaleString()} each</div>
    </div>

    <div class="service-controls">

      <button class="qty-btn minus-btn">−</button>

      <input
        type="number"
        class="qty-input"
        value="0"
        min="0"
      >

      <button class="qty-btn plus-btn">+</button>

    </div>

    <div class="service-subtotal">$0</div>
  
  `;

  const minusBtn = row.querySelector(".minus-btn");
  const plusBtn = row.querySelector(".plus-btn");
  const qtyInput = row.querySelector(".qty-input");
  const subtotalEl = row.querySelector(".service-subtotal");
  const priceLabel = row.querySelector(".service-price");

  function updateRow() {

    let qty = parseInt(qtyInput.value) || 0;

    if(qty < 0) qty = 0;

    state[service.name] = qty;

    let subtotal = 0;

    if(service.name === "Performance"){

      if(qty === 5){
        subtotal = 830000;
        priceLabel.innerHTML = "⚡ Bundle Deal x5 = $830,000";
      }
      else if(qty === 6){
        subtotal = 930000;
        priceLabel.innerHTML = "⚡ Bundle Deal x6 = $930,000";
      }
      else if(qty > 6){
        subtotal = 930000 + ((qty - 6) * 166000);
        priceLabel.innerHTML = "⚡ Infinite Bundle Active";
      }
      else{
        subtotal = qty * 166000;
        priceLabel.innerHTML = "$166,000 each";
      }

    }else{
      subtotal = qty * service.price;
    }

    subtotalEl.innerHTML = `$${subtotal.toLocaleString()}`;

    row.classList.toggle("active", qty > 0);

    updateTotal();
  }

  plusBtn.onclick = () => {
    qtyInput.value = parseInt(qtyInput.value || 0) + 1;
    updateRow();
  };

  minusBtn.onclick = () => {
    qtyInput.value = Math.max(0, parseInt(qtyInput.value || 0) - 1);
    updateRow();
  };

  qtyInput.addEventListener("input", updateRow);

  servicesList.appendChild(row);

});

function updateTotal(){

  let total = 0;
  let items = 0;

  services.forEach(service => {

    const qty = state[service.name];

    let subtotal = 0;

    if(service.name === "Performance"){

      if(qty === 5){
        subtotal = 830000;
      }
      else if(qty === 6){
        subtotal = 930000;
      }
      else if(qty > 6){
        subtotal = 930000 + ((qty - 6) * 166000);
      }
      else{
        subtotal = qty * 166000;
      }

    }else{
      subtotal = qty * service.price;
    }

    total += subtotal;
    items += qty;

  });

  document.getElementById("totalAmount").innerHTML =
    `$${total.toLocaleString()}`;

  document.getElementById("totalSubtext").innerHTML =
    items === 0
      ? "No services selected"
      : `${items} item(s) selected`;

}

document.getElementById("resetBtn").onclick = () => {

  document.querySelectorAll(".qty-input").forEach(input => {
    input.value = 0;
  });

  document.querySelectorAll(".service-subtotal").forEach(el => {
    el.innerHTML = "$0";
  });

  document.querySelectorAll(".service-row").forEach(el => {
    el.classList.remove("active");
  });

  document.querySelectorAll(".service-price").forEach((el,index) => {

    if(services[index].name === "Performance"){
      el.innerHTML = "$166,000 each";
    }else{
      el.innerHTML = `$${services[index].price.toLocaleString()} each`;
    }

  });

  Object.keys(state).forEach(key => {
    state[key] = 0;
  });

  updateTotal();

};

document.getElementById("copyBtn").onclick = () => {

  let text = "🔧 UNION MECHANIC QUOTE\n\n";

  let total = 0;

  services.forEach(service => {

    const qty = state[service.name];

    if(qty <= 0) return;

    let subtotal = 0;

    if(service.name === "Performance"){

      if(qty === 5){
        subtotal = 830000;
      }
      else if(qty === 6){
        subtotal = 930000;
      }
      else if(qty > 6){
        subtotal = 930000 + ((qty - 6) * 166000);
      }
      else{
        subtotal = qty * 166000;
      }

    }else{
      subtotal = qty * service.price;
    }

    total += subtotal;

    text += `${service.name} x${qty} → $${subtotal.toLocaleString()}\n`;

  });

  text += `\nTOTAL → $${total.toLocaleString()}`;

  navigator.clipboard.writeText(text);

  const toast = document.getElementById("toast");

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);

};

updateTotal();