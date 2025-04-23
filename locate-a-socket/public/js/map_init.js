/**
 * map-init.js
 * Initializes the Leaflet map and basic map functionality
 */

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Check if map container exists on page
  const mapContainer = document.getElementById("map-container");
  if (!mapContainer) {
    console.error("Map container not found!");
    return;
  }

  console.log("Map container found, initializing map...");

  // Create map instance
  const map = L.map("map-container").setView([37.7749, -122.4194], 13);

  // Add OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Add marker for user's location (temporarily using default location)
  const userMarker = L.marker([37.7749, -122.4194], {
    icon: L.divIcon({
      className: "user-location-marker",
      html: '<div style="background-color:#4285F4; border-radius:50%; width:20px; height:20px; border:3px solid white;"></div>',
      iconSize: [20, 20],
    }),
  }).addTo(map);
  userMarker.isUserMarker = true;
  userMarker.bindPopup("Your location").openPopup();

  // Store the map instance globally for other scripts
  window.stationsMap = map;

  // Get user's location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const { latitude, longitude } = position.coords;
        console.log("User location:", latitude, longitude);

        // Update user marker and map view
        userMarker.setLatLng([latitude, longitude]);
        map.setView([latitude, longitude], 13);

        // Store user location for distance calculations
        window.userLocation = { lat: latitude, lng: longitude };

        // Fetch nearby stations
        fetchNearbyStations(latitude, longitude);
      },
      function (error) {
        console.error("Error getting location:", error);
        // Use default location and fetch stations
        window.userLocation = { lat: 37.7749, lng: -122.4194 };
        fetchNearbyStations(37.7749, -122.4194);
        M.toast({ html: "Using default location", classes: "orange" });
      }
    );
  } else {
    console.error("Geolocation not supported by this browser");
    // Use default location
    window.userLocation = { lat: 37.7749, lng: -122.4194 };
    fetchNearbyStations(37.7749, -122.4194);
  }
});
