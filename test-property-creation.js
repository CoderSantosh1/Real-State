// Simple test to verify property creation API works
const testProperty = {
  title: "Test Property Creation",
  description: "This is a test property to verify the API is working correctly",
  price: 450000,
  location: {
    address: "123 Test Street",
    city: "Test City",
    state: "TS",
    zipCode: "12345"
  },
  propertyType: "house",
  listingType: "sale",
  features: {
    bedrooms: 3,
    bathrooms: 2,
    area: 1500,
    yearBuilt: 2020,
    parking: 2,
    amenities: ["Garage", "Garden", "Modern Kitchen"]
  },
  agent: {
    name: "Test Agent",
    email: "test@agent.com",
    phone: "+1-555-TEST"
  },
  status: "active",
  featured: false,
  images: [
    {
      url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
      alt: "Test property image",
      isPrimary: true
    }
  ]
};

async function testPropertyCreation() {
  try {
    console.log('Testing property creation API...');
    
    const response = await fetch('http://localhost:3000/api/properties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProperty)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS: Property created successfully!');
      console.log('Property ID:', result.property._id);
      console.log('Property Title:', result.property.title);
      console.log('Location:', result.property.location.city, result.property.location.state);
    } else {
      console.log('❌ ERROR: Property creation failed');
      console.log('Status:', response.status);
      console.log('Error:', result.error);
      if (result.details) {
        console.log('Details:', result.details);
      }
    }
  } catch (error) {
    console.log('❌ NETWORK ERROR:', error.message);
    console.log('Make sure the development server is running on http://localhost:3000');
  }
}

// Run the test only if this file is executed directly
if (require.main === module) {
  testPropertyCreation();
}

module.exports = { testPropertyCreation, testProperty };
