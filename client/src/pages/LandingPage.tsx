import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ContactModal from "../modals/ContactModal";
import React from "react";

export default function LandingPage() {
  const [isContactOpen, setIsContactOpen] = React.useState(false);
  return (
<div className="w-full text-black relative">
  {/* Navbar - Now Absolute to overlay the Hero */}
  <header className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-16 py-10">
    <h2 className="text-2xl font-bold text-black tracking-tight">GrowFrika</h2>
    
    {/* Added backdrop-blur to the nav container for a subtle "glass" effect on scroll */}
    <nav className="hidden md:flex gap-8 text-sm font-semibold">
      <Link to="/" className="text-black hover:text-green-700 transition-colors">Home</Link>
      <Link to="/aboutus" className="text-black hover:text-green-700 transition-colors">About</Link>
      <Link to="/solutions" className="text-black hover:text-green-700 transition-colors">Solutions</Link>
    </nav>
  </header>

  {/* Hero Section */}
  <section className="relative min-h-screen flex items-center ">
    {/* Background Image with Overlay */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <img 
        src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=2000" 
        alt="Sustainable farming"
        className="w-full h-full object-cover opacity-40" 
      />
      {/* This gradient is the secret sauce: 
          It fades from the top (where the nav is) into the center, 
          then to solid white at the bottom to transition to the next section.
      */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-50/80 via-transparent to-white" />
    </div>

    {/* Hero Content */}
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="relative z-10 max-w-4xl mx-auto text-center mt-16" 
    >
      <h2 className="text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-gray-900">
        Where Agriculture Meets <span className="text-green-600">Intelligence</span>
      </h2>
      <p className="mt-8 text-xl text-gray-800 max-w-2xl mx-auto leading-relaxed">
        Providing sustainable and intelligently designed tools for farmers everywhere to boost productivity and reduce environmental impact.
      </p>
      
      <div className="mt-12 flex justify-center gap-6">
        <Link to="/solutions" className="rounded-full border-2 text-black border-gray-500 px-8 py-4 text-green-700 hover:bg-green-50 transition-all">
          Explore Solutions
        </Link>
        <Link to="/aboutus" className="rounded-full border-2 text-black border-gray-500 px-8 py-4 text-green-700 hover:bg-green-50 transition-all">
          Learn More
        </Link>
      </div>
  </motion.div>
</section>

<ContactModal 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
      />

    {/* Stats Section */}
    <section className="px-10 py-16 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div>
            <h3 className="text-4xl font-bold text-green-700">95%+</h3>
            <p className="mt-2 text-sm text-gray-600">Model Diagnostic Accuracy</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-green-700">Artificial Intelligence</h3>
            <p className="mt-2 text-sm text-gray-600">Research-driven Architecture</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-green-700">Sustainable</h3>
            <p className="mt-2 text-sm text-gray-600">Designed for Long-term Impact</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-green-50 px-10 py-24">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-green-700">Our <span className="text-green-700">Focus Areas</span></h3>
          <p className="mt-4 text-gray-600">
            Intelligent tools to be a companion for farmers and the environment, providing insights and guidance to optimize yields while minimizing harm.
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: "Crop Diagnostics", desc: "Disease detection and analysis using deep learning models." },
              { title: "Intelligent Advisory", desc: "Context-aware guidance powered by large language models." },
              { title: "Your Digital Agronomist", desc: "Continuously analyzes your crops, tracks their growth, and delivers personalized recommendations at every stage." }
            ].map((item, idx) => (
              <motion.div
  key={idx}
  whileHover={{ y: -10, scale: 1.02 }}
  className="bg-white/60 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl"
>

  <h4 className="text-xl font-semibold text-green-800">{item.title}</h4>
  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{item.desc}</p>
</motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-10 py-24 bg-white">
  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
    <motion.div 
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <h3 className="text-4xl font-bold mb-6">Expert Guidance in Your Pocket</h3>
      <p className="text-gray-600 text-lg mb-8">
        Our Digital Agronomist uses computer vision to identify pests, diseases, and 
        nutrient deficiencies in real-time. Simply point your camera and get 
        research-backed solutions instantly.
      </p>
      <ul className="space-y-4">
        {['Real-time Disease Identification', 'Crop Tracking', 'Weather-linked Advice'].map((text) => (
          <li key={text} className="flex items-center gap-3 font-medium text-green-800">
            <span className="bg-green-100 p-1 rounded-full text-green-600">✓</span> {text}
          </li>
        ))}
      </ul>
    </motion.div>

    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="relative flex justify-center"
    >
      {/* Visual Placeholder for a Phone Mockup */}
      <div className="w-64 h-[500px] bg-gray-900 rounded-[3rem] border-[8px] border-gray-800 shadow-2xl overflow-hidden relative">
        <img 
          src="https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&q=80&w=800" 
          alt="AI Analysis"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
           <div className="w-40 h-40 border-2 border-white/50 rounded-lg animate-pulse" />
        </div>
      </div>
    </motion.div>
  </div>
</section>

      {/* Footer */}
      <footer className="px-10 py-10 text-center text-sm text-gray-500 bg-green-50">
        <button onClick={() => setIsContactOpen(true)} className="text-white hover:text-green-700 transition-colors">Contact Us</button><br/>
        © {new Date().getFullYear()} GrowFrika. Building sustainable intelligence for agriculture.
        <br />
        <p className="text-center font-bold">EST 2025</p>
      </footer>
    </div>


  );
}
