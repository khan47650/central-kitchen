import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import "../CSS/Contact.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const Contact = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  // React state for form
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);

  // Update form fields
  const updateField = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // simple validation
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill name, email and message');
      return;
    }

    setLoading(true);

    try {
      const url = `${DEFAULT_API}/api/contact`;
      console.log('Posting contact to:', url);
      console.log('Contact payload:', form);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      console.log('Contact response status:', res.status);
      const data = await res.json();
      console.log('Contact response body:', data);

      if (!res.ok) {
        toast.error(data.message || 'Failed to send message');
        setLoading(false);
        return;
      }

      toast.success('Message sent — thank you!');
      setForm({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    } catch (err) {
      console.error('Contact submit error:', err);
      toast.error('Server error. Try again later.');
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer autoClose={2500} />
      <section id="contact" className="contact-page">
        <div className="contact-header" data-aos="fade-up">
          <h1>Need <span>Help?</span></h1>
          <p>Contact Us</p>
        </div>

        <div className="contact-container" data-aos="fade-up" data-aos-delay="100">
          <div className="contact-info">
            <div className="info-card" data-aos="fade-up" data-aos-delay="200">
              <div className="icon-circle">
                <i className="bi bi-geo-alt"></i>
              </div>
              <h4>Address</h4>
              <p>17945 North Regent Drive, Maricopa, AZ 85138-7808</p>
            </div>

            <div className="info-card" data-aos="fade-up" data-aos-delay="300">
              <div className="icon-circle">
                <i className="bi bi-telephone"></i>
              </div>
              <h4>Call Us</h4>
              <p><a href="tel:+6494461709">520-494-6417</a></p>
            </div>

            <div className="info-card" data-aos="fade-up" data-aos-delay="400">
              <div className="icon-circle">
                <i className="bi bi-envelope"></i>
              </div>
              <h4>Email Us</h4>
              <p><a href="mailto:Megan.Purvis@centralaz.edu">Megan.Purvis@centralaz.edu</a></p>
            </div>
          </div>

          {/* React Controlled Form */}
          <form onSubmit={handleSubmit} className="contact-form" data-aos="fade-up" data-aos-delay="500">
            <div className="form-group">
              <input 
                type="text" 
                name="name" 
                placeholder="Your Name" 
                value={form.name} 
                onChange={updateField} 
                required 
              />
              <input 
                type="email" 
                name="email" 
                placeholder="Your Email" 
                value={form.email} 
                onChange={updateField} 
                required 
              />
            </div>

            <div className="form-group">
              <input 
                type="text" 
                name="subject" 
                placeholder="Subject" 
                value={form.subject} 
                onChange={updateField} 
                required 
              />
            </div>

            <div className="form-group">
              <textarea
                name="message"
                rows="4"
                placeholder="Message"
                value={form.message}
                onChange={updateField}
                required
              />
            </div>

            <button type="submit" className="send-btn" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="footer dark-background">
        <div className="container text-center mt-4">
          <p>
            © <span>Copyright</span>{" "}
            <strong className="px-1 sitename">Central Kitchen</strong>{" "}
            <span>All Rights Reserved</span>
          </p>
          <div className="credits">
            Designed by <a href="https://zonabcg.com/">ZonaBCG</a>
          </div>
        </div>
      </footer>

      {/* Scroll Top */}
      <a href="#" id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center">
        <i className="bi bi-arrow-up-short"></i>
      </a>

      {/* Preloader */}
      <div id="preloader">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </>
  );
};

export default Contact;
