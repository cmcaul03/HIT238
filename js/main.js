searchButton.addEventListener('click', function(evt) {
  evt.preventDefault();
  console.log('click');
  displayLoadScreen()

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
          hideLoadScreen()
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
    var searchablePlayer = unquotePlayer.replace('#', '%23')
    var ul = document.getElementById("searchList");
    var button = document.createElement("button")
    button.onclick = function(event) {
      displayLoadScreen()
      console.log(player);
      getPlayerStats(searchablePlayer);
    };
    button.appendChild(document.createTextNode(unquotePlayer));
    ul.appendChild(button);
  }

  function displayLoadScreen() {
    var initialContent = document.getElementsByClassName("initialContent");
    initialContent[0].style.display = "none";
    var searchContent = document.getElementsByClassName("searchContent");
    searchContent[0].style.display = "none";
    var statsContent = document.getElementsByClassName("statsContent");
    statsContent[0].style.display = "none";
    var loadingContent = document.getElementsByClassName("loadingContent");
    loadingContent[0].style.display = "block";
  }

  function hideLoadScreen() {
    var loadingContent = document.getElementsByClassName("loadingContent");
    loadingContent[0].style.display = "none";
  }

  function getPlayerStats(player){
    let statsUrl = 'https://sheltered-cove-87506.herokuapp.com/https://api.tracker.gg/api/v2/warzone/standard/profile/atvi/' + player;
    console.log(statsUrl)

    let stats = fetch(statsUrl, {
      mode: 'cors'
    }).then(successFunction).catch(errorFunction)

    function successFunction(stats) {
      stats.json().then(
        function(stats) {
          var statsContent = document.getElementsByClassName("statsContent")[0];
          statsContent.innerHTML = '';
          var h2 = document.createElement("h2")
          h2.appendChild(document.createTextNode(player));
          console.log(h2)
          statsContent.appendChild(h2);

          var lifetimeStatsArticle = document.createElement("article")
          lifetimeStatsArticle.setAttribute("id", "lifetimeStats");
          var h3 = document.createElement("h3")
          h3.appendChild(document.createTextNode("Lifetime Stats"));

          var lifetimeKD = document.createElement("div")
          lifetimeKDHeaderU = lifetimeKD.appendChild(document.createElement("U"));
          lifetimeKDHeaderU.appendChild(document.createTextNode("KD"));
          lifetimeKDDiv = lifetimeKD.appendChild(document.createElement("div"));
          lifetimeKDDiv.appendChild(document.createTextNode((JSON.stringify(stats.data.segments[1].stats.kdRatio.value))));

          var lifetimeKills = document.createElement("div")
          lifetimeKillsHeaderU = lifetimeKills.appendChild(document.createElement("U"));
          lifetimeKillsHeaderU.appendChild(document.createTextNode("Kills"));
          lifetimeKillsDiv = lifetimeKills.appendChild(document.createElement("div"));
          lifetimeKillsDiv.appendChild(document.createTextNode((JSON.stringify(stats.data.segments[1].stats.kills.value))));

          var lifetimeDeaths = document.createElement("div")
          lifetimeDeathsHeaderU = lifetimeDeaths.appendChild(document.createElement("U"));
          lifetimeDeathsHeaderU.appendChild(document.createTextNode("Deaths"));
          lifetimeDeathsDiv = lifetimeDeaths.appendChild(document.createElement("div"));
          lifetimeDeathsDiv.appendChild(document.createTextNode((JSON.stringify(stats.data.segments[1].stats.deaths.value))));

          var lifetimeMatches = document.createElement("div")
          lifetimeMatchesHeaderU = lifetimeMatches.appendChild(document.createElement("U"));
          lifetimeMatchesHeaderU.appendChild(document.createTextNode("Matches"));
          lifetimeMatchesDiv = lifetimeMatches.appendChild(document.createElement("div"));
          lifetimeMatchesDiv.appendChild(document.createTextNode((JSON.stringify(stats.data.segments[1].stats.gamesPlayed.value))));

          var lifetimeWins = document.createElement("div")
          lifetimeWinsHeaderU = lifetimeWins.appendChild(document.createElement("U"));
          lifetimeWinsHeaderU.appendChild(document.createTextNode("Wins"));
          lifetimeWinsDiv = lifetimeWins.appendChild(document.createElement("div"));
          lifetimeWinsDiv.appendChild(document.createTextNode((JSON.stringify(stats.data.segments[1].stats.wins.value))));

          var lifetimeWinRatio = document.createElement("div")
          lifetimeWinRatioHeaderU = lifetimeWinRatio.appendChild(document.createElement("U"));
          lifetimeWinRatioHeaderU.appendChild(document.createTextNode("Win Ratio"));
          lifetimeWinRatioDiv = lifetimeWinRatio.appendChild(document.createElement("div"));
          lifetimeWinRatioDiv.appendChild(document.createTextNode((JSON.stringify(stats.data.segments[1].stats.wlRatio.value))));

          lifetimeStatsArticle.appendChild(h3)
          lifetimeStatsArticle.appendChild(lifetimeKills)
          lifetimeStatsArticle.appendChild(lifetimeDeaths)
          lifetimeStatsArticle.appendChild(lifetimeKD)
          lifetimeStatsArticle.appendChild(lifetimeMatches)
          lifetimeStatsArticle.appendChild(lifetimeWins)
          lifetimeStatsArticle.appendChild(lifetimeWinRatio)


          statsContent.appendChild(lifetimeStatsArticle);

          console.log(JSON.stringify(stats.data.segments[1].stats.kdRatio.value))

          hideLoadScreen()
          statsContent.style.display = "block";
        }).catch(errorFunction)
    }
  }

})
