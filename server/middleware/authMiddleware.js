function calculatePriority(category){

  const emergency = [
    "Fire Emergency",
    "Gas Leak",
    "Flood"
  ];

  const high = [
    "Electricity Failure",
    "Water Leakage"
  ];

  if(emergency.includes(category)){
    return "Emergency";
  }

  if(high.includes(category)){
    return "High";
  }

  return "Low";

}

module.exports = calculatePriority;