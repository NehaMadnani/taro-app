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
        newProductLoaded();
          // newVideoLoaded();
      }
  });

  const harmfulIngredients = [ 'Retinoids', 'Retinols', 'Hydroquinon', 'Retin A', 'aluminium chloride', 'phthalates', 
  'Amphetamines', 'Sodium benzoate', 'Benzophenone', 'Octinoxate', 'Paraffin Oil', 'acrylamide', 
  'retinyl palmitate', 'Pyridine', 'hydrogenated cotton seed oil', 'Progestins', 'Urea', 
  'Polyethylene Glycol', 'Formaldehyde', 'Butylated hydroxyanisole', 'butylated hydroxytoluene', 
  'Potassium bromate', 'Propyl gallate', 'Lead' ];

  function containsHarmfulIngredients(harmfulIngredients, currentIngredients) {
    // Check if any harmful ingredient is present in the current ingredients
    return harmfulIngredients.some(ingredient => currentIngredients.includes(ingredient));
}

function getIngredients(currentDiv) {
    // Try to find the second last p tag in the grandchild div
    var secondLastPTag = currentDiv.querySelector('div > div p:nth-last-child(2)');

    if (secondLastPTag) {
        // If the p tag exists, return its content
        return secondLastPTag.textContent;
    } else {
        // If the p tag does not exist, find the content after the third <br> tag
        var grandchildDiv = currentDiv.querySelector('div > div');
        var brTags = grandchildDiv.querySelectorAll('br');

        if (brTags.length >= 4 && brTags[3].nextSibling) {
            // If there is at least a third <br> tag, return the text immediately following it
            return brTags[2].nextSibling.nodeValue || 'No text following the third <br> tag.';
        }
    }

    // Return a default message or empty string if no content is found
    return 'No relevant content found.';
}

  const newProductLoaded = () => { 

    const currentDiv = document.getElementById("ingredients");
    var secondLastPTag = currentDiv.querySelector('div > div p:nth-last-child(2)');

    var ingredients = getIngredients(currentDiv);
   

    
    console.log(ingredients);
    var isHarmful = containsHarmfulIngredients(harmfulIngredients, ingredients);

    console.log("Current product harmfulness status: " + isHarmful);
    showModal(isHarmful);

  }

  function showModal(isHarmful) {
    // Create the modal elements
    const modal = document.createElement('div');
    const modalContent = document.createElement('div');
    const closeBtn = document.createElement('span');
    const message = document.createElement('p');

    // Style the modal
    modal.style.position = 'fixed';
    modal.style.zIndex = '1000';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.overflow = 'auto';
    modal.style.backgroundColor = 'rgba(0,0,0,0.4)'; // Black background with opacity

    modalContent.style.margin = '15% auto';
    modalContent.style.padding = '20px';
    modalContent.style.border = '1px solid #888';
    modalContent.style.width = '80%'; // Could be less or more depending on the design
    modalContent.style.backgroundColor = '#fefefe';

    // Close button
    closeBtn.textContent = '×';
    closeBtn.style.color = '#aaa';
    closeBtn.style.float = 'right';
    closeBtn.style.fontSize = '28px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.cursor = 'pointer';

    // Close the modal when the close button is clicked
    closeBtn.onclick = function() {
        modal.style.display = 'none';
        document.body.removeChild(modal);
    };

    // Message content
    message.textContent = isHarmful ? 'This product contains harmful ingredients.' : 'This product does not contain harmful ingredients.';
    message.style.textAlign = 'center';
    message.style.fontSize = '16px';

    // Append elements
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(message);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}


  const newVideoLoaded = () => {
    console.log("Content script: New video loaded.");
    //   const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
    //   console.log(bookmarkBtnExists);

    //   if (!bookmarkBtnExists) {
    //       const bookmarkBtn = document.createElement("img");

    //       bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
    //       bookmarkBtn.className = "ytp-button " + "bookmark-btn";
    //       bookmarkBtn.title = "Click to bookmark current timestamp";

    //       youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
    //       youtubePlayer = document.getElementsByClassName("video-stream")[0];
          
    //       youtubeLeftControls.append(bookmarkBtn);
    //       bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
    //   }
  }

  const addNewBookmarkEventHandler = () => {
      const currentTime = youtubePlayer.currentTime;
      const newBookmark = {
          time: currentTime,
          desc: "Bookmark at " + getTime(currentTime),
      };
      console.log(newBookmark);

      chrome.storage.sync.set({
          [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
      });
  }

  newProductLoaded();
})();

const getTime = t => {
  var date = new Date(0);
  date.setSeconds(1);

  return date.toISOString().substr(11, 0);
}
