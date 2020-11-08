// What is the theme of the app?
// to get weather data and 5 day forcast of the city which was entered from user.
// When app starts I see Weather Dashboard.
// On the left input field and search button to enter and search city.
// Below input there is a history of search - clickable list of cities.
// On the right side the weather card for the city which was clicked or searched which shows the weather info now.
//  Below weather now card there is another 5 cards with 5 day forecast for that city.
// Then Current weather and 5 day forecast is displayed.
// The City name, the date, icon for current weather, temperature, humidity, wind speed, UV Index.

// The 5 day forecast shows date, icon for weather, temperature, and humidity.
// Search history is shown and when user clicks on city name in search the relevant weather data is shown.

$(document).ready(function(){

// Initialize app.
var city = {
    name: '',
    date: '',
    temp: '',
    humidity: '',
    wind: '',
    uv: ' '
}

var citiesHistory = [];
displaySearchHistory();

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
        city.name = data.name;
        city.lat = data.coord.lat;
        city.lon = data.coord.lon;
        city.date = dateToday;
        city.temp = data.main.temp;
        city.humidity = data.main.humidity;
        city.wind =  data.wind.speed;
        city.icon = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
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
        // Get 5-day forecast from API
        var endpointForecast = `http://api.openweathermap.org/data/2.5/forecast?q=${cityToGet}&units=metric&appid=${apiKey}`; 
        
        fetch(endpointForecast).then(function(response){
            if (response.ok){
                return response.json();
            }
        }).then(function(data){
            city.forecast = data.list;
            displayWeather(city);
            city.fiveDays = filterFiveDays(city.forecast);
            displayForecast(city)
            saveCityHistory(city);
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
    $('#forecast-cards').empty(); // clear any previous forecast displayed
    // Create forecast card div children and append later
    for (var i = 0; i < 5; i++){
        var $dayCard = $('<div>');
        $dayCard.addClass('card text-white bg-primary');
        var $dayCardBody = $('<div>');
        $dayCardBody.addClass('card-body forecast-card px-2 text-center');
        $dayCard.append($dayCardBody);
        var $cardTitle = $('<h5>'); // date
        $cardTitle.addClass('card-title');

        $cardTitle.text(city.fiveDays[i].date);
        var $cardIcon = $('<img>'); // weather icon
        $cardIcon.attr('src', `http://openweathermap.org/img/wn/${city.fiveDays[i].icon}.png`);
        var $temp = $('<div>');
        $temp.html(`Temp: ${city.fiveDays[i].temp} &#8451`);
        var $humid = $('<div>');
        $humid.text(`Humidity: ${city.fiveDays[i].humidity} %`);
        $dayCardBody.append($cardTitle);
        $dayCardBody.append($cardIcon);
        $dayCardBody.append($temp);
        $dayCardBody.append($humid);
        $('#forecast-cards').append($dayCard);
    }
    

}

// function to filter 5-day forecast data at noon from array of forecast from HTTP response
function filterFiveDays(forecast){
    var fiveDayForecast = [];
    for (var i = 1; i < 6; i++) {
        var nextDay = forecast.filter(function(day){
            var nextDate = moment().add(i,'days').format('YYYY-MM-DD') + ' 12:00:00'; // get next date using moment.js
            return day.dt_txt === nextDate;
        });
        var dayInfo = {
            date: nextDay[0].dt_txt.slice(0, 10).split('-').reverse().join('-'), // Extract date string and reverse
            icon: nextDay[0].weather[0].icon.replace('n', 'd'), // Make sure that daylight icon is assigned
            temp: nextDay[0].main.temp,
            humidity: nextDay[0].main.humidity
        }
        fiveDayForecast.push(dayInfo);
    }
    return fiveDayForecast;
}

//      save city weather and forecast info into local storage
function saveCityHistory(city){
    var history = loadSearchHistory();
    console.log(history)
    var indexOfExist = history.findIndex(element => element.name === city.name); // check if city already exist in history
    if (indexOfExist === -1) {
        history.push(Object.assign({}, city)); // make a clone of object to disonnect from next city objects
    } else {
        history[indexOfExist] = Object.assign({}, city); // Update existing city with new info
    }
    
    localStorage.setItem('searchHistory', JSON.stringify(history)); // save cities history to local storage
}

// Function to load search history list from local storage
function loadSearchHistory(){
    var history = JSON.parse(localStorage.getItem('searchHistory')); // load saved history from local storage
    if (!history) {
        history = []; // If there is no saved history then create empty array
    }
    return history;
}

// function to display search history on the page
function displaySearchHistory(){
    $('#searched-cities').empty();
    var history = loadSearchHistory();
    for (var i = 0; i < history.length; i++){
        var $cityListItem = $('<a href="#" class="list-group-item list-group-item-action">');
        $cityListItem.text(history[i].name);
        $cityListItem.attr('data-index', i);
        $('#searched-cities').append($cityListItem);
    }

}
    
});


// 1. When user enters city name and then search icon is clicked the request is getting sent to get weather.


//      add city into search history list and dislpay in history list on page

// 2. When User clicks on city in history
//      check if date in stored info is too old.
//      if need get new weather data (now and forecast) from weather website API
//      display weather info for City which was clicked in history list.
// --------------------------
// Additional
// 3. Clear history list button and clear local storage






