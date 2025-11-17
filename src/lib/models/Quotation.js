import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  service: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});

const QuotationSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  validUntil: {
    type: String,
    required: true
  },
  quotationNo: {
    type: String,
    required: true,
    unique: true
  },
  services: [ServiceSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.Quotation || mongoose.model('Quotation', QuotationSchema);