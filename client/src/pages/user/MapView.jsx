import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useUser, useAuth } from "@clerk/clerk-react";
import DashboardLayout from "../../components/DashboardLayout";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MapView = () => {
  const [complaints, setComplaints] = useState([]);
  const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!user || user.id === undefined) return;
      try {
        const token = await getToken();
        if (!token) return;
        
        const res = await fetch(`http://localhost:5000/api/complaints/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Clerk-User-Id": user.id
          }
        });
        const data = await res.json();
        if (res.ok) {
          setComplaints(data);
        }
      } catch (error) {
        console.log("Map fetch error:", error);
      }
    };
    fetchComplaints();
  }, [user?.id, getToken]);

  return (
    <DashboardLayout>
      <div style={{ height: "100vh", width: "100%" }}>
        <MapContainer
          center={[23.0225, 72.5714]} // Ahmedabad default center
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {complaints.map((c) => {
            // ensure coordinates exist
            if (!c.latitude || !c.longitude) return null;

            const lat = parseFloat(c.latitude);
            const lng = parseFloat(c.longitude);

            if (isNaN(lat) || isNaN(lng)) return null;

            return (
              <Marker
                key={c._id}
                position={[lat, lng]}
              >
                <Popup>
                  <div style={{ minWidth: "150px" }}>
                    <h4>{c.title}</h4>
                    <p><b>Category:</b> {c.category}</p>
                    <p><b>Status:</b> {c.status}</p>
                    <p><b>City:</b> {c.city}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </DashboardLayout>
  );
};

export default MapView;