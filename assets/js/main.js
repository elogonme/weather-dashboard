// What is the theme of the app?
// to get weather data and 5 day forcast of the city which was entered from user.
// When app starts I see Weather Dashboard.
// On the left input field and search button to enter and search city.
// Below input there is a history of search - clickable list of cities.
// On the right side the weather card for the city which was clicked or searched which shows the weather info now.
//  Below weather now card there is another 5 cards with 5 day forecast for that city.
// Then Current weather and 5 day forecast is displayed.
// The City name, the date, icon for current weather, temperature, humidity, wind speed, UV Index.

// The 5 day forecast shows datem icon for weather, temperature, and humidity.
// Search history is shown and when user clicks on city name in search the relevant weather data is shown.

$(document).ready(function(){

// Initialize app.
var city = {
    name: '',
    date: '',
    temp: '',
    humidity: '',
    wind: '',
    uv: ''
}

$('#search').on('click', function(event){
    event.preventDefault();
    $('#error').fadeOut();
    var city = $('#city').val();
    if (!city) return; // Guard if nothing is entered as city name
    getCityWeather(city);

    // filterFiveDays(JSON.parse(localStorage.getItem('forecast')));
    
});

// Function to fetch city weather and forecast
function getCityWeather(cityToGet){
    var dateToday = moment().format('DD-MM-YYYY'); // get todays date using moment.js
    var hourNow = moment().format('H'); // get hour now using moment.js
    var apiKey = 'ff0f76a4c4d020f2b161d15988971e11';
    var endpoint = `http://api.openweathermap.org/data/2.5/weather?q=${cityToGet}&units=metric&appid=${apiKey}`; // form API endpoint URL
    fetch(endpoint).then(function(response){    // Get City weather now info
        if (response.ok){
            return response.json();
        }
        $('#error').fadeIn();
        throw new Error('Request failed');
    }).then(function(data){
        console.log(data);
        city.name = data.name;
        city.lat = data.coord.lat;
        city.lon = data.coord.lon;
        city.date = dateToday;
        city.temp = data.main.temp;
        city.humidity = data.main.humidity;
        city.wind =  data.wind.speed;
        city.icon = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        console.log(city);
        return city;
    }).then(function(city){
        // Get City Uv Index
        var endpointUv = `http://api.openweathermap.org/data/2.5/uvi?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}`;
        fetch(endpointUv).then(function(response){
            if (response.ok){
                return response.json();
            }
        }).then(function(data){
            city.uv = data.value;
        })
     
    }).then(function(){
        // Get 5-day forecast
        var endpointForecast = `http://api.openweathermap.org/data/2.5/forecast?q=${cityToGet}&units=metric&appid=${apiKey}`; 
        
        fetch(endpointForecast).then(function(response){
            if (response.ok){
                return response.json();
            }
        }).then(function(data){
            city.forecast = data.list;
            displayWeather(city);
            city.fiveDays = filterFiveDays(city.forecast);
            console.log(city);
            displayForecast(city)
        })
    })
        
    .catch(function(err){
        console.log(err);
    })
};

// Function to fetch City UV Index
// Function to fetch City 5-day forecast
// function to display retreived weather now on the page
function displayWeather(city) {
    var uvColor = '';
    console.log(city);
    $('#city-name').text(city.name);
    $('#date').text(city.date);
    $('#icon').attr('src', city.icon);
    $('#temp').text(city.temp);
    $('#humidity').text(city.humidity);
    $('#wind').text(city.wind);
    $('#uv').text(city.uv);
    // When UV index is dipsplayed the color is according to conditions - favorable, moderate, or severe.
    // Assign UV Index style to display depending on condition
    if (city.uv < 3) {
        uvColor = 'green';
    } else if (city.uv < 6){
        uvColor = 'yellow';
    } else uvColor = 'red';
    $('#uv').css('background-color', uvColor);
}

function displayForecast(city){
    // Create forecast card div children and append later
    var $dayCard = $('<div>');
    $dayCard.addClass('card');
    var $dayCardBody = $('<div>');
    $dayCardBody.addClass('card-body forecast-card');
    $dayCard.append($dayCardBody);
    var $cardTitle = $('<h5>'); // date
    var date = city.forecast[0].dt_txt.slice(0, 10).split('-').reverse().join('-'); // Extract date string and reverse
    $cardTitle.text(date);
    var $cardIcon = $('<img>'); // weather icon
    $cardIcon.attr('src', `http://openweathermap.org/img/wn/${city.forecast[0].weather[0].icon}.png`);
    var $temp = $('<div>');
    $temp.html(`Temp: ${city.forecast[0].main.temp} &#8451`);
    var $humid = $('<div>');
    $humid.text(`Humidity: ${city.forecast[0].main.humidity} %`);
    $dayCardBody.append($cardTitle);
    $dayCardBody.append($cardIcon);
    $dayCardBody.append($temp);
    $dayCardBody.append($humid);
    $('#forecast-cards').append($dayCard);

}

// function to filter 5-day forecast data at noon from array of forecast from HTTP response
function filterFiveDays(forecast){
    var fiveDayForecast = [];
    for (var i = 1; i < 6; i++) {
        var nextDay = forecast.filter(day => {
            var nextDate = moment().add(i,'days').format('YYYY-MM-DD') + ' 12:00:00'; // get next date using moment.js
            return day.dt_txt === nextDate;
        });
        console.log(nextDay);
        var dayInfo = {
            date: nextDay[0].dt_txt,
            icon: nextDay[0].weather[0].icon,
            temp: nextDay[0].main.temp,
            humidity: nextDay[0].main.humidity
        }
        
        fiveDayForecast.push(dayInfo);
    }
    
    return fiveDayForecast;
}

});
// 1. When user enters city name and then search icon is clicked the request is getting sent to get weather.
//  when user enters city and clicks search
//      check if anything in input if not continue waitng for input.
//      get value of city name and form url for api

//      send fetch http request to get city weather now.
//      check if response is ok. 
//      display error message if it is not
//      if OK get weather info and display in weather now card.
//          UV index bg-color is different depending on conditions: favorable, moderate, or severe.

//      send fetch http request to get city 5-day forecast.
//      check if response is ok. 
//      display error message if it is not
//      if OK get weather info and display in 5-day forecast cards.

//      save city weather and forecast info into local storage
//      add city into search history list and dislpay in history list on page

// 2. When User clicks on city in history
//      check if date in stored info is too old.
//      if need get new weather data (now and forecast) from weather website API
//      display weather info for City which was clicked in history list.
// --------------------------
// Additional
// 3. Clear history list button and clear local storage






