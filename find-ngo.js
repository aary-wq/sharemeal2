// Make showOnMap function globally accessible
window.showOnMap = function(ngoId) {
    const ngo = ngos.find(n => n.id === ngoId);
    if (!ngo) return;

    // Clear existing active info windows
    if (activeInfoWindow) {
        activeInfoWindow.close();
    }

    // Center map on NGO location
    map.setCenter(ngo.coordinates);
    map.setZoom(15);

    // Create and open info window
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div class="map-info-window">
                <h4>${ngo.name}</h4>
                <p>${ngo.location}</p>
                <p>${ngo.contact}</p>
            </div>
        `
    });

    const marker = markers.find(m => m.ngoId === ngoId);
    infoWindow.open(map, marker);
    activeInfoWindow = infoWindow;
};

document.addEventListener('DOMContentLoaded', function() {
    // Sample NGO data - Replace with your actual data/API
    const ngos = [
        {
            id: 1,
            name: "Food Bank Foundation",
            location: "123 Main St, City",
            contact: "+1 234-567-8900",
            email: "contact@foodbank.org",
            types: ["food", "money"],
            coordinates: { lat: YOUR_LAT, lng: YOUR_LNG }
        },
        // Add more NGO data...
    ];

    let map;
    let markers = [];
    let activeInfoWindow = null;

    // Initialize Google Map
    function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: { lat: YOUR_DEFAULT_LAT, lng: YOUR_DEFAULT_LNG },
            styles: [/* Your custom map styles */]
        });
    }

    // Create NGO card
    function createNGOCard(ngo) {
        return `
            <div class="col-md-6" data-types="${ngo.types.join(' ')}">
                <div class="ngo-card">
                    <h3>${ngo.name}</h3>
                    <div class="ngo-info">
                        <p><i class="bi bi-geo-alt"></i>${ngo.location}</p>
                        <p><i class="bi bi-telephone"></i>${ngo.contact}</p>
                        <p><i class="bi bi-envelope"></i>${ngo.email}</p>
                    </div>
                    <div class="donation-types">
                        ${ngo.types.map(type => 
                            `<span class="donation-type">${type === 'food' ? 'Food Donation' : 'Money Donation'}</span>`
                        ).join('')}
                    </div>
                    <div class="ngo-actions">
                        <button class="view-map-btn" onclick="showOnMap(${ngo.id})">
                            View on Map
                        </button>
                        <a href="donate.html?ngo=${ngo.id}" class="btn btn-primary mt-2 w-100">
                            Donate to this NGO
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // Filter NGOs
    function filterNGOs() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const activeFilter = document.querySelector('.btn-filter.active').dataset.filter;

        document.querySelectorAll('#ngoList .col-md-6').forEach(card => {
            const ngoName = card.querySelector('h3').textContent.toLowerCase();
            const ngoLocation = card.querySelector('.ngo-info p').textContent.toLowerCase();
            const ngoTypes = card.dataset.types.split(' ');

            const matchesSearch = ngoName.includes(searchTerm) || ngoLocation.includes(searchTerm);
            const matchesFilter = activeFilter === 'all' || ngoTypes.includes(activeFilter);

            card.style.display = matchesSearch && matchesFilter ? 'block' : 'none';
        });
    }

    // Initialize the page
    function init() {
        // Initialize map
        initMap();

        // Render NGO cards
        const ngoList = document.getElementById('ngoList');
        ngoList.innerHTML = ngos.map(createNGOCard).join('');

        // Add markers to map
        ngos.forEach(ngo => {
            const marker = new google.maps.Marker({
                position: ngo.coordinates,
                map: map,
                title: ngo.name,
                ngoId: ngo.id
            });
            markers.push(marker);

            marker.addListener('click', () => showOnMap(ngo.id));
        });

        // Add event listeners
        document.getElementById('searchInput').addEventListener('input', filterNGOs);
        
        document.querySelectorAll('.btn-filter').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelector('.btn-filter.active').classList.remove('active');
                this.classList.add('active');
                filterNGOs();
            });
        });
    }

    init();
}); 