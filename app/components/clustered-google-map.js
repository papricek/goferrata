/* globals MarkerClusterer, google */
import Ember from 'ember';
import GoogleMapComponent from './google-map';

var activeInfo = null;
function makeHandler(latLng, info, map, slug, context) {
  return function() {
    if(activeInfo) {
      activeInfo.close(map);
    }

    info.setPosition(latLng);
    map.panTo(latLng);
    info.open(map);
    activeInfo = info;

    if(context) {
      context.sendAction('action', slug);
    }
  };
}

export default GoogleMapComponent.extend({
  action: 'windowOpened',
  currentDifficulties: null,
  heightMin: null,
  heightMax: null,
  durationMin: null,
  durationMax: null,
  clusterer: null,
  markerViewClass: 'ferrata-map-marker',
  markerController: 'ferratas/marker',
  markerInfoWindowTemplateName: 'map/info-window',
  type: 'terrain',

  /**
   * Initialize the map
   */
  initGoogleMap: Ember.on('didInsertElement', function () {
    this._super();

    var mcOptions = {gridSize: 50, maxZoom: 10};
    this.clusterer = new MarkerClusterer(this.googleObject, [], mcOptions);
    this.initMarkers();
  }),

  initMarkers: function() {
    var newMarkers = [];
    var clusterer = this.clusterer;
    var index;

    for (index = 0; index < this.markers.length; ++index) {
      var marker = this.markers[index];
      var durationInHours = parseInt((marker["duration"] / 60)).toString() + ':' + parseInt((marker["duration"] % 60)).toString();

      // filter difficulty
      if(this.currentDifficulties.length > 0) {
        if(!this.currentDifficulties.contains(marker.difficulty)) {continue;}
      }

      if(this.heightMin) {
        if(marker.height < this.heightMin) {continue;}
      }

      if(this.heightMax) {
        if(marker.height > this.heightMax) {continue;}
      }

      if(this.durationMin) {
        if(marker.duration < this.durationMin * 60) {continue;}
      }

      if(this.durationMax) {
        if(marker.duration > this.durationMax * 60) {continue;}
      }

      var latLng = new google.maps.LatLng(marker.lat, marker.lng);

      var googleMarker = new google.maps.Marker({
        position: latLng,
        title: marker.name + ' (' + marker.height + 'm)'
      });

      var googleInfoWindow = new google.maps.InfoWindow({
        pixelOffset: {width: 0, height: -40},
        content: "<div class='ferrata'>" +
          "<h4>" + marker.name + "</h4>"+
          "<dl class='dl-horizontal'>" +
          "<dt>State</dt><dd>" + marker.state + "</dd>" +
          "<dt>Region</dt><dd>" + marker.region + "</dd>" +
          "<dt>Locality</dt><dd>" + marker.locality + "</dd>" +
          "<dt>Coords</dt><dd>" + marker.lat + " " + marker.lng + "</dd>" +
          "<dt>Begin</dt><dd>" + marker.begin + "</dd>" +
          "<dt>Target</dt><dd>" + marker.height + "m</dd>" +
          "<dt>Duration</dt><dd>" + durationInHours + "h</dd>" +
          "<dt>Difficulty</dt><dd>("+marker.difficulty+")</dd>" +
          "<dt>Link</dt><dd><a target='_blank' href='http://klettersteig.de/klettersteig/"+ marker.link +"'>klettersteig.de</a></dd>" +
          "</dl>" +
          "</div>"
      });

      google.maps.event.addListener(googleMarker, 'click', makeHandler(latLng, googleInfoWindow, clusterer.getMap(), marker.slug, this));

      if(marker.active) {
        makeHandler(latLng, googleInfoWindow, clusterer.getMap())();
      }

      newMarkers.push(googleMarker);
    }

    clusterer.clearMarkers();
    clusterer.addMarkers(newMarkers);
  }.observes('currentDifficulties.[]', 'heightMin', 'heightMax', 'durationMin', 'durationMax')
});
