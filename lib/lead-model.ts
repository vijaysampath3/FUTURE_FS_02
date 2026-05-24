import mongoose from 'mongoose'

const LeadSchema = new mongoose.Schema({
  fullName:  { type: String, required: true },
  email:     { type: String, required: true },
  phone:     { type: String },
  source:    { type: String }, // "Website", "Referral", "Social Media", "Email Campaign", "Cold Call", "Other"
  status:    { type: String, enum: ['New', 'Contacted', 'Converted'], default: 'New' },
  followUpDate: { type: Date, default: null },
  notes:     [{ text: String, createdAt: { type: Date, default: Date.now } }],
  createdAt: { type: Date, default: Date.now }
})

export const getLeadModel = (firebaseUID: string) => {
  const collectionName = `user_${firebaseUID}_leads`
  // Check if model already exists to avoid OverwriteModelError
  return mongoose.models[collectionName] ||
    mongoose.model(collectionName, LeadSchema, collectionName)
}
