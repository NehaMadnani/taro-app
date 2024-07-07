console.log('Background script loaded');

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    console.log('Intercepted request:', details.url);
    
    if (details.url.match(/https:\/\/www\.sephora\.com\/api\/v3\/catalog\/products\/P\d+\?/)) {
      console.log('Sephora product API call detected:', details.url);
      chrome.tabs.sendMessage(details.tabId, {
        type: "interceptedProductAPI",
        url: details.url,
        site: "sephora"
      });
    } else if (details.url.match(/https:\/\/redsky\.target\.com\/redsky_aggregations\/v1\/web\/pdp_client_v1\?/)) {

          // url pattern - https://redsky.target.com/redsky_aggregations/v1/web/pdp_client_v1
      console.log('Target website product API call detected:', details.url);
      chrome.tabs.sendMessage(details.tabId, {
        type: "interceptedProductAPI",
        url: details.url,
        site: "target"
      });
    }
  },
  { urls: ["https://www.sephora.com/api/v3/catalog/products/*", "https://redsky.target.com/redsky_aggregations/v1/*"] }
);
