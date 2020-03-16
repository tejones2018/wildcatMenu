var sheetUrl = 'https://docs.google.com/spreadsheets/d/1fNcmozRTi50b8wCD8HmowI8aMcisTKe5x-zwySbtO3c/edit?usp=sharing';
var dayMap = {
  sunday: 1722803715,
  monday: 0,
  tuesday: 1386833158,
  wednesday: 911054084,
  thursday: 263112150,
  friday: 539105075,
  saturday: 2061210025
};
var weekdayArray = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var monthArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

function getOrdinal(n) {
  var s=["th","st","nd","rd"],
    v=n%100;
  return n+(s[(v-20)%10]||s[v]||s[0]);
}

/*!
 * Group items from an array together by some criteria or value.
 * (c) 2019 Tom Bremmer (https://tbremer.com/) and Chris Ferdinandi (https://gomakethings.com), MIT License,
 * @param  {Array}           arr      The array to group items from
 * @param  {String|Function} criteria The criteria to group by
 * @return {Object}                   The grouped object
 */
var groupBy = function (arr, criteria) {
  return arr.reduce(function (obj, item) {

    // Check if the criteria is a function to run on the item or a property of it
    var key = typeof criteria === 'function' ? criteria(item) : item[criteria];

    // If the key doesn't exist yet, create it
    if (!obj.hasOwnProperty(key)) {
      obj[key] = [];
    }

    // Push the value to the object
    obj[key].push(item);

    // Return the object to the next item in the loop
    return obj;

  }, {});
};

function renderToday (data) {
  var date = new Date();
  var day = date.getDate();
  var weekday = weekdayArray[date.getDay()];
  var month = monthArray[date.getMonth()];
  // var todayString = weekday + ', ' + month + ' ' + getOrdinal(day);

  var groupedByStation = groupBy(data[weekday].elements, 'station_name');
  var menuData = Object.keys(groupedByStation).map(function(key) {
    return {
      name: key,
      menus: groupBy(groupedByStation[key], 'time of day')
    };
  });

  console.log(menuData);
  var menuHtml = dailyMenuHtml(menuData);
  var body = document.getElementById('main');
  body.innerHTML = menuHtml;
}

function dailyMenuHtml (menuData) {
  var text = '';

  menuData.forEach(function(station) {
    text += '<h4 class="text-bold px-16 pt-12 pb-4">' + station.name + '</h4>';
    Object.keys(station.menus).forEach(function(timeOfDay) {
      text += '<ul style="list-style-type:circle;">';
      if (timeOfDay !== 'All Day') {
        text += '<li class="list-header" style="list-style: none; margin-left: -1em;">' + timeOfDay + '</li>';
      }
      station.menus[timeOfDay].forEach(function(data) {

        text += '<li class="text-md" style="font-style: italic">' + data.dish + '</li>';
      });
      text += '</ul>';
    })
  });
  return text;
}

function init(callback) {
  Tabletop.init( { key: sheetUrl, callback: callback } );
}