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

if (localStorage.getItem("favouritesList") === null) {
  var favouritesList = [];
} else {
  var favouritesList = JSON.parse(localStorage.getItem("favouritesList"));
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

  // Searches for players based on user's input
  var searchData = timeout(5000, fetch(url, {
    mode: 'cors'
  })).then(function(response) {
    successFunction(response)
  }).catch(function(error) {
    errorFunction(error)
  })

})

var favourites = document.querySelector(".favourites");

favourites.addEventListener("click", function(evt) {
  displayLoadScreen()
  var ul = document.getElementsByClassName("favouritesList");
  ul[0].innerHTML = '';
  favouritesList.forEach(createFavouriteResult)
  var favouritesContent = document.getElementsByClassName("favouritesContent");
  hideLoadScreen()
  favouritesContent[0].style.display = "block";
})

var home = document.querySelector(".home");

home.addEventListener("click", function(evt) {
  displayLoadScreen()
  var homeContent = document.getElementsByClassName("initialContent");
  hideLoadScreen()
  homeContent[0].style.display = "block";
})

var leaderboard = document.querySelector(".leaderboard");

leaderboard.addEventListener("click", function(evt) {
  displayLoadScreen()
  var leaderboardContent = document.getElementsByClassName("leaderboardContent");
  leaderboardContent[0].innerHTML = '';
  createLeaderboards()
})

// Creates new timeout function for fecth requests
// Stolen and adapted from https://stackoverflow.com/questions/46946380/fetch-api-request-timeout
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
  var searchablePlayer = searchablePlayer.toLowerCase();
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

// Creates buttons for each player it is passed
function createFavouriteResult(player) {
  var ul = document.getElementsByClassName("favouritesList");
  var li = document.createElement("li")

  var button = document.createElement("button")
  button.onclick = function(event) {
    displayLoadScreen()
    getPlayerStats(player);
  };

  button.appendChild(document.createTextNode(player));
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
  var favouritesContent = document.getElementsByClassName("favouritesContent");
  favouritesContent[0].style.display = "none";
  var leaderboardContent = document.getElementsByClassName("leaderboardContent");
  leaderboardContent[0].style.display = "none";
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

        h2.appendChild(document.createTextNode(getFirstPartPlayerName(player)));
        statsContent.appendChild(h2);

        var lifetimeStatsSection = document.createElement("Section")
        lifetimeStatsSection.setAttribute("class", "lifetimeStats");
        var h3 = document.createElement("h3")
        h3.appendChild(document.createTextNode("Lifetime Stats"));

        var lifetimeKD = createStatDiv("KD", (JSON.stringify(stats.data.segments[1].stats.kdRatio.value)))
        var lifetimeKills = createStatDiv("Kills", (JSON.stringify(stats.data.segments[1].stats.kills.value)))
        var lifetimeDeaths = createStatDiv("Deaths", (JSON.stringify(stats.data.segments[1].stats.deaths.value)))
        var lifetimeGames = createStatDiv("Games", (JSON.stringify(stats.data.segments[1].stats.gamesPlayed.value)))
        var lifetimeWins = createStatDiv("Wins", (JSON.stringify(stats.data.segments[1].stats.wins.value)))
        var lifetimeWinRatio = createStatDiv("Win Ratio", (JSON.stringify(stats.data.segments[1].stats.wlRatio.value)))

        lifetimeStatsSection.appendChild(h3)
        lifetimeStatsSection.appendChild(lifetimeKills)
        lifetimeStatsSection.appendChild(lifetimeDeaths)
        lifetimeStatsSection.appendChild(lifetimeKD)
        lifetimeStatsSection.appendChild(lifetimeGames)
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
        var weeklyGamesValue = (JSON.stringify(stats.data.segments[1].stats.weeklyMatchesPlayed.value))

        if (weeklyKillsValue == 'null') {
          console.log('here')
          var weeklyKillsValue = 0;
          var weeklyDeathsValue = 0;
          var weeklyKDValue = 'N/A';
        }

        var weeklyDeaths = createStatDiv("Weekly Deaths", weeklyDeathsValue)
        var weeklyKills = createStatDiv("Weekly Kills", weeklyKillsValue)
        var weeklyKD = createStatDiv("Weekly KD", weeklyKDValue)
        var weeklyGames = createStatDiv("Weekly Games", weeklyGamesValue)

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
        weeklyStatsSection.appendChild(weeklyGames)

        statsContent.appendChild(weeklyStatsSection);

        addFavouriteButton = document.createElement("button")
        addFavouriteButton.appendChild(document.createTextNode("Add to Favourites"));
        addFavouriteButton.setAttribute("id", "addFavouriteButton");
        addFavouriteButton.setAttribute("type", "submit");

        statsContent.appendChild(addFavouriteButton)

        removeFavouriteButton = document.createElement("button")
        removeFavouriteButton.appendChild(document.createTextNode("Remove from Favourites"));
        removeFavouriteButton.setAttribute("id", "removeFavouriteButton");
        removeFavouriteButton.setAttribute("type", "submit");

        statsContent.appendChild(removeFavouriteButton)

        console.log(favouritesList)
        console.log(player)

        if (favouritesList.indexOf(player) === -1) {
          removeFavouriteButton.style.display = "none";
          addFavouriteButton.style.display = "block";

        } else {
          addFavouriteButton.style.display = "none";
          removeFavouriteButton.style.display = "block";
        }

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

        addFavouriteButton.addEventListener('click', function(evt) {
          favouritesList.indexOf(player) === -1 ? favouritesList.push(player) : console.log("This item already exists");
          localStorage.setItem("favouritesList", JSON.stringify(favouritesList));
          addFavouriteButton.style.display = "none";
          removeFavouriteButton.style.display = "block";
        })

        removeFavouriteButton.addEventListener('click', function(evt) {
          var index = favouritesList.indexOf(player);
          favouritesList.splice(index, 1);
          localStorage.setItem("favouritesList", JSON.stringify(favouritesList));
          removeFavouriteButton.style.display = "none";
          addFavouriteButton.style.display = "block";
        })

      }).catch(errorFunction)
  }
}

function getPlayerGames(player) {
  let gamesUrl = 'https://sheltered-cove-87506.herokuapp.com/https://api.tracker.gg/api/v2/warzone/matches/atvi/' + player;
  let games = fetch(gamesUrl, {
    mode: 'cors'
  }).then(successFunction).catch(recentGamesErrorFunction)

  function successFunction(games) {
    games.json().then(
      function(games) {
        var games = games.data.matches
        for (var i = 0; i < games.length; i++) {
          createRecentGame(games[i]);
        }
        var recentGamesSection = document.getElementsByClassName("recentGames")
        recentGamesSection[0].style.display = "none";
      }).catch(recentGamesErrorFunction)
  }
}

function recentGamesErrorFunction(err) {
  var recentGamesSection = document.getElementsByClassName("recentGames")
  var errorDiv = document.createElement("div")
  errorDiv.setAttribute("class", "error");
  var h2 = document.createElement("h2")
  h2.appendChild(document.createTextNode("Error"));
  var p = document.createElement("p")
  p.appendChild(document.createTextNode("Error getting recent games"));
  errorDiv.appendChild(h2);
  errorDiv.appendChild(p);
  recentGamesSection[0].appendChild(errorDiv)

  var loaderDiv = document.getElementsByClassName("loader")
  loaderDiv[0].style.display = "none";
  console.error(err)
}


function createRecentGame(game) {
  var statsContent = document.getElementsByClassName("statsContent")[0];
  var recentGameSection = document.createElement("Section")
  var recentGameSectionDiv = document.createElement("Div")
  recentGameSectionDiv.setAttribute("class", "recentGame")

  gameMode = game.metadata.modeName
  gameModeP = recentGameSectionDiv.appendChild(document.createElement("p"));
  gameModeP.appendChild(document.createTextNode(gameMode));

  gametime = game.metadata.timestamp
  gametimeP = recentGameSectionDiv.appendChild(document.createElement("p"));
  gametimeP.appendChild(document.createTextNode(timestampToDateTime(gametime)));

  gamePlacement = game.segments[0].stats.placement.value
  gamePlacementP = recentGameSectionDiv.appendChild(document.createElement("p"));
  gamePlacementP.appendChild(document.createTextNode(toOrdinalSuffix(gamePlacement)));

  gameKills = game.segments[0].stats.kills.value
  gameDeaths = game.segments[0].stats.deaths.value
  gameKD = game.segments[0].stats.kdRatio.value
  gameDamage = game.segments[0].stats.damageDone.value

  var recentGameStatDiv = document.createElement("Div")
  recentGameStatDiv.setAttribute("class", "recentGameStats")

  recentGameSection.appendChild(recentGameSectionDiv)
  recentGameStatDiv.appendChild(createStatDiv("Kills", gameKills))
  recentGameStatDiv.appendChild(createStatDiv("Deaths", gameDeaths))
  recentGameStatDiv.appendChild(createStatDiv("Damage", gameDamage))
  recentGameStatDiv.appendChild(createStatDiv("KD", parseFloat(gameKD).toFixed(2)))
  recentGameSection.appendChild(recentGameStatDiv)

  if (gamePlacement == ('1')) {
    gamePlacementP.setAttribute("class", "won")
  } else if (gamePlacement < 10) {
    gamePlacementP.setAttribute("class", "top-ten");
  } else {
    gamePlacementP.setAttribute("class", "low");
  }

  recentGameSection.setAttribute("class", "recentGame");
  statsContent.appendChild(recentGameSection);
}

function createLeaderboards() {

  var counter = 0

  var leaderboardContent = document.getElementsByClassName("leaderboardContent");

  if (localStorage.getItem("favouritesList") === null) {
    var favouritesList = [];
  } else {
    var favouritesList = JSON.parse(localStorage.getItem("favouritesList"));
  }

  var lifetimeKDtable = document.createElement("table");
  lifetimeKDtable.setAttribute("class", "lifetimeKDtable");
  var lifetimeKDheaderRow = document.createElement("tr");
  var lifetimeplayerheader = document.createElement("th")
  lifetimeplayerheader.onclick = function(event) {
    sortTable(0, lifetimeKDtable)
  }
  var lifetimeKillsheader = document.createElement("th")
  lifetimeKillsheader.onclick = function(event) {
    sortTable(1, lifetimeKDtable)
  }
  var lifetimeDeathsheader = document.createElement("th")
  lifetimeDeathsheader.onclick = function(event) {
    sortTable(2, lifetimeKDtable)
  }
  var lifetimeKDheader = document.createElement("th")
  lifetimeKDheader.onclick = function(event) {
    sortTable(3, lifetimeKDtable)
  }
  lifetimeplayerheader.innerHTML = "Player &#8597"
  lifetimeKillsheader.innerHTML = "Kills &#8597"
  lifetimeDeathsheader.innerHTML = "Deaths &#8597"
  lifetimeKDheader.innerHTML = "KD Ratio &#8597"
  lifetimeKDheaderRow.appendChild(lifetimeplayerheader)
  lifetimeKDheaderRow.appendChild(lifetimeKillsheader)
  lifetimeKDheaderRow.appendChild(lifetimeDeathsheader)
  lifetimeKDheaderRow.appendChild(lifetimeKDheader)
  lifetimeKDtable.appendChild(lifetimeKDheaderRow)

  var lifetimeWinstable = document.createElement("table");
  lifetimeWinstable.setAttribute("class", "lifetimeWinstable");
  var lifetimeWinsheaderRow = document.createElement("tr");
  var lifetimeWinsplayerheader = document.createElement("th")
  lifetimeWinsplayerheader.onclick = function(event) {
    sortTable(0, lifetimeWinstable)
  }
  var lifetimeGamesheader = document.createElement("th")
  lifetimeGamesheader.onclick = function(event) {
    sortTable(1, lifetimeWinstable)
  }
  var lifetimeWinsheader = document.createElement("th")
  lifetimeWinsheader.onclick = function(event) {
    sortTable(2, lifetimeWinstable)
  }
  var lifetimeWinRatioheader = document.createElement("th")
  lifetimeWinRatioheader.onclick = function(event) {
    sortTable(3, lifetimeWinstable)
  }
  lifetimeWinsplayerheader.innerHTML = "Player &#8597;"
  lifetimeGamesheader.innerHTML = "Games &#8597"
  lifetimeWinsheader.innerHTML = "Wins &#8597"
  lifetimeWinRatioheader.innerHTML = "Win Ratio &#8597"
  lifetimeWinsheaderRow.appendChild(lifetimeWinsplayerheader)
  lifetimeWinsheaderRow.appendChild(lifetimeGamesheader)
  lifetimeWinsheaderRow.appendChild(lifetimeWinsheader)
  lifetimeWinsheaderRow.appendChild(lifetimeWinRatioheader)
  lifetimeWinstable.appendChild(lifetimeWinsheaderRow)

  var weeklyKDtable = document.createElement("table");
  weeklyKDtable.setAttribute("class", "weeklyKDtable");
  var weeklyKDheaderRow = document.createElement("tr");
  var weeklyplayerheader = document.createElement("th")
  weeklyplayerheader.onclick = function(event) {
    sortTable(0, weeklyKDtable)
  }
  var weeklyKillsheader = document.createElement("th")
  weeklyKillsheader.onclick = function(event) {
    sortTable(1, weeklyKDtable)
  }
  var weeklyDeathsheader = document.createElement("th")
  weeklyDeathsheader.onclick = function(event) {
    sortTable(2, weeklyKDtable)
  }
  var weeklyKDheader = document.createElement("th")
  weeklyKDheader.onclick = function(event) {
    sortTable(3, weeklyKDtable)
  }
  weeklyplayerheader.innerHTML = "Player &#8597"
  weeklyKillsheader.innerHTML = "Kills &#8597"
  weeklyDeathsheader.innerHTML = "Deaths &#8597"
  weeklyKDheader.innerHTML = "KD Ratio &#8597"
  weeklyKDheaderRow.appendChild(weeklyplayerheader)
  weeklyKDheaderRow.appendChild(weeklyKillsheader)
  weeklyKDheaderRow.appendChild(weeklyDeathsheader)
  weeklyKDheaderRow.appendChild(weeklyKDheader)
  weeklyKDtable.appendChild(weeklyKDheaderRow)


  for (var i = 0; i < favouritesList.length; i++) {
    let player = favouritesList[i]

    let statsUrl = 'https://sheltered-cove-87506.herokuapp.com/https://api.tracker.gg/api/v2/warzone/standard/profile/atvi/' + player;

    player = getFirstPartPlayerName(player)

    let stats = fetch(statsUrl, {
      mode: 'cors'
    }).then(successFunction).catch(errorFunction)

    function successFunction(stats) {
      stats.json().then(
        function(stats) {

          var lifetimeKD = JSON.stringify(stats.data.segments[1].stats.kdRatio.value)
          var lifetimeKills = JSON.stringify(stats.data.segments[1].stats.kills.value)
          var lifetimeDeaths = JSON.stringify(stats.data.segments[1].stats.deaths.value)
          var lifetimeGames = JSON.stringify(stats.data.segments[1].stats.gamesPlayed.value)
          var lifetimeWins = JSON.stringify(stats.data.segments[1].stats.wins.value)
          var lifetimeWinRatio = JSON.stringify(stats.data.segments[1].stats.wlRatio.value)

          var weeklyKDValue = parseFloat((JSON.stringify(stats.data.segments[1].stats.weeklyKdRatio.value))).toFixed(2)
          var weeklyDeathsValue = Math.round(parseFloat(((JSON.stringify(stats.data.segments[1].stats.weeklyKills.value))) / weeklyKDValue))
          var weeklyKillsValue = (JSON.stringify(stats.data.segments[1].stats.weeklyKills.value))

          var lifetimeKDtr = document.createElement("tr")
          var lifetimeWinstr = document.createElement("tr")
          var weeklyKDtr = document.createElement("tr")
          var lifetimeKDplayertd = document.createElement("td")
          var lifetimeKDtd = document.createElement("td")
          var lifetimeKillstd = document.createElement("td")
          var lifetimeDeathstd = document.createElement("td")
          var lifetimeGamestd = document.createElement("td")
          var lifetimeWinstd = document.createElement("td")
          var lifetimeWinsplayertd = document.createElement("td")
          var lifetimeWinRatiotd = document.createElement("td")
          var weeklyKDValuetd = document.createElement("td")
          var weeklyKDplayertd = document.createElement("td")
          var weeklyDeathsValuetd = document.createElement("td")
          var weeklyKillsValuetd = document.createElement("td")

          lifetimeKDplayertd.innerHTML = player
          lifetimeKDtd.innerHTML = lifetimeKD
          lifetimeKillstd.innerHTML = lifetimeKills
          lifetimeDeathstd.innerHTML = lifetimeDeaths
          lifetimeGamestd.innerHTML = lifetimeGames
          lifetimeWinstd.innerHTML = lifetimeWins
          lifetimeWinsplayertd.innerHTML = player
          lifetimeWinRatiotd.innerHTML = lifetimeWinRatio
          weeklyKDValuetd.innerHTML = weeklyKDValue
          weeklyKDplayertd.innerHTML = player
          weeklyDeathsValuetd.innerHTML = weeklyDeathsValue
          weeklyKillsValuetd.innerHTML = weeklyKillsValue

          lifetimeKDtr.appendChild(lifetimeKDplayertd)
          lifetimeKDtr.appendChild(lifetimeKillstd)
          lifetimeKDtr.appendChild(lifetimeDeathstd)
          lifetimeKDtr.appendChild(lifetimeKDtd)
          lifetimeWinstr.appendChild(lifetimeWinsplayertd)
          lifetimeWinstr.appendChild(lifetimeGamestd)
          lifetimeWinstr.appendChild(lifetimeWinstd)
          lifetimeWinstr.appendChild(lifetimeWinRatiotd)
          weeklyKDtr.appendChild(weeklyKDplayertd)
          weeklyKDtr.appendChild(weeklyKillsValuetd)
          weeklyKDtr.appendChild(weeklyDeathsValuetd)
          weeklyKDtr.appendChild(weeklyKDValuetd)

          lifetimeKDtable.appendChild(lifetimeKDtr)
          lifetimeWinstable.appendChild(lifetimeWinstr)
          weeklyKDtable.appendChild(weeklyKDtr)
        })

        counter = counter + 1

        if (counter == favouritesList.length) {
          leaderboardContent[0].appendChild(leaderboardSection);
          hideLoadScreen()
          leaderboardContent[0].style.display = "block";
        }

    }
  }

  var leaderboardSection = document.createElement("Section")
  var leaderboardh2 = document.createElement("h2")
  leaderboardh2.appendChild(document.createTextNode("Leaderboards"));
  var lifetimeKDh3 = document.createElement("h3")
  lifetimeKDh3.appendChild(document.createTextNode("Lifetime KD"));
  var lifetimeWinsh3 = document.createElement("h3")
  lifetimeWinsh3.appendChild(document.createTextNode("Lifetime Wins"));
  var weeklyKDh3 = document.createElement("h3")
  weeklyKDh3.appendChild(document.createTextNode("Weekly KD"));

  leaderboardSection.appendChild(leaderboardh2)
  leaderboardSection.appendChild(lifetimeKDh3)
  leaderboardSection.appendChild(lifetimeKDtable)
  leaderboardSection.appendChild(lifetimeWinsh3)
  leaderboardSection.appendChild(lifetimeWinstable)
  leaderboardSection.appendChild(weeklyKDh3)
  leaderboardSection.appendChild(weeklyKDtable)

}

const toOrdinalSuffix = num => {
  const int = parseInt(num),
    digits = [int % 10, int % 100],
    ordinals = ['st', 'nd', 'rd', 'th'],
    oPattern = [1, 2, 3, 4],
    tPattern = [11, 12, 13, 14, 15, 16, 17, 18, 19];
  return oPattern.includes(digits[0]) && !tPattern.includes(digits[1]) ?
    int + ordinals[digits[0] - 1] :
    int + ordinals[3];
};

function timestampToDateTime(timestamp) {
  var timestamp = Date.parse(timestamp)
  var date = new Date(parseInt(timestamp));

  return (date.getDate() +
    "/" + (date.getMonth() + 1) +
    "/" + (date.getFullYear()).toString().substr(-2) +
    " " + date.getHours() +
    ":" + ('0' + date.getMinutes()).slice(-2));
};

function getFirstPartPlayerName(str) {
  return str.split('%')[0];
}

function createStatDiv(header, value) {
  var stat = document.createElement("div")
  u = stat.appendChild(document.createElement("U"));
  u.appendChild(document.createTextNode(header + ":"));
  div = stat.appendChild(document.createElement("p"));
  div.appendChild(document.createTextNode(value));
  return stat;
};

function sortTable(n, passedtable) {
  // Sorts a table, needs to be passed a column reference and a table element
  // Stolen and adapted from https://www.w3schools.com/howto/howto_js_sort_table.asp
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = passedtable
  switching = true;
  dir = "asc";
  while (switching) {
    switching = false;
    rows = table.rows;
    for (i = 1; i < (rows.length - 1); i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      if (dir == "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      } else if (dir == "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchcount++;
    } else {
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}
