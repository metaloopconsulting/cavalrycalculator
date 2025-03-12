document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('quoteForm');

  form.addEventListener('submit', function(event) {
    event.preventDefault();

    const projectType = document.getElementById('projectType').value;
    const length = parseFloat(document.getElementById('length').value);
    const width = parseFloat(document.getElementById('width').value);
    const irrigation = document.getElementById('irrigation').checked;
    const sloped = document.getElementById('sloped').checked;
    
    const area = length * width;
    const pricePerSqFt = getPricePerSqFt(area);
    const irrigationCost = irrigation ? 50 : 0;
    const slopeCost = sloped ? 75 : 0;
    const quote = calculateQuote(projectType, area, irrigation, sloped);
    const customerPricePerSqFt = quote / area;

    document.getElementById('quoteOutput').innerHTML = `
      <p><strong>Estimated Quote:</strong> ${quote.toFixed(2)}</p>
      <p><strong>Price Per Sq Ft:</strong> ${customerPricePerSqFt.toFixed(2)}</p>
      <p><strong>Total Sq Ft:</strong> ${area.toFixed(2)} sq ft</p>
      <p><strong>Price for Irrigation:</strong> ${irrigationCost.toFixed(2)}</p>
      <p><strong>Price for Slope Adjustment:</strong> ${slopeCost.toFixed(2)}</p>
    `;
  });
});

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

function calculateQuote(projectType, area, irrigation, sloped) {
  let basePricePerSqFt = getPricePerSqFt(area);
  
  let projectMultiplier = 1.0;
  if (projectType === 'patio') projectMultiplier = 1.00;
  else if (projectType === 'trash_can_pad') projectMultiplier = 1.00;
  
  let baseCost = basePricePerSqFt * area * projectMultiplier;

  if (irrigation) baseCost += 75;
  if (sloped) baseCost += 100;

  const margin = 0.20;
  const customerCost = baseCost * (1 + margin);
  

  return customerCost;
}
