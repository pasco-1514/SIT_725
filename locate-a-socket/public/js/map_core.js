/**
 * map-core.js
 * Contains core map functionality and utilities
 */

/**
 * Calculate distance between two geographical coordinates
 * @param {number} lat1 - First point latitude
 * @param {number} lon1 - First point longitude
 * @param {number} lat2 - Second point latitude (defaults to user location)
 * @param {number} lon2 - Second point longitude (defaults to user location)
 * @returns {string} Distance in kilometers, formatted to 1 decimal place
 */
function getDistance(lat1, lon1, lat2, lon2) {
  // Use provided coordinates or get user's location
  if (lat2 === undefined) lat2 = window.userLocation.lat;
  if (lon2 === undefined) lon2 = window.userLocation.lng;

  // If coordinates are the same, return 0
  if (lat1 === lat2 && lon1 === lon2) return 0;

  // Convert degrees to radians
  const radLat1 = (Math.PI * lat1) / 180;
  const radLat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radTheta = (Math.PI * theta) / 180;

  // Calculate distance
  let dist =
    Math.sin(radLat1) * Math.sin(radLat2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta);
  // Fix: Ensure dist is not greater than 1 to avoid NaN
  dist = Math.min(dist, 1);
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515 * 1.609344; // Convert to kilometers

  return dist.toFixed(1);
}

/**
 * Apply filters to stations based on active filter chips
 */
function applyFilters() {
  const activeFilters = [];
  document.querySelectorAll(".filter-chip.active").forEach((chip) => {
    activeFilters.push(chip.getAttribute("data-filter"));
  });

  // If no filters active, show all stations
  if (activeFilters.length === 0) {
    document.querySelectorAll(".collection-item").forEach((item) => {
      item.style.display = "block";
    });
    return;
  }

  console.log("Active filters:", activeFilters);

  // Filter the station list based on active filters
  document.querySelectorAll(".collection-item").forEach((item) => {
    const stationId = item
      .querySelector(".station-details")
      ?.getAttribute("data-station-id");
    if (!stationId) return;

    // Get station data
    const station = window.stations.find((s) => s._id === stationId);
    if (!station) return;

    let matchesFilter = false;

    // Check if station matches any active filter
    activeFilters.forEach((filter) => {
      switch (filter) {
        case "fast":
          if (
            station.connectors &&
            station.connectors.some((c) => c.power >= 50)
          )
            matchesFilter = true;
          break;
        case "free":
          if (
            station.cost === "$0.00/kWh" ||
            (station.cost && station.cost.includes("Free"))
          )
            matchesFilter = true;
          break;
        case "ccs":
          if (
            station.connectors &&
            station.connectors.some((c) => c.type === "CCS")
          )
            matchesFilter = true;
          break;
        case "chademo":
          if (
            station.connectors &&
            station.connectors.some((c) => c.type === "CHAdeMO")
          )
            matchesFilter = true;
          break;
        case "type2":
          if (
            station.connectors &&
            station.connectors.some((c) => c.type === "Type2")
          )
            matchesFilter = true;
          break;
        case "available":
          if (station.status === "available") matchesFilter = true;
          break;
      }
    });

    // Show or hide based on filter match
    item.style.display = matchesFilter ? "block" : "none";
  });
}

/**
 * Setup event listeners for filters and search
 */
function setupEventListeners() {
  // Add event listeners for filter chips
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", function () {
      this.classList.toggle("active");
      // Apply filters based on active chips
      applyFilters();
    });
  });

  // Add event listener for radius select
  const radiusSelect = document.getElementById("radius_select");
  if (radiusSelect) {
    radiusSelect.addEventListener("change", function () {
      const radius = parseInt(this.value);
      fetchNearbyStations(
        window.userLocation.lat,
        window.userLocation.lng,
        radius
      );
    });
  }

  // Add event listener for search button
  const searchBtn = document.getElementById("search-btn");
  if (searchBtn) {
    searchBtn.addEventListener("click", function () {
      const searchInput = document.getElementById("search_location");
      if (!searchInput || !searchInput.value.trim()) {
        M.toast({
          html: "Please enter a location to search",
          classes: "orange",
        });
        return;
      }

      // In a real app, you would geocode the search input
      // For demo purposes, just show a toast
      M.toast({
        html: `Searching for "${searchInput.value}" (Demo)`,
        classes: "blue",
      });
    });
  }
}

/**
 * Display stations on the map
 * @param {Array} stations - Array of station objects
 */
function displayStationsOnMap(stations) {
  const map = window.stationsMap;
  if (!map) return;

  // Clear existing station markers
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker && !layer.isUserMarker) {
      map.removeLayer(layer);
    }
  });

  // Create markers for each station
  stations.forEach((station) => {
    // Fix: Add null check for location
    if (!station.location || !station.location.coordinates) return;

    const location = station.location.coordinates;
    const lat = location[1];
    const lng = location[0];

    // Skip invalid coordinates
    if (!lat || !lng) return;

    // Create marker with appropriate color based on status
    const statusColor =
      station.status === "available"
        ? "green"
        : station.status === "busy"
        ? "orange"
        : "red";

    const marker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: `station-marker ${statusColor}-marker`,
        html: `<div style="background-color:${statusColor}; border-radius:50%; width:14px; height:14px; border:2px solid white;"></div>`,
        iconSize: [14, 14],
      }),
    }).addTo(map);

    // Fix: Add null check for connectors
    const connectors = station.connectors || [];
    const availablePoints = connectors.reduce(
      (sum, connector) => sum + (connector.available || 0),
      0
    );
    const totalPoints = connectors.reduce(
      (sum, connector) => sum + (connector.count || 0),
      0
    );

    // Create popup for the marker
    marker.bindPopup(`
      <div class="popup-content">
        <h6>${station.name}</h6>
        <p>${station.address}</p>
        <p>${getDistance(lat, lng)} km away</p>
        <p class="${statusColor}-text">
          <i class="material-icons tiny">circle</i> 
          ${
            station.status === "available"
              ? `Available (${availablePoints}/${totalPoints})`
              : station.status === "busy"
              ? `Busy (${availablePoints}/${totalPoints})`
              : "Offline"
          }
        </p>
        <button class="btn-small waves-effect waves-light view-details" 
                onclick="showStationDetails('${station._id}')">
          <i class="material-icons left">info</i>Details
        </button>
      </div>
    `);
  });
}
