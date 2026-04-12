import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';
const roles = ['Victim', 'Volunteer', 'NGO', 'Admin'];

export default function RegisterPage() {
  const [role, setRole] = useState('');
  const [form, setForm] = useState({
    // Common
    name: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    age: '',
    bloodGroup: 'A+',
    aadhaarNumber: '',
    
    // Victim-specific
    location: '',
    disasterType: 'Flood',
    injuryLevel: 'Minor - Mostly safe',
    numberOfPeople: 1,
    hasChildrenOrElderly: 'No',
    additionalInfo: '',
    
    // Volunteer-specific
    experienceLevel: '',
    specialization: '',
    skillsDescription: '',
    licenceNumber: '',
    availability: 'Part-time',
    vehicleAvailable: 'No',
    
    // NGO-specific
    organizationName: '',
    registrationNumber: '',
    establishedYear: '',
    headName: '',
    registeredAddress: '',
    totalWorkers: '',
    trainedRescueWorkers: '',
    pastExperience: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    console.log('🔵 [SUBMIT CLICKED] Role:', role, 'Form:', form);
    
    if (!role) return alert('Select a role first.');
    
    // Basic validation for all roles
    const baseFields = ['name', 'email', 'password'];
    if (role === 'NGO') baseFields.push('organizationName', 'phone', 'registeredAddress');
    else baseFields.push('phone');
    
    for (const field of baseFields) {
      if (!form[field]?.toString().trim()) {
        console.error(`❌ VALIDATION FAILED: Missing field: ${field}`);
        return alert(`Please fill in: ${field}`);
      }
    }

    // Role-specific validation
    if (role === 'Victim') {
      console.log('👤 [VICTIM VALIDATION] Checking fields:', { location: form.location, disasterType: form.disasterType, injuryLevel: form.injuryLevel });
      if (!form.location?.trim() || !form.disasterType || !form.injuryLevel) {
        console.error('❌ VICTIM VALIDATION FAILED:', { location: !form.location?.trim(), disasterType: !form.disasterType, injuryLevel: !form.injuryLevel });
        return alert('Please complete all Victim fields (Location, Disaster Type, Injury Level)');
      }
    } else if (role === 'Volunteer') {
      if (!form.address?.trim()) {
        return alert('Please fill in Address');
      }
    } else if (role === 'NGO') {
      if (!form.registrationNumber?.trim() || !form.headName?.trim()) {
        return alert('Please fill in Registration Number and Head Name');
      }
    }

    setLoading(true);
    let endpoint = '';
    let payload = {};

    try {
      if (role === 'Victim') {
        endpoint = `${BACKEND_URL}/api/victims/register`;
        payload = {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          password: form.password.trim(),
          location: form.location.trim(),
          age: form.age ? Number(form.age) : undefined,
          bloodGroup: form.bloodGroup || undefined,
          aadhaarNumber: form.aadhaarNumber || undefined,
          address: form.address || undefined,
          disasterType: form.disasterType,
          injuryLevel: form.injuryLevel,
          numberOfPeople: Number(form.numberOfPeople) || 1,
          hasChildrenOrElderly: form.hasChildrenOrElderly,
          additionalInfo: form.additionalInfo || '',
        };
      } else if (role === 'Volunteer') {
        endpoint = `${BACKEND_URL}/api/volunteers/register`;
        payload = {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          password: form.password.trim(),
          address: form.address.trim(),
          age: form.age ? Number(form.age) : undefined,
          bloodGroup: form.bloodGroup || undefined,
          experienceLevel: form.experienceLevel || undefined,
          specialization: form.specialization || undefined,
          skillsDescription: form.skillsDescription || undefined,
          aadhaarNumber: form.aadhaarNumber || undefined,
          licenceNumber: form.licenceNumber || undefined,
          availability: form.availability || 'Part-time',
          vehicleAvailable: form.vehicleAvailable || 'No',
        };
      } else if (role === 'NGO') {
        endpoint = `${BACKEND_URL}/api/ngos/register`;
        payload = {
          organizationName: form.organizationName.trim(),
          registrationNumber: form.registrationNumber.trim(),
          establishedYear: form.establishedYear ? Number(form.establishedYear) : undefined,
          headName: form.headName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          password: form.password.trim(),
          registeredAddress: form.registeredAddress.trim(),
          totalWorkers: form.totalWorkers ? Number(form.totalWorkers) : undefined,
          trainedRescueWorkers: form.trainedRescueWorkers ? Number(form.trainedRescueWorkers) : undefined,
          pastExperience: form.pastExperience || undefined,
        };
      }

      console.log(`🚀 [${role.toUpperCase()} REGISTER] Sending payload:`, payload);
      console.log('🔗 Backend URL:', endpoint);
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📥 Response status:', res.status);
      const data = await res.json();
      console.log('📥 Response data:', data);
      
      if (!res.ok) {
        console.error('❌ Backend rejected:', data);
        throw new Error(data.error || `Registration failed (${res.status})`);
      }

      console.log(`✅ ${role} registration success!`);
      const successMsg = role === 'Victim' 
        ? `✅ Registration successful!\n\nTicket ID: ${data.ticketId}\n\nPriority: ${data.priorityLevel}\nScore: ${data.priorityScore}`
        : `✅ ${role} Registration successful!\n\nToken received. Logging in...`;
        
      alert(successMsg);
      
      // Reset form
      setForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        location: '',
        age: '',
        bloodGroup: 'A+',
        aadhaarNumber: '',
        address: '',
        organizationName: '',
        registrationNumber: '',
        establishedYear: '',
        headName: '',
        registeredAddress: '',
        experienceLevel: '',
        specialization: '',
        skillsDescription: '',
        licenceNumber: '',
        availability: 'Part-time',
        vehicleAvailable: 'No',
        totalWorkers: '',
        trainedRescueWorkers: '',
        pastExperience: '',
        disasterType: 'Flood',
        injuryLevel: 'Minor - Mostly safe',
        numberOfPeople: 1,
        hasChildrenOrElderly: 'No',
        additionalInfo: '',
      });
      setRole('');
      
      navigate('/map');
    } catch (err) {
      console.error(`❌ ${role} registration error:`, err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0C0F', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif' }}>
      <div style={{ background: '#181C22', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '420px' }}>
        <button onClick={() => navigate('/')}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)',
            color: '#8B94A3', padding: '6px 12px', borderRadius: '8px',
            cursor: 'pointer', marginBottom: '1.5rem', fontFamily: 'Syne, sans-serif' }}>
          ← Back
        </button>
        <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '1.5rem' }}>Register</h2>
        
        {/* Role selector */}
        <label style={{ color: '#8B94A3', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
          SELECT ROLE
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1.5rem' }}>
          {roles.map(r => (
            <button key={r} onClick={() => setRole(r)}
              style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer',
                fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 600,
                background: role === r ? '#E8321A' : '#1E242D',
                color: role === r ? '#fff' : '#8B94A3',
                border: role === r ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
              {r}
            </button>
          ))}
        </div>

        {role && (
          <>
            <input
              placeholder="Full name"
              value={form.name}
              onChange={e => updateForm('name', e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Phone number"
              value={form.phone}
              onChange={e => updateForm('phone', e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Email address"
              type="email"
              value={form.email}
              onChange={e => updateForm('email', e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={e => updateForm('password', e.target.value)}
              style={inputStyle}
            />
            {role === 'Victim' && (
              <>
                <input placeholder="Current location *" value={form.location} onChange={e => updateForm('location', e.target.value)} style={inputStyle} />
                <select value={form.disasterType} onChange={e => updateForm('disasterType', e.target.value)} style={inputStyle}>
                  <option value="Flood">Flood</option>
                  <option value="Earthquake">Earthquake</option>
                  <option value="Fire">Fire</option>
                  <option value="Cyclone / Storm">Cyclone / Storm</option>
                  <option value="Landslide">Landslide</option>
                  <option value="Industrial Accident">Industrial Accident</option>
                  <option value="Building Collapse">Building Collapse</option>
                  <option value="Other">Other</option>
                </select>
                <select value={form.injuryLevel} onChange={e => updateForm('injuryLevel', e.target.value)} style={inputStyle}>
                  <option value="Critical - Immediate help needed">Critical - Immediate help needed</option>
                  <option value="Moderate - Injured but stable">Moderate - Injured but stable</option>
                  <option value="Minor - Mostly safe">Minor - Mostly safe</option>
                  <option value="None - Stranded only">None - Stranded only</option>
                </select>
                <input placeholder="Number of people affected" type="number" value={form.numberOfPeople} onChange={e => updateForm('numberOfPeople', e.target.value)} style={inputStyle} />
                <select value={form.hasChildrenOrElderly} onChange={e => updateForm('hasChildrenOrElderly', e.target.value)} style={inputStyle}>
                  <option value="No">No Children/Elderly</option>
                  <option value="Yes">Yes, has Children/Elderly</option>
                </select>
                <input placeholder="Age" type="number" value={form.age} onChange={e => updateForm('age', e.target.value)} style={inputStyle} />
                <select value={form.bloodGroup} onChange={e => updateForm('bloodGroup', e.target.value)} style={inputStyle}>
                  <option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
                </select>
                <input placeholder="Aadhaar Number (12 digits)" value={form.aadhaarNumber} onChange={e => updateForm('aadhaarNumber', e.target.value)} style={inputStyle} />
                <input placeholder="Address" value={form.address} onChange={e => updateForm('address', e.target.value)} style={inputStyle} />
                <textarea placeholder="Additional information (optional)" value={form.additionalInfo} onChange={e => updateForm('additionalInfo', e.target.value)} style={{ ...inputStyle, minHeight: '60px' }} />
              </>
            )}
            
            {role === 'Volunteer' && (
              <>
                <input placeholder="Address *" value={form.address} onChange={e => updateForm('address', e.target.value)} style={inputStyle} />
                <input placeholder="Age" type="number" value={form.age} onChange={e => updateForm('age', e.target.value)} style={inputStyle} />
                <select value={form.bloodGroup} onChange={e => updateForm('bloodGroup', e.target.value)} style={inputStyle}>
                  <option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
                </select>
                <select value={form.experienceLevel} onChange={e => updateForm('experienceLevel', e.target.value)} style={inputStyle}>
                  <option value="">Select Experience Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
                <input placeholder="Specialization (e.g., Medical, Search, Logistics)" value={form.specialization} onChange={e => updateForm('specialization', e.target.value)} style={inputStyle} />
                <textarea placeholder="Skills Description" value={form.skillsDescription} onChange={e => updateForm('skillsDescription', e.target.value)} style={{ ...inputStyle, minHeight: '60px' }} />
                <input placeholder="Aadhaar Number (12 digits)" value={form.aadhaarNumber} onChange={e => updateForm('aadhaarNumber', e.target.value)} style={inputStyle} />
                <input placeholder="Licence Number (optional)" value={form.licenceNumber} onChange={e => updateForm('licenceNumber', e.target.value)} style={inputStyle} />
                <select value={form.availability} onChange={e => updateForm('availability', e.target.value)} style={inputStyle}>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Occasional">Occasional</option>
                </select>
                <select value={form.vehicleAvailable} onChange={e => updateForm('vehicleAvailable', e.target.value)} style={inputStyle}>
                  <option value="No">No Vehicle</option>
                  <option value="Car">Car</option>
                  <option value="Bike">Bike</option>
                  <option value="Truck">Truck</option>
                </select>
              </>
            )}
            
            {role === 'NGO' && (
              <>
                <input placeholder="Organization Name *" value={form.organizationName} onChange={e => updateForm('organizationName', e.target.value)} style={inputStyle} />
                <input placeholder="Registration Number *" value={form.registrationNumber} onChange={e => updateForm('registrationNumber', e.target.value)} style={inputStyle} />
                <input placeholder="Year Established" type="number" value={form.establishedYear} onChange={e => updateForm('establishedYear', e.target.value)} style={inputStyle} />
                <input placeholder="Head Name *" value={form.headName} onChange={e => updateForm('headName', e.target.value)} style={inputStyle} />
                <input placeholder="Registered Address *" value={form.registeredAddress} onChange={e => updateForm('registeredAddress', e.target.value)} style={inputStyle} />
                <input placeholder="Total Workers" type="number" value={form.totalWorkers} onChange={e => updateForm('totalWorkers', e.target.value)} style={inputStyle} />
                <input placeholder="Trained Rescue Workers" type="number" value={form.trainedRescueWorkers} onChange={e => updateForm('trainedRescueWorkers', e.target.value)} style={inputStyle} />
                <textarea placeholder="Past Experience & Details" value={form.pastExperience} onChange={e => updateForm('pastExperience', e.target.value)} style={{ ...inputStyle, minHeight: '60px' }} />
              </>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ width: '100%', padding: '13px', background: '#E8321A', color: '#fff',
                border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600,
                fontFamily: 'Syne, sans-serif', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}
            >
              {loading ? 'SUBMITTING...' : 'Submit & Continue →'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '11px 13px', marginBottom: '10px',
  background: '#1E242D', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', color: '#fff', fontSize: '14px',
  fontFamily: 'Syne, sans-serif', boxSizing: 'border-box', display: 'block'
};
