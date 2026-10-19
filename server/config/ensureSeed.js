import mongoose from "mongoose";
import Hospital from "../models/Hospital.js";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import mockStore from "./mockStore.js";

/**
 * Safely ensures core network hospitals, users, and doctors are populated in MongoDB
 * WITHOUT modifying or clearing any existing emergencyrequests or availability records.
 */
export async function ensureSeedData() {
  try {
    const hospitalCount = await Hospital.countDocuments();
    if (hospitalCount === 0) {
      console.log("ℹ️  Hospital collection is empty. Populating network hospitals from mock store...");

      // Insert hospitals with preserved ObjectIds
      for (const h of mockStore.hospitals) {
        const hospDoc = {
          _id: new mongoose.Types.ObjectId(h._id),
          name: h.name,
          address: h.address,
          city: h.city,
          phone: h.phone,
          emergencyPhone: h.emergencyPhone,
          emergencyAvailable: h.emergencyAvailable ?? true,
          description: h.description,
          latitude: h.latitude,
          longitude: h.longitude,
          lastVerified: h.lastVerified,
          readinessStatus: h.readinessStatus,
          totalBeds: h.totalBeds
        };
        await Hospital.updateOne({ _id: hospDoc._id }, { $set: hospDoc }, { upsert: true });
      }
      console.log(`✅ ${mockStore.hospitals.length} hospitals verified in MongoDB.`);
    }

    // Ensure demo hospital users exist for all network hospitals
    // Never create or overwrite administrator accounts with default credentials
    let seededUsersCount = 0;
    for (const u of mockStore.users) {
      if (u.role === "admin") {
        // Administrator accounts must only be provisioned explicitly via createAdmin.js
        // or when ADMIN_PASSWORD is explicitly set in environment with valid length
        if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 6) {
          continue;
        }
      }

      const existing = await User.findOne({ email: u.email.toLowerCase() });
      if (!existing) {
        const userPassword = u.role === "admin" ? process.env.ADMIN_PASSWORD : u.password;
        // Never seed users into MongoDB without a valid password meeting model requirements (min 6 characters)
        if (!userPassword || typeof userPassword !== "string" || userPassword.length < 6) {
          continue;
        }

        const userDoc = new User({
          _id: new mongoose.Types.ObjectId(u._id),
          name: u.name,
          email: u.email.toLowerCase(),
          password: userPassword,
          role: u.role,
          hospitalId: u.hospitalId ? new mongoose.Types.ObjectId(u.hospitalId) : undefined
        });
        await userDoc.save();
        seededUsersCount++;
      }
    }
    if (seededUsersCount > 0) {
      console.log(`✅ Seeded ${seededUsersCount} additional user accounts into MongoDB.`);
    }

    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0 && mockStore.doctors && mockStore.doctors.length > 0) {
      console.log("ℹ️  Doctor collection is empty. Populating specialists from mock store...");
      for (const d of mockStore.doctors) {
        await Doctor.updateOne(
          { _id: new mongoose.Types.ObjectId(d._id) },
          {
            $set: {
              _id: new mongoose.Types.ObjectId(d._id),
              hospitalId: new mongoose.Types.ObjectId(d.hospitalId),
              name: d.name,
              specialization: d.specialization || d.specialty,
              department: d.department,
              qualification: d.qualification,
              experience: d.experience,
              status: d.status,
              workingHours: d.workingHours,
              phone: d.phone
            }
          },
          { upsert: true }
        );
      }
      console.log(`✅ ${mockStore.doctors.length} specialists verified in MongoDB.`);
    }
  } catch (err) {
    console.warn("⚠️  ensureSeedData notice:", err.message);
  }
}

export default ensureSeedData;
