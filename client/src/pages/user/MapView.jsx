import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useUser, useAuth } from "@clerk/clerk-react";
import DashboardLayout from "../../components/DashboardLayout";

const MapView = () => {
  const [complaints, setComplaints] = useState([]);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = await getToken();
        const res = await fetch("http://localhost:5000/api/complaints", {
          headers: {
            Authorization: `Bearer ${token}`
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
  }, [getToken]);

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