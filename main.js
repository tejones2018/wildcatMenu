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

function groupWeekdayMenus(data, weekday) {
  var groupedByStation = groupBy(data[weekday].elements, 'station_name');
  var menuData = Object.keys(groupedByStation).map(function(key) {
    return {
      name: key,
      menus: groupBy(groupedByStation[key], 'time of day')
    };
  });
  return menuData;
}

function renderToday (data) {
  var date = new Date();
  var weekday = weekdayArray[date.getDay()];
  var menuData = groupWeekdayMenus(data, weekday);
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


function renderWeekly (data) {
  var date = new Date();
  var today = weekdayArray[date.getDay()];

  var weekdayMenus = Object.keys(data).map(function(sheetName) {
    if (weekdayArray.indexOf(sheetName) > -1) {
      return {
        day: sheetName,
        index: weekdayArray.indexOf(sheetName),
        stations: groupWeekdayMenus(data, sheetName)
      }
    } else {
      return false;
    }
  }).filter(function(menuData) {
    return menuData !== false;
  }).sort(function(a, b) {
    return a.index > b.index ? 1 : -1;
  });
  // console.log(weekdayMenus);

  var weeklyHtml = weekdayMenus.map(function(menuData) {
    return weeklyMenuHtml(menuData);
  }).join('');

  document.getElementById('weeklyMenuTabContent').innerHTML = weeklyHtml;

  var navTabHtml = weekdayArray.map(function(day) {
    var active = today === day;
    return '<li class="nav-item">' +
      '<a class="nav-link ' + (active ? 'active' : '') + '" id="' + day + '-tab" data-toggle="tab" href="#' + day + 'Menu" role="tab" ' +
        'aria-controls="' + day + 'Menu" ' + (active ? 'aria-selected="true"' : '') + '>' + day + '</a>' +
      '</li>'
  }).join('');

  document.getElementById('weeklyMenuTabs').innerHTML = navTabHtml;
}

function weeklyMenuHtml(data){
  var date = new Date();
  var active = date.getDay() === data.index;
  var text = '<div class="tab-pane fade ' + (active ? 'show active' : '') + '" id="' + data.day + 'Menu" role="tabpanel" aria-labelledby="' + data.day+ '-tab">';
  text += '<div class="row"><div class="col text-center p-3"><p class="h4">' + data.day + '</p></div></div>';
  text += '<div class="row">';

  data.stations.forEach(function(station) {
    text += '<div class="col-12 col-sm-6 col-lg-4 pt-3"><div class="card"><div class="card-header">' + station.name + '</div><div class="card-body">';
    Object.keys(station.menus).forEach(function(timeOfDay) {
      if (timeOfDay !== 'All Day') {
        text += '<p class="h5 cart-title">' + timeOfDay + '</p>';
      }
      text += '<ul class="list-unstyled">';
      station.menus[timeOfDay].forEach(function(data) {
        text += '<li style="font-style: italic">' + data.dish + '</li>';
      });
      text += '</ul>';
    });
    text += '</div></div></div>';
  });

  text += '</div></div>';

  return text;
}

function init(callback) {
  Tabletop.init( { key: sheetUrl, callback: callback } );
}