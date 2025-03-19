//Navigation between steps
let currentStep = 1; // Track the current step
let finalStep = 5; // The final step

function nextStep(step) {
  // Get the current step div
  let currentCard = document.getElementById(`step-${step}`);

  // Validate required inputs before allowing navigation
  let inputs = currentCard.querySelectorAll("input[required], select[required]");
  for (let input of inputs) {
    if (!input.value) {
      alert("Please fill out all required fields before continuing.");
      return;
    }
  }

  // Hide current step
  document.getElementById(`step-${step}`).classList.remove("active");

  // Show next step
  document.getElementById(`step-${step + 1}`).classList.add("active");

  currentStep++; // Increment step counter
}

function prevStep(step) {
  document.getElementById(`step-${step}`).classList.remove("active");
  document.getElementById(`step-${step - 1}`).classList.add("active");
  currentStep--;
}

//Button click event listeners
document.addEventListener("DOMContentLoaded", function () {


  document.querySelector(".quote-container").addEventListener("click", function (event) {
    if (event.target.classList.contains("next-btn")) {
      const step = parseInt(event.target.dataset.step); // Get step number from data attribute
      nextStep(step);
    }
    if (event.target.classList.contains("prev-btn")) {
      const step = parseInt(event.target.dataset.step);
      prevStep(step);
    }
  });
});



const form = document.getElementById('quoteForm');

form.addEventListener('submit', function (event) {
  if (currentStep !== finalStep + 1) {
    event.preventDefault();  // Stop form submission if not on the last step
    return;
  }
});

//Listener for the Sloped Surface checkbox
document.getElementById("sloped").addEventListener("click", showSlope);

//Listener for the successful submit of the form
document.getElementById("quoteForm").addEventListener("submit", showQuote);

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

    console.log("showing quote");

    let finalStepElement = document.getElementById(`quoteOutput`);
    if (finalStepElement) {
      finalStepElement.classList.add("active");
      finalStepElement.style.display = "block";
    }

    const projectType = document.getElementById('projectType').value;
    const length = document.getElementById('lengthValue').value || 10;
    const width = document.getElementById('widthValue').value || 10;
    const irrigation = document.getElementById('irrigation').checked;
    const sloped = document.getElementById('sloped').checked || false;

    //calculates the slope cost based on the value of the radio button
    let slopeType = 0;
    if (sloped === true) {
      slopeType = document.querySelector('input[name="slopeType"]:checked').value
    }
    else {
      slopeType = 0;
    }

    let slopeCost = 0;
    if (slopeType === "1") {
      slopeCost = 75;
    } else if (slopeType === "2") {
      slopeCost = 150;
    } else if (slopeType === "3") {
      slopeCost = 225;
    } else {
      slopeCost = 0;
    }

    const area = length * width;
    const pricePerSqFt = getPricePerSqFt(area);
    const irrigationCost = irrigation ? 50 : 0;
    const slopePrice = sloped ? slopeCost : 0;
    const quote = calculateQuote(projectType, area, irrigation, slopePrice);
    const customerPricePerSqFt = quote / area;

    document.getElementById('quoteOutput').innerHTML = `
      <p><strong>Estimated Quote:</strong> $${quote.toFixed(2)}</p>
      <p><strong>Price Per Sq Ft:</strong> $${customerPricePerSqFt.toFixed(2)}</p>
      <p><strong>Total Sq Ft:</strong> ${area.toFixed(2)} sq ft</p>
      <p><strong>Price for Irrigation:</strong> $${irrigationCost.toFixed(2)}</p>
      <p><strong>Price for Slope Adjustment:</strong> $${slopePrice.toFixed(2)}</p>
    `;

  }
}

