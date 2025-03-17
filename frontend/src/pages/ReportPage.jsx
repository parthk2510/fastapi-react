import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import './styles/ReportPage.css';

const ReportPage = () => {
    const [userData, setUserData] = useState({});  // Store user data for backend submission

    // Fetch user details from Firestore
    useEffect(() => {
        const fetchUserData = async () => {
            const currentUser = auth.currentUser;

            if (currentUser) {
                const userDocRef = doc(db, "users", currentUser.uid);
                try {
                    const docSnap = await getDoc(userDocRef);

                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        console.error("User data not found in Firestore.");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };

        fetchUserData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = {
            ...userData, // Include user data directly
            affectedEntity: e.target.elements['affectedEntity'].value,
            description: e.target.elements['description'].value,
            occurrenceDate: e.target.elements['occurrenceDate'].value,
            detectionDate: e.target.elements['detectionDate'].value
        };

        console.log("Form Data for Backend Submission:", formData);
        // Send `formData` to your backend API
    };

    return (
        <div className="report-page-container">
            <h1>Incident Reporting Form</h1>

            <form className="report-page" onSubmit={handleSubmit}>
                <section className="incident-details">
                    <h2>Basic Incident Details</h2>

                    <label>Affected Entity</label>
                    <input type="text" name="affectedEntity" placeholder="Enter affected entity" />

                    <label>Brief Description of Incident</label>
                    <textarea name="description" placeholder="Enter description"></textarea>

                    <label>Occurrence Date & Time</label>
                    <input type="datetime-local" name="occurrenceDate" />

                    <label>Detection Date & Time</label>
                    <input type="datetime-local" name="detectionDate" />
                </section>

                <button type="submit" className="submit-btn">Submit Report</button>
            </form>
        </div>
    );
};

export default ReportPage;
