document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('quoteForm');

  form.addEventListener('submit', function(event) {
    event.preventDefault();

    const projectType = document.getElementById('projectType').value;
    const length = parseFloat(document.getElementById('length').value);
    const width = parseFloat(document.getElementById('width').value);
    const irrigation = document.getElementById('irrigation').checked;
    const sloped = document.getElementById('sloped').checked;

    //calculates the slope cost based on the value of the radio button
    const slopeType = document.querySelector('input[name="slopeType"]:checked').value;
    let slopeCost = 0;
    if (slopeType === "1") {
      slopeCost = 75;
    } else if (slopeType === "2") {
      slopeCost = 150;
    } else if (slopeType === "3") {
      slopeCost = 225;
    }
    
    const area = length * width;
    const pricePerSqFt = getPricePerSqFt(area);
    const irrigationCost = irrigation ? 50 : 0;
    const slopePrice = sloped ? slopeCost : 0;
    const quote = calculateQuote(projectType, area, irrigation, slopePrice);
    const customerPricePerSqFt = quote / area;

    document.getElementById('quoteOutput').innerHTML = `
      <p><strong>Estimated Quote:</strong> ${quote.toFixed(2)}</p>
      <p><strong>Price Per Sq Ft:</strong> ${customerPricePerSqFt.toFixed(2)}</p>
      <p><strong>Total Sq Ft:</strong> ${area.toFixed(2)} sq ft</p>
      <p><strong>Price for Irrigation:</strong> ${irrigationCost.toFixed(2)}</p>
      <p><strong>Price for Slope Adjustment:</strong> ${slopePrice.toFixed(2)}</p>
    `;
  });
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
  
  let projectMultiplier = 1.0;
  if (projectType === 'patio') projectMultiplier = 1.00;
  else if (projectType === 'trash_can_pad') projectMultiplier = 1.00;
  
  let baseCost = basePricePerSqFt * area * projectMultiplier;

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
  if (checkBox.checked == true){
    slopeDiv.style.display = "inline";
  } else {
    slopeDiv.style.display = "none";
  }

  //makes radio 1 required if sloped is checked
  var radio1 = document.getElementById("radio1");
  radio1.required = checkBox.checked;
 
}

//Handles showing the output of the quote
function showQuote() {
  var quoteOutput = document.getElementById("quoteOutput");
  quoteOutput.style.display = "block";
}
