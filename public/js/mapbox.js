/* eslint-disable */


export const displayMap = (locations) => {
    
mapboxgl.accessToken = 'pk.eyJ1IjoiZGVjb3JkZSIsImEiOiJja2N5eWZtaW8wZW52MnNsaW9oa3JlcHRhIn0.gCg2MuxU6PQ4G7pzdKCL0w';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/decorde/ckcyz2hzn02k81ilivecyjvhs',
    // center: [ -86.833618,35.894892],
    // zoom: 7,
    // interactive:false 
    scrollZoom:false
});

const bounds = new mapboxgl.LngLatBounds();
locations.forEach(loc => {
    //create marjer
    const el = document.createElement('div');
    el.className= 'marker';
    //add marker to each coordinate
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom' //bottom of the marker is at the GPS position
    }).setLngLat(loc.coordinates).addTo(map);
//add popup
    new mapboxgl.Popup({
        offset: 30
    }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map)

    //extends map bounds to include current location
    bounds.extend(loc.coordinates);

});

map.fitBounds(bounds, {
    padding: {
        top: 200,
        bottom: 150,
        left:100, 
        right: 100
    }
});

}
