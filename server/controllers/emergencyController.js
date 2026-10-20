import EmergencyRequest from "../models/EmergencyRequest.js";
import Hospital from "../models/Hospital.js";
import { isMongoDBConnected } from "../config/db.js";
import mockStore from "../config/mockStore.js";
import mongoose from "mongoose";
import {
  emitPatientStatusUpdate,
  emitHospitalRequestUpdate,
  emitNewEmergencyRequestDispatched
} from "../socket.js";

/**
 * Helper to resolve hospital contact and location details
 */
function getHospitalDetails(hospitalId) {
  const hosp = mockStore.hospitals.find(
    (h) => String(h._id) === String(hospitalId) || String(h.id) === String(hospitalId)
  );
  if (hosp) {
    return {
      hospitalId: hosp._id || hosp.id,
      hospitalName: hosp.name,
      hospitalPhone: hosp.phone,
      hospitalEmergencyPhone: hosp.emergencyPhone || hosp.phone,
      hospitalAddress: `${hosp.address}, ${hosp.city || "Pune"}`
    };
  }
  return {
    hospitalId: hospitalId || "670100000000000000000010",
    hospitalName: "Care Hospital Pune",
    hospitalPhone: "+91 20 2567 8900",
    hospitalEmergencyPhone: "+91 20 2567 8999",
    hospitalAddress: "Plot 14, Senapati Bapat Road, Shivajinagar, Pune"
  };
}

/**
 * Helper to find hospital in DB or mockStore
 */
async function findHospitalRecord(hospitalId) {
  if (!hospitalId) return null;
  const hid = String(hospitalId).trim();
  if (isMongoDBConnected()) {
    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(hid);
      const query = isObjectId ? { _id: hid } : { id: hid };
      let hosp = await Hospital.findOne(query);
      if (!hosp && !isObjectId) {
        hosp = await Hospital.findOne({ slug: hid });
      }
      if (hosp) return hosp;
    } catch (e) {
      console.warn("MongoDB findHospitalRecord fallback:", e.message);
    }
  }
  return (
    mockStore.hospitals.find(
      (h) =>
        String(h._id) === hid ||
        String(h.id) === hid ||
        (h.slug && String(h.slug) === hid)
    ) || null
  );
}

// @desc    Create incoming emergency request (from patient/family portal)
// @route   POST /api/emergency-requests
// @access  Public
export const createEmergencyRequest = async (req, res, next) => {
  try {
    const {
      patientName,
      patientAge,
      patientGender,
      emergencyType,
      requiredFacility,
      requiredSpecialist,
      reportedComplaint,
      suggestedSpecialist,
      requiredBedType,
      hospitalId,
      hospitalIds,
      message,
      contactPhone,
      location,
      estimatedArrival,
      budget,
      insurance
    } = req.body;

    if (!patientName || !emergencyType) {
      return res.status(400).json({
        success: false,
        message: "Patient name and emergency type are required"
      });
    }

    // Validate and normalize location data
    let validatedLocation = null;
    if (location !== undefined && location !== null && location !== "") {
      if (typeof location === "string") {
        validatedLocation = location.trim();
      } else if (typeof location === "object") {
        const { latitude, longitude, address, source } = location;

        let latVal = null;
        let lngVal = null;

        if (latitude !== undefined && latitude !== null && latitude !== "") {
          const latNum = Number(latitude);
          if (isNaN(latNum) || latNum < -90 || latNum > 90) {
            return res.status(400).json({
              success: false,
              message: "Invalid latitude: must be a number between -90 and 90"
            });
          }
          latVal = latNum;
        }

        if (longitude !== undefined && longitude !== null && longitude !== "") {
          const lngNum = Number(longitude);
          if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
            return res.status(400).json({
              success: false,
              message: "Invalid longitude: must be a number between -180 and 180"
            });
          }
          lngVal = lngNum;
        }

        if ((latVal !== null && lngVal === null) || (latVal === null && lngVal !== null)) {
          return res.status(400).json({
            success: false,
            message: "Both latitude and longitude must be provided for coordinate-based location"
          });
        }

        const validSource = source === "gps" || source === "manual" ? source : (latVal !== null ? "gps" : "manual");
        const cleanAddress = typeof address === "string" ? address.trim() : "";

        validatedLocation = {
          latitude: latVal,
          longitude: lngVal,
          address: cleanAddress,
          source: validSource
        };
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid location format"
        });
      }
    }

    // Determine initial dispatched hospitals based on target hospital(s) or patient location
    let targetHospitalIds = [];
    if (Array.isArray(hospitalIds) && hospitalIds.length > 0) {
      targetHospitalIds = hospitalIds;
    } else if (hospitalId) {
      targetHospitalIds = [hospitalId];
    } else {
      // Auto-dispatch to network emergency hospitals matching patient location
      const locAddress = typeof location === "object" && location !== null
        ? (location.address || "")
        : (typeof location === "string" ? location : "");
      const locStr = locAddress.trim().toLowerCase();
      let cityMatches = [];

      if (locStr) {
        const cityToken = locStr.split(",")[0].trim();
        cityMatches = mockStore.hospitals.filter((h) => {
          const hCity = (h.city || "").toLowerCase();
          if (locStr.includes("mumbai") || cityToken.includes("mumbai")) {
            return hCity.includes("mumbai");
          }
          if (locStr.includes("pune") || cityToken.includes("pune")) {
            return hCity.includes("pune");
          }
          return hCity.includes(cityToken) || cityToken.includes(hCity);
        });
      }

      if (cityMatches.length > 0) {
        targetHospitalIds = cityMatches.map((h) => String(h._id || h.id));
      } else {
        // Default to Pune emergency casualty network (Care Hospital Pune, Apollo Care, Ruby Metro)
        targetHospitalIds = [
          "670100000000000000000010",
          "670100000000000000000020",
          "670100000000000000000030"
        ];
      }
    }

    const initialResponses = [];
    const now = new Date();
    for (const hid of targetHospitalIds) {
      const details = getHospitalDetails(hid);
      const isOid = mongoose.Types.ObjectId.isValid(details.hospitalId);
      initialResponses.push({
        hospitalId: isOid ? new mongoose.Types.ObjectId(details.hospitalId) : details.hospitalId,
        hospitalName: details.hospitalName,
        hospitalPhone: details.hospitalPhone,
        hospitalEmergencyPhone: details.hospitalEmergencyPhone,
        hospitalAddress: details.hospitalAddress,
        responseStatus: "PENDING",
        responseNote: null,
        rejectionReason: null,
        responseTimestamp: null,
        updatedAt: now.toISOString ? now.toISOString() : now
      });
    }

    const primaryHospitalId = targetHospitalIds[0] && mongoose.Types.ObjectId.isValid(targetHospitalIds[0])
      ? new mongoose.Types.ObjectId(targetHospitalIds[0])
      : (targetHospitalIds[0] || null);

    if (isMongoDBConnected()) {
      try {
        const newRequest = await EmergencyRequest.create({
          patientName,
          patientAge: patientAge ? Number(patientAge) : 0,
          patientGender: patientGender || "Unspecified",
          emergencyType,
          requiredFacility: Array.isArray(requiredFacility)
            ? requiredFacility
            : requiredFacility
            ? [requiredFacility]
            : [],
          requiredSpecialist: requiredSpecialist || "",
          reportedComplaint: reportedComplaint || null,
          suggestedSpecialist: suggestedSpecialist || null,
          requiredBedType: requiredBedType || "Normal",
          hospitalId: primaryHospitalId,
          status: "PENDING",
          message: message || "",
          contactPhone: contactPhone || "",
          location: validatedLocation,
          estimatedArrival: estimatedArrival || "15 min",
          budget: budget || "",
          insurance: insurance || "",
          hospitalResponses: initialResponses
        });

        // Real-Time Notification: Emit dispatch to each recipient hospital desk
        for (const hid of targetHospitalIds) {
          emitNewEmergencyRequestDispatched(String(hid), {
            requestId: String(newRequest._id || newRequest.id),
            id: String(newRequest.id || newRequest._id),
            patientName: newRequest.patientName,
            patientAge: newRequest.patientAge,
            patientGender: newRequest.patientGender,
            emergencyType: newRequest.emergencyType,
            requiredFacility: newRequest.requiredFacility,
            requiredSpecialist: newRequest.requiredSpecialist,
            location: newRequest.location,
            estimatedArrival: newRequest.estimatedArrival,
            status: "PENDING",
            createdAt: newRequest.createdAt
          });
        }

        return res.status(201).json({
          success: true,
          message: "Emergency request created and dispatched to triage network",
          data: newRequest
        });
      } catch (e) {
        console.warn("MongoDB createEmergencyRequest fallback:", e.message);
      }
    }

    // Memory Store Fallback
    const nextNum = mockStore.emergencyRequests.length + 1;
    const newReq = {
      _id: `67010000000000000000050${nextNum}`,
      id: `ER-${1020 + nextNum}`,
      patientName,
      patientAge: patientAge ? Number(patientAge) : 0,
      patientGender: patientGender || "Unspecified",
      emergencyType,
      requiredFacility: Array.isArray(requiredFacility)
        ? requiredFacility
        : requiredFacility
        ? [requiredFacility]
        : [],
      requiredSpecialist: requiredSpecialist || "",
      reportedComplaint: reportedComplaint || null,
      suggestedSpecialist: suggestedSpecialist || null,
      requiredBedType: requiredBedType || "Normal",
      hospitalId: primaryHospitalId,
      status: "PENDING",
      message: message || "",
      contactPhone: contactPhone || "",
      location: validatedLocation,
      estimatedArrival: estimatedArrival || "15 min",
      budget: budget || "",
      insurance: insurance || "",
      rejectionReason: null,
      responseNote: null,
      responseTimestamp: null,
      hospitalResponse: null,
      hospitalResponses: initialResponses,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockStore.emergencyRequests.unshift(newReq);

    // Real-Time Notification: Emit dispatch to each recipient hospital desk
    for (const hid of targetHospitalIds) {
      emitNewEmergencyRequestDispatched(String(hid), {
        requestId: String(newReq._id || newReq.id),
        id: String(newReq.id || newReq._id),
        patientName: newReq.patientName,
        patientAge: newReq.patientAge,
        patientGender: newReq.patientGender,
        emergencyType: newReq.emergencyType,
        requiredFacility: newReq.requiredFacility,
        requiredSpecialist: newReq.requiredSpecialist,
        location: newReq.location,
        estimatedArrival: newReq.estimatedArrival,
        status: "PENDING",
        createdAt: newReq.createdAt
      });
    }

    res.status(201).json({
      success: true,
      message: "Emergency request created and dispatched to triage network",
      data: newReq
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get emergency request by ID (Patient-safe status view with hospital responses)
// @route   GET /api/emergency-requests/:id
// @access  Public
export const getEmergencyRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Emergency request ID is required"
      });
    }

    let foundRequest = null;
    let respondingHospital = null;

    if (isMongoDBConnected()) {
      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        const query = isObjectId ? { _id: id } : { id: id };
        foundRequest = await EmergencyRequest.findOne(query);

        if (foundRequest && foundRequest.hospitalId) {
          try {
            respondingHospital = await Hospital.findById(foundRequest.hospitalId).select(
              "name address city phone emergencyPhone"
            );
          } catch (he) {
            console.warn("Could not populate hospital in MongoDB:", he.message);
          }
        }
      } catch (e) {
        console.warn("MongoDB getEmergencyRequestById fallback:", e.message);
      }
    }

    if (!foundRequest) {
      foundRequest = mockStore.emergencyRequests.find(
        (r) => String(r._id) === String(id) || String(r.id) === String(id)
      );
      if (foundRequest && foundRequest.hospitalId) {
        const hosp = mockStore.hospitals.find(
          (h) => String(h._id) === String(foundRequest.hospitalId) || String(h.id) === String(foundRequest.hospitalId)
        );
        if (hosp) {
          respondingHospital = {
            _id: hosp._id || hosp.id,
            name: hosp.name,
            address: hosp.address,
            city: hosp.city,
            phone: hosp.phone,
            emergencyPhone: hosp.emergencyPhone
          };
        }
      }
    }

    if (!foundRequest) {
      return res.status(404).json({
        success: false,
        message: `Emergency request #${id} not found`
      });
    }

    // Default hospital details if hospitalResponse or respondingHospital is present
    const hospInfo = respondingHospital || {
      name: foundRequest.hospitalResponse?.hospitalName || "Care Hospital Pune",
      address: foundRequest.hospitalResponse?.hospitalAddress || "Plot 14, Senapati Bapat Road, Shivajinagar, Pune",
      phone: foundRequest.hospitalResponse?.hospitalPhone || "+91 20 2567 8900",
      emergencyPhone: foundRequest.hospitalResponse?.hospitalEmergencyPhone || "+91 20 2567 8999"
    };

    const rawHospResp = foundRequest.hospitalResponse
      ? (foundRequest.hospitalResponse.toObject ? foundRequest.hospitalResponse.toObject() : foundRequest.hospitalResponse)
      : null;

    const hospitalResponse = {
      hospitalId: rawHospResp?.hospitalId || foundRequest.hospitalId || (hospInfo._id || "670100000000000000000010"),
      hospitalName: rawHospResp?.hospitalName || hospInfo.name || "Care Hospital Pune",
      hospitalPhone: rawHospResp?.hospitalPhone || hospInfo.phone || "+91 20 2567 8900",
      hospitalEmergencyPhone: rawHospResp?.hospitalEmergencyPhone || hospInfo.emergencyPhone || "+91 20 2567 8999",
      hospitalAddress: rawHospResp?.hospitalAddress || (hospInfo.address ? `${hospInfo.address}${hospInfo.city ? `, ${hospInfo.city}` : ""}` : "Pune"),
      status: rawHospResp?.status || rawHospResp?.responseStatus || foundRequest.status,
      responseStatus: rawHospResp?.responseStatus || rawHospResp?.status || foundRequest.status,
      rejectionReason: rawHospResp?.rejectionReason || foundRequest.rejectionReason || null,
      timestamp: rawHospResp?.timestamp || rawHospResp?.responseTimestamp || foundRequest.responseTimestamp || foundRequest.updatedAt || foundRequest.createdAt,
      note: rawHospResp?.note || rawHospResp?.responseNote || foundRequest.responseNote || (foundRequest.status === "ACCEPTED" ? "Hospital Confirmed — Triage bay prepared." : null)
    };

    // Format safe hospitalResponses array
    const rawResponses = foundRequest.hospitalResponses || [];
    const formattedResponses = rawResponses.map((hr) => {
      const hosp = mockStore.hospitals.find(
        (h) => String(h._id) === String(hr.hospitalId) || String(h.id) === String(hr.hospitalId)
      );
      const avail = mockStore.availabilities?.find(
        (a) => String(a.hospitalId) === String(hr.hospitalId)
      );

      return {
        hospitalId: hr.hospitalId,
        hospitalName: hr.hospitalName || hosp?.name || "Hospital",
        responseStatus: hr.responseStatus || "PENDING",
        hospitalPhone: hr.hospitalPhone || hosp?.phone || "",
        hospitalEmergencyPhone: hr.hospitalEmergencyPhone || hosp?.emergencyPhone || hr.hospitalPhone || "",
        emergencyPhone: hr.hospitalEmergencyPhone || hosp?.emergencyPhone || hr.hospitalPhone || "",
        hospitalAddress: hr.hospitalAddress || hosp?.address || "Pune",
        address: hr.hospitalAddress || hosp?.address || "Pune",
        responseTimestamp: hr.responseTimestamp || null,
        responseNote: hr.responseNote || null,
        rejectionReason: hr.rejectionReason || null,
        updatedAt: hr.updatedAt || null,
        availability: avail ? {
          normalBeds: avail.normalBeds?.available ?? null,
          icuBeds: avail.icuBeds?.available ?? null,
          ventilators: avail.ventilators?.available ?? null
        } : null,
        readinessStatus: hosp?.readinessStatus || "READY"
      };
    });

    // Determine confirmed hospitals (any with ACCEPTED status)
    const acceptedResponses = formattedResponses.filter((hr) => hr.responseStatus === "ACCEPTED");

    // Return strictly patient-safe fields (NO credentials, tokens, sensitive internal admin flags)
    const patientSafeData = {
      _id: foundRequest._id,
      id: foundRequest.id || foundRequest._id,
      patientName: foundRequest.patientName,
      patientAge: foundRequest.patientAge,
      patientGender: foundRequest.patientGender,
      emergencyType: foundRequest.emergencyType,
      requiredFacility: foundRequest.requiredFacility || [],
      requiredSpecialist: foundRequest.requiredSpecialist || "",
      reportedComplaint: foundRequest.reportedComplaint || null,
      suggestedSpecialist: foundRequest.suggestedSpecialist || null,
      requiredBedType: foundRequest.requiredBedType || "Normal",
      location: foundRequest.location ?? null,
      budget: foundRequest.budget || "",
      insurance: foundRequest.insurance || "",
      message: foundRequest.message || "",
      contactPhone: foundRequest.contactPhone || "",
      status: foundRequest.status || "PENDING",
      createdAt: foundRequest.createdAt,
      updatedAt: foundRequest.updatedAt || foundRequest.createdAt,
      rejectionReason: foundRequest.rejectionReason || null,
      responseNote: foundRequest.responseNote || null,
      responseTimestamp: foundRequest.responseTimestamp || null,
      hospitalResponse: foundRequest.status !== "PENDING" ? hospitalResponse : null,
      hospitalResponses: formattedResponses,
      confirmedHospital: foundRequest.status === "ACCEPTED" ? {
        id: hospInfo._id || foundRequest.hospitalId,
        name: hospInfo.name,
        address: hospInfo.address ? `${hospInfo.address}${hospInfo.city ? `, ${hospInfo.city}` : ""}` : "Pune",
        phone: hospInfo.phone,
        emergencyPhone: hospInfo.emergencyPhone
      } : null,
      acceptedHospitals: acceptedResponses
    };

    res.json({
      success: true,
      data: patientSafeData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dispatch an existing emergency request to multiple suitable hospitals
// @route   POST /api/emergency-requests/:id/dispatch
// @access  Public
export const dispatchEmergencyRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { hospitalIds } = req.body || {};

    if (!Array.isArray(hospitalIds) || hospitalIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "hospitalIds must be a non-empty array of hospital IDs"
      });
    }

    let request = null;

    if (isMongoDBConnected()) {
      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        const query = isObjectId ? { _id: id } : { id: id };
        request = await EmergencyRequest.findOne(query);
      } catch (e) {
        console.warn("MongoDB dispatchEmergencyRequest lookup fallback:", e.message);
      }
    }

    if (!request) {
      request = mockStore.emergencyRequests.find(
        (r) => String(r._id) === String(id) || String(r.id) === String(id)
      );
    }

    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Emergency request #${id} not found`
      });
    }

    // Validate that each hospital exists
    const validHospitals = [];
    for (const hid of hospitalIds) {
      const hosp = await findHospitalRecord(hid);
      if (!hosp) {
        return res.status(400).json({
          success: false,
          message: `Hospital with ID '${hid}' not found in network`
        });
      }
      validHospitals.push({ id: hid, record: hosp });
    }

    if (!request.hospitalResponses) {
      request.hospitalResponses = [];
    }

    // Add unique entries
    const now = new Date();
    for (const { id: hid, record } of validHospitals) {
      const recId = record._id || record.id || hid;
      const alreadyDispatched = request.hospitalResponses.some(
        (hr) => String(hr.hospitalId) === String(hid) || String(hr.hospitalId) === String(recId)
      );
      if (!alreadyDispatched) {
        const info = {
          hospitalId: recId,
          hospitalName: record.name,
          hospitalPhone: record.phone,
          hospitalEmergencyPhone: record.emergencyPhone || record.phone,
          hospitalAddress: `${record.address}, ${record.city || "Pune"}`,
          responseStatus: "PENDING",
          responseNote: null,
          rejectionReason: null,
          responseTimestamp: null,
          updatedAt: now.toISOString ? now.toISOString() : now
        };
        request.hospitalResponses.push(info);
      }
    }

    if (!request.hospitalId && validHospitals.length > 0) {
      const primaryRec = validHospitals[0].record;
      const primaryId = primaryRec._id || primaryRec.id || validHospitals[0].id;
      if (mongoose.Types.ObjectId.isValid(primaryId)) {
        request.hospitalId = new mongoose.Types.ObjectId(primaryId);
      } else {
        request.hospitalId = primaryId;
      }
      if (request.markModified) {
        request.markModified("hospitalId");
      }
    }

    request.updatedAt = now.toISOString ? now.toISOString() : now;

    if (request.markModified) {
      request.markModified("hospitalResponses");
    }
    if (isMongoDBConnected() && request.save) {
      await request.save();
    }

    // Real-Time Notification (Phase C): Emit to each dispatched hospital's room
    for (const { id: hid, record } of validHospitals) {
      const recId = record._id || record.id || hid;
      emitNewEmergencyRequestDispatched(String(recId), {
        requestId: String(request._id || request.id),
        id: String(request.id || request._id),
        patientName: request.patientName,
        patientAge: request.patientAge,
        patientGender: request.patientGender,
        emergencyType: request.emergencyType,
        requiredFacility: request.requiredFacility,
        requiredSpecialist: request.requiredSpecialist,
        location: request.location,
        estimatedArrival: request.estimatedArrival,
        status: "PENDING",
        createdAt: request.createdAt
      });
    }

    // Real-Time Notification: Emit updated hospital responses to patient's request room
    emitPatientStatusUpdate(String(request._id || request.id), {
      status: request.status,
      hospitalResponses: request.hospitalResponses
    });

    res.json({
      success: true,
      message: `Emergency request dispatched to ${validHospitals.length} hospital(s)`,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient-safe hospital responses for an emergency request
// @route   GET /api/emergency-requests/:id/responses
// @access  Public
export const getEmergencyResponses = async (req, res, next) => {
  try {
    const { id } = req.params;

    let request = null;

    if (isMongoDBConnected()) {
      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        const query = isObjectId ? { _id: id } : { id: id };
        request = await EmergencyRequest.findOne(query);
      } catch (e) {
        console.warn("MongoDB getEmergencyResponses lookup fallback:", e.message);
      }
    }

    if (!request) {
      request = mockStore.emergencyRequests.find(
        (r) => String(r._id) === String(id) || String(r.id) === String(id)
      );
    }

    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Emergency request #${id} not found`
      });
    }

    const responses = (request.hospitalResponses || []).map((hr) => {
      const hosp = mockStore.hospitals.find(
        (h) => String(h._id) === String(hr.hospitalId) || String(h.id) === String(hr.hospitalId)
      );
      const avail = mockStore.availabilities?.find(
        (a) => String(a.hospitalId) === String(hr.hospitalId)
      );

      return {
        hospitalId: hr.hospitalId,
        hospitalName: hr.hospitalName || hosp?.name || "Hospital",
        responseStatus: hr.responseStatus || "PENDING",
        hospitalPhone: hr.hospitalPhone || hosp?.phone || "",
        hospitalEmergencyPhone: hr.hospitalEmergencyPhone || hosp?.emergencyPhone || hr.hospitalPhone || "",
        emergencyPhone: hr.hospitalEmergencyPhone || hosp?.emergencyPhone || hr.hospitalPhone || "",
        hospitalAddress: hr.hospitalAddress || hosp?.address || "Pune",
        address: hr.hospitalAddress || hosp?.address || "Pune",
        responseTimestamp: hr.responseTimestamp,
        responseNote: hr.responseNote,
        rejectionReason: hr.rejectionReason,
        updatedAt: hr.updatedAt,
        availability: avail ? {
          normalBeds: avail.normalBeds?.available ?? null,
          icuBeds: avail.icuBeds?.available ?? null,
          ventilators: avail.ventilators?.available ?? null
        } : null,
        readinessStatus: hosp?.readinessStatus || "READY"
      };
    });

    res.json({
      success: true,
      count: responses.length,
      data: responses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hospital staff reviews their hospital's response
// @route   PUT /api/emergency-requests/:id/hospitals/:hospitalId/review
// @access  Protected
export const reviewHospitalEmergencyResponse = async (req, res, next) => {
  try {
    const { id, hospitalId } = req.params;
    const { note } = req.body || {};

    // Authorization check: hospital can only modify its own response
    const authHospitalId = req.user?.hospitalId || req.user?.hospital?._id || req.user?.hospital?.id;
    if (req.user?.role !== "admin") {
      if (!authHospitalId || String(authHospitalId) !== String(hospitalId)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not authorized to modify another hospital's response"
        });
      }
    }

    let request = null;

    if (isMongoDBConnected()) {
      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        const query = isObjectId ? { _id: id } : { id: id };
        request = await EmergencyRequest.findOne(query);
      } catch (e) {
        console.warn("MongoDB reviewHospitalEmergencyResponse lookup fallback:", e.message);
      }
    }

    if (!request) {
      request = mockStore.emergencyRequests.find(
        (r) => String(r._id) === String(id) || String(r.id) === String(id)
      );
    }

    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Emergency request #${id} not found`
      });
    }

    if (!request.hospitalResponses || request.hospitalResponses.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No hospital responses found for request #${id}`
      });
    }

    const responseEntry = request.hospitalResponses.find(
      (hr) => String(hr.hospitalId) === String(hospitalId)
    );

    if (!responseEntry) {
      return res.status(404).json({
        success: false,
        message: `Hospital #${hospitalId} is not a dispatched recipient for request #${id}`
      });
    }

    const now = new Date();
    responseEntry.responseStatus = "UNDER_REVIEW";
    responseEntry.responseNote = note || responseEntry.responseNote || "Hospital is reviewing the request";
    responseEntry.updatedAt = now.toISOString ? now.toISOString() : now;

    // Update top-level status if currently PENDING
    if (request.status === "PENDING") {
      request.status = "UNDER_REVIEW";
      request.hospitalId = hospitalId;
      request.hospitalResponse = {
        hospitalId: responseEntry.hospitalId || hospitalId,
        hospitalName: responseEntry.hospitalName,
        hospitalPhone: responseEntry.hospitalPhone,
        hospitalEmergencyPhone: responseEntry.hospitalEmergencyPhone,
        hospitalAddress: responseEntry.hospitalAddress,
        status: "UNDER_REVIEW",
        responseStatus: "UNDER_REVIEW",
        note: responseEntry.responseNote,
        timestamp: now.toISOString ? now.toISOString() : now
      };
    }
    request.updatedAt = now.toISOString ? now.toISOString() : now;

    if (request.markModified) {
      request.markModified("hospitalResponses");
    }
    if (isMongoDBConnected() && request.save) {
      await request.save();
    }

    // Real-Time Notification: Emit to hospital room and patient room
    emitHospitalRequestUpdate(String(hospitalId), {
      requestId: String(request._id || request.id),
      status: "UNDER_REVIEW",
      responseStatus: "UNDER_REVIEW",
      responseEntry
    });
    emitPatientStatusUpdate(String(request._id || request.id), {
      status: request.status,
      hospitalId: String(hospitalId),
      responseStatus: "UNDER_REVIEW",
      hospitalResponse: responseEntry,
      hospitalResponses: request.hospitalResponses
    });

    const responseData = responseEntry.toObject ? responseEntry.toObject() : { ...responseEntry };
    responseData.hospitalResponses = request.hospitalResponses;

    res.json({
      success: true,
      message: `Hospital ${responseEntry.hospitalName} marked request as Under Review`,
      data: responseData,
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hospital staff accepts their hospital's response
// @route   PUT /api/emergency-requests/:id/hospitals/:hospitalId/accept
// @access  Protected
export const acceptHospitalEmergencyResponse = async (req, res, next) => {
  try {
    const { id, hospitalId } = req.params;
    const { note } = req.body || {};

    // Authorization check: hospital can only modify its own response
    const authHospitalId = req.user?.hospitalId || req.user?.hospital?._id || req.user?.hospital?.id;
    if (req.user?.role !== "admin") {
      if (!authHospitalId || String(authHospitalId) !== String(hospitalId)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not authorized to modify another hospital's response"
        });
      }
    }

    let request = null;

    if (isMongoDBConnected()) {
      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        const query = isObjectId ? { _id: id } : { id: id };
        request = await EmergencyRequest.findOne(query);
      } catch (e) {
        console.warn("MongoDB acceptHospitalEmergencyResponse lookup fallback:", e.message);
      }
    }

    if (!request) {
      request = mockStore.emergencyRequests.find(
        (r) => String(r._id) === String(id) || String(r.id) === String(id)
      );
    }

    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Emergency request #${id} not found`
      });
    }

    if (!request.hospitalResponses || request.hospitalResponses.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No hospital responses found for request #${id}`
      });
    }

    const responseEntry = request.hospitalResponses.find(
      (hr) => String(hr.hospitalId) === String(hospitalId)
    );

    if (!responseEntry) {
      return res.status(404).json({
        success: false,
        message: `Hospital #${hospitalId} is not a dispatched recipient for request #${id}`
      });
    }

    const now = new Date();
    responseEntry.responseStatus = "ACCEPTED";
    responseEntry.responseNote = note || responseEntry.responseNote || "Hospital Confirmed — Casualty triage notified";
    responseEntry.rejectionReason = null;
    responseEntry.responseTimestamp = now.toISOString ? now.toISOString() : now;
    responseEntry.updatedAt = now.toISOString ? now.toISOString() : now;

    // Top-level status becomes ACCEPTED
    request.status = "ACCEPTED";
    request.hospitalId = hospitalId;
    request.hospitalResponse = {
      hospitalId: responseEntry.hospitalId || hospitalId,
      hospitalName: responseEntry.hospitalName,
      hospitalPhone: responseEntry.hospitalPhone,
      hospitalEmergencyPhone: responseEntry.hospitalEmergencyPhone,
      hospitalAddress: responseEntry.hospitalAddress,
      status: "ACCEPTED",
      responseStatus: "ACCEPTED",
      rejectionReason: null,
      note: responseEntry.responseNote,
      timestamp: responseEntry.responseTimestamp
    };
    request.responseNote = responseEntry.responseNote;
    request.responseTimestamp = responseEntry.responseTimestamp;
    request.updatedAt = now.toISOString ? now.toISOString() : now;

    if (request.markModified) {
      request.markModified("hospitalResponses");
    }
    if (isMongoDBConnected() && request.save) {
      await request.save();
    }

    // Real-Time Notification: Emit to hospital room and patient room
    emitHospitalRequestUpdate(String(hospitalId), {
      requestId: String(request._id || request.id),
      status: "ACCEPTED",
      responseStatus: "ACCEPTED",
      responseEntry
    });
    emitPatientStatusUpdate(String(request._id || request.id), {
      status: "ACCEPTED",
      hospitalId: String(hospitalId),
      responseStatus: "ACCEPTED",
      hospitalResponse: responseEntry,
      hospitalResponses: request.hospitalResponses,
      confirmedHospital: {
        id: responseEntry.hospitalId || hospitalId,
        name: responseEntry.hospitalName,
        address: responseEntry.hospitalAddress,
        phone: responseEntry.hospitalPhone,
        emergencyPhone: responseEntry.hospitalEmergencyPhone
      }
    });

    const responseData = responseEntry.toObject ? responseEntry.toObject() : { ...responseEntry };
    responseData.hospitalResponses = request.hospitalResponses;

    res.json({
      success: true,
      message: `Hospital ${responseEntry.hospitalName} confirmed and accepted request #${id}`,
      data: responseData,
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hospital staff rejects their hospital's response
// @route   PUT /api/emergency-requests/:id/hospitals/:hospitalId/reject
// @access  Protected
export const rejectHospitalEmergencyResponse = async (req, res, next) => {
  try {
    const { id, hospitalId } = req.params;
    const { rejectionReason, note } = req.body || {};

    // Authorization check: hospital can only modify its own response
    const authHospitalId = req.user?.hospitalId || req.user?.hospital?._id || req.user?.hospital?.id;
    if (req.user?.role !== "admin") {
      if (!authHospitalId || String(authHospitalId) !== String(hospitalId)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not authorized to modify another hospital's response"
        });
      }
    }

    let request = null;

    if (isMongoDBConnected()) {
      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        const query = isObjectId ? { _id: id } : { id: id };
        request = await EmergencyRequest.findOne(query);
      } catch (e) {
        console.warn("MongoDB rejectHospitalEmergencyResponse lookup fallback:", e.message);
      }
    }

    if (!request) {
      request = mockStore.emergencyRequests.find(
        (r) => String(r._id) === String(id) || String(r.id) === String(id)
      );
    }

    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Emergency request #${id} not found`
      });
    }

    if (!request.hospitalResponses || request.hospitalResponses.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No hospital responses found for request #${id}`
      });
    }

    const responseEntry = request.hospitalResponses.find(
      (hr) => String(hr.hospitalId) === String(hospitalId)
    );

    if (!responseEntry) {
      return res.status(404).json({
        success: false,
        message: `Hospital #${hospitalId} is not a dispatched recipient for request #${id}`
      });
    }

    const now = new Date();
    const finalReason = rejectionReason || "Hospital reported capacity full";
    responseEntry.responseStatus = "REJECTED";
    responseEntry.rejectionReason = finalReason;
    responseEntry.responseNote = note || finalReason;
    responseEntry.responseTimestamp = now.toISOString ? now.toISOString() : now;
    responseEntry.updatedAt = now.toISOString ? now.toISOString() : now;

    // Check if ALL dispatched hospitals have rejected
    const allRejected = request.hospitalResponses.every(
      (hr) => hr.responseStatus === "REJECTED"
    );
    if (allRejected) {
      request.status = "REJECTED";
      request.rejectionReason = finalReason;
      request.hospitalResponse = {
        hospitalId: responseEntry.hospitalId || hospitalId,
        hospitalName: responseEntry.hospitalName,
        hospitalPhone: responseEntry.hospitalPhone,
        hospitalEmergencyPhone: responseEntry.hospitalEmergencyPhone,
        hospitalAddress: responseEntry.hospitalAddress,
        status: "REJECTED",
        responseStatus: "REJECTED",
        rejectionReason: finalReason,
        note: responseEntry.responseNote,
        timestamp: responseEntry.responseTimestamp
      };
    }
    request.updatedAt = now.toISOString ? now.toISOString() : now;

    if (request.markModified) {
      request.markModified("hospitalResponses");
    }
    if (isMongoDBConnected() && request.save) {
      await request.save();
    }

    // Real-Time Notification: Emit to hospital room and patient room
    emitHospitalRequestUpdate(String(hospitalId), {
      requestId: String(request._id || request.id),
      status: "REJECTED",
      responseStatus: "REJECTED",
      responseEntry
    });
    emitPatientStatusUpdate(String(request._id || request.id), {
      status: request.status,
      hospitalId: String(hospitalId),
      responseStatus: "REJECTED",
      hospitalResponse: responseEntry,
      hospitalResponses: request.hospitalResponses
    });

    const responseData = responseEntry.toObject ? responseEntry.toObject() : { ...responseEntry };
    responseData.hospitalResponses = request.hospitalResponses;

    res.json({
      success: true,
      message: `Hospital ${responseEntry.hospitalName} marked request #${id} as Cannot Accept`,
      data: responseData,
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get emergency requests for a hospital
// @route   GET /api/hospitals/:hospitalId/emergency-requests
// @access  Protected
export const getEmergencyRequests = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;
    const { status } = req.query;

    // Authorization: hospital can only view emergency requests dispatched to its desk
    if (req.user && req.user.role !== "admin" && req.user.hospitalId) {
      if (String(req.user.hospitalId) !== String(hospitalId)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Not authorized to view emergency requests for this hospital"
        });
      }
    }

    if (isMongoDBConnected()) {
      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(hospitalId);
        const objId = isObjectId ? new mongoose.Types.ObjectId(hospitalId) : null;
        const idVariants = isObjectId
          ? [hospitalId, objId, String(hospitalId)]
          : [hospitalId, String(hospitalId)];

        const hospRecord = await findHospitalRecord(hospitalId);
        const hospCity = hospRecord?.city ? String(hospRecord.city).split(",")[0].trim() : "";

        // Unassigned requests fallback: only included if the querying hospital has a verified city (>= 3 chars)
        // and strictly matches the patient's specified location for that same city.
        const unassignedCityFallback = (hospCity && hospCity.length >= 3)
          ? [
              {
                $and: [
                  {
                    $or: [
                      { hospitalId: null },
                      { hospitalId: { $exists: false } },
                      { hospitalResponses: { $size: 0 } },
                      { hospitalResponses: { $exists: false } }
                    ]
                  },
                  {
                    $or: [
                      { "location.address": new RegExp(`(^|\\b|\\s|,)${hospCity}(\\b|\\s|,|$)`, "i") },
                      { location: new RegExp(`(^|\\b|\\s|,)${hospCity}(\\b|\\s|,|$)`, "i") }
                    ]
                  }
                ]
              }
            ]
          : [];

        const query = {
          $or: [
            { "hospitalResponses.hospitalId": { $in: idVariants } },
            { hospitalId: { $in: idVariants } },
            ...unassignedCityFallback
          ]
        };

        if (status && status !== "ALL") {
          query.status = status.toUpperCase();
        }

        const requests = await EmergencyRequest.find(query).sort({ createdAt: -1 });

        // Map status specific to this hospital
        const mapped = requests.map((r) => {
          const hospEntry = r.hospitalResponses?.find(
            (hr) => String(hr.hospitalId) === String(hospitalId)
          );
          const doc = r.toObject ? r.toObject() : { ...r };
          if (hospEntry) {
            return {
              ...doc,
              status: hospEntry.responseStatus,
              rawStatus: hospEntry.responseStatus,
              responseStatus: hospEntry.responseStatus,
              rejectionReason: hospEntry.rejectionReason,
              responseNote: hospEntry.responseNote
            };
          }
          return {
            ...doc,
            status: doc.status || "PENDING",
            rawStatus: doc.status || "PENDING",
            responseStatus: doc.status || "PENDING"
          };
        });

        let filtered = mapped;
        if (status && status !== "ALL") {
          filtered = mapped.filter((r) => String(r.status).toUpperCase() === status.toUpperCase());
        }

        return res.json({
          success: true,
          count: filtered.length,
          data: filtered
        });
      } catch (e) {
        console.warn("MongoDB getEmergencyRequests fallback:", e.message);
      }
    }

    // Memory Store Fallback
    const targetHospIdStr = String(hospitalId);
    const mockHosp = mockStore.hospitals.find(
      (h) => String(h._id) === targetHospIdStr || String(h.id) === targetHospIdStr
    );
    const mockCity = (mockHosp?.city || "Pune").toLowerCase();

    let requests = mockStore.emergencyRequests.filter((r) => {
      const hasResponse = r.hospitalResponses?.some(
        (hr) => String(hr.hospitalId) === targetHospIdStr
      );
      if (hasResponse) return true;
      if (r.hospitalId && String(r.hospitalId) === targetHospIdStr) {
        return true;
      }
      const isUnassigned =
        (!r.hospitalId || r.hospitalId === null) &&
        (!r.hospitalResponses || r.hospitalResponses.length === 0);
      if (isUnassigned) {
        const locStr = typeof r.location === "object" ? (r.location?.address || "") : (r.location || "");
        if (!locStr || locStr.toLowerCase().includes(mockCity)) {
          return true;
        }
      }
      return false;
    });

    const mapped = requests.map((r) => {
      const hospEntry = r.hospitalResponses?.find(
        (hr) => String(hr.hospitalId) === targetHospIdStr
      );
      if (hospEntry) {
        return {
          ...r,
          status: hospEntry.responseStatus,
          rawStatus: hospEntry.responseStatus,
          responseStatus: hospEntry.responseStatus,
          rejectionReason: hospEntry.rejectionReason,
          responseNote: hospEntry.responseNote
        };
      }
      return {
        ...r,
        status: r.status || "PENDING",
        rawStatus: r.status || "PENDING",
        responseStatus: r.status || "PENDING"
      };
    });

    let filtered = mapped;
    if (status && status !== "ALL") {
      filtered = mapped.filter((r) => String(r.status).toUpperCase() === status.toUpperCase());
    }

    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hospital marks emergency request as UNDER_REVIEW (Part 4A single-action compatibility)
// @route   PUT /api/emergency-requests/:id/review
// @access  Protected
export const reviewEmergencyRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body || {};
    const hospitalId = req.user?.hospitalId || "670100000000000000000010";

    const hospInfo = getHospitalDetails(hospitalId);
    const now = new Date();
    const responseNote = note || "Hospital casualty desk is actively reviewing triage request.";

    if (isMongoDBConnected()) {
      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        const query = isObjectId ? { _id: id } : { id: id };
        const request = await EmergencyRequest.findOne(query);
        if (request) {
          request.status = "UNDER_REVIEW";
          request.hospitalId = hospitalId;
          request.responseNote = responseNote;
          request.updatedAt = now;
          request.hospitalResponse = {
            hospitalId,
            hospitalName: hospInfo.hospitalName,
            hospitalPhone: hospInfo.hospitalPhone,
            hospitalEmergencyPhone: hospInfo.hospitalEmergencyPhone,
            hospitalAddress: hospInfo.hospitalAddress,
            status: "UNDER_REVIEW",
            responseStatus: "UNDER_REVIEW",
            timestamp: now,
            note: responseNote
          };

          // Also update hospitalResponses entry if present
          if (request.hospitalResponses) {
            const entry = request.hospitalResponses.find(
              (hr) => String(hr.hospitalId) === String(hospitalId)
            );
            if (entry) {
              entry.responseStatus = "UNDER_REVIEW";
              entry.responseNote = responseNote;
              entry.updatedAt = now;
            }
          }

          await request.save();

          return res.json({
            success: true,
            message: `Emergency request #${request.id || request._id} is now under review`,
            data: request
          });
        }
      } catch (e) {
        console.warn("MongoDB reviewEmergencyRequest fallback:", e.message);
      }
    }

    // Memory Store Fallback
    const reqItem = mockStore.emergencyRequests.find(
      (r) => String(r._id) === String(id) || String(r.id) === String(id)
    );

    if (!reqItem) {
      return res.status(404).json({
        success: false,
        message: "Emergency request not found"
      });
    }

    reqItem.status = "UNDER_REVIEW";
    reqItem.hospitalId = hospitalId;
    reqItem.responseNote = responseNote;
    reqItem.updatedAt = now.toISOString();
    reqItem.hospitalResponse = {
      hospitalId,
      hospitalName: hospInfo.hospitalName,
      hospitalPhone: hospInfo.hospitalPhone,
      hospitalEmergencyPhone: hospInfo.hospitalEmergencyPhone,
      hospitalAddress: hospInfo.hospitalAddress,
      status: "UNDER_REVIEW",
      timestamp: now.toISOString(),
      note: responseNote
    };

    if (reqItem.hospitalResponses) {
      const entry = reqItem.hospitalResponses.find(
        (hr) => String(hr.hospitalId) === String(hospitalId)
      );
      if (entry) {
        entry.responseStatus = "UNDER_REVIEW";
        entry.responseNote = responseNote;
        entry.updatedAt = now.toISOString();
      }
    }

    res.json({
      success: true,
      message: `Emergency request #${reqItem.id || reqItem._id} is now under review`,
      data: reqItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hospital accepts emergency request (Part 4A single-action compatibility)
// @route   PUT /api/emergency-requests/:id/accept
// @access  Protected
export const acceptEmergencyRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body || {};
    const hospitalId = req.user?.hospitalId || "670100000000000000000010";

    const hospInfo = getHospitalDetails(hospitalId);
    const now = new Date();
    const responseNote = note || "Hospital Confirmed — Casualty triage team and critical care bed reserved.";

    if (isMongoDBConnected()) {
      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        const query = isObjectId ? { _id: id } : { id: id };
        const request = await EmergencyRequest.findOne(query);
        if (request) {
          request.status = "ACCEPTED";
          request.rejectionReason = null;
          request.hospitalId = hospitalId;
          request.responseNote = responseNote;
          request.responseTimestamp = now;
          request.updatedAt = now;
          request.hospitalResponse = {
            hospitalId,
            hospitalName: hospInfo.hospitalName,
            hospitalPhone: hospInfo.hospitalPhone,
            hospitalEmergencyPhone: hospInfo.hospitalEmergencyPhone,
            hospitalAddress: hospInfo.hospitalAddress,
            status: "ACCEPTED",
            responseStatus: "ACCEPTED",
            timestamp: now,
            note: responseNote
          };

          if (request.hospitalResponses) {
            const entry = request.hospitalResponses.find(
              (hr) => String(hr.hospitalId) === String(hospitalId)
            );
            if (entry) {
              entry.responseStatus = "ACCEPTED";
              entry.responseNote = responseNote;
              entry.rejectionReason = null;
              entry.responseTimestamp = now;
              entry.updatedAt = now;
            }
          }

          await request.save();

          return res.json({
            success: true,
            message: `Emergency request #${request._id} confirmed and accepted`,
            data: request
          });
        }
      } catch (e) {
        console.warn("MongoDB acceptEmergencyRequest fallback:", e.message);
      }
    }

    // Memory Store Fallback
    const reqItem = mockStore.emergencyRequests.find(
      (r) => String(r._id) === String(id) || String(r.id) === String(id)
    );

    if (!reqItem) {
      return res.status(404).json({
        success: false,
        message: "Emergency request not found"
      });
    }

    reqItem.status = "ACCEPTED";
    reqItem.rejectionReason = null;
    reqItem.hospitalId = hospitalId;
    reqItem.responseNote = responseNote;
    reqItem.responseTimestamp = now.toISOString();
    reqItem.updatedAt = now.toISOString();
    reqItem.hospitalResponse = {
      hospitalId,
      hospitalName: hospInfo.hospitalName,
      hospitalPhone: hospInfo.hospitalPhone,
      hospitalEmergencyPhone: hospInfo.hospitalEmergencyPhone,
      hospitalAddress: hospInfo.hospitalAddress,
      status: "ACCEPTED",
      timestamp: now.toISOString(),
      note: responseNote
    };

    if (reqItem.hospitalResponses) {
      const entry = reqItem.hospitalResponses.find(
        (hr) => String(hr.hospitalId) === String(hospitalId)
      );
      if (entry) {
        entry.responseStatus = "ACCEPTED";
        entry.responseNote = responseNote;
        entry.rejectionReason = null;
        entry.responseTimestamp = now.toISOString();
        entry.updatedAt = now.toISOString();
      }
    }

    res.json({
      success: true,
      message: `Emergency request #${reqItem.id || reqItem._id} confirmed and accepted`,
      data: reqItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hospital rejects emergency request (Part 4A single-action compatibility)
// @route   PUT /api/emergency-requests/:id/reject
// @access  Protected
export const rejectEmergencyRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason, note } = req.body || {};
    const hospitalId = req.user?.hospitalId || "670100000000000000000010";

    const hospInfo = getHospitalDetails(hospitalId);
    const now = new Date();
    const finalReason = rejectionReason || "Hospital reported capacity full";
    const responseNote = note || finalReason;

    if (isMongoDBConnected()) {
      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        const query = isObjectId ? { _id: id } : { id: id };
        const request = await EmergencyRequest.findOne(query);
        if (request) {
          request.status = "REJECTED";
          request.rejectionReason = finalReason;
          request.hospitalId = hospitalId;
          request.responseNote = responseNote;
          request.responseTimestamp = now;
          request.updatedAt = now;
          request.hospitalResponse = {
            hospitalId,
            hospitalName: hospInfo.hospitalName,
            hospitalPhone: hospInfo.hospitalPhone,
            hospitalEmergencyPhone: hospInfo.hospitalEmergencyPhone,
            hospitalAddress: hospInfo.hospitalAddress,
            status: "REJECTED",
            responseStatus: "REJECTED",
            rejectionReason: finalReason,
            timestamp: now,
            note: responseNote
          };

          if (request.hospitalResponses) {
            const entry = request.hospitalResponses.find(
              (hr) => String(hr.hospitalId) === String(hospitalId)
            );
            if (entry) {
              entry.responseStatus = "REJECTED";
              entry.rejectionReason = finalReason;
              entry.responseNote = responseNote;
              entry.responseTimestamp = now;
              entry.updatedAt = now;
            }
          }

          await request.save();

          return res.json({
            success: true,
            message: `Emergency request #${request._id} marked as Cannot Accept`,
            data: request
          });
        }
      } catch (e) {
        console.warn("MongoDB rejectEmergencyRequest fallback:", e.message);
      }
    }

    // Memory Store Fallback
    const reqItem = mockStore.emergencyRequests.find(
      (r) => String(r._id) === String(id) || String(r.id) === String(id)
    );

    if (!reqItem) {
      return res.status(404).json({
        success: false,
        message: "Emergency request not found"
      });
    }

    reqItem.status = "REJECTED";
    reqItem.rejectionReason = finalReason;
    reqItem.hospitalId = hospitalId;
    reqItem.responseNote = responseNote;
    reqItem.responseTimestamp = now.toISOString();
    reqItem.updatedAt = now.toISOString();
    reqItem.hospitalResponse = {
      hospitalId,
      hospitalName: hospInfo.hospitalName,
      hospitalPhone: hospInfo.hospitalPhone,
      hospitalEmergencyPhone: hospInfo.hospitalEmergencyPhone,
      hospitalAddress: hospInfo.hospitalAddress,
      status: "REJECTED",
      timestamp: now.toISOString(),
      note: responseNote
    };

    if (reqItem.hospitalResponses) {
      const entry = reqItem.hospitalResponses.find(
        (hr) => String(hr.hospitalId) === String(hospitalId)
      );
      if (entry) {
        entry.responseStatus = "REJECTED";
        entry.rejectionReason = finalReason;
        entry.responseNote = responseNote;
        entry.responseTimestamp = now.toISOString();
        entry.updatedAt = now.toISOString();
      }
    }

    res.json({
      success: true,
      message: `Emergency request #${reqItem.id || reqItem._id} marked as Cannot Accept`,
      data: reqItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hospital completes emergency request
// @route   PUT /api/emergency-requests/:id/complete
// @access  Protected
export const completeEmergencyRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body || {};
    const hospitalId = req.user?.hospitalId || "670100000000000000000010";
    const now = new Date();
    const responseNote = note || "Emergency coordination completed. Patient arrived/admitted.";

    if (isMongoDBConnected()) {
      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        const query = isObjectId ? { _id: id } : { id: id };
        const request = await EmergencyRequest.findOne(query);
        if (request) {
          request.status = "COMPLETED";
          request.responseNote = responseNote;
          request.updatedAt = now;
          if (request.hospitalResponse) {
            request.hospitalResponse.status = "COMPLETED";
            request.hospitalResponse.note = responseNote;
          }
          await request.save();

          emitHospitalRequestUpdate(String(hospitalId), {
            requestId: String(request._id || request.id),
            status: "COMPLETED",
            responseStatus: "COMPLETED"
          });
          emitPatientStatusUpdate(String(request._id || request.id), {
            status: "COMPLETED",
            hospitalId: String(hospitalId),
            responseStatus: "COMPLETED"
          });

          return res.json({
            success: true,
            message: `Emergency request #${request._id} marked as Completed`,
            data: request
          });
        }
      } catch (e) {
        console.warn("MongoDB completeEmergencyRequest fallback:", e.message);
      }
    }

    // Memory Store Fallback
    const reqItem = mockStore.emergencyRequests.find(
      (r) => String(r._id) === String(id) || String(r.id) === String(id)
    );

    if (!reqItem) {
      return res.status(404).json({
        success: false,
        message: "Emergency request not found"
      });
    }

    reqItem.status = "COMPLETED";
    reqItem.responseNote = responseNote;
    reqItem.updatedAt = now.toISOString();
    if (reqItem.hospitalResponse) {
      reqItem.hospitalResponse.status = "COMPLETED";
      reqItem.hospitalResponse.note = responseNote;
    }

    emitHospitalRequestUpdate(String(hospitalId), {
      requestId: String(reqItem._id || reqItem.id),
      status: "COMPLETED",
      responseStatus: "COMPLETED"
    });
    emitPatientStatusUpdate(String(reqItem._id || reqItem.id), {
      status: "COMPLETED",
      hospitalId: String(hospitalId),
      responseStatus: "COMPLETED"
    });

    res.json({
      success: true,
      message: `Emergency request #${reqItem.id || reqItem._id} marked as Completed`,
      data: reqItem
    });
  } catch (error) {
    next(error);
  }
};
