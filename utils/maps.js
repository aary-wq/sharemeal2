const initMap = (mapElementId, defaultLocation = { lat: 20.5937, lng: 78.9629 }) => {
    const map = new google.maps.Map(document.getElementById(mapElementId), {
        center: defaultLocation,
        zoom: 12
    });
    return map;
};

const addMarker = (map, position, title = '') => {
    return new google.maps.Marker({
        position,
        map,
        title
    });
};

const geocodeAddress = async (address) => {
    const geocoder = new google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
            if (status === 'OK') {
                resolve(results[0].geometry.location);
            } else {
                reject(new Error('Could not find location'));
            }
        });
    });
};

module.exports = {
    initMap,
    addMarker,
    geocodeAddress
}; 