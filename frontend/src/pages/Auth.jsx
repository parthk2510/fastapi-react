import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth, db } from "../firebaseConfig"; // Import Firestore config
import { doc, setDoc } from "firebase/firestore"; // Firestore for saving data
import "./styles/Auth.css";
import { motion, AnimatePresence } from "framer-motion";
import Squares from "../components/Squares";
import DecryptedText from "../components/DecryptedText";
import ClickSpark from "../components/ClickSpark";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleToggle = () => setIsLogin((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("Login successful!");
        navigate("/"); // Redirect to dashboard
      } else {
        if (password !== confirmPassword) {
          setError("Passwords do not match!");
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store additional user info in Firestore
        await setDoc(doc(db, "users", user.uid), {
          name,
          contact,
          email,
          address,
          organization: organization || "N/A", // Optional field handling
          createdAt: new Date().toISOString()
        });

        setMessage("Signup successful!");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fadeAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.5, ease: "easeInOut" }
  };

  return (
    <>
      <div className="bg">
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#fff"
          hoverFillColor="#808080"
        />
      </div>

      <div className="auth-screen">
        <div className="container">
          <ClickSpark sparkColor="#fff" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
            <div className="title">
              <DecryptedText text="Cyber Drishti" animateOn="view" revealDirection="center" />
            </div>

            <div className="button-switch">
              <button className={!isLogin ? "active" : ""} onClick={() => setIsLogin(false)}>Sign Up</button>
              <button className={isLogin ? "active" : ""} onClick={() => setIsLogin(true)}>Login</button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={isLogin ? "login" : "signup"} {...fadeAnimation} className="inner-container">
                <form className="forms" onSubmit={handleSubmit}>
                  {!isLogin && (
                    <>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Contact No."
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Organization (if any)"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                      />
                    </>
                  )}

                  <input
                    type="text"
                    name="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {!isLogin && (
                    <input
                      type="password"
                      name="confirm-password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  )}

                  <div className="buttons">
                    <button type="submit" disabled={loading}>
                      {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
                    </button>
                  </div>
                </form>

                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
              </motion.div>
            </AnimatePresence>
          </ClickSpark>
        </div>
      </div>
    </>
  );
};

export default Auth;
