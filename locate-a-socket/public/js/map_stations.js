/**
 * map-stations.js
 * Handles station data fetching, modal creation, and station list rendering
 */

/**
 * Fetch nearby charging stations
 * @param {number} lat - Latitude coordinate
 * @param {number} lng - Longitude coordinate
 * @param {number} radius - Search radius in kilometers (optional)
 */
function fetchNearbyStations(lat, lng, radius = 10) {
  // Show loading state
  document.querySelector(".collection").innerHTML = `
    <li class="collection-item center-align">
      <div class="preloader-wrapper small active">
        <div class="spinner-layer spinner-green-only">
          <div class="circle-clipper left"><div class="circle"></div></div>
          <div class="gap-patch"><div class="circle"></div></div>
          <div class="circle-clipper right"><div class="circle"></div></div>
        </div>
      </div>
      <p>Loading stations...</p>
    </li>
  `;

  // Fetch data from API
  fetch(`/api/stations/nearby?lat=${lat}&lng=${lng}&radius=${radius}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((stations) => {
      // Store stations globally for filtering
      window.stations = stations;

      // Update station count
      const countElement = document.getElementById("station-count");
      if (countElement) {
        countElement.textContent = stations.length;
      }

      // Display stations on map
      displayStationsOnMap(stations);

      // Update station list
      updateStationList(stations);

      // Set up event listeners
      setupEventListeners();
    })
    .catch((error) => {
      console.error("Error fetching stations:", error);

      // Show error in the collection
      document.querySelector(".collection").innerHTML = `
        <li class="collection-item center-align red-text">
          <i class="material-icons medium">error</i>
          <p>Error loading stations. Using sample data.</p>
        </li>
      `;

      // Show error toast
      M.toast({
        html: "Error loading stations. Using sample data.",
        classes: "red",
      });

      // Use sample data as fallback
      useSampleStations(lat, lng);
    });
}

/**
 * Use sample stations for development or when API fails
 * @param {number} lat - Latitude coordinate
 * @param {number} lng - Longitude coordinate
 */
function useSampleStations(lat, lng) {
  const sampleStations = [
    {
      _id: "1",
      name: "Central City Charging",
      address: "123 Main St, Downtown",
      location: {
        type: "Point",
        coordinates: [lng + 0.01, lat + 0.01],
      },
      connectors: [
        { type: "CCS", power: 150, count: 4, available: 3 },
        { type: "CHAdeMO", power: 50, count: 2, available: 1 },
      ],
      amenities: {
        restroom: true,
        food: true,
        wifi: true,
        shopping: false,
      },
      network: "ChargeCo",
      status: "available",
      cost: "$0.35/kWh",
      averageRating: 4.5,
      lastUpdated: new Date(),
    },
    {
      _id: "2",
      name: "Westside Mall Charging",
      address: "456 Market Ave, Westside",
      location: {
        type: "Point",
        coordinates: [lng - 0.01, lat + 0.005],
      },
      connectors: [
        { type: "CCS", power: 50, count: 4, available: 1 },
        { type: "Type2", power: 22, count: 3, available: 0 },
      ],
      amenities: {
        restroom: true,
        food: true,
        wifi: true,
        shopping: true,
      },
      network: "EVgo",
      status: "busy",
      cost: "$0.40/kWh",
      averageRating: 3.8,
      lastUpdated: new Date(),
    },
    {
      _id: "3",
      name: "Eastside Parking Chargers",
      address: "789 East St, Eastside",
      location: {
        type: "Point",
        coordinates: [lng + 0.02, lat - 0.01],
      },
      connectors: [
        { type: "CCS", power: 50, count: 2, available: 0 },
        { type: "Type2", power: 22, count: 4, available: 0 },
      ],
      amenities: {
        restroom: false,
        food: false,
        wifi: false,
        shopping: false,
      },
      network: "ChargePoint",
      status: "offline",
      cost: "$0.30/kWh",
      averageRating: 3.2,
      lastUpdated: new Date(),
    },
  ];

  // Store stations globally for filtering
  window.stations = sampleStations;

  // Update station count
  const countElement = document.getElementById("station-count");
  if (countElement) {
    countElement.textContent = sampleStations.length;
  }

  // Display stations on map
  displayStationsOnMap(sampleStations);

  // Update station list
  updateStationList(sampleStations);

  // Set up event listeners
  setupEventListeners();
}

/**
 * Show station details modal
 * @param {string} stationId - Station ID
 */
function showStationDetails(stationId) {
  // Find the station in the global stations array
  const station = window.stations.find((s) => s._id === stationId);

  if (!station) {
    console.error("Station not found:", stationId);
    M.toast({ html: "Station details not available", classes: "red" });
    return;
  }

  // Create modal ID
  const modalId = `station-modal-${stationId}`;

  // Check if modal already exists
  let modal = document.getElementById(modalId);

  if (!modal) {
    // Create modal if it doesn't exist
    modal = document.createElement("div");
    modal.id = modalId;
    modal.className = "modal modal-fixed-footer";

    // Fix: Add null check for connectors
    const connectors = station.connectors || [];
    const connectorsList = connectors
      .map(
        (connector) =>
          `<div class="chip">${connector.type} - ${connector.power}kW (${connector.available}/${connector.count})</div>`
      )
      .join("");

    const amenitiesList = [];
    // Fix: Add null check for amenities
    const amenities = station.amenities || {};
    if (amenities.restroom)
      amenitiesList.push(
        '<div class="chip"><i class="material-icons left">wc</i>Restroom</div>'
      );
    if (amenities.food)
      amenitiesList.push(
        '<div class="chip"><i class="material-icons left">local_cafe</i>Food</div>'
      );
    if (amenities.wifi)
      amenitiesList.push(
        '<div class="chip"><i class="material-icons left">wifi</i>WiFi</div>'
      );
    if (amenities.shopping)
      amenitiesList.push(
        '<div class="chip"><i class="material-icons left">shopping_cart</i>Shopping</div>'
      );

    modal.innerHTML = `
      <div class="modal-content">
        <h4>${station.name}</h4>
        
        <div class="row">
          <div class="col s12">
            <!-- Station Details -->
            <div class="section">
              <h5>Details</h5>
              <div class="row">
                <div class="col s12 m6">
                  <p><i class="material-icons tiny">location_on</i> <strong>Address:</strong> ${
                    station.address
                  }</p>
                  <p><i class="material-icons tiny">access_time</i> <strong>Hours:</strong> 24/7</p>
                  <p><i class="material-icons tiny">attach_money</i> <strong>Cost:</strong> ${
                    station.cost || "Not specified"
                  }</p>
                  <p><i class="material-icons tiny">power</i> <strong>Connector Types:</strong></p>
                  <div>${
                    connectorsList || "No connector information available"
                  }</div>
                </div>
                <div class="col s12 m6">
                  <p><i class="material-icons tiny">speed</i> <strong>Power:</strong> Up to ${Math.max(
                    ...(connectors.map((c) => c.power) || [0])
                  )} kW</p>
                  <p><i class="material-icons tiny">business</i> <strong>Network:</strong> ${
                    station.network || "Not specified"
                  }</p>
                  <p><i class="material-icons tiny">today</i> <strong>Last Updated:</strong> ${new Date(
                    station.lastUpdated
                  ).toLocaleString()}</p>
                  <p><i class="material-icons tiny">star</i> <strong>Rating:</strong> ${
                    station.averageRating || "No ratings"
                  }/5</p>
                </div>
              </div>
            </div>
            
            <!-- Amenities -->
            <div class="section">
              <h5>Amenities</h5>
              ${amenitiesList.join("") || "No amenities listed"}
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <a href="#!" class="modal-close waves-effect waves-light btn-flat">Close</a>
        <a href="#!" class="waves-effect waves-light btn">
          <i class="material-icons left">directions</i>Navigate
        </a>
        <a href="#!" class="waves-effect waves-light btn">
          <i class="material-icons left">bookmark</i>Save
        </a>
      </div>
    `;

    document.body.appendChild(modal);
  }

  // Initialize and open the modal
  const modalInstance = M.Modal.init(modal);
  modalInstance.open();
}

/**
 * Update the station list sidebar
 * @param {Array} stations - Array of station objects
 */
function updateStationList(stations) {
  const stationList = document.querySelector(".collection");
  if (!stationList) return;

  // Clear existing list
  stationList.innerHTML = "";

  if (stations.length === 0) {
    stationList.innerHTML = `
      <li class="collection-item center-align">
        <p>No stations found in this area.</p>
      </li>
    `;
    return;
  }

  // Add stations to the list
  stations.forEach((station) => {
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

    const statusClass =
      station.status === "available"
        ? "green-text"
        : station.status === "busy"
        ? "orange-text"
        : "red-text";

    const statusText =
      station.status === "available"
        ? `Available (${availablePoints}/${totalPoints})`
        : station.status === "busy"
        ? `Busy (${availablePoints}/${totalPoints})`
        : "Offline";

    // Fix: Add null check for location
    const location =
      station.location && station.location.coordinates
        ? station.location.coordinates
        : [0, 0];

    const distance = getDistance(
      location[1],
      location[0],
      window.userLocation.lat,
      window.userLocation.lng
    );

    const li = document.createElement("li");
    li.className = "collection-item avatar";
    li.innerHTML = `
      <i class="material-icons circle ${
        station.status === "available"
          ? "green"
          : station.status === "busy"
          ? "orange"
          : "red"
      }">ev_station</i>
      <span class="title"><strong>${station.name}</strong></span>
      <p>${distance} km away<br>
        <span class="${statusClass}">
          <i class="material-icons tiny">circle</i> ${statusText}
        </span>
      </p>
      <div class="secondary-content">
        <a href="#!" class="btn-floating btn-small waves-effect waves-light station-details" data-station-id="${
          station._id
        }">
          <i class="material-icons">info</i>
        </a>
      </div>
    `;

    stationList.appendChild(li);

    // Add click event to view station details
    li.querySelector(".station-details").addEventListener("click", () => {
      showStationDetails(station._id);
    });
  });
}

// Make functions globally available
window.showStationDetails = showStationDetails;
