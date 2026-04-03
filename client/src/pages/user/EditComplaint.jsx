import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import "./addComplaint.css";
import DashboardLayout from "../../components/DashboardLayout";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icon issue
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const EditComplaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const fileInputRef = useRef(null);

  const [message, setMessage] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [preview, setPreview] = useState(null);
  const isEditingRef = useRef(false);
  const [loading, setLoading] = useState(true);
  
  // Custom Dropdown State
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [showSubDropdown, setShowSubDropdown] = useState(false);

  const [form, setForm] = useState({
    category: "",
    subcategory: "",
    address: "",
    image: null,
    latitude: 23.0225,
    longitude: 72.5714,
  });

  const categoryMap = {
    "Drainage": [
      "Drainage- Choking Of Line",
      "Drainage- Manhole Cover Missing",
      "Drainage- Public Toilets and Urinals - Drainage Line Blockage or Choking",
      "Drainage- Other"
    ],
    "Water": [
      "Water- Low Pressure",
      "Water- Leakage In Main Line",
      "Water- No Supply",
      "Water- Pollution In Supply",
      "Road- Waterlogged Due To Rain",
      "Road- Catch Pit Repairing",
      "Water- Other"
    ],
    "Light": [
      "Streetlight- Switched On In Day Time",
      "Light- Fan-Lift (Office/Civic/School/Gym/Crematorium)",
      "Light- Fan-Lift General Electrical Repairing in Auditorium-Hall",
      "AC/Fridge/Water Cooler Not Working (Hospital/Office)",
      "Light- Wiring General Electrical Fault",
      "Swimming Pool Electrical Issues",
      "Streetlight- Shock Observed",
      "Light- Hospital Electrical Issue",
      "Streetlight- Off",
      "Streetlight- Poles Fell Down",
      "Light & Streetlight- Other"
    ],
    "Health": [
      "Health- Collecting Water Samples",
      "Health- Doctors/Staff Not Available",
      "UHC- Doctors/Staff Not Available",
      "Health- Food Poisoning Cases",
      "Health- Inferior Quality of Food",
      "Health- Malaria/Dengue Prevention",
      "Health- Other"
    ],
    "Cleaning & Solid Waste": [
      "SWM- Spitting/Urinating in Public",
      "SWM- Toilet Surrounding Cleaning",
      "SWM- Daily Cleaning Not Done",
      "SWM- Burning Waste",
      "SWM- Debris Clearing",
      "SWM- Door-to-Door Vehicle Not Coming",
      "SWM- Road Cleaning Not Done"
    ],
    "Road": [
      "Road- Bhuva On Road",
      "Road- Footpath Repairing",
      "Road- Repair Required",
      "Road- Other"
    ],
    "Wandering & Dead Animal": [
      "SWM- Clearing Big Dead Animals",
      "SWM- Clearing Dead Animals",
      "CNCD- Capture Stray Cattle",
      "CNCD- Capture Dogs",
      "CNCD- Animal Treatment",
      "CNCD- Sick Dog Capture",
      "CNCD- Dog Nuisance",
      "CNCD- Aggressive Dog Capture"
    ],
    "Garden": [
      "Garden- No Cleaning",
      "Garden- No Security",
      "Garden- Repair Required",
      "Garden- Trimming",
      "Garden- Watering Issue",
      "Garden- Staff Not Available",
      "Garden- Tree Falling",
      "Garden- Toilet Cleaning"
    ],
    "Crematorium": [
      "Crematorium- Furnace Not Working",
      "Crematorium- Incharge Not Available",
      "Crematorium- Cleanliness Issue",
      "Crematorium- Wood Quality Issue"
    ],
    "Tree Cutting": [
      "Tree Cutting Complaint"
    ],
    "Building": [
      "Public Building Repair",
      "School Repair",
      "Unsafe Building Demolition",
      "Electrical Issues in Buildings"
    ],
    "Gym": [
      "Gym- Coach Absent",
      "Gym- Lights Off",
      "Gym- Improper Coaching",
      "Gym- Equipment Maintenance"
    ],
    "Library": [
      "Library- Cleaning",
      "Library- Basic Needs Issue",
      "Library- Materials Not Available"
    ],
    "Swimming Pool": [
      "Swimming- Infrastructure Damage",
      "Swimming- Security Issue",
      "Swimming- Electrical Issue",
      "Swimming- Coach Issue",
      "Swimming- Cleaning Issue",
      "Swimming- Water Quality Issue",
      "Swimming- Training Issue"
    ],
    "Traffic Circle": [
      "Traffic Circle Cleaning Issue",
      "Tree Guard Damage",
      "Watering Issue"
    ],
    "Plastic Collection": [
      "Plastic Waste Issue",
      "Inferior Plastic Use"
    ],
    "Smart Toilet": [
      "No Water",
      "Cleaning Not Done",
      "Door Not Working",
      "Auto Flush Not Working"
    ],
    "Fire": [
      "Fire Hazard / Explosive Storage"
    ]
  };

  // ================= LOAD DATA =================

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!isLoaded || !user) return;
      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:5000/api/complaints/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await res.json();
        if (res.ok) {
          setForm({
            category: data.category,
            subcategory: data.subcategory,
            address: data.address,
            latitude: data.latitude || 23.0225,
            longitude: data.longitude || 72.5714,
            image: null // We don't pre-fill File object
          });
          if (data.image) {
            setPreview(`http://localhost:5000/uploads/${data.image}`);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();

    const handleClickOutside = (e) => {
      if (!e.target.closest(".custom-select")) {
        setShowCatDropdown(false);
        setShowSubDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id]);

  const fetchTimer = useRef(null);

  const debouncedFetchAddress = (lat, lon) => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    fetchTimer.current = setTimeout(() => {
      fetchAddress(lat, lon);
    }, 500);
  };

  const fetchAddress = async (lat, lon) => {
    setLoadingAddress(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await res.json();
      
      if (!isEditingRef.current) {
        setForm((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lon,
          address: data.display_name || "Address not found",
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lon
        }));
      }
    } catch {
      if (!isEditingRef.current) {
        setForm((prev) => ({ ...prev, address: "Error fetching address" }));
      }
    } finally {
      setLoadingAddress(false);
    }
  };

  const LocationMarker = () => {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        isEditingRef.current = false;
        setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
        debouncedFetchAddress(lat, lng);
      },
      dragend() {
        const center = map.getCenter();
        isEditingRef.current = false;
        setForm((prev) => ({ ...prev, latitude: center.lat, longitude: center.lng }));
        debouncedFetchAddress(center.lat, center.lng);
      }
    });

    // Handle map centering on data load
    const mapObj = useMap();
    useEffect(() => {
        if (form.latitude && form.longitude) {
            mapObj.setView([form.latitude, form.longitude], mapObj.getZoom());
        }
    }, [form.latitude, form.longitude, mapObj]);

    return (
      <Marker position={[form.latitude, form.longitude]} draggable={false} />
    );
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      if (file && ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setForm((prev) => ({ ...prev, image: file }));
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setMessage("Please upload a valid image (JPG, PNG)");
      }
      return;
    }

    if (name === "category") {
      setForm((prev) => ({
        ...prev,
        category: value,
        subcategory: "",
      }));
      return;
    }

    if (name === "address") {
      isEditingRef.current = true;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setForm((prev) => ({ ...prev, image: file }));
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setForm((prev) => ({ ...prev, image: null }));
    setPreview(null);
  };

  // ================= SUBMIT =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.category || !form.subcategory) {
      setMessage("Please select category and subcategory");
      return;
    }

    try {
      const data = new FormData();
      Object.keys(form).forEach((key) => {
        if (key === 'image' && !form[key]) return; // Skip if no new image selected
        data.append(key, form[key]);
      });

      data.append("clerkUserId", user?.id);
      data.append("title", form.subcategory);
      data.append("description", `Issue reported in category: ${form.category}, Subcategory: ${form.subcategory}`);

      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/complaints/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: data,
      });

      const result = await res.json();

      if (res.ok) {
        alert("Complaint updated successfully! 🚀");
        navigate("/my-complaints");
      } else {
        setMessage(result.message || "Update failed");
      }
    } catch {
      setMessage("Server error");
    }
  };

  if (loading) return <DashboardLayout><div className="addComplaintPage">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="addComplaintPage">
        <div className="complaintCard">
          <h2>Edit Complaint</h2>
          <p className="sub">Modify your report details and location</p>

          <form onSubmit={handleSubmit}>
            {/* CATEGORY */}
            <h3>Complaint Category</h3>
            <div className="custom-select">
              <div 
                className={`select-selected ${showCatDropdown ? "active" : ""}`}
                onClick={() => setShowCatDropdown(!showCatDropdown)}
              >
                <span>{form.category || "Select Category"}</span>
                <div className={`chevron ${showCatDropdown ? "up" : ""}`}></div>
              </div>
              
              {showCatDropdown && (
                <div className="select-items max-h-60 overflow-y-auto rounded-lg shadow-md">
                  {Object.keys(categoryMap).map((cat) => (
                    <div 
                      key={cat} 
                      onClick={() => {
                        setForm(prev => ({ ...prev, category: cat, subcategory: "" }));
                        setShowCatDropdown(false);
                      }}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SUBCATEGORY */}
            <h3>Subcategory</h3>
            <div className="custom-select">
              <div 
                className={`select-selected ${!form.category ? "disabled" : ""} ${showSubDropdown ? "active" : ""}`}
                onClick={() => form.category && setShowSubDropdown(!showSubDropdown)}
              >
                <span>
                  {!form.category ? "Select category first" : (form.subcategory || "Select subcategory")}
                </span>
                <div className={`chevron ${showSubDropdown ? "up" : ""}`}></div>
              </div>

              {showSubDropdown && form.category && (
                <div className="select-items max-h-60 overflow-y-auto rounded-lg shadow-md">
                  {categoryMap[form.category].map((sub) => (
                    <div 
                      key={sub} 
                      onClick={() => {
                        setForm(prev => ({ ...prev, subcategory: sub }));
                        setShowSubDropdown(false);
                      }}
                    >
                      {sub}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MAP */}
            <h3>Update Location on Map</h3>
            <div className="mapContainer">
              <MapContainer 
                center={[form.latitude, form.longitude]} 
                zoom={14} 
                className="complaintMap"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker />
              </MapContainer>
            </div>

            <div className="formGroup">
              <h3>Address Details</h3>
              {loadingAddress && (
                <div className="loadingHint">
                  <span>📍 Detecting address...</span>
                </div>
              )}
              <textarea
                name="address"
                className="addressField"
                value={form.address}
                onChange={handleChange}
                placeholder="Edit address details..."
              />
              <p className="addressHint">
                Update markers on map or edit address manually.
              </p>
            </div>

            {/* IMAGE */}
            <h3>Complaint Image</h3>
            <div className="uploadContainer">
              <div 
                className="uploadBox"
                onDragOver={handleDrag}
                onDragEnter={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                {preview ? (
                  <div className="imagePreviewWrapper">
                    <img src={preview} alt="Preview" className="imagePreview" />
                    <button 
                      type="button" 
                      className="removeImgBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" className="cameraIcon" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                    <h4>Update or Capture Image</h4>
                    <p>Click to replace current photo</p>
                  </>
                )}
              </div>
              <input
                type="file"
                name="image"
                accept="image/*"
                capture="environment"
                className="hiddenInput"
                ref={fileInputRef}
                onChange={handleChange}
              />
            </div>

            <button className="submitBtn" type="submit">
              Update Complaint
            </button>

            {message && (
              <p className={message.toLowerCase().includes("success") ? "successMsg" : "errorMsg"} style={{marginTop: '15px'}}>
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditComplaint;