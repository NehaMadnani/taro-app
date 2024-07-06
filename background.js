// chrome.tabs.onUpdated.addListener((tabId, tab) => {
//   if (tab.url && tab.url.includes("sephora.com/product/")) {
//     const queryParameters = tab.url.split("?")[1];
//     const urlParameters = new URLSearchParams(queryParameters);
//     console.log('Background script: Sending message to content script.')
//     console.log(urlParameters.get("skuId"));
//     chrome.tabs.sendMessage(tabId, {
//       type: "NEW",
//       productSKU: urlParameters.get("skuId"),
//     });
//   }
// });


// chrome.webRequest.onCompleted.addListener(
//   function(details) {
//     if (details.url === 'https://www.sephora.com/api/v3/catalog/products/*') {
//       // Fetch the response of the specific URL
//       fetch(details.url)
//         .then(response => response.json())
//         .then(data => {
//           // Process the response data
//           console.log(data);
//           // Perform any desired actions with the response data
//         })
//         .catch(error => {
//           console.error('Error fetching response:', error);
//         });
//     }
//   },
//   { urls: ['<all_urls>'] }
// );


// console.log('Background script loaded');

// chrome.webRequest.onCompleted.addListener(
//   function(details) {
//     if (details.url.match(/https:\/\/www\.sephora\.com\/api\/v3\/catalog\/products\/P\d+\?/)) {
//       console.log('Product API call detected:', details.url);
//       chrome.tabs.sendMessage(details.tabId, {
//         type: "interceptedProductAPI",
//         url: details.url
//       });
//     }
//   },
//   {urls: ["https://www.sephora.com/api/v3/catalog/products/*"]}
// );

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === 'complete' && tab.url && tab.url.includes('sephora.com')) {
//     chrome.tabs.sendMessage(tabId, {type: "pageRefreshed"});
//   }
// });


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