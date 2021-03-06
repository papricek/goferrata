import Ember from 'ember';

export default Ember.Controller.extend({
  centerLat: 46.87946,
  centerLng: 13.317000000000007,
  zoom: 8,

  actions: {
    centerMap: function(lat, lon) {
      this.setProperties({
        centerLat: lat,
        centerLng: lon
      });
    }
  }
});
