document.addEventListener('DOMContentLoaded', function() {
    // Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const body = document.body;

    sidebarToggle.addEventListener('click', () => {
        if (window.innerWidth > 992) {
            body.classList.toggle('sidebar-collapsed');
        } else {
            body.classList.toggle('sidebar-show');
        }
    });

    // Initialize Google Maps
    initMap();

    // Initialize Notifications
    initNotifications();
});

// Google Maps initialization
function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
        styles: [
            {
                featureType: "all",
                elementType: "geometry.fill",
                stylers: [{ weight: "2.00" }]
            },
            {
                featureType: "all",
                elementType: "geometry.stroke",
                stylers: [{ color: "#9c9c9c" }]
            },
            {
                featureType: "all",
                elementType: "labels.text",
                stylers: [{ visibility: "on" }]
            }
        ]
    });

    // Add markers for donation locations (example)
    const locations = [
        { lat: -34.397, lng: 150.644, title: "Donation Center A" },
        { lat: -34.395, lng: 150.642, title: "Restaurant B" },
        { lat: -34.399, lng: 150.646, title: "Emergency Location" }
    ];

    locations.forEach(location => {
        new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: map,
            title: location.title
        });
    });
}

// Notification System
function initNotifications() {
    let notificationCount = 3;
    const notificationBadge = document.querySelector('#notificationDropdown .badge');
    
    // Update notification count
    function updateNotificationCount(count) {
        notificationCount = count;
        notificationBadge.textContent = count;
        if (count === 0) {
            notificationBadge.style.display = 'none';
        } else {
            notificationBadge.style.display = 'block';
        }
    }

    // Example function to add a new notification
    window.addNotification = function(message) {
        const dropdown = document.querySelector('#notificationDropdown + .dropdown-menu');
        const li = document.createElement('li');
        li.innerHTML = `<a class="dropdown-item" href="#">${message}</a>`;
        dropdown.insertBefore(li, dropdown.firstChild);
        updateNotificationCount(notificationCount + 1);

        // Show notification toast
        showToast(message);
    }

    // Toast notification
    function showToast(message) {
        const toastContainer = document.createElement('div');
        toastContainer.style.position = 'fixed';
        toastContainer.style.top = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '1050';
        
        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.innerHTML = `
            <div class="toast-header">
                <strong class="me-auto">New Notification</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;
        
        toastContainer.appendChild(toast);
        document.body.appendChild(toastContainer);

        setTimeout(() => {
            toastContainer.remove();
        }, 5000);
    }

    // Example: Simulate new notifications
    setInterval(() => {
        const messages = [
            "New donation request received",
            "Emergency relief needed in Sector 4",
            "Donation completed successfully"
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        // Uncomment the line below to enable random notifications
        // addNotification(randomMessage);
    }, 30000);
} 