var menuBtn = document.querySelector(".main-nav__toggler span");
var menuBtnWrap = document.querySelector(".main-nav__toggler");
var menu = document.querySelector(".main-nav__list");

menuBtnWrap.classList.toggle("main-nav__toggler--active");
menu.classList.toggle("main-nav__list--visible");

menuBtn.addEventListener("click", function() {
  menuBtnWrap.classList.toggle("main-nav__toggler--active");
  menu.classList.toggle("main-nav__list--visible");
});

function initMap() {
  var mapContainer = document.querySelector(".contacts__map");
  var pink = {
    lat: 59.9387969,
    lng: 30.323
  };
  var mapOptions = {
    center: pink,
    zoom: 17,
    mapTypeControl: false
  };
  var map = new google.maps.Map(mapContainer, mapOptions);
  var markerIcon = {
    url: "../img/icon-map-marker.svg",
    scaledSize: new google.maps.Size(36, 36),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(18, 18)
  };
  var markerOptions = {
    position: pink,
    map: map,
    title: "Pink",
    optimized: false,
    icon: markerIcon
  };
  var marker = new google.maps.Marker(markerOptions);
}
