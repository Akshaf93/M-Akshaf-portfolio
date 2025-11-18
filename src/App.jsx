import React, { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, Text, useTexture, Stars, MeshDistortMaterial } from '@react-three/drei';
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
  Play,
  Menu,
  X
} from 'lucide-react';

// --- 3D COMPONENTS ---

// Procedural Gear Component
const Gear = ({ position, color, speed, size, teeth, ...props }) => {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * speed;
    }
  });

  // Create gear geometry procedurally to avoid external asset dependency
  const gearGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = size;
    const innerRadius = size * 0.8;
    const holeRadius = size * 0.3;
    const numTeeth = teeth;

    for (let i = 0; i < numTeeth * 2; i++) {
      const angle = (Math.PI * 2 * i) / (numTeeth * 2);
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, holeRadius, 0, Math.PI * 2, false);
    shape.holes.push(holePath);

    const extrudeSettings = { depth: 0.5, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.1, bevelThickness: 0.1 };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [size, teeth]);

  return (
    <mesh ref={meshRef} position={position} {...props} castShadow receiveShadow>
      <primitive object={gearGeometry} attach="geometry" />
      <meshStandardMaterial 
        color={color} 
        roughness={0.3} 
        metalness={0.8} 
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

// Connecting Shaft
const Shaft = ({ position, length, rotation }) => {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <cylinderGeometry args={[0.2, 0.2, length, 16]} />
      <meshStandardMaterial color="#555" roughness={0.2} metalness={0.9} />
    </mesh>
  );
};

// Main Mechanical Assembly Scene
const MechanicalScene = ({ currentSection }) => {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Subtle floating animation for the whole assembly
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.2;
    
    // Rotate based on scroll/section (simulated by currentSection prop)
    // In a real app, you might bind this to scrollY directly
    const targetRotation = currentSection === 'hero' ? 0 : 
                          currentSection === 'about' ? 1.5 : 
                          currentSection === 'projects' ? 3.2 : 4.5;
    
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation, 0.02);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, currentSection === 'hero' ? 0.2 : 0, 0.02);
  });

  return (
    <group ref={groupRef}>
      {/* Main Driving Gear */}
      <Gear position={[0, 0, 0]} size={2.5} teeth={12} speed={0.5} color="#3b82f6" />
      
      {/* Secondary Gears */}
      <Gear position={[3.2, 0, 0]} size={1.5} teeth={8} speed={-0.83} color="#f97316" />
      <Gear position={[-3.2, 0, 0]} size={1.5} teeth={8} speed={-0.83} color="#10b981" />
      
      {/* Vertical Stack */}
      <Shaft position={[0, 0, 1]} length={4} rotation={[Math.PI / 2, 0, 0]} />
      <Gear position={[0, 0, 2]} size={1.2} teeth={8} speed={0.5} color="#6366f1" />
      
      {/* Background Elements */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[5, 3, -5]}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial wireframe color="#333" />
        </mesh>
        <mesh position={[-5, -3, -5]}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial wireframe color="#333" />
        </mesh>
      </Float>
    </group>
  );
};

// --- UI COMPONENTS ---

const Navbar = ({ activeSection, scrollToSection, mobileMenuOpen, setMobileMenuOpen }) => {
  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'Engineering' },
    { id: 'projects', label: 'Simulations' },
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
          
          {/* Desktop Nav */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                    activeSection === item.id 
                      ? 'text-blue-500 bg-white/5' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
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
                  onClick={() => {
                    scrollToSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
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

const Section = ({ id, children, className = "" }) => (
  <section id={id} className={`min-h-screen flex flex-col justify-center relative z-10 px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </section>
);

const ProjectCard = ({ project, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.2 }}
    className="group relative bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors duration-300"
  >
    {/* Simulated CAD Viewport Header */}
    <div className="bg-black/50 p-2 flex justify-between items-center border-b border-white/5 text-xs font-mono text-zinc-500">
      <div className="flex gap-2">
        <span className="text-blue-500">VIEW: ISOMETRIC</span>
        <span>SCALE: 1:1</span>
      </div>
      <div className="flex gap-1">
        <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
        <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
        <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
      </div>
    </div>

    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg bg-${project.color}-500/10`}>
          {project.icon}
        </div>
        <a href="#" className="text-zinc-500 hover:text-white transition-colors">
          <ExternalLink size={20} />
        </a>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
        {project.title}
      </h3>
      <p className="text-zinc-400 text-sm mb-4 line-clamp-3">
        {project.description}
      </p>
      
      <div className="flex flex-wrap gap-2 mt-auto">
        {project.tags.map((tag) => (
          <span key={tag} className="px-2 py-1 text-xs rounded-md bg-white/5 text-zinc-300 border border-white/5">
            {tag}
          </span>
        ))}
      </div>
    </div>
    
    {/* Hover Glow Effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
  </motion.div>
);

// --- MAIN APP COMPONENT ---

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Update active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'about', 'projects', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
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
      title: "Cycloidal Gearbox FEA",
      description: "Finite Element Analysis of a high-reduction cycloidal drive used in robotic joints. Optimized for weight reduction while maintaining stress safety factors.",
      tags: ["SolidWorks", "ANSYS", "Matlab"],
      icon: <Cog className="text-orange-500" size={24} />,
      color: "orange"
    },
    {
      title: "Drone Aerodynamics CFD",
      description: "Computational Fluid Dynamics simulation of propeller thrust and body drag for a custom quadcopter frame. Analyzed turbulence models to improve battery efficiency.",
      tags: ["OpenFOAM", "Fusion 360", "Python"],
      icon: <Wind className="text-blue-500" size={24} />,
      color: "blue"
    },
    {
      title: "6-DOF Robot Arm",
      description: "Full kinematic simulation and control system design for a 6-axis articulated robot arm. Implemented inverse kinematics solver and path planning algorithms.",
      tags: ["ROS", "Gazebo", "C++"],
      icon: <Cpu className="text-green-500" size={24} />,
      color: "green"
    },
    {
      title: "Suspension System Optimization",
      description: "Multi-body dynamic simulation of a double wishbone suspension. Optimized damper coefficients for off-road terrain handling.",
      tags: ["ADAMS", "Simulink", "Vehicle Dynamics"],
      icon: <Layers className="text-purple-500" size={24} />,
      color: "purple"
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
            
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
            
            <MechanicalScene currentSection={activeSection} />
            
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
        
        {/* Vignette & Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-zinc-950/80 via-transparent to-zinc-950/80"></div>
        <div className="absolute inset-0 pointer-events-none opacity-10" 
             style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
      </div>

      <Navbar 
        activeSection={activeSection} 
        scrollToSection={scrollToSection}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="relative z-10">
        {/* HERO SECTION */}
        <Section id="hero" className="pt-20">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Open for Spring 2025 Internships
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                Engineering the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500">
                  Future Mechanics
                </span>
              </h1>
              
              <p className="text-xl text-zinc-400 max-w-2xl mb-8 leading-relaxed">
                Mechanical Engineering student specializing in CAD design, FEA simulations, and Robotics. 
                Turning complex physics into functional reality.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => scrollToSection('projects')}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all flex items-center gap-2 group"
                >
                  View Simulations
                  <ChevronDown className="group-hover:translate-y-1 transition-transform" />
                </button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold transition-all border border-zinc-700"
                >
                  Contact Me
                </button>
              </div>
            </motion.div>
          </div>
          
          {/* Scroll Indicator */}
          <motion.div 
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-zinc-500 flex flex-col items-center gap-2"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span className="text-xs uppercase tracking-widest">Scroll to Explore</span>
            <ChevronDown />
          </motion.div>
        </Section>

        {/* ABOUT SECTION */}
        <Section id="about">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            >
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-8 flex items-center gap-3">
                  <Wrench className="text-blue-500" />
                  Technical Arsenal
                </h2>
                <div className="space-y-8">
                  {skills.map((skill, index) => (
                    <div key={skill.name} className="relative">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-zinc-200">{skill.name}</span>
                        <span className="text-zinc-500 text-sm">{skill.tools}</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-blue-600 to-emerald-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-12 p-6 bg-zinc-900/50 border border-white/10 rounded-xl">
                  <h3 className="text-xl font-bold mb-4 text-white">Education</h3>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <Layers size={24} className="text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">B.S. Mechanical Engineering</h4>
                      <p className="text-blue-400">Technical University</p>
                      <p className="text-zinc-500 text-sm mt-1">2021 - Present • GPA: 3.8/4.0</p>
                      <p className="text-zinc-400 text-sm mt-2">Focus on Mechatronics & Computational Mechanics</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* The right side is left empty to show the 3D background rotation */}
              <div className="hidden md:flex flex-col items-center justify-center h-[500px] relative">
                <div className="absolute inset-0 border-2 border-dashed border-zinc-800 rounded-3xl flex items-center justify-center">
                  <p className="text-zinc-600 font-mono text-sm animate-pulse">
                    INTERACTIVE MODEL VIEW AREA
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </Section>

        {/* PROJECTS SECTION */}
        <Section id="projects">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3">
                  <Box className="text-blue-500" />
                  Simulation Lab
                </h2>
                <p className="text-zinc-400 max-w-xl">
                  A collection of my technical projects involving CAD design, finite element analysis, 
                  and dynamic system simulation.
                </p>
              </div>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hidden md:flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mt-4 md:mt-0">
                View all code <ExternalLink size={16} />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project, index) => (
                <ProjectCard key={index} project={project} index={index} />
              ))}
            </div>
          </div>
        </Section>

        {/* CONTACT SECTION */}
        <Section id="contact" className="pb-20">
          <div className="max-w-3xl mx-auto w-full bg-zinc-900/80 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/10">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Collaborate?</h2>
              <p className="text-zinc-400">
                Currently looking for internship opportunities in Robotics or Mechanical Design.
                Let's build something extraordinary.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <a href="mailto:hello@example.com" className="flex flex-col items-center justify-center p-6 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5 group">
                <Mail className="mb-4 text-blue-500 group-hover:scale-110 transition-transform" size={32} />
                <span className="font-medium text-zinc-200">Email Me</span>
              </a>
              <a href="https://linkedin.com" className="flex flex-col items-center justify-center p-6 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5 group">
                <Linkedin className="mb-4 text-blue-500 group-hover:scale-110 transition-transform" size={32} />
                <span className="font-medium text-zinc-200">LinkedIn</span>
              </a>
              <a href="https://github.com" className="flex flex-col items-center justify-center p-6 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5 group">
                <Github className="mb-4 text-blue-500 group-hover:scale-110 transition-transform" size={32} />
                <span className="font-medium text-zinc-200">GitHub</span>
              </a>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="john@company.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Message</label>
                <textarea 
                  rows={4} 
                  className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Tell me about your project..."
                ></textarea>
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-900/20">
                Send Message
              </button>
            </form>
          </div>
        </Section>

        {/* Footer */}
        <footer className="py-8 text-center text-zinc-600 text-sm relative z-10 border-t border-zinc-900">
          <p>© {new Date().getFullYear()} Mechanical Engineering Portfolio. Built with React & Three.js.</p>
        </footer>
      </main>
    </div>
  );
}