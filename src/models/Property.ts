import mongoose from 'mongoose';

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Property description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Property price is required'],
    min: [0, 'Price cannot be negative']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  propertyType: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['house', 'apartment', 'condo', 'townhouse', 'villa', 'commercial', 'land']
  },
  listingType: {
    type: String,
    required: [true, 'Listing type is required'],
    enum: ['sale', 'rent']
  },
  features: {
    bedrooms: {
      type: Number,
      required: [true, 'Number of bedrooms is required'],
      min: 0
    },
    bathrooms: {
      type: Number,
      required: [true, 'Number of bathrooms is required'],
      min: 0
    },
    area: {
      type: Number,
      required: [true, 'Property area is required'],
      min: [1, 'Area must be at least 1 sq ft']
    },
    yearBuilt: {
      type: Number,
      min: [1800, 'Year built must be after 1800'],
      max: [new Date().getFullYear(), 'Year built cannot be in the future']
    },
    parking: {
      type: Number,
      default: 0
    },
    amenities: [{
      type: String
    }]
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: 'Property image'
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  agent: {
    name: {
      type: String,
      required: [true, 'Agent name is required']
    },
    email: {
      type: String,
      required: [true, 'Agent email is required']
    },
    phone: {
      type: String,
      required: [true, 'Agent phone is required']
    }
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'rented', 'pending', 'inactive'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create indexes for better search performance
PropertySchema.index({ 'location.city': 1, propertyType: 1, listingType: 1 });
PropertySchema.index({ price: 1 });
PropertySchema.index({ status: 1 });
PropertySchema.index({ featured: -1, createdAt: -1 });

export default mongoose.models.Property || mongoose.model('Property', PropertySchema);
