import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../CSS/Signup.css";
import logo from "../assets/img/logo3.png";

const DEFAULT_API = process.env.REACT_APP_API_URL || "";
console.log("Backend URL:", DEFAULT_API);

export default function Signup() {
  const navigate = useNavigate();
  const API = DEFAULT_API;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    businessName: "",
    typeOfBusiness: "Food Truck",
    preferredLocation: "Maricopa",
    contactTitle: "",
    contactName: "",
    email: "",
    password: "",
    name: "",

    typeOfProperty: "Food Truck",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    mobileNumber: "",
    businessPhoneNumber: "",
    businessFaxNumber: "",
    website: "",
    comments: "",
  });

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const gotoStep = (n) => {
    if (n < 1 || n > 3) return;
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateStep1 = () => {
    const required = ["businessName", "contactName", "email", "password", "name"];
    for (const r of required) {
      if (!form[r]?.trim()) {
        toast.error("Please fill all required fields in Contact Info");
        return false;
      }
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const required = ["street", "city", "state", "zipCode"];
    for (const r of required) {
      if (!form[r]?.trim()) {
        toast.error("Please fill all required fields in Address Info");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep1()) {
      gotoStep(1);
      return;
    }
    if (!validateStep2()) {
      gotoStep(2);
      return;
    }

    setLoading(true);

  try {
  const payload = {
    fullName: form.name,
    email: form.email,
    password: form.password,
    permanentPassword: form.password,
    businessName: form.businessName,
    typeOfBusiness: form.typeOfBusiness,
    preferredLocation: form.preferredLocation,
    contactTitle: form.contactTitle,
    contactName: form.contactName,
    address: {
      typeOfProperty: form.typeOfProperty,
      street: form.street,
      city: form.city,
      state: form.state,
      zipCode: form.zipCode,
    },
    phone: {
      mobile: form.mobileNumber,
      business: form.businessPhoneNumber,
      fax: form.businessFaxNumber,
    },
    website: form.website,
    comments: form.comments,
  };

  console.log("Submitting payload:", payload); // <-- log the payload

  const res = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  console.log("Raw response status:", res.status); // <-- log status

  const data = await res.json();
  console.log("Response data:", data); // <-- log response body

  if (!res.ok) {
    toast.error(data.message || "Registration failed");
    setLoading(false);
    return;
  }

  toast.success("Registration successful!");
  setLoading(false);
  navigate("/success",{replace:true});
} catch (err) {
  console.error("Error during registration:", err); // <-- log error
  toast.error("Server error. Try again later.");
  setLoading(false);
}

  };

  return (
    <div className="signup-page container-fluid py-5">
      <ToastContainer autoClose={2500} />
      <div className="row justify-content-center">
        <div className="col-xl-8 col-lg-9 col-md-10">
          <div className="card signup-card p-4 shadow-sm">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center">
                <img src={logo} alt="Central Kitchen" className="signup-logo me-3" />
                <div>
                  <h2 className="mb-0 signup-heading">Register</h2>
                  <small className="text-muted">Create your business account</small>
                </div>
              </div>

              <div className="d-none d-md-block">
                <div className="stepper">
                  <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
                  <div className={`stepline ${step > 1 ? "active" : ""}`} />
                  <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
                  <div className={`stepline ${step > 2 ? "active" : ""}`} />
                  <div className={`step ${step >= 3 ? "active" : ""}`}>3</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="d-md-none mb-3">
                <div className="progress-labels d-flex justify-content-between">
                  <small className={step === 1 ? "fw-bold text-primary" : "text-muted"}>Contact Info</small>
                  <small className={step === 2 ? "fw-bold text-primary" : "text-muted"}>Address Info</small>
                  <small className={step === 3 ? "fw-bold text-primary" : "text-muted"}>Comments</small>
                </div>
                <div className="progress mt-2" style={{ height: 6 }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${(step - 1) / 2 * 100}%` }}
                    aria-valuenow={(step - 1) * 50}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
              </div>

              {/* STEP 1 */}
              <div className={`step-pane ${step === 1 ? "active" : "d-none"}`}>
                <h5 className="section-title">Contact Info</h5>
                <div className="card inner-card p-3 mb-3 border-accent">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small">Full Name</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={updateField}
                        className="form-control"
                        placeholder="Full Name"
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small">Business Name</label>
                      <input
                        name="businessName"
                        value={form.businessName}
                        onChange={updateField}
                        className="form-control"
                        placeholder="Business Name"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">Type of Business</label>
                      <select
                        name="typeOfBusiness"
                        className="form-select"
                        value={form.typeOfBusiness}
                        onChange={updateField}
                      >
                        <option>Food Truck</option>
                        <option>Catering</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">Preferred Location</label>
                      <select
                        name="preferredLocation"
                        className="form-select"
                        value={form.preferredLocation}
                        onChange={updateField}
                      >
                        <option>Maricopa</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">Contact Title</label>
                      <input
                        name="contactTitle"
                        value={form.contactTitle}
                        onChange={updateField}
                        className="form-control"
                        placeholder="Contact Title (owner, manager)"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">Contact Name</label>
                      <input
                        name="contactName"
                        value={form.contactName}
                        onChange={updateField}
                        className="form-control"
                        placeholder="Contact Name"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">Email Address</label>
                      <input
                        name="email"
                        value={form.email}
                        onChange={updateField}
                        type="email"
                        className="form-control"
                        placeholder="Email Address"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">Password</label>
                      <input
                        name="password"
                        value={form.password}
                        onChange={updateField}
                        type="password"
                        className="form-control"
                        placeholder="Password"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <div />
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-next"
                    onClick={() => {
                      if (validateStep1()) gotoStep(2);
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* STEP 2 */}
              <div className={`step-pane ${step === 2 ? "active" : "d-none"}`}>
                <h5 className="section-title">Address Info</h5>
                <p className="text-center text-muted small mb-2">Enter Your Address Information</p>

                <div className="card inner-card p-3 mb-3 border-accent">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small">Type of Property</label>
                      <select
                        name="typeOfProperty"
                        className="form-select"
                        value={form.typeOfProperty}
                        onChange={updateField}
                      >
                        <option>Food Truck</option>
                        <option>Food Cart</option>
                        <option>Catering Kitchen</option>
                        <option>Shared Kitchen</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">Street</label>
                      <input
                        name="street"
                        value={form.street}
                        onChange={updateField}
                        className="form-control"
                        placeholder="Street"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">City</label>
                      <input
                        name="city"
                        value={form.city}
                        onChange={updateField}
                        className="form-control"
                        placeholder="City"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">State</label>
                      <input
                        name="state"
                        value={form.state}
                        onChange={updateField}
                        className="form-control"
                        placeholder="State"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">ZipCode</label>
                      <input
                        name="zipCode"
                        value={form.zipCode}
                        onChange={updateField}
                        className="form-control"
                        placeholder="ZipCode"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">Mobile Number</label>
                      <input
                        name="mobileNumber"
                        value={form.mobileNumber}
                        onChange={updateField}
                        className="form-control"
                        placeholder="Mobile Number"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">Business Phone Number</label>
                      <input
                        name="businessPhoneNumber"
                        value={form.businessPhoneNumber}
                        onChange={updateField}
                        className="form-control"
                        placeholder="Business Phone Number"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">Business Fax Number</label>
                      <input
                        name="businessFaxNumber"
                        value={form.businessFaxNumber}
                        onChange={updateField}
                        className="form-control"
                        placeholder="Business Fax Number"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">Website</label>
                      <input
                        name="website"
                        value={form.website}
                        onChange={updateField}
                        className="form-control"
                        placeholder="Website"
                      />
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <button
                    type="button"
                    className="btn btn-light btn-prev"
                    onClick={() => gotoStep(1)}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-next"
                    onClick={() => {
                      if (validateStep2()) gotoStep(3);
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* STEP 3 */}
              <div className={`step-pane ${step === 3 ? "active" : "d-none"}`}>
                <h5 className="section-title">Comments & Submit</h5>
                <div className="card inner-card p-3 mb-3 border-accent">
                  <div className="mb-3">
                    <label className="form-label small">Comments / Notes</label>
                    <textarea
                      name="comments"
                      value={form.comments}
                      onChange={updateField}
                      className="form-control"
                      rows="5"
                      placeholder="Anything else you'd like to add?"
                    />
                  </div>
                  <div className="mb-0 text-muted small">
                    Please review your information before submitting. We'll contact you at the
                    email provided.
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <button
                    type="button"
                    className="btn btn-light btn-prev"
                    onClick={() => gotoStep(2)}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-submit"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Registration"}
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="text-center mt-3">
            <small className="text-muted">Step {step} of 3</small>
          </div>
        </div>
      </div>
    </div>
  );
}
