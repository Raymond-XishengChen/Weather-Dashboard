// var city = "";
var userFormEl = document.querySelector('#user-form');
// var userFormEl = $('#user-form');
var searchEl = document.querySelector('.history-items');
var cityEl = document.querySelector('#search-city');
// var searchBtn = $(".search-btn");
var weatherAPI = "6353b75fff5792bfafcdc2bafb0e1246";


var currentTemperature = $("#current-temperature");
var currentHumidty= $("#current-humidity");
var currentWSpeed=$("#current-wind");
// var currentUvindex= $("#uv-index");
var saveList = [];

var formSubmitHandler = function (event) {
    event.preventDefault();
  
    var city = cityEl.value.trim();
  
    if (city) {
        console.log(city)
        getSearchCity(city);
  
    //   repoContainerEl.textContent = '';
    //   nameInputEl.value = '';
    } else {
        alert('Please enter a city name');
    }
  };



var getSearchCity = function (city) {
    var apiUrl = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + weatherAPI;
  
    fetch(apiUrl)
      .then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
            var weatherIcon = "https://openweathermap.org/img/wn/"+ data.weather[0].icon +"@2x.png";
            var tempInCel = (data.main.temp - 273.15).toFixed(2);
            var windSpeedMPH = (data.wind.speed * 2.2369).toFixed(2);
            var todayDate = dayjs().format('MM/DD/YYYY');

            $("#current-city").html(city.toUpperCase() + " (" + todayDate + ") " + "<img src=" + weatherIcon +">");
            $("#current-temperature").html(tempInCel + '&#8451');
            $("#current-wind").html(windSpeedMPH + ' MPH');
            $("#current-humidity").html(data.main.humidity + ' %');

            if(saveList === null){ 
              saveList=[];
              saveList.push(city.toUpperCase());
              localStorage.setItem("searchHistory",JSON.stringify(saveList));
            }
             else {
              saveList.push(city.toUpperCase());
              localStorage.setItem("searchHistory",JSON.stringify(saveList));
            }
            appendHistory(city);

            readSearchHistory();
          });

        } else {
          alert('Error: ' + response.statusText);
        }
      })
      .catch(function (error) {
        alert('Unable to connect to Open Weather');
      });

    var apiUrlForecast = 'https://api.openweathermap.org/data/2.5/forecast?q=' + city + '&appid=' + weatherAPI;
    fetch(apiUrlForecast)
    .then(function (response) {
      if (response.ok) {
          response.json().then(function (data) {
          console.log(data)
          var dayCounter = 0;
          for (dayCounter = 0; dayCounter < 5; dayCounter ++){
            var hourIndex = dayCounter * 8;

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

function appendHistory(city){
  var listEl= $("<li>" + city.toUpperCase() + "</li>");
  $(listEl).attr("class","history-list");
  $(listEl).attr("value",city.toUpperCase());
  $(".history-items").append(listEl);
}

function searchInHistory(event){
  var historyItems = event.target;
  if(event.target.matches("li")){
    city = historyItems.value.trim();
    getSearchCity(city);
  }
}

searchEl.addEventListener("click", function(event) {
  var element = event.target;
  if (element.matches("li")) {
    city = element.textContent;
    getSearchCity(city);
  }
})

userFormEl.addEventListener('submit', formSubmitHandler);
readSearchHistory();
