(() => {
  let taroProducts = [];
  let currentProduct;
  let currentVideo = "";
  let currentVideoBookmarks = [];

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
      const { type, value, productSKU } = obj;

      if (type === "NEW") {
        currentProduct = productSKU;
        console.log("Content script: Received message from background script.");

        // Check if the DOM is already loaded
        if (document.readyState === "complete" || document.readyState === "interactive") {
            // Safe to perform DOM operations
            newProductLoaded();
        } else {
            // Wait for the DOM to be loaded
            document.addEventListener('DOMContentLoaded', newProductLoaded);
        }
      }
  });

  const harmfulIngredients = [ 'Retinoids', 'Retinols', 'Hydroquinon', 'Retin A', 'aluminium chloride', 'phthalates', 
  'Amphetamines', 'Benzophenone', 'Octinoxate', 'Paraffin Oil', 'acrylamide', 
  'retinyl palmitate', 'Pyridine', 'hydrogenated cotton seed oil', 'Progestins', 'Urea', 
  'Polyethylene Glycol', 'Formaldehyde', 'Butylated hydroxyanisole', 'butylated hydroxytoluene', 
  'Potassium bromate', 'Propyl gallate', 'Lead', 'Retinol', 'Salicylic acid', 'Botox', 'homosalate', 'octocrylene', 'octinoxate', 'Accutane', 
  'Benzoyl peroxide', 'Cocamidopropyl betaine', 'Dimethicone', 'Homosalate', 'Homomenthyl salicylate', 
  '3,3,5-trimethyl-cyclohexyl-salicylate' ];

  function containsHarmfulIngredients(harmfulIngredients, currentIngredients) {
    // Convert both arrays to lower case for case-insensitive comparison
    const harmfulIngredientsLower = harmfulIngredients.map(ingredient => ingredient.toLowerCase());
    const currentIngredientsLower = currentIngredients.map(ingredient => ingredient.toLowerCase());

    // Check if any harmful ingredient is present in the current ingredients
    return harmfulIngredientsLower.some(ingredient => currentIngredientsLower.includes(ingredient));
}

  const newProductLoaded = () => { 

    var existingModal = document.querySelector('.taro-modal');
    if (existingModal) {
       document.body.removeChild(existingModal);
       existingModal.remove();
    }

    var existingTaroImage = document.querySelector('.taro-image');
   if (existingTaroImage) {
       document.body.removeChild(existingTaroImage);
       existingTaroImage.remove();
   }
    const currentDiv = document.getElementById("ingredients");
    var ingredientsDiv = currentDiv ? currentDiv.textContent: "";   

    // Split into an array by commas and trim any extra spaces
    const ingredientsArray = ingredientsDiv.split(',').map(ingredient => ingredient.trim());

    
    console.log(ingredientsArray);
    var isHarmful = containsHarmfulIngredients(harmfulIngredients, ingredientsArray);

    console.log("Current product harmfulness status: " + isHarmful);
    showModal(isHarmful);

  }

  function showModal(isHarmful) {

    const existingTaroImage = document.querySelector('.taro-image');
    if (existingTaroImage) {
        existingTaroImage.remove();
        document.body.removeChild(existingTaroImage)
    }

    // Create the modal elements
    const modal = document.createElement('div');
    modal.className = 'taro-modal';  // Add class for easier future reference

    const modalContent = document.createElement('div');
    const closeBtn = document.createElement('span');
    const message = document.createElement('p');

    // Style the modal
    modal.style.position = 'fixed';
    modal.style.width = '300px';
    modal.style.zIndex = '1000';
    modal.style.right = '50px';
    modal.style.top = '300px';
    modal.style.color = 'white';
    modal.style.borderRadius = '10px';
    modal.style.overflow = 'auto';
    modal.style.backgroundColor = 'rgba(0,0,0,0.4)'; // Black background with opacity
    

    modalContent.style.margin = '0px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.padding = '20px';
    modalContent.style.border = '1px solid #888';
    modalContent.style.width = '100%'; // Could be less or more depending on the design
    modalContent.style.height = '100%'; // Could be less or more depending on the design
    modalContent.style.backgroundColor = isHarmful ? '#fddcde' : '#d3f0e4';
    modalContent.style.border = isHarmful ? '1px solid #fdcbce' : '1px solid #bde8d7';
    modalContent.style.color = isHarmful ? '#f44336' : '#4CAF50';
    modalContent.style.fontWeight = 'bold';

    // Close button
    closeBtn.textContent = '×';
    closeBtn.style.color = '#aaa';
    closeBtn.style.float = 'right';
    closeBtn.style.fontSize = '28px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.marginTop = '-20px';
    closeBtn.style.marginRight = '-15px';

    // Message content
    message.textContent = isHarmful ? 'This product contains harmful ingredients.' : 'This product does not contain harmful ingredients.';
    message.style.textAlign = 'center';
    message.style.fontSize = '16px';

    // Append elements
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(message);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Handle close button click
    closeBtn.onclick = function() {
        modal.style.display = 'none';
        document.body.removeChild(modal);
        taroImage.style.display = 'block'; // Show the taro image after closing the modal
    };

    // Create and style the taro image
    const taroImage = document.createElement('img');
    taroImage.className = 'taro-image';
    taroImage.src = chrome.runtime.getURL("taro_image.png");
    taroImage.style.position = 'fixed';
    taroImage.style.bottom = '10px';
    taroImage.style.right = '10px';
    taroImage.style.width = '100px';  // Adjust size as needed
    taroImage.style.height = '100px';  // Adjust size as needed
    taroImage.style.cursor = 'pointer';
    taroImage.style.zIndex = '1000';
    taroImage.style.borderRadius = '50%';
    taroImage.style.border = '5px solid #9C27B0';
    taroImage.style.display = 'none'; // Initially hidden
    document.body.appendChild(taroImage);

    // Reopen modal when the taro image is clicked
    taroImage.onclick = function() {
        document.body.appendChild(modal);
        modal.style.display = 'block';
        taroImage.style.display = 'none'; // Hide the image when modal is open
    };
}

  newProductLoaded();
})();

const getTime = t => {
  var date = new Date(0);
  date.setSeconds(1);

  return date.toISOString().substr(11, 0);
}
