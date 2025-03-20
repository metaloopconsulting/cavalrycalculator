//Navigation between steps
let currentStep = 1; // Track the current step
let finalStep = 6; // The final step


//Button click event listeners
document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("quoteForm");
  const buttonsContainer = document.querySelector(".quote-container");

  // Track the current step
  let currentStep = 1;
  const totalSteps = finalStep

  // Next Button Click Event
  buttonsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("next-btn")) {
      event.preventDefault(); // Prevent default form validation behavior
      let step = parseInt(event.target.dataset.step);
      nextStep(step);
    }

    if (event.target.classList.contains("prev-btn")) {
      event.preventDefault();
      let step = parseInt(event.target.dataset.step);
      prevStep(step);
    }

    if (event.target.classList.contains("submit-btn")) {
      event.preventDefault();
      let step = parseInt(event.target.dataset.step);
      nextStep(step); // Moves to the last step
      //setTimeout(showQuote, 300); // Delay to ensure UI updates before calculating quote
    }
    ;
  });


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
  }

  // Function to Go Back to Previous Step
  function prevStep(step) {
    let currentCard = document.getElementById(`step-${step}`);
    let prevCard = document.getElementById(`step-${step - 1}`);

    currentCard.classList.remove("active");
    prevCard.classList.add("active");

    currentStep--;
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



//Listener for the Sloped Surface checkbox
document.getElementById("sloped").addEventListener("click", showSlope);



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

function calculateQuote(projectType, area, irrigation, slopePrice) {
  let basePricePerSqFt = getPricePerSqFt(area);



  let baseCost = basePricePerSqFt * area;

  if (irrigation) baseCost += 75;
  baseCost += slopePrice;

  const margin = 0.20;
  const customerCost = baseCost * (1 + margin);


  return customerCost;
}

//Handles if the sloped surface checkbox is checked, and if so displays three more checkboxes
function showSlope() {
  var checkBox = document.getElementById("sloped");
  var slopeDiv = document.getElementById("slopeDiv");
  if (checkBox.checked == true) {
    slopeDiv.style.display = "flex";
  } else {
    slopeDiv.style.display = "none";
  }

  //makes radio 1 required if sloped is checked
  var radio1 = document.getElementById("radio1");
  radio1.required = checkBox.checked;

}

//Handles showing the output of the quote
function showQuote() {
  console.log("step " + currentStep + " of " + finalStep);

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

    // Your existing quote calculation logic
    document.getElementById('quoteOutput').innerHTML = `
      <div class="invoice-container">
        <h2>Quote Summary</h2>
        <table class="invoice-table">
          <tr><td><strong>Total Sq Ft:</strong></td><td>${area.toFixed(2)} sq ft</td></tr>
          <tr><td><strong>Price Per Sq Ft:</strong></td><td>${customerPricePerSqFt.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
          <tr><td><strong>Price for Irrigation:</strong></td><td>${irrigationCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
          <tr><td><strong>Price for Slope Adjustment:</strong></td><td>${slopePrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
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

