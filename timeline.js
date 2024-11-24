//This is the example of GLOF event which swept away Thame Village in Solukhumnbu District of Nepal. 

// Define an area of interest
var lat = 27.825674;
var lng = 86.621047;
var point = ee.Geometry.Point(lng, lat); //
var aoi = point.buffer(1000); // Create an area (1km buffer around point)

Map.setCenter(lng, lat, 14); // Center the map on this location, zoom level 14


// uncomment the section below to see the timeline in firstmap


var collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED').filterBounds(aoi);
// var collection = ee.ImageCollection('LANDSAT/LC08/C02/T1');

var start = ee.Image(collection).date().get('year').format();
var now = Date.now();
var end = ee.Date(now).format();
// Use the start of the collection and now to bound the slider.
var start = ee.Image(collection.first()).date().get('year').format();
var now = Date.now();
var end = ee.Date(now).format();

// Run this function on a change of the dateSlider.
var showMosaic = function(range) {
  // var mosaic = ee.Algorithms.Landsat.simpleComposite({
  //   collection: collection.filterDate(range.start(), range.end())
  // });
  
  var s2_ = collection.filterBounds(aoi)
  .filterDate(range.start(), range.end())
  .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 20);
  print(s2_)
  
  // var median = s2_.min(); 

  var mosaic = s2_.mosaic();
  print(mosaic);
  // Asynchronously compute the name of the composite.  Display it.
  range.start().get('year').evaluate(function(name) {
    var visParams = {bands: ['B4', 'B3', 'B2'], max: 1000};
    var layer = ui.Map.Layer(mosaic, visParams, name + ' composite');
    Map.layers().set(0, layer);
  });
};

// Asynchronously compute the date range and show the slider.
var dateRange = ee.DateRange(start, end).evaluate(function(range) {
  var dateSlider = ui.DateSlider({
    start: range['dates'][0],
    end: range['dates'][1],
    value: null,
    period: 365,
    onChange: showMosaic,
    style: {width: '180px'}
  });
  Map.add(dateSlider.setValue(now));
});
