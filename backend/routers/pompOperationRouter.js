
app.post("/api/pumps", async (req, res) => {
    try {
      const newPump = new Pump(req.body);
      await newPump.save();
      res.status(201).json({ message: "Pump data saved successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to save pump data" });
    }
  });
  
  app.get("/api/pumps", async (req, res) => {
    try {
      const pumps = await Pump.find();
      res.json(pumps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pump data" });
    }
  });