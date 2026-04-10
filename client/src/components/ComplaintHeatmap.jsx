import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/ComplaintHeatmap.css";
import { API } from "../config/api";

// Fix for default marker icons in Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ComplaintHeatmap = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocationStats = async () => {
      try {
        const res = await fetch(`${API}/api/admin/location-stats`);
        const data = await res.json();
        if (res.ok) setLocations(data);
      } catch (err) {
        console.error("Error fetching location stats:", err);
      }
    };
    fetchLocationStats();
  }, []);

  const getMarkerIcon = (count) => {
    let statusClass = "heatmap-marker-stable";
    if (count > 10) statusClass = "heatmap-marker-critical";
    else if (count >= 5) statusClass = "heatmap-marker-active";

    return L.divIcon({
      className: "custom-div-icon",
      html: `<div class="heatmap-marker-icon ${statusClass}">${count}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  return (
    <div className="admin-table-container heatmap-container">
      <div className="heatmap-header">
        <h3 className="heatmap-title">City Complaint Density Map</h3>
        <p className="heatmap-subtitle">Visualizing issue hot-spots across cities.</p>
      </div>
      <div className="heatmap-map-wrapper">
        <MapContainer 
          center={[23.0225, 72.5714]} // Ahmedabad Center
          zoom={7} 
          className="heatmap-map"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {locations.map((loc, idx) => (
            loc.latitude && loc.longitude && (
              <Marker 
                key={idx} 
                position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]}
                icon={getMarkerIcon(loc.count)}
              >
                <Popup>
                  <div className="heatmap-popup-container">
                    <h3 className="heatmap-popup-title">{loc.location}</h3>
                    <p className="heatmap-popup-count">{loc.count} Complaints</p>
                    <div className={`heatmap-popup-status ${
                      loc.count > 10 ? "heatmap-status-critical" : 
                      loc.count >= 5 ? "heatmap-status-active" : 
                      "heatmap-status-stable"
                    }`}>
                      {loc.count > 10 ? "🔥 Critical Hub" : loc.count >= 5 ? "⚠️ Active Area" : "✅ Stable"}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default ComplaintHeatmap;
