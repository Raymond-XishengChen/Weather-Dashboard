var userFormEl = document.querySelector('#user-form');
var searchEl = document.querySelector('.history-items');
var cityEl = document.querySelector('#search-city');
var weatherAPI = "6353b75fff5792bfafcdc2bafb0e1246";

var currentTemperature = $("#current-temperature");
var currentHumidty= $("#current-humidity");
var currentWSpeed=$("#current-wind");
var saveList = [];

// Read the input from the search bar
var formSubmitHandler = function (event) {
    event.preventDefault();
    var city = cityEl.value.trim();
    if (city) {
        console.log(city)
        getSearchCity(city);
    } else {
        alert('Please enter a city name');
    }
  };

// Use the API to search for the weather in the desired city
var getSearchCity = function (city) {
    //API Key for OpenWeatherMap
    var apiUrl = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + weatherAPI;
  
    fetch(apiUrl)
      .then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
            // Load the icon from Open Weather Map
            var weatherIcon = "https://openweathermap.org/img/wn/"+ data.weather[0].icon +"@2x.png";
            // Change temperature from Kelvin to Celsius
            var tempInCel = (data.main.temp - 273.15).toFixed(2);
            // Change wind speed to miles per hour
            var windSpeedMPH = (data.wind.speed * 2.2369).toFixed(2);
            // get current date form dayjs
            var todayDate = dayjs().format('MM/DD/YYYY');

            $("#current-city").html(city.toUpperCase() + " (" + todayDate + ") " + "<img src=" + weatherIcon +">");
            $("#current-temperature").html(tempInCel + '&#8451');
            $("#current-wind").html(windSpeedMPH + ' MPH');
            $("#current-humidity").html(data.main.humidity + ' %');

            readSearchHistory();
            // Save searches to local storages
            // If it's the first search, create an empty array before saving
            if(saveList === null){ 
              saveList=[];
              saveList.push(city.toUpperCase());
              localStorage.setItem("searchHistory",JSON.stringify(saveList));
              appendHistory(city);
            }
            // If it's not the first search, check if the city it's been searched before
            // If not, push the search to the save list
            else {            
              console.log(saveList)
              var duplicate;
              for(i = 0; i < saveList.length; i++){
                if( saveList[i] === city.toUpperCase()){
                  duplicate = 1;
                }else{
                  duplicate = 0;
                }
              }
              if(duplicate === 0){              
                saveList.push(city.toUpperCase());
                localStorage.setItem("searchHistory",JSON.stringify(saveList));
                appendHistory(city);
              }
            }
          });
        } else {
          alert('Error: ' + response.statusText);
        }
      })
      // If there's no respond from server, pop an error message
      .catch(function (error) {
        alert('Unable to connect to Open Weather');
      });

    // Get the 5 days forecast of the searched city
    var apiUrlForecast = 'https://api.openweathermap.org/data/2.5/forecast?q=' + city + '&appid=' + weatherAPI;
    fetch(apiUrlForecast)
    .then(function (response) {
      if (response.ok) {
          response.json().then(function (data) {
          var dayCounter = 0;
          for (dayCounter = 0; dayCounter < 5; dayCounter ++){
            // Create an index for getting the weather information in each of the next five days
            // since the API returns a result for every 3 hours, which is 8 times per day
            var hourIndex = dayCounter * 8;
            // Using the timestamp to generate the dates for the next 5 days
            var dateForecastUnix = dayjs.unix((data.list[hourIndex].dt));
            var dateForecast = dayjs(dateForecastUnix).format('MM/DD/YYYY');

            var urlForecastWeatherIcon = "https://openweathermap.org/img/wn/"+ data.list[hourIndex].weather[0].icon +"@2x.png";

            $(`#forecast${dayCounter+1}-date`).html(dateForecast + "<img src=" + urlForecastWeatherIcon +">");

            var tempForecastInCel = (data.list[hourIndex].main.temp - 273.15).toFixed(1);
            $(`#forecast${dayCounter+1}-temp`).html('Temp: ' + tempForecastInCel + '&#8451');

            var windForecastMPH = (data.list[hourIndex].wind.speed * 2.2369).toFixed(1);
            $(`#forecast${dayCounter+1}-wind`).html('Wind: ' + windForecastMPH + ' MPH');

            var humidityForecast = data.list[hourIndex].main.humidity;
            $(`#forecast${dayCounter+1}-humidity`).html('Humidity: ' + humidityForecast + '%');
          }
        });
      } else {
        alert('Error: ' + response.statusText);
      }
    })
    .catch(function (error) {
      alert('Unable to connect to Open Weather');
    });
  };


function readSearchHistory(){
    saveList=JSON.parse(localStorage.getItem("searchHistory"));
    console.log(saveList);
}

// Create history search items in the HTML file
function appendHistory(city){
  var listEl= $("<li>" + city.toUpperCase() + "</li>");
  $(listEl).attr("class","history-list");
  $(listEl).attr("value",city.toUpperCase());
  $(".history-items").append(listEl);
}


// Add actions of searching when user clicks on the history search items
searchEl.addEventListener("click", function(event) {
  var element = event.target;
  if (element.matches("li")) {
    city = element.textContent;
    getSearchCity(city);
  }
})

userFormEl.addEventListener('submit', formSubmitHandler);
