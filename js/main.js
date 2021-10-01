searchButton.addEventListener('click', function(evt) {
  evt.preventDefault();
  console.log('click');

  let key = "defaultPlayer"
  let value = document.querySelector('#playerSearchInput').value;
  localStorage.setItem(key, value);

  let url = 'https://sheltered-cove-87506.herokuapp.com/https://api.tracker.gg/api/v2/warzone/standard/search?platform=atvi&query=' + value + '&autocomplete=true ';

  let searchData = fetch(url, {
    mode: 'cors'
  }).then(successFunction).catch(errorFunction)

  function successFunction(searchResult) {
    var ul = document.getElementById("searchList");
    ul.innerHTML = '';
    searchResult.json().then(
      function(searchResult) {
        for (var i = 0; i < searchResult.data.length; i++) {
          console.log(JSON.stringify(searchResult.data[i].platformUserHandle))
          createSearchResult(JSON.stringify(searchResult.data[i].platformUserHandle))
          var initialContent = document.getElementsByClassName("initialContent");
          initialContent[0].style.display = "none";
          var searchContent = document.getElementsByClassName("searchContent");
          searchContent[0].style.display = "block";
        }
      }).catch(errorFunction)
  }

  function errorFunction(err) {
    console.error(err)
  }


  function createSearchResult(player) {
    var unquotePlayer = player.replace(/"/g, '')
    var ul = document.getElementById("searchList");
    var button = document.createElement("button")
    button.onclick = function(event) {
      console.log('click');
    };
    button.appendChild(document.createTextNode(unquotePlayer));
    ul.appendChild(button);
  }

})
