document.addEventListener('DOMContentLoaded', function() {
  var checkPageButton = document.getElementById('checkPage');
  var btcAddress = document.getElementById('btcAddress');
  var btcAmt = document.getElementById('btcAmt');
  var bitpayFee = document.getElementById('bitpayFee');
  var totalAmt = document.getElementById('totalAmt');
  var bipQR = document.getElementById('qr');
  var bipCode = document.getElementById('bip21Code');
  var walletOpen = document.getElementById('walletOpen');
  var rawData = document.getElementById('rawData');

  checkPageButton.addEventListener('click', function() {

    var splitURL;
    var newURL = '';
    var request = new XMLHttpRequest();
    var results;
    chrome.tabs.getSelected(null, function(tab) {
      if (tab.url.search('/i/') >= 0) {
        splitURL = tab.url.split('/i/');
        newURL = splitURL[0] + '/invoiceData/' + splitURL[1] + '?poll=false';
      } else if (tab.url.search('id=') >= 0) {
        splitURL = tab.url.split('/invoice?id=');
        newURL = splitURL[0] + '/invoiceData/' + splitURL[1] + '?poll=false';
      } else {
        alert('No invoice data located on this page!');
      }
      if (newURL.length > 0) {
        request.open('Get', newURL);
        request.send();
      }
    });

    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        if (request.status === 200) {
          results = JSON.parse(request.responseText).invoice;

          btcAddress.innerText = results.addresses.BTC;
          btcAmt.innerText = parseFloat(results.btcPrice).toFixed(8) + ' BTC';
          bitpayFee.innerText = parseFloat(results.minerFees.BTC.totalFee * 0.00000001).toFixed(8) + ' BTC';
          totalAmt.innerText = parseFloat(results.btcDue).toFixed(8) + ' BTC';
          bipCode.innerText = results.paymentUrls.BIP21;
          var qr = new QRious({
            element: bipQR,
            value: results.paymentUrls.BIP21,
            background: 'white', // background color
            foreground: 'black', // foreground color
            level: 'H', // Error correction level of the QR code (L, M, Q, H)
            mime: 'image/png', // MIME type used to render the image for the QR code
            size: 250 // Size of the QR code in pixels.
          })
          bipQR.style.height = '250px';
          walletOpen.href = results.paymentUrls.BIP21;
          walletOpen.style.display = 'block';
          rawData.href = newURL;
          rawData.style.display = 'block';
        } else {
          alert('An error occurred during your request: ' + request.status + ' ' + request.statusText);
        }
      }
    }
  }, false);
}, false);
