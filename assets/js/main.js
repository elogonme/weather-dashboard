// What is the theme of the app?
// to get weather data and 5 day forcast of the city which was entered from user.
// When app starts I see Weather Dashboard.
// On the left input field and search button to enter and search city.
// Below input there is a history of search - clickable list of cities.
// On the right side the weather card for the city which was clicked or searched which shows the weather info now.
//  Below weather now card there is another 5 cards with 5 day forecast for that city.
// Then Current weather and 5 day forecast is displayed.
// The City name, the date, icon for current weather, temperature, humidity, wind speed, UV Index.
// When UV index is dipsplayed the color is according to conditions - favorable, moderate, or severe.
// The 5 day forecast shows datem icon for weather, temperature, and humidity.
// Search history is shown and when user clicks on city name in search the relevant weather data is shown.

$(document).ready(function(){

// Initialize app.

$('#search').on('click', function(event){
    event.preventDefault();
    $('#error').fadeOut();
    var city = $('#city').val();
    if (!city) return; // Guard if nothing is entered as city name
    console.log('called get weather')
    getCityWeather(city);
    
});

function getCityWeather(city){
    var dateToday = moment().format('dddd, MMMM Do, YYYY'); // get todays date using moment.js
    var hourNow = moment().format('H'); // get hour now using moment.js
    var apiKey = 'ff0f76a4c4d020f2b161d15988971e11';
    var endpoint = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`; // form API endpoint URL
    fetch(endpoint).then(function(response){
        if (response.ok){
            return response.json();
        }
        $('#error').fadeIn();
        throw new Error('Request failed');
    }).then(function(data){
        console.log(data);
    }).catch(function(err){
        console.log(err);
    })
};

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






