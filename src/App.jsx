import React, { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Float, Stars, ContactShadows, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Cog, 
  Wrench, 
  Wind, 
  Layers, 
  Github, 
  Linkedin, 
  Mail, 
  ChevronDown, 
  ExternalLink,
  Box,
  Menu,
  X,
  User,
  Download,
  Maximize2
} from 'lucide-react';

// --- 3D COMPONENTS ---

// Optimized Instanced Background Objects (Instead of 2 heavy gears)
const BackgroundInstances = ({ count = 500 }) => {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const positions = useMemo(() => {
    return Array.from({ length: count }, () => [
      (0.5 - Math.random()) * 20,
      (0.5 - Math.random()) * 20,
      (0.5 - Math.random()) * 20,
    ]);
  }, [count]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Apply a subtle wobble and rotation
    positions.forEach((pos, i) => {
      const timeOffset = i * 0.1;
      const x = pos[0] + Math.sin(t * 0.5 + timeOffset) * 0.1;
      const y = pos[1] + Math.cos(t * 0.5 + timeOffset) * 0.1;
      const z = pos[2];

      dummy.position.set(x, y, z);
      dummy.rotation.x = Math.sin(t * 0.3 + timeOffset);
      dummy.rotation.y = Math.cos(t * 0.4 + timeOffset);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} position={[0, 0, 0]}>
      <boxGeometry args={[0.08, 0.08, 0.08]} />
      <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.8} metalness={0.9} roughness={0.1} />
    </instancedMesh>
  );
};


// ** Custom Model Loader Component **
const CustomRoverModel = () => {
  // Path points to the file in the public folder
  // NOTE: You must place your converted 3D model (e.g., rover_model.glb) in the 'public' folder.
  const { scene } = useGLTF('/rover_model.glb'); 
  
  useFrame(() => {
    // Optional: Add rotation to the loaded scene
    if(scene) {
        scene.rotation.y += 0.005; 
    }
  });

  // Since GLB files contain their own materials/meshes, we only need to render the primitive scene.
  return (
    <primitive object={scene} scale={1.5} />
  );
};

// Generic Project Model (Placeholder for others)
const GenericCADModel = ({ color }) => (
  <group>
    <mesh castShadow>
      <torusKnotGeometry args={[1, 0.3, 100, 16]} />
      <meshStandardMaterial color={color} roughness={0.2} metalness={0.9} />
    </mesh>
  </group>
);

// Scene Manager - Now uses the Instanced Mesh
const BackgroundScene = ({ currentSection }) => {
  const groupRef = useRef();
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.02; // Slower rotation
  });

  return (
    <group ref={groupRef}>
      {/* Replaced Gear with optimized instances */}
      <BackgroundInstances />
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[0, 0, -10]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={5} />
        </mesh>
      </Float>
    </group>
  );
};

// --- UI COMPONENTS ---

const Navbar = ({ activeSection, scrollToSection, mobileMenuOpen, setMobileMenuOpen }) => {
  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'profile', label: 'Profile' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter text-white">
            <Cog className={`w-6 h-6 text-blue-500 ${activeSection === 'hero' ? 'animate-spin-slow' : ''}`} />
            <span>MECH<span className="text-blue-500">.FOLIO</span></span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                    activeSection === item.id ? 'text-blue-500 bg-white/5' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-300 hover:text-white p-2">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-zinc-900 border-b border-white/10 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { scrollToSection(item.id); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const ProjectModal = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-6xl h-[85vh] bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-blue-900/20">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-red-500/80 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Left: Interactive 3D View */}
        <div className="w-full md:w-2/3 h-1/2 md:h-full bg-black relative">
          <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/60 text-blue-400 text-xs font-mono border border-blue-500/30 rounded">
            INTERACTIVE 3D PREVIEW - DRAG TO ROTATE
          </div>
          <Canvas shadows>
            <Suspense fallback={null}>
              {/* Camera settings */}
              <PerspectiveCamera makeDefault position={[4, 3, 5]} />
              <OrbitControls enablePan={false} autoRotate autoRotateSpeed={1} />
              
              {/* Lighting and Environment */}
              <ambientLight intensity={0.6} />
              <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} castShadow intensity={1} />
              <Environment preset="city" />
              
              <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
                {/* RENDER THE CUSTOM LOADER HERE */}
                {project.id === 'rover' ? (
                  <CustomRoverModel /> 
                ) : (
                  <GenericCADModel color={project.colorStr} />
                )}
              </Float>
              <ContactShadows position={[0, -1.5, 0]} opacity={0.5} scale={10} blur={1.5} far={4} />
            </Suspense>
          </Canvas>
        </div>
        {/* Right: Details */}
        <div className="w-full md:w-1/3 h-1/2 md:h-full overflow-y-auto p-8 bg-zinc-900 border-l border-white/5">
          <div className={`inline-block p-3 rounded-lg bg-${project.color}-500/10 mb-6`}>
            {project.icon}
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">{project.title}</h2>
          <p className="text-zinc-500 text-sm mb-6 font-mono">{project.date || "Fall 2024"}</p>
          
          <div className="prose prose-invert prose-sm mb-8 text-zinc-300">
            <p>{project.fullDescription || project.description}</p>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map(tag => (
                <span key={tag} className="px-2 py-1 text-xs rounded-md bg-white/5 text-blue-300 border border-blue-500/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Gallery Placeholder */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Gallery</h3>
            <div className="grid grid-cols-2 gap-2">
               {[1,2,3,4].map(i => (
                 <div key={i} className="aspect-square bg-zinc-800 rounded hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-600 text-xs">
                   Img {i}
                 </div>
               ))}
            </div>
          </div>

          <div className="flex gap-4">
             <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2">
                <Download size={16} /> Download Report
             </button>
             <button className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold text-sm transition-all border border-white/10">
                View Source
             </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'profile', 'projects', 'skills', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 150 && rect.bottom >= 150;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  const projects = [
    {
      id: "rover",
      title: "3D Printed Rover for EFX",
      description: "A fully functional modular rover chassis designed for the EFX planetary exploration challenge. Features a custom suspension system and 3D printed modular wheels.",
      fullDescription: "This project involved the complete design lifecycle of a planetary rover prototype. I used Fusion 360 for the chassis design, focusing on printability and structural integrity using PLA+ and PETG filaments. The rover utilizes a rocker-bogie suspension system adapted for 3D printing to navigate rough terrain. The wheels are a compliant mechanism design to absorb shock without pneumatic tires.",
      tags: ["Fusion 360", "3D Printing", "Arduino", "C++"],
      icon: <Cpu className="text-red-500" size={24} />,
      color: "red",
      colorStr: "#ef4444"
    },
    {
      id: "fea",
      title: "Cycloidal Gearbox FEA",
      description: "Finite Element Analysis of a high-reduction cycloidal drive used in robotic joints. Optimized for weight reduction while maintaining stress safety factors.",
      fullDescription: "Performed static structural analysis to identify stress concentrations under maximum torque loads. Topology optimization was applied to the housing to reduce mass by 22% while maintaining a Factor of Safety of 2.5.",
      tags: ["SolidWorks", "ANSYS", "Matlab"],
      icon: <Cog className="text-orange-500" size={24} />,
      color: "orange",
      colorStr: "#f97316"
    },
    {
      id: "cfd",
      title: "Drone Aerodynamics CFD",
      description: "Computational Fluid Dynamics simulation of propeller thrust and body drag for a custom quadcopter frame. Analyzed turbulence models to improve battery efficiency.",
      fullDescription: "Simulated airflow over the drone fuselage using OpenFOAM. The analysis led to a fuselage redesign that reduced drag by 14% at cruising speeds.",
      tags: ["OpenFOAM", "Fusion 360", "Python"],
      icon: <Wind className="text-blue-500" size={24} />,
      color: "blue",
      colorStr: "#3b82f6"
    },
    {
      id: "suspension",
      title: "Suspension System Optimization",
      description: "Multi-body dynamic simulation of a double wishbone suspension. Optimized damper coefficients for off-road terrain handling.",
      fullDescription: "Created a mathematical model of a quarter-car suspension and ran simulations in MATLAB Simulink to tune the damping ratios for critical damping response.",
      tags: ["ADAMS", "Simulink", "Vehicle Dynamics"],
      icon: <Layers className="text-purple-500" size={24} />,
      color: "purple",
      colorStr: "#a855f7"
    }
  ];

  const skills = [
    { name: "CAD Design", level: 95, tools: "SolidWorks, Fusion 360, CATIA" },
    { name: "CFD & FEA Simulation", level: 85, tools: "ANSYS, COMSOL, OpenFOAM" },
    { name: "Programming", level: 80, tools: "Python, MATLAB, C++, React" },
    { name: "Robotics", level: 90, tools: "ROS, Arduino, PLC" }
  ];

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen font-sans selection:bg-blue-500/30">
      {/* Background 3D Scene */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Canvas shadows dpr={[1, 2]}>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
            <color attach="background" args={['#09090b']} />
            <ambientLight intensity={0.5} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
            <BackgroundScene activeSection={activeSection} />
            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
        <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-zinc-950/90 via-zinc-950/40 to-zinc-950/90"></div>
      </div>

      <Navbar 
        activeSection={activeSection} 
        scrollToSection={scrollToSection}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="relative z-10">
        
        {/* HERO SECTION */}
        <section id="hero" className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-4xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Available for Spring 2025
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                Designed for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500">
                  Performance.
                </span>
              </h1>
              <p className="text-xl text-zinc-400 max-w-2xl mb-8 leading-relaxed">
                Mechanical Engineering Portfolio specializing in Robotics, Additive Manufacturing, and Computational Simulation.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.button 
                  onClick={() => scrollToSection('profile')} 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                   See Profile <User size={20} />
                </motion.button>
                <motion.button 
                  onClick={() => scrollToSection('projects')} 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold transition-all border border-zinc-700"
                >
                   View Projects
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PROFILE / SUMMARY SECTION */}
        <section id="profile" className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900/30 backdrop-blur-sm border-y border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12">
               <div className="w-full md:w-1/3">
                 <div className="aspect-[3/4] rounded-2xl bg-zinc-800 border border-white/10 relative overflow-hidden group">
                    {/* Placeholder for Headshot */}
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-zinc-600">
                       <User size={64} />
                       <span className="absolute bottom-4 text-xs uppercase tracking-widest">Add Headshot Here</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60"></div>
                    <div className="absolute bottom-0 left-0 p-6">
                       <h3 className="text-2xl font-bold text-white">John Doe</h3>
                       <p className="text-blue-400 font-mono">Mechanical Engineer</p>
                    </div>
                 </div>
               </div>
               <div className="w-full md:w-2/3">
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                     <span className="w-8 h-1 bg-blue-500 rounded-full"></span>
                     About Me
                  </h2>
                  <p className="text-lg text-zinc-300 leading-relaxed mb-6">
                     I am a final-year Mechanical Engineering student with a passion for bridging the gap between digital simulation and physical manufacturing. 
                  </p>
                  <p className="text-zinc-400 leading-relaxed mb-8">
                     My experience spans from designing complex mechanisms in SolidWorks to verifying their integrity using ANSYS FEA. I have hands-on experience with rapid prototyping (3D printing, CNC) and have successfully led technical teams in university rover competitions. I am looking for a challenging role where I can apply my skills in product design and robotics.
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                     {[
                        { label: "Experience", val: "2 Years" },
                        { label: "Projects", val: "15+" },
                        { label: "GPA", val: "3.8/4.0" },
                        { label: "Location", val: "Remote/Hybrid" }
                     ].map((stat, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 + 0.5, duration: 0.5 }}
                            className="p-4 bg-white/5 rounded-lg border border-white/5 hover:border-blue-500/50 transition-colors"
                        >
                           <div className="text-2xl font-bold text-white mb-1">{stat.val}</div>
                           <div className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</div>
                        </motion.div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
             <div className="mb-12">
                <h2 className="text-4xl font-bold mb-4">Featured Projects</h2>
                <p className="text-zinc-400 max-w-xl">Click on any project card to view the interactive 3D model, full technical details, and gallery.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {projects.map((project, index) => (
                 <motion.div
                   key={index}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: index * 0.1 }}
                   onClick={() => setSelectedProject(project)}
                   whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)" }} // Interactive Lift
                   className="group cursor-pointer bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300"
                 >
                   {/* Header Simulation */}
                   <div className="bg-black/40 p-3 flex justify-between items-center border-b border-white/5">
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                         <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                         <span>{project.id.toUpperCase()}_V04.STEP</span>
                      </div>
                      <Maximize2 size={14} className="text-zinc-600 group-hover:text-blue-400" />
                   </div>
                   
                   <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                         <div className={`p-4 rounded-xl bg-${project.color}-500/10`}>
                            {project.icon}
                         </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{project.title}</h3>
                      <p className="text-zinc-400 text-sm mb-6 line-clamp-3">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                         {project.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs rounded bg-white/5 text-zinc-400">{tag}</span>
                         ))}
                      </div>
                   </div>
                   <div className="h-1 w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 </motion.div>
               ))}
             </div>
          </div>
        </section>

        {/* SKILLS SECTION (Revised) */}
        <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900/30">
           <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 flex items-center gap-3">
                 <Wrench className="text-blue-500" />
                 Technical Arsenal
              </h2>
              <div className="space-y-8">
                  {skills.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-zinc-200">{skill.name}</span>
                        <span className="text-zinc-500 text-sm">{skill.tools}</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        {/* Scroll-triggered animation for skill bars */}
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true, amount: 0.5 }} // Trigger when 50% visible
                          transition={{ duration: 1 }}
                          className="h-full bg-gradient-to-r from-blue-600 to-emerald-500"
                        />
                      </div>
                    </div>
                  ))}
              </div>
              
              <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="p-6 bg-zinc-900/80 border border-white/10 rounded-xl hover:border-blue-500/50 transition-colors"
                 >
                    <h3 className="text-lg font-bold text-white mb-2">Education</h3>
                    <p className="text-blue-400">B.S. Mechanical Engineering</p>
                    <p className="text-zinc-500 text-sm">University of Tech • 2021-2025</p>
                 </motion.div>
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="p-6 bg-zinc-900/80 border border-white/10 rounded-xl hover:border-blue-500/50 transition-colors"
                 >
                    <h3 className="text-lg font-bold text-white mb-2">Certifications</h3>
                    <p className="text-zinc-300 text-sm">CSWP - Certified SolidWorks Professional</p>
                    <p className="text-zinc-300 text-sm">Certified ANSYS Associate</p>
                 </motion.div>
              </div>
           </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
           <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">Let's Build Something.</h2>
              <p className="text-zinc-400 mb-10">
                 I am actively seeking opportunities to apply my engineering skills. 
              </p>
              <div className="flex justify-center gap-6 mb-12">
                 <motion.a 
                    href="#" 
                    whileHover={{ scale: 1.1, color: '#3b82f6' }}
                    whileTap={{ scale: 0.9 }}
                    className="p-4 bg-white/5 rounded-full hover:bg-blue-600/50 text-white transition-colors"
                 >
                    <Mail size={24} />
                 </motion.a>
                 <motion.a 
                    href="#" 
                    whileHover={{ scale: 1.1, color: '#3b82f6' }}
                    whileTap={{ scale: 0.9 }}
                    className="p-4 bg-white/5 rounded-full hover:bg-blue-600/50 text-white transition-colors"
                 >
                    <Linkedin size={24} />
                 </motion.a>
                 <motion.a 
                    href="#" 
                    whileHover={{ scale: 1.1, color: '#3b82f6' }}
                    whileTap={{ scale: 0.9 }}
                    className="p-4 bg-white/5 rounded-full hover:bg-blue-600/50 text-white transition-colors"
                 >
                    <Github size={24} />
                 </motion.a>
              </div>
              <footer className="text-zinc-600 text-sm">
                 © {new Date().getFullYear()} Mech.Folio
              </footer>
           </div>
        </section>

      </main>

      {/* PROJECT MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}