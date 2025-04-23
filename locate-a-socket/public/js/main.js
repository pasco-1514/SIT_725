// Main JavaScript file for Locate a Socket application

document.addEventListener("DOMContentLoaded", function () {
  // Initialize Materialize CSS components
  initializeMaterialize();

  // Initialize page-specific features
  initializePageFeatures();
});

// Initialize Materialize CSS components
function initializeMaterialize() {
  // Initialize sidenav for mobile
  const sidenav = document.querySelectorAll(".sidenav");
  M.Sidenav.init(sidenav);

  // Initialize dropdowns
  const dropdowns = document.querySelectorAll(".dropdown-trigger");
  M.Dropdown.init(dropdowns);

  // Initialize modals
  const modals = document.querySelectorAll(".modal");
  M.Modal.init(modals);

  // Initialize select elements
  const selects = document.querySelectorAll("select");
  M.FormSelect.init(selects);

  // Initialize tabs
  const tabs = document.querySelectorAll(".tabs");
  M.Tabs.init(tabs);

  // Initialize tooltips
  const tooltips = document.querySelectorAll(".tooltipped");
  M.Tooltip.init(tooltips);

  // Initialize collapsibles
  const collapsibles = document.querySelectorAll(".collapsible");
  M.Collapsible.init(collapsibles);
}

// Initialize page-specific features
function initializePageFeatures() {
  // Check current page
  const currentPath = window.location.pathname;

  if (currentPath === "/" || currentPath === "/index") {
    // Home page specific initializations
    initHomePage();
  } else if (currentPath === "/map") {
    // Map page specific initializations
    initMapPage();
  } else if (currentPath === "/profile") {
    // Profile page specific initializations
    initProfilePage();
  }
}

// Home page specific initializations
function initHomePage() {
  console.log("Home page initialized");

  // Animate ScrollReveal for feature cards if library is loaded
  if (typeof ScrollReveal !== "undefined") {
    const sr = ScrollReveal();
    sr.reveal(".feature-card", {
      duration: 1000,
      origin: "bottom",
      distance: "20px",
      delay: 200,
      interval: 100,
    });
  }
}

// Map page specific initializations
function initMapPage() {
  console.log("Map page initialized");

  // Check if we're using the new map implementation
  if (document.getElementById("map-display")) {
    console.log("New map implementation detected");

    // The new map implementation has its own initialization and filter handling
    // So we don't need to do anything here
    return;
  }

  // Initialize filter chips (for old implementation)
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", function () {
      this.classList.toggle("active");
      // Apply filters based on active chips
      applyFilters();
    });
  });

  // Initialize map (old implementation)
  initializeMap();
}

// Profile page specific initializations
function initProfilePage() {
  console.log("Profile page initialized");

  // Initialize any profile page specific elements
}

// Function to initialize map (old implementation)
function initializeMap() {
  // This is the old map implementation
  console.log("Map would be initialized here");

  const mapContainer = document.getElementById("map-container");
  if (mapContainer) {
    // Display placeholder for map
    mapContainer.innerHTML =
      '<div class="center-align" style="padding-top: 30vh;"><p>Map loading...</p><div class="preloader-wrapper big active"><div class="spinner-layer spinner-green-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div></div>';

    // Simulate map loading
    setTimeout(() => {
      mapContainer.innerHTML =
        '<div class="center-align" style="padding-top: 30vh;"><h4>Map Placeholder</h4><p>In a real application, Google Maps or OpenStreetMap would be displayed here.</p></div>';
    }, 1500);
  }
}

// Function to apply filters (old implementation)
function applyFilters() {
  // Get all active filter chips
  const activeFilters = [];
  document.querySelectorAll(".filter-chip.active").forEach((chip) => {
    activeFilters.push(chip.getAttribute("data-filter"));
  });

  console.log("Active filters:", activeFilters);
  // Would filter map markers or station list based on active filters
}
