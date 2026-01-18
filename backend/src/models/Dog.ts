import mongoose, { Document, Schema } from 'mongoose';

export interface IDog extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  dateOfBirth: Date;
  age: number;
  weight: number;
  color: string;
  description: string;
  images: string[];
  mainImage: string;
  
  healthInfo: {
    vaccinated: boolean;
    neutered: boolean;
    healthCertificates: string[];
    veterinarian: {
      name: string;
      contact: string;
    };
    medicalHistory: string;
  };
  
  pedigree: {
    registered: boolean;
    registrationNumber?: string;
    registry?: string;
    sire?: string;
    dam?: string;
    pedigreeDocument?: string;
  };
  
  breeding: {
    available: boolean;
    studFee?: number;
    studFeeNegotiable: boolean;
    previousLitters: number;
    temperament: string[];
  };
  
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  status: 'active' | 'inactive' | 'pending';
  views: number;
  favorites: number;
  createdAt: Date;
  updatedAt: Date;
}

const DogSchema = new Schema<IDog>({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  breed: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: [String],
  mainImage: String,
  
  healthInfo: {
    vaccinated: {
      type: Boolean,
      default: false
    },
    neutered: {
      type: Boolean,
      default: false
    },
    healthCertificates: [String],
    veterinarian: {
      name: String,
      contact: String
    },
    medicalHistory: String
  },
  
  pedigree: {
    registered: {
      type: Boolean,
      default: false
    },
    registrationNumber: String,
    registry: String,
    sire: String,
    dam: String,
    pedigreeDocument: String
  },
  
  breeding: {
    available: {
      type: Boolean,
      default: true
    },
    studFee: Number,
    studFeeNegotiable: {
      type: Boolean,
      default: false
    },
    previousLitters: {
      type: Number,
      default: 0
    },
    temperament: [String]
  },
  
  location: {
    address: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: String,
    country: {
      type: String,
      default: 'USA'
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for search optimization
DogSchema.index({ breed: 1, gender: 1, 'breeding.available': 1 });
DogSchema.index({ 'location.city': 1, 'location.state': 1 });
DogSchema.index({ owner: 1 });

export default mongoose.model<IDog>('Dog', DogSchema);