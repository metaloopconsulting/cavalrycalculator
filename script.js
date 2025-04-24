/*

 /////////////////////////////////
 INITIALIZATION
 /////////////////////////////////

*/

let currentStep = 0; // Track the current step
let finalStep = 7; // The final step
let backendURL = `https://cavalrycalculator-backend-production.up.railway.app/`;
let backendPort = `8080`;

/*

 /////////////////////////////////
 SETUP
 /////////////////////////////////

*/

let calculatorMargin = 0.3; // Margin for the calculator
let sqFtLimitLowest = 150;
let sqFtLimitHighest = 300;




/*

  /////////////////////////////////
  EVENT LISTENERS ON CONTENT LOAD
  /////////////////////////////////

*/

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

  //Listeners for the buttons on the project selection
  const trashCanPadButtons = document.querySelectorAll('#trashcanpad-button');
  trashCanPadButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      selectTrashCanType(this.dataset.value);
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

  //Listeners for the buttons on the clearance selection
  const clearanceButtons = document.querySelectorAll('#clearance-button');
  clearanceButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      selectClearanceType(this.dataset.value);
    });
  });

  //Listeners for the buttons on the clearance selection
  const distanceButtons = document.querySelectorAll('#distance-button');
  distanceButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      selectDistanceType(this.dataset.value);
    });
  });

  //Listener for first name last name and email input on submit button
  const submitButton = document.getElementById('submit-btn');

  submitButton.addEventListener('click', async function () {

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const projectDetails = getProjectDetails().projectDetails;

    if (firstName && lastName && email) {

      const existingEmail = await checkEmail(email.toLowerCase());
      markStepComplete('checkingEmail')

      if (existingEmail === false) {
        await createCustomer(email, firstName, lastName, projectDetails);
        markStepComplete('creatingProfile')


        await createOpportunity(email.toLowerCase(), projectDetails);
        markStepComplete('wrappingUpQuote')
      }
      else {

        await updateContact(email.toLowerCase(), firstName, lastName, projectDetails);
        markStepComplete('creatingProfile')

        await createOpportunity(email.toLowerCase(), projectDetails);
        markStepComplete('wrappingUpQuote')
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
      const session = await startCheckoutSession(email.toLowerCase());
      if (session && session.url) {
        console.log("🟢 Redirecting to Stripe checkout...");
        //window.location.href = session.url; // or use window.open if you prefer
        window.parent.postMessage({ type: 'openStripe', url: session.url }, '*');

      } else {
        console.error("❌ Stripe session returned without a URL");
      }
    } catch (err) {
      console.error("❌ Error starting Stripe session:", err);
    }
  });

  /*

  /////////////////////////////////
  STEPS AND PROGRESS BAR
  /////////////////////////////////

  */

  //Update steps tracker
  updateSteps();

  updateProgressBar();

  //Listener for the slider fill
  const sliders = document.querySelectorAll('input[type="range"]');

  sliders.forEach(slider => {
    updateSliderTrack(slider); // Set initial fill

    slider.addEventListener("input", function () {
      updateSliderTrack(this);
    });
  });



});

/*

 /////////////////////////////////
 NEXT AND PREVIOUS BUTTONS
 /////////////////////////////////

*/


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

/*

  /////////////////////////////////
  FUNCTIONS
  /////////////////////////////////

*/

function calculateSlopePrice(slopeType, squareFootage, projectType) {

  // Trash can pad slope pricing
  if (projectType === "trash_can_pad") {
    if (slopeType === "none") {
      return 0;
    } else if (slopeType === "slight") {
      return 50;
    } else if (slopeType === "moderate") {
      return 100;
    } else if (slopeType === "high") {
      return 150;
    }


    //Walkway, patio, driveway slope pricing
  } else if (projectType === "walkway" || projectType === "patio" || projectType === "driveway") {
    if (slopeType === "none") {
      return 0;
    }
    else if (slopeType === "slight") {
      if (squareFootage <= sqFtLimitLowest) {
        return 100;
      } else if
        (squareFootage > sqFtLimitLowest && squareFootage <= sqFtLimitHighest) {
        return 200;
      }
      else {
        return 300;
      }
    } else if (slopeType === "moderate") {
      if (squareFootage <= sqFtLimitLowest) {
        return 150;
      }
      else if (squareFootage > sqFtLimitLowest && squareFootage <= sqFtLimitHighest) {
        return 250;
      }
      else {
        return 350;
      }
    } else if (slopeType === "high") {
      if (squareFootage <= sqFtLimitLowest) {
        return 200;
      }
      else if (squareFootage > sqFtLimitLowest && squareFootage <= sqFtLimitHighest) {
        return 300;
      }
      else {
        return 400;
      }
    }
  }

  return 0; // Default case if no conditions are met

}

function calculateIrrigationPrice(irrigationType, projectType) {

  if (projectType === "trash_can_pad") {
    if (irrigationType === "none") {
      return 0;
    } else if (irrigationType === "capped") {
      return 50;
    } else if (irrigationType === "rerouted") {
      return 100;
    }
  } else if (projectType === "walkway" || projectType === "patio" || projectType === "driveway") {
    if (irrigationType === "none") {
      return 0;
    } else if (irrigationType === "capped") {
      return 100;
    } else if (irrigationType === "rerouted") {
      return 250;
    }
  }
}



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
  } else if (projectType === 'driveway') {
    lengthSlider.min = 18;
    lengthSlider.max = 30;
    widthSlider.min = 10;
    widthSlider.max = 25;
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

  //Navigation between steps
  const totalSteps = finalStep

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
    markStepComplete('processingQuote');
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

function updateSliderTrack(slider) {
  const min = slider.min || 0;
  const max = slider.max || 100;
  const value = slider.value;
  const percentage = ((value - min) / (max - min)) * 100;

  // Apply gradient background
  slider.style.background = `linear-gradient(to right,rgb(70, 70, 70) ${percentage}%, #ddd ${percentage}%)`;
}

//Function for buttons on project selection
function selectProjectType(value) {
  document.getElementById('projectType').value = value;
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(btn => btn.classList.remove('selected'));
  document.querySelector(`.option-btn[data-value="${value}"]`).classList.add('selected');

  // Update which container should be visible based on project type
  const projectType = document.getElementById('projectType').value;
  if (projectType === 'trash_can_pad') {
    document.getElementById('trashcanpad-options').style.display = 'flex';
    document.getElementById('range-container').style.display = 'none';
    //Set the trashcanpad type to required
    document.getElementById('trashCanPadType').setAttribute('required', 'required');
  } else {
    document.getElementById('range-container').style.display = 'block';
    document.getElementById('trashcanpad-options').style.display = 'none';
    //Set the trashcanpad type to  not required
    document.getElementById('trashCanPadType').removeAttribute('required');
  }
  setTimeout(() => nextStep(1), 300);
}

//Function for buttons on trash can pad selection
function selectTrashCanType(value) {
  document.getElementById('trashCanPadType').value = value;
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(btn => btn.classList.remove('selected'));
  document.querySelector(`.option-btn[data-value="${value}"]`).classList.add('selected');
  setTimeout(() => nextStep(2), 300);
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

//Function for buttons on slope selection
function selectClearanceType(value) {
  document.getElementById('clearanceType').value = value;
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(btn => btn.classList.remove('selected'));
  document.querySelector(`.option-btn[data-value="${value}"]`).classList.add('selected');
  setTimeout(() => nextStep(5), 300);
}

//Function for buttons on slope selection
function selectDistanceType(value) {
  document.getElementById('distanceType').value = value;
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(btn => btn.classList.remove('selected'));
  document.querySelector(`.option-btn[data-value="${value}"]`).classList.add('selected');
  setTimeout(() => nextStep(6), 300);
}

//Function to update the loading steps as they are completed (reusable)
function markStepComplete(stepId) {
  const el = document.getElementById(stepId);
  if (!el) {
    console.warn(`⚠️ No element found with id '${stepId}'`);
    return;
  }

  // Replace spinner with a green checkmark
  el.classList.remove('spinner');
  el.classList.add('done');
  el.innerHTML = '✅';

  if (stepId === 'wrappingUpQuote') {
    const payDiv = document.getElementById('info-container');
    const loadingHeader = document.getElementById('loading-header');
    loadingHeader.style.display = 'none'; // Hide the loading header
    payDiv.style.display = 'block'; // Show the payment button div
  }
}

//Backend function to start a checkout session
async function startCheckoutSession(email) {
  console.log("⌛ Starting checkout session...");
  const response = await fetch(`${backendURL}stripe/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: email.toLowerCase() })
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
      markStepComplete('paymentLink')
      return data;
    } else {
      console.log("❌ Error: Invalid response data");
      return null;
    }
  } else {
    throw new Error("Response is not JSON");
  }
}

/*

/////////////////////////////////////
BACKEND FUNCTIONS
/////////////////////////////////////

*/

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

//Backend function to create a new opportunity for unpaid quote
async function createOpportunity(email, projectDetails) {
  const response = await fetch(`${backendURL}ghl/opportunities/createUnpaid`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: email.toLowerCase(), projectDetails: projectDetails })
  })
  const data = await response.json();

  if (data.opportunity !== null) {
    console.log("🟢 New opportunity created for " + email);

  } else {
    console.log("❌ Error creating new opportunity");
  }
}

//Backend function to create a new customer
async function createCustomer(email, firstName, lastName, projectDetails) {
  const response = await fetch(`${backendURL}ghl/contacts/createNew`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: email.toLowerCase(), firstName: firstName, lastName: lastName, projectDetails: projectDetails })
  })
  const data = await response.json();

  if (data.contact !== null) {
    console.log("👤 New customer created for " + firstName + " " + lastName + " with email " + email);

  } else {
    console.log("❌ Error creating new customer");
  }
}

//Backend function to update contact
async function updateContact(email, firstName, lastName, projectDetails) {
  const response = await fetch(`${backendURL}ghl/contacts/updateContact`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: email.toLowerCase(), firstName: firstName, lastName: lastName, projectDetails: projectDetails })
  })
  const data = await response.json();
  if (data.contact !== null) {
    console.log("👤 Contact updated for " + email)


  } else {
    console.log("❌ Error updating contact");
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

function calculateQuote(projectType, area, irrigationPrice, slopePrice, pumpTruckCost) {

  let baseCost = 0;
  let basePricePerSqFt = 0;
  let customerCost = 0;


  //Calculate price based on project type
  if (projectType === "trash_can_pad") {

    trasnCanPadType = document.getElementById("trashCanPadType").value;
    if (trasnCanPadType === "2") {
      baseCost = 700;
    } else if (trasnCanPadType === "3") {
      baseCost = 750;
    }

    customerCost = baseCost + irrigationPrice + slopePrice;
    customerCost = customerCost * (1 + calculatorMargin);

    return customerCost;


  } else {

    basePricePerSqFt = getPricePerSqFt(area);
    baseCost = (basePricePerSqFt * area);
    customerCost = 0;



    customerCost = baseCost * (1 + calculatorMargin);
    customerCost += irrigationPrice + slopePrice;
    customerCost += pumpTruckCost; // Add pump truck cost
    customerCost = Math.round(customerCost); // Round to nearest dollar

    //Minimum price for things not trash can pad
    if (projectType === "trash_can_pad") {
      customerCost = customerCost
    }
    else if (customerCost < 2600) {
      customerCost = 2600;
    }

    return customerCost;

  }

}

//Function to give project details
function getProjectDetails() {

  // Get the values from the form
  const projectType = document.getElementById("projectType").value;
  let length = parseFloat(document.getElementById("lengthValue").value);
  let width = parseFloat(document.getElementById("widthValue").value);
  const irrigationValue = document.getElementById("irrigationType").value;
  const slopeValue = document.getElementById("slopeType").value;
  const trashCanPadValue = document.getElementById("trashCanPadType").value;
  const clearance = document.getElementById("clearanceType").value;
  const distance = document.getElementById("distanceType").value;
  let area = length * width;


  // Calculate irrigation price
  let irrigationPrice = calculateIrrigationPrice(irrigationValue, projectType);

  // Calculate slope price
  let slopePrice = calculateSlopePrice(slopeValue, area, projectType);

  // Calculate pump truck cost
  let pumpTruckCost = 0;
  if (distance === "Far") {
    pumpTruckCost = 1000;
  }

  //Project type description
  let projectTypeDesc = "Unknown Project Type";

  if (projectType === "walkway") {
    projectTypeDesc = "Walkway";
  }
  else if (projectType === "patio") {
    projectTypeDesc = "Patio";
  }
  else if (projectType === "trash_can_pad") {
    projectTypeDesc = "Trash Can Pad";
  }
  else if (projectType === "driveway") {
    projectTypeDesc = "Driveway Extension";
  }

  //Trash can pad type area override
  if (projectType === "trash_can_pad") {
    if (trashCanPadValue === "2") {
      area = 4 * 4;
      length = 4;
      width = 4;
    } else if (trashCanPadValue === "3") {
      area = 6 * 6;
      length = 6;
      width = 6;
    }
  }


  const quoteValue = calculateQuote(projectType, area, irrigationPrice, slopePrice, pumpTruckCost);
  const customerPricePerSqFt = (quoteValue - (irrigationPrice + slopePrice)) / area;

  return {
    projectDetails: {
      projectType: projectType,
      projectTypeDesc: projectTypeDesc,
      length: length,
      width: width,
      area: area,
      irrigationType: irrigationValue,
      irrigationPrice: irrigationPrice,
      slopeType: slopeValue,
      slopePrice: slopePrice,
      trashCanPadType: trashCanPadValue,
      quote: quoteValue,
      clearance: clearance,
      distance: distance,
      pumpTruckCost: pumpTruckCost
    },
  }

}

//Handles showing the output of the quote
/*
function showQuote() {


    const quoteDetails = getProjectDetails().projectDetails;


    const quote = calculateQuote(quoteDetails.projectType, quoteDetails.area, quoteDetails.irrigationPrice, quoteDetails.slopePrice);
    const customerPricePerSqFt = (quote - (quoteDetails.irrigationPrice + quoteDetails.slopePrice)) / quoteDetails.area;
    markStepComplete('processingQuote')

    //Project type description
    let projectTypeDesc = quoteDetails.projectTypeDesc;

    /* Your existing quote calculation logic
    document.getElementById('quoteOutput').innerHTML = `
      <div class="invoice-container">
        <h2>Quote Summary</h2>
        <table class="invoice-table">
          <tr><td><strong>Project Type:</strong></td><td>${projectTypeDesc}</td></tr>
          <tr><td><strong>Total Sq Ft:</strong></td><td>${quoteDetails.area} sq ft</td></tr>
          <tr><td><strong>Price Per Sq Ft:</strong></td><td>${customerPricePerSqFt.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
          <tr><td><strong>Irrigation Adjustment Price:</strong></td><td>${quoteDetails.irrigationPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
          <tr><td><strong>Slope Adjustment Price:</strong></td><td>${quoteDetails.slopePrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
        </table>

        <div class="total-amount">
          <p>Total Estimate:</p>
          <p class="total-price">${quoteDetails.quote.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
        </div>
      </div>
    `;

    quoteOutput.style.display = "block"; // Ensure it's visible
    
  }
  */


