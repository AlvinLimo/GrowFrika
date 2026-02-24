import { motion } from "framer-motion";
import { easeInOut } from "framer-motion";
import { Link } from "react-router-dom";

// Animation variants for reusability
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeInOut } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function AboutUs() {
  return (
    <div className="relative min-h-screen w-full font-sans selection:bg-green-100 selection:text-green-900">
        <header className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-16 py-10">
    <h2 className="text-2xl font-bold text-black tracking-tight">GrowFrika</h2>
    
    {/* Added backdrop-blur to the nav container for a subtle "glass" effect on scroll */}
    <nav className="hidden md:flex gap-8 text-sm font-semibold">
      <Link to="/" className="text-black hover:text-green-700 transition-colors">Home</Link>
      <Link to="/aboutus" className="text-black hover:text-green-700 transition-colors">About</Link>
      <Link to="/solutions" className="text-black hover:text-green-700 transition-colors">Solutions</Link>
    </nav>
  </header>
      {/* 1. Global Fixed Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1620200423727-8127f75d7f53?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
          alt="Lush green landscape" 
          className="w-full h-full object-cover grayscale-[20%] brightness-[0.85]"
        />
        {/* Deep gradient overlay to ensure text remains the hero */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/40 to-white/95" />
      </div>

      <div className="relative z-10">
        
        {/* 2. Hero Section - Deep Breathing Room */}
        <section className="min-h-screen flex items-center justify-center px-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-4xl text-center"
          >
            <span className="inline-block px-4 py-1 mb-6 text-xs font-bold tracking-widest text-green-700 uppercase bg-green-100 rounded-full">
              Our Mission
            </span>
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-8 text-gray-900">
              Empowering the <span className="text-green-600">Future of Farming</span>
            </h1>
            <p className="text-xl md:text-2xl text-black leading-relaxed max-w-2xl mx-auto">
              GrowFrika is a real-time companion designed to transition 
              agriculture from traditional methods to informed and precise techniques from the first seed to the final harvest.
            </p>
            <motion.div 
              animate={{ y: [0, 10, 0] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="mt-16 text-green-600"
            >
              <span className="text-sm font-medium">Scroll to explore</span>
              <div className="w-px h-12 bg-green-400 mx-auto mt-4" />
            </motion.div>
          </motion.div>
        </section>

        {/* 3. Tech Spotlight - Coffee Model with Glassmorphism */}
        <section className="py-32 px-10">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-transparent"
            >
              <img 
                src="https://images.unsplash.com/photo-1703974686238-446734c02f9c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Coffee plant analysis" 
                className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700"
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white/70 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-xl border border-white/20"
            >
              <h2 className="text-4xl font-bold mb-6 text-green-800">Intelligence That Speaks</h2>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                We started by solving the hardest problems first. Our proprietary AI model identifies 
                complex coffee diseases with surgical precision.
              </p>
              <div className="bg-green-600/5 p-6 rounded-2xl border-l-4 border-green-600 italic text-green-900 font-medium">
                "It doesn't just tell you it's Leaf Rust. It explains the humidity triggers and 
                prescribes the exact organic treatment needed right now."
              </div>
            </motion.div>
          </div>
        </section>

        {/* 4. Sustainability Section */}
        <section className="py-32 px-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto bg-emerald-900 text-white rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl"
          >
            <div className="md:w-1/2 p-12 md:p-20">
              <h2 className="text-4xl font-bold mb-8 leading-tight">
                Harmony Between <br/> <span className="text-emerald-400">Profit & Planet</span>
              </h2>
              <div className="space-y-10">
                <div className="flex gap-6">
                  <div className="text-3xl bg-emerald-800 w-14 h-14 flex items-center justify-center rounded-2xl">🌱</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Targeted Intervention</h4>
                    <p className="text-emerald-100/70 text-sm">Prevents chemical runoff by identifying exactly where treatment is needed.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="text-3xl bg-emerald-800 w-14 h-14 flex items-center justify-center rounded-2xl">💧</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Resource Optimization</h4>
                    <p className="text-emerald-100/70 text-sm">Weather-sync technology saves millions of liters of water annually.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 relative min-h-[400px]">
              <img 
                src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1000" 
                className="absolute inset-0 w-full h-full object-cover"
                alt="Green Field"
              />
            </div>
          </motion.div>
        </section>

        {/* 5. Ecosystem Grid */}
        <section className="py-32 px-10">
          <div className="max-w-6xl mx-auto text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900">One Ecosystem. Every Scale.</h2>
          </div>
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {[
              { title: "The Hobbyist", desc: "Never miss a watering. Get weather-synced alerts for your home garden.", icon: "🏡" },
              { title: "The Professional", desc: "Full yield tracking, expenditure logs, and real-time P&L data for your business.", icon: "🚜" },
              { title: "The Environment", desc: "Protecting the soil for tomorrow with precision irrigation.", icon: "🌍" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="p-10 bg-white/60 backdrop-blur-md border border-white/40 rounded-[2.5rem] shadow-lg text-center"
              >
                <div className="text-5xl mb-6">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-green-800">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 6. Footer Call to Action */}
        <section className="py-32 px-10">
          <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             whileInView={{ scale: 1, opacity: 1 }}
             viewport={{ once: true }}
             className="max-w-4xl mx-auto bg-green-600 rounded-[4rem] p-16 text-center text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <h2 className="text-4xl font-bold mb-6">Ready to grow smarter?</h2>
            <p className="text-xl mb-10 opacity-90 max-w-xl mx-auto">Try out our model and enjoy the free trial.</p>
            <button className="bg-white text-green-700 px-12 py-5 rounded-full font-bold hover:shadow-2xl hover:bg-gray-100 transition transform hover:-translate-y-1">
              GrowFrika Model
            </button>
          </motion.div>
        </section>

      </div>
    </div>
  );
}