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

// Function to calculate Debris Index 
var calculateDebrisIndex = function(image) { 
  var debrisIndex = image.normalizedDifference(['B12', 'B11']).rename('Debris_Index'); 
  return image.addBands(debrisIndex);
};

// Download the Sentinel-2 imagery collection
var s2 = ee.ImageCollection('COPERNICUS/S2');
// var s2 = ee.ImageCollection('LANDSAT/LC08/C02/T1');

//Add layers to firstMap after filtering, sorting and calculating debris index
// Filter the collection by location, date boundaries and cloud cover percentage
var s2_a_filtered = s2.filterBounds(aoi)
.filterDate('2023-07-01','2023-11-20') //june 15
.filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 90);
print(s2_a_filtered)

// This will sort lowest cloud cover image first.
var sorted_a = s2_a_filtered.sort('CLOUDY_PIXEL_PERCENTAGE', true);
print(sorted_a)

// Pick the first image from the sorted and filtered collection
var image_a = ee.Image(sorted_a.first());
print(image_a)

// Define the visualisation parameters to display the image (change bands for different visualisations)
var vizParams = {
bands: ['B4', 'B3', 'B2'], //true color composite: it can be seen after switching off the debrisIndex layers.
min: 0,
max: 3000,
gamma: [1, 1, 1]
};

// calculate Debris index
var debrisIndex_a = calculateDebrisIndex(image_a);

// Add the layers to the firstMap.
var layer_before = firstMap.addLayer(image_a, vizParams, "Sentinel-2 before");
var debris_layer_before = firstMap.addLayer(debrisIndex_a.select('Debris_Index'), {min: -1, max: 1, palette: ['blue', 'white', 'red']}, 'Debris Index Before');
firstMap.addLayer(settlement, {}, "Settlement");
firstMap.setControlVisibility({layerList:true, drawingToolsControl: false, mapTypeControl: true, zoomControl: false});


// Add layers to another map ie. linkedMap which represent the after event.
// Filter the collection by location, date boundaries and cloud cover percentage
var s2_b_filtered = s2.filterBounds(aoi)
.filterDate('2024-08-20','2024-10-30')
.filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 30);
// This will sort lowest cloud cover image first.
var sorted_b = s2_b_filtered.sort('CLOUDY_PIXEL_PERCENTAGE', true);
// Pick the first image from the sorted and filtered collection
var image_b = ee.Image(sorted_b.first());

//Calculate debris index
var debrisIndex_b = calculateDebrisIndex(image_b);

// Add the after event image to the linked map - use same visualisation as defined for the before image
linkedMap.addLayer(image_b, vizParams, "Sentinel-2 after");
linkedMap.addLayer(debrisIndex_b.select('Debris_Index'), {min: -1, max: 1, palette: ['blue', 'white', 'red']}, 'Debris Index after');

// //Add polygon to visualize Settlement Area affected by GLOF
// var polygon = ee.FeatureCollection('projects/ee-upendra/assets/Settlement');
// // polygon.style({});
// firstMap.addLayer(polygon, {color: 'FF000009'}, 'Polygon Layer');


// Link the default Map to the other map.
var linker = ui.Map.Linker([firstMap, linkedMap]);
// Create a SplitPanel which holds the linked maps side-by-side.
var splitPanel = ui.SplitPanel({
// firstPanel: firstMap,
firstPanel:linker.get(1),
// secondPanel: linkedMap,
secondPanel: linker.get(0),
orientation: 'horizontal',
wipe: true,
// style: {stretch: 'both'}
});

//Add title of Map
var title = ui.Label({ 
  value: "Before After Map: GLOF Debris", 
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

firstMap.add(title);


// // Set the SplitPanel as the only thing in root.
ui.root.widgets().reset([splitPanel]);


// add Layer switcher in linkedMap. The current layerswitcher is hidden in the right side for after map.

// var imageList = linkedMap.layers();
// function addLayerSelector(mapToChange, defaultValue, position){
//   var label = ui.Label('Select Layers');
  
//   // function updateMap(selection){
//   //   print(firstMap.layers());
//   //   print(imageList[selection]);
//   //   mapToChange.layers().set(0, imageList[selection]);
//   // }
//   function updateMap(selection){ 
//     print(firstMap.layers()); 
//     print(imageList[selection]); 
//     // Check if the layer is already in the map's layer list 
//     var layerToAdd = imageList[selection]; 
//     var existingLayers = mapToChange.layers(); 
//     var layerExists = false; 
//     existingLayers.forEach(function(layer) { 
//         if (layer.getName() === layerToAdd.getName()) {
//           layerExists = true; 
//         } 
//     }); 
//     // Add the layer if it doesn't already exist 
//     if (!layerExists) { 
//       mapToChange.layers().set(0, layerToAdd); 
//     }
//     else { 
//       print('Layer is already present in the map.');
//     }
//   }
  
//   print(imageList[defaultValue])
//   var select = ui.Select({
//     items:Object.keys(imageList),
//     onChange: updateMap
//   })
  
//   select.setValue(Object.keys(imageList[defaultValue], true);
  
//   var controlPanel = ui.Panel({
//     widgets: [label, select],
//     style: {
//       position:position
//     }
//   });
  
//   mapToChange.add(controlPanel);
// }


// addLayerSelector(linkedMap, 0, 'top-left');


