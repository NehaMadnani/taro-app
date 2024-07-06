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
      } else {
        console.log('This product does not contain any of the listed harmful ingredients. It\'s good!');
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

// Clear the cache when the page is about to unload (refresh or navigation)
window.addEventListener('beforeunload', clearProcessedUrls);

// Use the History API to detect URL changes
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    clearProcessedUrls();
  }
}).observe(document, {subtree: true, childList: true});

// Initial call to clear the cache when the script loads
clearProcessedUrls();