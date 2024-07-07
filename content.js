console.log('Content script loaded');

// Cache to store processed URLs
let processedUrls = new Set();

// Function to clear the processedUrls set
function clearProcessedUrls() {
  processedUrls.clear();
  console.log('Processed URLs cache cleared');
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('Message received in content script:', message);
  if (message.type === "interceptedProductAPI" && !processedUrls.has(message.url)) {
    processedUrls.add(message.url);
    fetchProductDetails(message.url);
  }
});

async function fetchProductDetails(url) {
  console.log('Fetching product details from:', url);
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.currentSku && data.currentSku.ingredientDesc) {
      const ingredientDesc = data.currentSku.ingredientDesc;
      
      // Remove all HTML tags and trim the result
      const cleanIngredientDesc = ingredientDesc.replace(/<[^>]*>/g, '').trim();
      
      // Split the cleaned description into an array of paragraphs
      const paragraphs = cleanIngredientDesc.split('\n').filter(p => p.trim() !== '');
      
      // The last paragraph typically contains the full ingredient list
      const fullIngredientList = paragraphs[paragraphs.length - 1];
      
      // The earlier paragraphs typically contain the highlighted ingredients
      const highlightedIngredients = paragraphs.slice(0, -1).map(p => p.replace(/^-/, '').trim());
      
      const foundHarmfulIngredients = harmfulIngredients.filter(ingredient => 
        fullIngredientList.toLowerCase().includes(ingredient.toLowerCase())
      );
      
      if (foundHarmfulIngredients.length > 0) {
        console.log('This product contains the following harmful ingredients:', foundHarmfulIngredients.join(', '));
        console.log('These ingredients are considered harmful.');
        showModal(true);
      } else {
        console.log('This product does not contain any of the listed harmful ingredients. It\'s good!');
        showModal(false);
      }
      
      console.log('Highlighted Ingredients:', highlightedIngredients);
      console.log('Full Ingredient List:', fullIngredientList);
    } else {
      console.log('Ingredient information not found in the API response.');
    }
  } catch (error) {
    console.error('Error fetching product details:', error);
  }
}



function showModal(isHarmful) {

  const existingModal = document.querySelector('.taro-modal');
  if (existingModal) {
    document.body.removeChild(existingModal);
  }

  const existingTaroImage = document.querySelector('.taro-image');
  if (existingTaroImage) {
    document.body.removeChild(existingTaroImage);
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
  modalContent.style.border = isHarmful ? '1px solid #f44336' : '1px solid #4CAF50';
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

// Clear the cache when the page is about to unload (refresh or navigation)
window.addEventListener('beforeunload', clearProcessedUrls);

// Use the History API to detect URL changes
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    clearProcessedUrls();

    const existingModal = document.querySelector('.taro-modal');
    if (existingModal) {
      document.body.removeChild(existingModal);
    }
    const existingTaroImage = document.querySelector('.taro-image');
    if (existingTaroImage) {
      document.body.removeChild(existingTaroImage);
    }
  }
}).observe(document, {subtree: true, childList: true});

// Initial call to clear the cache when the script loads
clearProcessedUrls();