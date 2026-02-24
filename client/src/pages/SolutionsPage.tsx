import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.3 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function SolutionsPage() {
  return (
    <div className="bg-white min-h-screen pt-20">
      {/* Header */}
      <section className="py-20 px-10 text-center">
          <header className="absolute top-0 left-0 w-full  flex items-center justify-between px-10 py-10">
    <h2 className="text-2xl font-bold text-black tracking-tight">GrowFrika</h2>
    
    {/* Added backdrop-blur to the nav container for a subtle "glass" effect on scroll */}
    <nav className="hidden md:flex gap-8 text-sm font-semibold">
      <Link to="/" className="text-black hover:text-green-700 transition-colors">Home</Link>
      <Link to="/aboutus" className="text-black hover:text-green-700 transition-colors">About</Link>
      <Link to="/solutions" className="text-black hover:text-green-700 transition-colors">Solutions</Link>
    </nav>
  </header>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold text-gray-900"
        >
          Our <span className="text-green-600">Intelligence</span> Suite
        </motion.h1>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
          From state-of-the-art diagnostic models to comprehensive farm management systems.
        </p>
      </section>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-10 pb-32 space-y-32"
      >
        
        {/* Product 1: The Model (Live) */}
        <section className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div variants={cardVariants} className="order-2 lg:order-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">LIVE NOW</span>
              <span className="text-gray-400 text-xs">v1.0.4</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Coffee Disease Diagnostic Model</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Our flagship deep learning model. Trained on thousands of high-resolution agricultural 
              datasets to identify Leaf Rust and other coffee pathogens with over 95% accuracy.
            </p>
            <ul className="grid grid-cols-2 gap-4 mb-10">
              {['95% Accuracy', 'LLM Integration', 'Real-time Analysis', 'Organic Remedies'].map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-gray-700 font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full" /> {feat}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/home" 
                target="_blank"
                className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition flex items-center gap-2"
              >
                Try the Model <span>→</span>
              </Link>
              <Link 
                to="YOUR_DOCUMENTATION_LINK" 
                className="border border-gray-200 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition"
              >
                View API Docs
              </Link>
            </div>
          </motion.div>
          
          <motion.div variants={cardVariants} className="order-1 lg:order-2 bg-gray-100 rounded-[3rem] p-8 aspect-video flex items-center justify-center relative overflow-hidden shadow-inner">
             {/* Replace with an image of your model's interface or a graphic representing AI */}
             <img 
               src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=1000" 
               className="rounded-2xl shadow-2xl"
               alt="AI Analytics Interface"
             />
             <div className="absolute inset-0 bg-green-600/10 mix-blend-overlay" />
          </motion.div>
        </section>

        {/* Product 2: The App (Coming Soon) */}
        <section className="grid lg:grid-cols-2 gap-16 items-center">
           <motion.div variants={cardVariants} className="bg-green-50 rounded-[3rem] p-12 relative overflow-hidden h-[600px] flex items-end">
             <div className="absolute top-12 left-12 right-12 bottom-0 bg-white rounded-t-[2rem] shadow-2xl border-x-8 border-t-8 border-gray-900">
                {/* Mockup Content */}
                <div className="p-6">
                   <div className="w-full h-4 bg-gray-100 rounded mb-4" />
                   <div className="grid grid-cols-2 gap-4">
                      <div className="h-32 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-bold">Yield: 85%</div>
                      <div className="h-32 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">Rain: 2pm</div>
                   </div>
                   <div className="mt-6 space-y-3">
                      <div className="h-4 bg-gray-50 rounded w-3/4" />
                      <div className="h-4 bg-gray-50 rounded w-1/2" />
                   </div>
                </div>
             </div>
             <div className="absolute inset-0 bg-gradient-to-t from-green-50 via-transparent to-transparent z-10" />
           </motion.div>

           <motion.div variants={cardVariants}>
            <span className="text-green-600 font-bold tracking-tighter text-sm uppercase">Coming Late 2026</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-6">GrowFrika Mobile Ecosystem</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              The complete seed-to-sale management system. Whether you are a backyard gardener 
              or a commercial exporter, track everything from one unified dashboard.
            </p>
            <div className="space-y-6 mb-10">
              {[
                { t: "Smart Irrigation", d: "Syncs with weather data to optimize water usage." },
                { t: "Financial Logging", d: "Track every cent of expenditure and every gram of yield." },
                { t: "The Digital Agronomist", d: "A 24/7 expert guide available via the mobile camera." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900">{item.t}</h4>
                    <p className="text-gray-600 text-sm">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="bg-green-600 text-white px-10 py-4 rounded-full font-bold opacity-50 cursor-not-allowed">
              Coming Soon to iOS & Android
            </button>
           </motion.div>
        </section>

      </motion.div>
    </div>
  );
}