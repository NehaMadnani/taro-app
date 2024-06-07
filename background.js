chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("sephora.com/product/")) {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    console.log('Background script: Sending message to content script.')
    console.log(urlParameters.get("skuId"));
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      productSKU: urlParameters.get("skuId"),
    });
  }
});
