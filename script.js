//Navigation between steps
let currentStep = 1; // Track the current step
let finalStep = 6; // The final step
let calculatorMargin = 0.2; // Margin for the calculator
let backendURL = `https://cavalrycalculator-backend-production.up.railway.app/`;
let backendPort = `8080`;


//Button click event listeners
document.addEventListener("DOMContentLoaded", function () {

  //ping backend
  fetch(backendURL)
    .then(response => response.text())
    .then(data => console.log(data))

  //Listeners for the buttons on the project selection
  const projectButtons = document.querySelectorAll('#project-button');
  projectButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      selectProjectType(this.dataset.value);
      updateMinMaxValues();
    });
  });

  //Listeners for the buttons on the irrigation selection
  const irrigationButtons = document.querySelectorAll('#irrigation-button');
  irrigationButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      selectIrrigationType(this.dataset.value);
    });
  });

  //Listeners for the buttons on the slope selection
  const slopeButtons = document.querySelectorAll('#slope-button');
  slopeButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      selectSlopeType(this.dataset.value);
    });
  });

  //Listener for first name last name and email input on submit button
  const submitButton = document.getElementById('submit-btn');

  submitButton.addEventListener('click', async function () {

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;

    if (firstName && lastName && email) {

      const existingEmail = await checkEmail(email);

      if (existingEmail === false) {
        await createCustomer(email, firstName, lastName);
      }

    } else {
      alert("Please fill out all required fields before continuing.");

    }
  });


  //Listener for the buy button
  const buyButton = document.getElementById('buy-button');

  buyButton.addEventListener('click', async function (event) {
    event.preventDefault(); // Prevent default form validation behavior
    const email = document.getElementById('email').value;
  
    try {
      const session = await startCheckoutSession(email);
      if (session && session.url) {
        console.log("🟢 Redirecting to Stripe checkout...");
        window.location.href = session.url; // or use window.open if you prefer
      } else {
        console.error("❌ Stripe session returned without a URL");
      }
    } catch (err) {
      console.error("❌ Error starting Stripe session:", err);
    }
  });
  

  //Navigation between steps
  const totalSteps = finalStep

  //Update steps tracker
  updateSteps();

  // Next Button Click Event
  const nextButtons = document.querySelectorAll(".next-btn");
  nextButtons.forEach(btn => {
    btn.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent default form validation behavior
      let step = parseInt(this.dataset.step);
      nextStep(step);
    });
  });

  // Previous Button Click Event
  const prevButtons = document.querySelectorAll(".prev-btn");
  prevButtons.forEach(btn => {
    btn.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent default form validation behavior
      let step = parseInt(this.dataset.step);
      prevStep(step);
    });
  });

  //Project Type Selection Update Min and Max Values Function
  function updateMinMaxValues() {
    const projectType = document.getElementById('projectType').value;
    const lengthSlider = document.getElementById('lengthValue');
    const widthSlider = document.getElementById('widthValue');
    const lengthDisplay = document.getElementById('lengthDisplay');
    const widthDisplay = document.getElementById('widthDisplay');


    if (projectType === 'walkway') {
      lengthSlider.min = 10;
      lengthSlider.max = 50;
      widthSlider.min = 4;
      widthSlider.max = 6;
    } else if (projectType === 'patio') {
      lengthSlider.min = 5;
      lengthSlider.max = 20;
      widthSlider.min = 5;
      widthSlider.max = 20;
    } else if (projectType === 'trash_can_pad') {
      lengthSlider.min = 3;
      lengthSlider.max = 10;
      widthSlider.min = 3;
      widthSlider.max = 10;
    }

    // Reset slider values and displays
    lengthSlider.value = lengthSlider.min;
    widthSlider.value = widthSlider.min;
    lengthDisplay.innerText = lengthSlider.value;
    widthDisplay.innerText = widthSlider.value;
  };

  //Progress bar functions

  function updateProgressBar() {
    const progressBar = document.getElementById(`progress-bar`);
    const totalSteps = finalStep;
    const progress = ((currentStep) / (totalSteps)) * 100;

    progressBar.style.width = `${progress}%`;

    updateSteps();

    //console.log(`✅ Progress updated: ${progress}%`);
  }

  function updateSteps() {
    const currentStepElement = document.getElementById(`step`);
    currentStepElement.innerHTML = currentStep;
    const totalStepsElement = document.getElementById(`totalSteps`);
    totalStepsElement.innerHTML = totalSteps;
  }

  // Function to Validate and Move to Next Step
  function nextStep(step) {
    let currentCard = document.getElementById(`step-${step}`);
    let nextCard = document.getElementById(`step-${step + 1}`);

    // Validate only inputs inside the current step
    let inputs = currentCard.querySelectorAll("input[required], select[required]");
    let isValid = true;

    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add("input-error");
        isValid = false;
      } else {
        input.classList.remove("input-error");
      }
    });

    if (!isValid) {
      alert("Please fill out all required fields before continuing.");
      return;
    }

    // Hide current step and show the next step
    currentCard.classList.remove("active");
    nextCard.classList.add("active");


    currentStep++;
    updateProgressBar();

    if (currentStep === finalStep) {
      showQuote();
    }

  }

  // Function to Go Back to Previous Step
  function prevStep(step) {
    let currentCard = document.getElementById(`step-${step}`);
    let prevCard = document.getElementById(`step-${step - 1}`);

    currentCard.classList.remove("active");
    prevCard.classList.add("active");


    currentStep--;
    updateProgressBar();

  }

  //Function for buttons on project selection
  function selectProjectType(value) {
    document.getElementById('projectType').value = value;
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`.option-btn[data-value="${value}"]`).classList.add('selected');
    setTimeout(() => nextStep(1), 300);
  }

  //Function for buttons on irrigation selection
  function selectIrrigationType(value) {
    document.getElementById('irrigationType').value = value;
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`.option-btn[data-value="${value}"]`).classList.add('selected');
    setTimeout(() => nextStep(3), 300);
  }

  //Function for buttons on slope selection
  function selectSlopeType(value) {
    document.getElementById('slopeType').value = value;
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`.option-btn[data-value="${value}"]`).classList.add('selected');
    setTimeout(() => nextStep(4), 300);
  }



  //Listener for the slider fill
  const sliders = document.querySelectorAll('input[type="range"]');

  sliders.forEach(slider => {
    updateSliderTrack(slider); // Set initial fill

    slider.addEventListener("input", function () {
      updateSliderTrack(this);
    });
  });


  function updateSliderTrack(slider) {
    const min = slider.min || 0;
    const max = slider.max || 100;
    const value = slider.value;
    const percentage = ((value - min) / (max - min)) * 100;

    // Apply gradient background
    slider.style.background = `linear-gradient(to right,rgb(0, 62, 95) ${percentage}%, #ddd ${percentage}%)`;
  }
});

//Backend function to start a checkout session
async function startCheckoutSession(email) {
  console.log("⌛ Starting checkout session...");
  const response = await fetch(`${backendURL}stripe/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: email })
  });

  if (!response.ok) {
    console.error(`❌ Error starting checkout session: ${response.status} ${response.statusText}`);
    return null;
  }
  const contentType = response.headers.get("Content-Type");
  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();

    if (data.id) {
      console.log("🛒 Checkout session started");
      return data;
    } else {
      console.log("❌ Error: Invalid response data");
      return null;
    }
  } else {
    throw new Error("Response is not JSON");
  }
}

//Backend function to check for existing email
async function checkEmail(email) {
  console.log("⌛ Checking email in GHL...");
  const response = await fetch(`${backendURL}ghl/contacts/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: email })
  })
  const data = await response.json();

  if (data.total === 0 || data.message === "No contact found") {
    console.log("📩 No emails found in GHL");
    return false;

  } else {
    console.log("📧 Email found in GHL");
    return true;
  }
}

//Backend function to create a new customer
async function createCustomer(email, firstName, lastName) {
  const response = await fetch(`${backendURL}ghl/contacts/createNew`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: email, firstName: firstName, lastName: lastName })
  })
  const data = await response.json();

  if (data.contact !== null) {
    console.log("👤 New customer created for " + firstName + " " + lastName + " with email " + email);
  } else {
    console.log("❌ Error creating new customer");
  }
}

function getPricePerSqFt(area) {

  const minArea = 100;
  const maxArea = 400;
  const maxPrice = 22;
  const minPrice = 8.8;

  if (area <= minArea) return maxPrice;
  if (area >= maxArea) return minPrice;

  const scale = (Math.log10(area) - Math.log10(minArea)) / (Math.log10(maxArea) - Math.log10(minArea));
  const pricePerSqFt = maxPrice - scale * (maxPrice - minPrice);
  return pricePerSqFt;
}

function calculateQuote(projectType, area, irrigationPrice, slopePrice) {

  let basePricePerSqFt = getPricePerSqFt(area);
  let baseCost = (basePricePerSqFt * area);
  let customerCost = 0;

  const margin = calculatorMargin;

  customerCost = baseCost * (1 + margin);
  customerCost += irrigationPrice + slopePrice;

  //Minimum price for things not trash can pad
  if (projectType === "trashcanpad") {
    customerCost = customerCost
  }
  else if (customerCost < 2600) {
    customerCost = 2600;
  }

  return customerCost;
}

//Handles showing the output of the quote
function showQuote() {
  

  if (currentStep === finalStep) {
    console.log("✅ Showing quote");

    let finalStepElement = document.getElementById(`step-${finalStep}`);
    if (finalStepElement) {
      finalStepElement.classList.add("active");
      finalStepElement.style.display = "block";
    } else {
      console.error("❌ Final step element not found.");
    }

    const quoteOutput = document.getElementById("quoteOutput");
    if (!quoteOutput) {
      console.error("❌ Error: #quoteOutput not found in the DOM.");
      return;
    }

    // Calculate irrigation price
    let irrigationPrice = 0;
    let irrigationValue = document.getElementById("irrigationType").value;

    if (irrigationValue === "none") {
      irrigationPrice = 0;
    } else if (irrigationValue === "capped") {
      irrigationPrice = 50;
    } else if (irrigationValue === "rerouted") {
      irrigationPrice = 100;
    }

    // Calculate slope price
    let slopePrice = 0;
    let slopeValue = document.getElementById("slopeType").value;

    if (slopeValue === "none") {
      slopePrice = 0;
    } else if (slopeValue === "slight") {
      slopePrice = 100;
    } else if (slopeValue === "moderate") {
      slopePrice = 200;
    } else if (slopeValue === "high") {
      slopePrice = 300;
    } else {
      slopeCost = 0;
    }




    // Get the values from the form
    const projectType = document.getElementById("projectType").value;
    const length = parseFloat(document.getElementById("lengthValue").value);
    const width = parseFloat(document.getElementById("widthValue").value);
    const area = length * width;
    const quote = calculateQuote(projectType, area, irrigationPrice, slopePrice);
    const customerPricePerSqFt = (quote - (irrigationPrice + slopePrice)) / area;


    // Your existing quote calculation logic
    document.getElementById('quoteOutput').innerHTML = `
      <div class="invoice-container">
        <h2>Quote Summary</h2>
        <table class="invoice-table">
          <tr><td><strong>Total Sq Ft:</strong></td><td>${area.toFixed(2)} sq ft</td></tr>
          <tr><td><strong>Price Per Sq Ft:</strong></td><td>${customerPricePerSqFt.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
          <tr><td><strong>Irrigation Adjustment Price:</strong></td><td>${irrigationPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
          <tr><td><strong>Slope Adjustment Price:</strong></td><td>${slopePrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
        </table>

        <div class="total-amount">
          <p>Total Estimate:</p>
          <p class="total-price">${quote.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
        </div>
      </div>
    `;

    quoteOutput.style.display = "block"; // Ensure it's visible
  }
}

