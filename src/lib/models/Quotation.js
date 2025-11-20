import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: [true, 'Service heading is required']
  },
  details: {
    type: String,
    required: [true, 'Service details are required']
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const QuotationSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone/Email is required'],
    trim: true
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
    unique: true,
    index: true
  },
  services: {
    type: [ServiceSchema],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one service is required'
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
QuotationSchema.index({ createdAt: -1 });
QuotationSchema.index({ quotationNo: 1 });

// Delete old model if exists
if (mongoose.models.Quotation) {
  delete mongoose.models.Quotation;
}

export default mongoose.model('Quotation', QuotationSchema);