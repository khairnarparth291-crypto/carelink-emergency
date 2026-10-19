import Cost from "../models/Cost.js";
import { isMongoDBConnected } from "../config/db.js";
import mockStore from "../config/mockStore.js";

// @desc    Get hospital tariffs & insurance schemes
// @route   GET /api/hospitals/:hospitalId/costs
// @access  Public
export const getCosts = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;

    if (isMongoDBConnected()) {
      try {
        let cost = await Cost.findOne({ hospitalId });
        if (!cost) {
          cost = await Cost.create({ hospitalId });
        }
        return res.json({ success: true, data: cost });
      } catch (e) {
        console.warn("MongoDB getCosts fallback:", e.message);
      }
    }

    // Memory Store Fallback
    let cost = mockStore.costs.find(
      (c) => String(c.hospitalId) === String(hospitalId)
    );

    if (!cost) {
      cost = {
        _id: `67010000000000000000040${mockStore.costs.length + 1}`,
        hospitalId,
        consultation: 800,
        emergencyVisit: 1200,
        icuPerDay: 8500,
        normalBedPerDay: 3500,
        ventilatorPerDay: 4500,
        surgeryStarting: 18000,
        minEstimatedCost: 5000,
        maxEstimatedCost: 10000,
        insuranceAccepted: [
          "Private Insurance",
          "Cashless Insurance",
          "Ayushman Bharat",
          "Government Schemes",
          "Corporate Insurance"
        ],
        governmentSchemes: ["Ayushman Bharat PMJAY", "MJPJAY Maharashtra"]
      };
      mockStore.costs.push(cost);
    }

    res.json({
      success: true,
      data: cost
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hospital tariffs & insurance
// @route   PUT /api/hospitals/:hospitalId/costs
// @access  Protected
export const updateCosts = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;

    if (isMongoDBConnected()) {
      try {
        let cost = await Cost.findOne({ hospitalId });
        if (!cost) {
          cost = new Cost({ hospitalId, ...req.body });
        } else {
          Object.assign(cost, req.body);
        }
        await cost.save();

        return res.json({
          success: true,
          message: "Hospital costs and insurance saved successfully",
          data: cost
        });
      } catch (e) {
        console.warn("MongoDB updateCosts fallback:", e.message);
      }
    }

    // Memory Store Fallback
    let cost = mockStore.costs.find(
      (c) => String(c.hospitalId) === String(hospitalId)
    );

    if (!cost) {
      cost = {
        _id: `67010000000000000000040${mockStore.costs.length + 1}`,
        hospitalId,
        ...req.body
      };
      mockStore.costs.push(cost);
    } else {
      Object.assign(cost, req.body);
    }

    res.json({
      success: true,
      message: "Hospital costs and insurance saved successfully",
      data: cost
    });
  } catch (error) {
    next(error);
  }
};
