console.log('Background script loaded');

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    console.log('Intercepted request:', details.url);
    
    if (details.url.match(/https:\/\/www\.sephora\.com\/api\/v3\/catalog\/products\/P\d+\?/)) {
      console.log('Product API call detected:', details.url);
      chrome.tabs.sendMessage(details.tabId, {
        type: "interceptedProductAPI",
        url: details.url
      });
    }
  },
  { urls: ["https://www.sephora.com/api/v3/catalog/products/*"] }
);