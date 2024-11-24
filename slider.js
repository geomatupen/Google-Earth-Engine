//This is the example of GLOF event which swept away Thame Village in Solukhumnbu District of Nepal. 

// Define an area of interest
var lat = 27.825674;
var lng = 86.621047;
var point = ee.Geometry.Point(lng, lat); //
var aoi = point.buffer(1000); // Create an area (1km buffer around point)

var settlement = ee.Geometry.Point(86.649995, 27.831373); //point of settlement affected by GLOF

//define two maps ui to show side by side.
var firstMap = ui.Map();
var linkedMap = ui.Map();

firstMap.setCenter(lng, lat, 14); // Center the map on this location, zoom level 14


// load the Sentinel-2 imagery collection
var s2 = ee.ImageCollection('COPERNICUS/S2');
// var s2 = ee.ImageCollection('LANDSAT/LC08/C02/T1');

//Add layers to firstMap after filtering, sorting and calculating debris index
// Filter the collection by location, date boundaries and cloud cover percentage
var s2_a_filtered = s2.filterBounds(aoi)
.filterDate('2022-10-20','2023-09-20')
.filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 20);
print(s2_a_filtered)

// This will sort lowest cloud cover image first.
var sorted_a = s2_a_filtered.sort('CLOUDY_PIXEL_PERCENTAGE', true);
print(sorted_a)

// Pick the first image from the sorted and filtered collection
var image_a = ee.Image(sorted_a.first());
// var image_a = ee.Image(sorted_a.median());
print(image_a)

// Define the visualisation parameters to display the image (change bands for different visualisations)
var vizParams = {
bands: ['B4', 'B3', 'B2'], //true color composite: it can be seen after switching off the Index layers.
min: 0,
max: 3000,
gamma: [1, 1, 1]
};
// Add the layers to the firstMap.
var layer_before = firstMap.addLayer(image_a, vizParams, "Sentinel-2 before");

var palette_ndwi = ['red', 'white', 'blue'];
var palette_debris = ['red', 'white', 'blue'];

// calculate NDWI/ Debris Index
var index_a = image_a.normalizedDifference(['B3', 'B8']).rename('index_a'); //NDWI
// var index_a = image_a.normalizedDifference(['B12', 'B11']).rename('index_a'); //Debris Index

firstMap.addLayer(
  index_a.select('index_a'), 
  {min: -1, 
  max: 1, 
  palette: palette_ndwi
  // palette: palette_debris,
  }, 
  'Normalized Index Before'
);

// Add layers to another map ie. linkedMap which represent the after event.
// Filter the collection by location, date boundaries and cloud cover percentage
var s2_b_filtered = s2.filterBounds(aoi)
.filterDate('2024-08-20','2024-10-30')
.filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 20);
// This will sort lowest cloud cover image first.
var sorted_b = s2_b_filtered.sort('CLOUDY_PIXEL_PERCENTAGE', true);
// Pick the first image from the sorted and filtered collection
var image_b = ee.Image(sorted_b.first());
print(image_b);


// var index_b = image_b.normalizedDifference(['B12', 'B11']).rename('index_b'); //Debris Index
var index_b = image_b.normalizedDifference(['B3', 'B8']).rename('index_b'); //NDWI

// Add the after event image to the linked map - use same visualisation as defined for the before image
linkedMap.addLayer(image_b, vizParams, "Sentinel-2 after");
linkedMap.addLayer(
  index_b.select('index_b'), 
  {min: -1, 
  max: 1, 
  palette: palette_ndwi
  // palette: palette_debris
  }, 
  'Normalized Index After'
);

// //Add polygon to visualize Settlement Area affected by GLOF
// var polygon = ee.FeatureCollection('projects/ee-upendra/assets/Settlement');
// // polygon.style({});
// firstMap.addLayer(polygon, {color: 'FF000009'}, 'Polygon Layer');


// Link the default Map to the other map.
var linker = ui.Map.Linker([firstMap, linkedMap]);
// Create a SplitPanel which holds the linked maps side-by-side.
var splitPanel = ui.SplitPanel({
// firstPanel: firstMap,
firstPanel:linker.get(0),
// secondPanel: linkedMap,
secondPanel: linker.get(1),
orientation: 'horizontal',
wipe: true,
// style: {stretch: 'both'}
});

//Add title of Map
var title = ui.Label({ 
  value: "Before After Map: GLOF Event", 
  style: { 
    fontSize: '16px', 
    fontWeight: 'bold', 
    textAlign: 'left', 
    color: 'black', 
    backgroundColor: 'white', 
    stretch: 'horizontal',
    margin: '10px 0 0 300px'
  } 
}); // Add the title label to the map Map.add(title);

linkedMap.add(title);


// // Set the SplitPanel as the only thing in root.
ui.root.widgets().reset([splitPanel]);

linkedMap.addLayer(settlement, {color: 'red'}, "Settlement Point")

