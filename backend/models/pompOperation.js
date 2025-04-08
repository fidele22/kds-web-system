
const PumpSchema = new mongoose.Schema({
    date: String,
    pumpNumber: String,
    pumpName: String,
    parts: [{ name: String, quantity: Number }],
    technician: String,
    operation: String,
  });
  
  const Pump = mongoose.model("Pump", PumpSchema);