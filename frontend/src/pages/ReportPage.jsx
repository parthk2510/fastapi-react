import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import './styles/ReportPage.css';
import axios from 'axios';

const ReportPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        organization: '',
        contact: '',
        email: '',
        address: '',
        affected_entity: '',
        incident_type: [],
        is_critical: '',
        domain: '',
        ip_address: '',
        os: '',
        location: '',
        description: '',
        occurrence_date: '',
        detection_date: ''
    });

    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

    // Fetch Firestore Data
    useEffect(() => {
        const fetchUserData = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const userDocRef = doc(db, "users", currentUser.uid);
                try {
                    const docSnap = await getDoc(userDocRef);
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setFormData(prev => ({
                            ...prev,
                            name: userData.name || '',
                            organization: userData.organization || '',
                            contact: userData.contact || '',
                            email: userData.email || '',
                            address: userData.address || ''
                        }));
                    } else {
                        console.error("User data not found in Firestore.");
                    }
                } catch (error) {
                    // console.error("Error fetching user data:", error);
                }
            }
        };
        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (incident) => {
        setFormData(prev => {
            const updatedIncidentTypes = prev.incident_type.includes(incident)
                ? prev.incident_type.filter(type => type !== incident)
                : [...prev.incident_type, incident];
            return {
                ...prev,
                incident_type: updatedIncidentTypes
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus({ type: 'info', message: 'Submitting report...' });

        try {
            const response = await axios.post('http://localhost:8000/api/report', formData);
            setSubmitStatus({ 
                type: 'success', 
                message: 'Report generated and sent successfully!' 
            });
        } catch (error) {
            setSubmitStatus({ 
                type: 'error', 
                message: 'Failed to submit report. Please try again.' 
            });
            console.error('Error:', error);
        }
    };

    const incidentTypes = [
        'Targeted scanning/probing of critical networks/systems',
        'Compromise of critical systems/information',
        'Unauthorised access of IT systems/data',
        'Defacement or intrusion into the website',
        'Malicious code attacks',
        'Attack on servers and network devices',
        'Identity Theft, spoofing and phishing attacks',
        'DoS/DDoS attacks',
        'Attacks on Critical infrastructure and Wireless networks',
        'Data Breach',
        'Data Leak'
    ];

    return (
        <div className="report-page-container">
            <h1>Incident Reporting Form</h1>

            {submitStatus.message && (
                <div className={`status-message ${submitStatus.type}`}>
                    {submitStatus.message}
                </div>
            )}

            <form className="report-page" onSubmit={handleSubmit}>
                <section className="contact-info">
                    <h2>Contact Information of the Reporter</h2>
                    <label>Name & Role/Title</label>
                    <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your name and role" 
                        required
                    />

                    <label>Organization Name</label>
                    <input 
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        placeholder="Enter organization name"
                    />

                    <label>Contact No.</label>
                    <input 
                        type="text"
                        name="contact"
                        value={formData.contact}
                        onChange={handleInputChange}
                        placeholder="Enter contact number"
                        required
                    />

                    <label>Email</label>
                    <input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                        required
                    />

                    <label>Address</label>
                    <textarea 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter address"
                    ></textarea>
                </section>

                <section className="incident-details">
                    <h2>Basic Incident Details</h2>
                    <label>Affected Entity</label>
                    <input 
                        type="text"
                        name="affected_entity"
                        value={formData.affected_entity}
                        onChange={handleInputChange}
                        placeholder="Enter affected entity"
                        required
                    />

                    <label>Incident Type</label>
                    <div className="checkbox-group">
                        {incidentTypes.map((incident, index) => (
                            <label key={index}>
                                <input
                                    type="checkbox"
                                    checked={formData.incident_type.includes(incident)}
                                    onChange={() => handleCheckboxChange(incident)}
                                /> {incident}
                            </label>
                        ))}
                    </div>

                    <label>Is the affected system critical to the organization's mission?</label>
                    <textarea 
                        name="is_critical"
                        value={formData.is_critical}
                        onChange={handleInputChange}
                        placeholder="Provide brief details"
                        required
                    ></textarea>

                    <label>Domain/URL</label>
                    <input 
                        type="text"
                        name="domain"
                        value={formData.domain}
                        onChange={handleInputChange}
                        placeholder="Enter domain/URL"
                    />

                    <label>IP Address</label>
                    <input 
                        type="text"
                        name="ip_address"
                        value={formData.ip_address}
                        onChange={handleInputChange}
                        placeholder="Enter IP address"
                    />

                    <label>Operating System</label>
                    <input 
                        type="text"
                        name="os"
                        value={formData.os}
                        onChange={handleInputChange}
                        placeholder="Enter OS details"
                    />

                    <label>Location</label>
                    <input 
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Enter location details"
                    />

                    <label>Brief Description of Incident</label>
                    <textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter description"
                        required
                    ></textarea>

                    <label>Occurrence Date & Time</label>
                    <input 
                        type="datetime-local"
                        name="occurrence_date"
                        value={formData.occurrence_date}
                        onChange={handleInputChange}
                        required
                    />

                    <label>Detection Date & Time</label>
                    <input 
                        type="datetime-local"
                        name="detection_date"
                        value={formData.detection_date}
                        onChange={handleInputChange}
                        required
                    />
                </section>

                <button type="submit" className="submit-btn">Submit Report</button>
            </form>
        </div>
    );
};

export default ReportPage;
