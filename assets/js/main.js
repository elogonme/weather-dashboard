// When html page is fully loaded ready - run the js
$(document).ready(function(){
// ------- Initialize app -----------------
// Create empty city object for use
var city = {
    name: '',
    date: '',
    temp: '',
    humidity: '',
    wind: '',
    uv: ' '
}
var dateToday = moment().format('DD-MM-YYYY'); // get todays date using moment.js
displaySearchHistory();
getLastCityWeather(); // On start up load last searched city if there is one saved

// Event listener to detect search button click and start search
$('#search').on('click', function(event){
    event.preventDefault();
    $('#error').fadeOut();
    var city = $('#city').val();
    if (!city) return; // Guard if nothing is entered as city name
    getCityWeather(city);
    $('#city').val(''); // Clear input feild after search
});

// Event listener to detect click on city from history list
$("#searched-cities").on('click', function(event){
    event.preventDefault();
    var index = $(event.target).attr('data-index');
    loadCityWeatherHistory(index);
});

// Event listener to detect click on clear history button and clear data
$("#clear-history").on('click', function(){
    localStorage.clear();
    $('#searched-cities').empty();
    $('#forecast-cards').empty();
    var city = {
        name: '',
        date: '',
        temp: '',
        humidity: '',
        wind: '',
        uv: ' '
    }
    displayWeather(city); // Clear weather info on the page with blank empty city object
    $('#uv').css('background-color', '#fff'); // Remove color class from UV index to make it white
});

// Function to fetch city weather and forecast from API
function getCityWeather(cityToGet){
    var apiKey = 'ff0f76a4c4d020f2b161d15988971e11'; // Openweather API key
    // API endpoint URL for weather now
    var endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${cityToGet}&units=metric&appid=${apiKey}`; 
    fetch(endpoint).then(function(response){    // Get City weather now info
        if (response.ok){
            return response.json();
        }
        $('#error').fadeIn(); // Display error message on the page if city not found or invalid request
        throw new Error('Request failed'); // Show error message in console
    }).then(function(data){
        // Assign retrieved data to object properties
        city.name = data.name;
        city.lat = data.coord.lat;
        city.lon = data.coord.lon;
        city.date = dateToday;
        city.temp = data.main.temp;
        city.humidity = data.main.humidity;
        city.wind =  data.wind.speed;
        city.icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        return city;
    }).then(function(city){
        // Get City Uv Index
        var endpointUv = `https://api.openweathermap.org/data/2.5/uvi?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}`;
        fetch(endpointUv).then(function(response){
            if (response.ok){
                return response.json();
            }
        }).then(function(data){
            city.uv = data.value; // Assign retrieved UV index data to object uv property
            return city
        }).then(function(city){
            // Get 5-day forecast from API
            var endpointForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${cityToGet}&units=metric&appid=${apiKey}`; 
            fetch(endpointForecast).then(function(response){
                if (response.ok){
                    return response.json();
                }
            }).then(function(data){
                // Assign retrieved forcast list data to object property forecast
                city.forecast = data.list;
                displayWeather(city);
                // Filter out only 5 day data at noon from forecast list as it has data for every 3 hours
                city.fiveDays = filterFiveDays(city.forecast); 
                displayForecast(city)
                saveCityHistory(city); // Save city weather info to local storage
                displaySearchHistory(); // Add searched city to history list and update list on page
            }).catch(function(err){  // output error message to console if there are any other network errors
                console.log(err);
            })
        })
    })
    .catch(function(err){ // output error message to console if there are any other network errors
        console.log(err);
    })
};


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
    // When UV index is dipsplayed the color is changed according to conditions - favorable, moderate, or severe.
    // Assign UV Index style to display depending on condition
    if (city.uv < 3) {
        uvColor = 'green';
    } else if (city.uv < 6){
        uvColor = '#ffcc00';
    } else uvColor = 'red';
    $('#uv').css('background-color', uvColor);
};

function displayForecast(city){
    $('#forecast-cards').empty(); // clear any previous forecast displayed
    // Create forecast card div children and append later in for loop for 5 days forecast
    for (var i = 0; i < 5; i++){
        var $dayCard = $('<div>');
        $dayCard.addClass('card text-white bg-primary mx-2');
        var $dayCardBody = $('<div>');
        $dayCardBody.addClass('card-body forecast-card text-center px-1');
        $dayCard.append($dayCardBody);
        var $cardTitle = $('<h5>'); // date
        $cardTitle.addClass('card-title');

        $cardTitle.text(city.fiveDays[i].date);
        var $cardIcon = $('<img>'); // weather icon
        $cardIcon.attr('src', `https://openweathermap.org/img/wn/${city.fiveDays[i].icon}.png`);
        var $temp = $('<div>');
        $temp.html(`Temp: ${city.fiveDays[i].temp} &#8451`);
        var $humid = $('<div>');
        $humid.text(`Humidity: ${city.fiveDays[i].humidity} %`);
        $dayCardBody.append($cardTitle);
        $dayCardBody.append($cardIcon);
        $dayCardBody.append($temp);
        $dayCardBody.append($humid);
        $('#forecast-cards').append($dayCard);
    };
};

// function to filter 5-day forecast data at noon from array of forecast from HTTP response
function filterFiveDays(forecast){
    var fiveDayForecast = [];
    for (var i = 1; i < 6; i++) {
        var nextDay = forecast.filter(function(day){
            var nextDate = moment().add(i,'days').format('YYYY-MM-DD') + ' 12:00:00'; // get next date using moment.js
            if (!day.dt_txt) {
                // Some times there is no data for 12 noon for last day yet on openweather then get data for 9am
                nextDate = moment().add(i,'days').format('YYYY-MM-DD') + ' 09:00:00';
            };
            return day.dt_txt === nextDate; // filter out data at next day around noon time
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
};

// Function to save city weather and forecast info into local storage
function saveCityHistory(city){
    var history = loadSearchHistory();
    var indexOfExist = history.findIndex(element => element.name === city.name); // check if city already exist in history
    if (indexOfExist === -1) {
        history.unshift(Object.assign({}, city)); // make a clone of object to disonnect from next city objects
    } else {
        history[indexOfExist] = Object.assign({}, city); // Update existing city with new info
    }
    localStorage.setItem('searchHistory', JSON.stringify(history)); // save cities history to local storage
};

// Function to load search history list from local storage
function loadSearchHistory(){
    var history = JSON.parse(localStorage.getItem('searchHistory')); // load saved history from local storage
    if (!history) {
        history = []; // If there is no saved history then create empty array
    }
    return history;
};

// function to display search history on the page
function displaySearchHistory(){
    $('#searched-cities').empty();
    var history = loadSearchHistory();
    for (var i = 0; i < history.length; i++){
        var $cityListItem = $('<a href="" class="list-group-item list-group-item-action">');
        $cityListItem.text(history[i].name);
        $cityListItem.attr('data-index', i);
        $('#searched-cities').append($cityListItem);
    }
    return history.length;  // return number of cities saved in history
};

// function to load city weather and forecast from the search history
function loadCityWeatherHistory(i){
    var history = loadSearchHistory();
    var city = history[i];
    displayWeather(city);
    displayForecast(city);
    return city;
};

// Function to get last searched city from history and output forecast from saved or updated
function getLastCityWeather(){
    var history = loadSearchHistory();
    var city = history[0];
    if (!city) return // return if there is no city saved in history
    if (city.date === dateToday){
        loadCityWeatherHistory(0);
    } else {
        getCityWeather(city); // Get updated data if date is old
    };
};

});
