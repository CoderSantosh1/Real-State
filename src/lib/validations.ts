import { z } from 'zod';

export const propertySchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  
  description: z.string()
    .min(1, 'Description is required')
    .max(1000, 'Description cannot exceed 1000 characters'),
  
  price: z.number()
    .min(0, 'Price cannot be negative'),
  
  location: z.object({
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
    coordinates: z.object({
      lat: z.number().optional(),
      lng: z.number().optional()
    }).optional()
  }),
  
  propertyType: z.enum(['house', 'apartment', 'condo', 'townhouse', 'villa', 'commercial', 'land']),
  
  listingType: z.enum(['sale', 'rent']),
  
  features: z.object({
    bedrooms: z.number().min(0, 'Bedrooms cannot be negative'),
    bathrooms: z.number().min(0, 'Bathrooms cannot be negative'),
    area: z.number().min(1, 'Area must be at least 1 sq ft'),
    yearBuilt: z.number()
      .min(1800, 'Year built must be after 1800')
      .max(new Date().getFullYear(), 'Year built cannot be in the future')
      .optional(),
    parking: z.number().min(0, 'Parking cannot be negative').optional(),
    amenities: z.array(z.string()).optional()
  }),
  
  agent: z.object({
    name: z.string().min(1, 'Agent name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(1, 'Agent phone is required')
  }),
  
  status: z.enum(['active', 'sold', 'rented', 'pending', 'inactive']).optional(),
  featured: z.boolean().optional()
});

export const userSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name cannot exceed 50 characters'),
  
  email: z.string()
    .email('Invalid email format'),
  
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
  
  role: z.enum(['user', 'agent', 'admin']).optional(),
  
  phone: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format')
    .optional(),
  
  agentProfile: z.object({
    license: z.string().optional(),
    company: z.string().optional(),
    experience: z.number().optional(),
    specializations: z.array(z.string()).optional()
  }).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const searchSchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  propertyType: z.enum(['house', 'apartment', 'condo', 'townhouse', 'villa', 'commercial', 'land']).optional(),
  listingType: z.enum(['sale', 'rent']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minBedrooms: z.number().min(0).optional(),
  maxBedrooms: z.number().min(0).optional(),
  minBathrooms: z.number().min(0).optional(),
  maxBathrooms: z.number().min(0).optional(),
  minArea: z.number().min(0).optional(),
  maxArea: z.number().min(0).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(50).optional()
});

export type PropertyFormData = z.infer<typeof propertySchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
