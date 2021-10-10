// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register("sw.js").then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

searchButton.addEventListener('click', function(evt) {
  clearTimeout()
  evt.preventDefault();
  displayLoadScreen()

  // Captures user input, and provides basic validation
  let value = document.querySelector('.playerSearchInput').value;
  if (value.length < 3) {
    errorFunction("Less than three characters entered in search input.\
    Please enter at least three characters.")
    return
  }

  let url = 'https://sheltered-cove-87506.herokuapp.com/https://api.tracker.gg/api/v2/warzone/standard/search?platform=atvi&query=' + value + '&autocomplete=true ';

  // Creates new timeout function for fecth requests
  // Stolen from https://stackoverflow.com/questions/46946380/fetch-api-request-timeout
  function timeout(ms, promise) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Backend connection timed out'))
      }, ms)

      promise
        .then(value => {
          clearTimeout(timer)
          resolve(value)
        })
        .catch(reason => {
          clearTimeout(timer)
          reject(reason)
        })
    })
  }

  // Searches for players based on user's input
  var searchData = timeout(5000, fetch(url, {
    mode: 'cors'
  })).then(function(response) {
    successFunction(response)
  }).catch(function(error) {
    errorFunction(error)
  })

  function successFunction(searchResult) {
    var ul = document.getElementsByClassName("searchList");
    ul[0].innerHTML = '';
    searchResult.json().then(
      function(searchResult) {
        if (searchResult.data.length == 0) {
          errorFunction("No results found")
        }
        for (var i = 0; i < searchResult.data.length; i++) {
          createSearchResult(JSON.stringify(searchResult.data[i].platformUserHandle))
          hideLoadScreen()
          var searchContent = document.getElementsByClassName("searchContent");
          searchContent[0].style.display = "block";
        }
      }).catch(errorFunction)
  }

  function errorFunction(err) {
    hideLoadScreen()
    var errorContent = document.getElementsByClassName("errorContent");
    errorContent[0].innerHTML = ''
    var h2 = document.createElement("h2")
    h2.appendChild(document.createTextNode("Error"));
    var p = document.createElement("p")
    p.appendChild(document.createTextNode("The following error has occurred: " + err));
    errorContent[0].appendChild(h2);
    errorContent[0].appendChild(p);
    errorContent[0].style.display = "block";
    console.error(err)
  }

  // Creates buttons for each player it is passed
  function createSearchResult(player) {
    var unquotePlayer = player.replace(/"/g, '')
    var searchablePlayer = unquotePlayer.replace('#', '%23')
    var ul = document.getElementsByClassName("searchList");
    var li = document.createElement("li")

    var button = document.createElement("button")
    button.onclick = function(event) {
      displayLoadScreen()
      getPlayerStats(searchablePlayer);
    };
    button.appendChild(document.createTextNode(unquotePlayer));
    li.appendChild(button)
    ul[0].appendChild(li);
  }

  // Hides all other screens and displays the loading screen
  function displayLoadScreen() {
    var initialContent = document.getElementsByClassName("initialContent");
    initialContent[0].style.display = "none";
    var searchContent = document.getElementsByClassName("searchContent");
    searchContent[0].style.display = "none";
    var statsContent = document.getElementsByClassName("statsContent");
    statsContent[0].style.display = "none";
    var statsContent = document.getElementsByClassName("errorContent");
    statsContent[0].style.display = "none";
    var loadingContent = document.getElementsByClassName("loadingContent");
    loadingContent[0].style.display = "block";
  }

  // Hides the loading screen
  function hideLoadScreen() {
    var loadingContent = document.getElementsByClassName("loadingContent");
    loadingContent[0].style.display = "none";
  }

  // Fetches and displays a single player's stats
  function getPlayerStats(player) {
    let statsUrl = 'https://sheltered-cove-87506.herokuapp.com/https://api.tracker.gg/api/v2/warzone/standard/profile/atvi/' + player;
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
          statsContent.appendChild(h2);

          var lifetimeStatsSection = document.createElement("Section")
          lifetimeStatsSection.setAttribute("class", "lifetimeStats");
          var h3 = document.createElement("h3")
          h3.appendChild(document.createTextNode("Lifetime Stats"));

          var lifetimeKD = document.createElement("div")
          lifetimeKDHeaderU = lifetimeKD.appendChild(document.createElement("U"));
          lifetimeKDHeaderU.appendChild(document.createTextNode("KD:"));
          lifetimeKDDiv = lifetimeKD.appendChild(document.createElement("p"));
          lifetimeKDDiv.appendChild(document.createTextNode((JSON.stringify(stats.data.segments[1].stats.kdRatio.value))));

          var lifetimeKills = document.createElement("div")
          lifetimeKillsHeaderU = lifetimeKills.appendChild(document.createElement("U"));
          lifetimeKillsHeaderU.appendChild(document.createTextNode("Kills:"));
          lifetimeKillsDiv = lifetimeKills.appendChild(document.createElement("p"));
          lifetimeKillsDiv.appendChild(document.createTextNode((JSON.stringify(stats.data.segments[1].stats.kills.value))));

          var lifetimeDeaths = document.createElement("div")
          lifetimeDeathsHeaderU = lifetimeDeaths.appendChild(document.createElement("U"));
          lifetimeDeathsHeaderU.appendChild(document.createTextNode("Deaths:"));
          lifetimeDeathsDiv = lifetimeDeaths.appendChild(document.createElement("p"));
          lifetimeDeathsDiv.appendChild(document.createTextNode((JSON.stringify(stats.data.segments[1].stats.deaths.value))));

          var lifetimeMatches = document.createElement("div")
          lifetimeMatchesHeaderU = lifetimeMatches.appendChild(document.createElement("U"));
          lifetimeMatchesHeaderU.appendChild(document.createTextNode("Matches:"));
          lifetimeMatchesDiv = lifetimeMatches.appendChild(document.createElement("p"));
          lifetimeMatchesDiv.appendChild(document.createTextNode((JSON.stringify(stats.data.segments[1].stats.gamesPlayed.value))));

          var lifetimeWins = document.createElement("div")
          lifetimeWinsHeaderU = lifetimeWins.appendChild(document.createElement("U"));
          lifetimeWinsHeaderU.appendChild(document.createTextNode("Wins:"));
          lifetimeWinsDiv = lifetimeWins.appendChild(document.createElement("p"));
          lifetimeWinsDiv.appendChild(document.createTextNode((JSON.stringify(stats.data.segments[1].stats.wins.value))));

          var lifetimeWinRatio = document.createElement("div")
          lifetimeWinRatioHeaderU = lifetimeWinRatio.appendChild(document.createElement("U"));
          lifetimeWinRatioHeaderU.appendChild(document.createTextNode("Win Ratio:"));
          lifetimeWinRatioDiv = lifetimeWinRatio.appendChild(document.createElement("p"));
          lifetimeWinRatioDiv.appendChild(document.createTextNode((JSON.stringify(stats.data.segments[1].stats.wlRatio.value))));

          lifetimeStatsSection.appendChild(h3)
          lifetimeStatsSection.appendChild(lifetimeKills)
          lifetimeStatsSection.appendChild(lifetimeDeaths)
          lifetimeStatsSection.appendChild(lifetimeKD)
          lifetimeStatsSection.appendChild(lifetimeMatches)
          lifetimeStatsSection.appendChild(lifetimeWins)
          lifetimeStatsSection.appendChild(lifetimeWinRatio)

          statsContent.appendChild(lifetimeStatsSection);


          var weeklyStatsSection = document.createElement("Section")
          weeklyStatsSection.setAttribute("class", "weeklyStats");
          var h3 = document.createElement("h3")
          h3.appendChild(document.createTextNode("Weekly Stats"));


          var weeklyKDValue = (JSON.stringify(stats.data.segments[1].stats.weeklyKdRatio.value))
          var weeklyKDValue = parseFloat(weeklyKDValue).toFixed(2)

          var weeklyDeathsValue = parseFloat(((JSON.stringify(stats.data.segments[1].stats.weeklyKills.value))) / weeklyKDValue)
          var weeklyDeathsValue = Math.round(weeklyDeathsValue)

          var weeklyKillsValue = (JSON.stringify(stats.data.segments[1].stats.weeklyKills.value))

          if (weeklyKillsValue == 'null') {
            console.log('here')
            var weeklyKillsValue = 0;
            var weeklyDeathsValue = 0;
            var weeklyKDValue = 'N/A';
          }

          var weeklyDeaths = document.createElement("div")
          weeklyDeathsHeaderU = weeklyDeaths.appendChild(document.createElement("U"));
          weeklyDeathsHeaderU.appendChild(document.createTextNode("Weekly Deaths:"));
          weeklyDeathsDiv = weeklyDeaths.appendChild(document.createElement("p"));
          weeklyDeathsDiv.appendChild(document.createTextNode(weeklyDeathsValue));

          var weeklyKills = document.createElement("div")
          weeklyKillsHeaderU = weeklyKills.appendChild(document.createElement("U"));
          weeklyKillsHeaderU.appendChild(document.createTextNode("Weekly Kills:"));
          weeklyKillsDiv = weeklyKills.appendChild(document.createElement("p"));
          weeklyKillsDiv.appendChild(document.createTextNode(weeklyKillsValue));

          var weeklyKD = document.createElement("div")
          weeklyKDHeaderU = weeklyKD.appendChild(document.createElement("U"));
          weeklyKDHeaderU.appendChild(document.createTextNode("Weekly KD:"));
          weeklyKDDiv = weeklyKD.appendChild(document.createElement("p"));
          weeklyKDDiv.appendChild(document.createTextNode(weeklyKDValue));

          if (weeklyKDValue == ('N/A')) {
            console.log("N/A")
          } else if (weeklyKDValue > (JSON.stringify(stats.data.segments[1].stats.kdRatio.value))) {
            improvementI = weeklyKD.appendChild(document.createElement("i"));
            improvementI.setAttribute("class", "fa fa-arrow-circle-up");
          } else if (weeklyKDValue == (JSON.stringify(stats.data.segments[1].stats.kdRatio.value))) {
            console.log("equal")
          } else {
            improvementI = weeklyKD.appendChild(document.createElement("i"));
            improvementI.setAttribute("class", "fa fa-arrow-circle-down");
          }

          weeklyStatsSection.appendChild(h3)
          weeklyStatsSection.appendChild(weeklyKills)
          weeklyStatsSection.appendChild(weeklyDeaths)
          weeklyStatsSection.appendChild(weeklyKD)

          statsContent.appendChild(weeklyStatsSection);

          var recentGamesH2 = document.createElement("h2")
          recentGamesH2.appendChild(document.createTextNode("Recent Games"));
          statsContent.appendChild(recentGamesH2);

          var recentGamesSection = document.createElement("Section")
          recentGamesSection.setAttribute("class", "recentGames");
          var loaderDiv = document.createElement("div")
          loaderDiv.setAttribute("class", "loader");
          recentGamesSection.appendChild(loaderDiv)

          statsContent.appendChild(recentGamesSection);

          hideLoadScreen()
          statsContent.style.display = "block";
          getPlayerGames(player)
        }).catch(errorFunction)
    }
  }

  function getPlayerGames(player) {
    let matchesUrl = 'https://sheltered-cove-87506.herokuapp.com/https://api.tracker.gg/api/v2/warzone/matches/atvi/' + player;
    let matches = fetch(matchesUrl, {
      mode: 'cors'
    }).then(successFunction).catch(errorFunction)

    function successFunction(matches) {
      matches.json().then(
        function(matches) {
          var matches = matches.data.matches
          console.log(matches.length)
          for (var i = 0; i < matches.length; i++) {
            console.log(matches[i])
          }

          var loaderDiv = document.getElementsByClassName("loader")
          console.log(loaderDiv)
          loaderDiv[0].style.display = "none";
        }).catch(errorFunction)
     }
   }

})
