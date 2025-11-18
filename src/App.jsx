import React, { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  Environment, 
  Float, 
  Stars, 
  OrbitControls, 
  useGLTF, 
  Text, 
  AccumulativeShadows, 
  RandomizedLight 
} from '@react-three/drei';
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
  Download,
  GitBranch,
  Target,
  FlaskConical,
  Zap,
  Menu,
  X,
  Gauge, // New Icon for Skills
  Code
} from 'lucide-react';

// --- CONFIG & UTILS ---

const BACKGROUND_COLOR = '#0F0F0F'; // Dark Black
const ACCENT_COLOR = '#FF6B00';    // Vibrant Engineering Orange
const UI_GRAY = '#F0F0F0';         // Near White for Text
const SHAPE_COUNT = 700;           // High number of instances, still fast

// --- 3D COMPONENTS ---

// Optimized Instanced Background Objects - Varied Shapes (Cubes, Cylinders, etc.)
const BackgroundInstances = ({ count = SHAPE_COUNT }) => {
  const meshRefs = useRef([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const geometries = useMemo(() => [
    new THREE.BoxGeometry(0.08, 0.08, 0.08),
    new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8),
    new THREE.ConeGeometry(0.08, 0.2, 8),
    new THREE.DodecahedronGeometry(0.08),
    new THREE.TorusGeometry(0.06, 0.02, 8, 16),
  ], []);

  const instanceData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (0.5 - Math.random()) * 25,
        (0.5 - Math.random()) * 25,
        (0.5 - Math.random()) * 25,
      ],
      geometryIndex: Math.floor(Math.random() * geometries.length),
    }));
  }, [count, geometries]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    const instanceGroups = Array(geometries.length).fill(null).map(() => []);
    instanceData.forEach(data => instanceGroups[data.geometryIndex].push(data));

    instanceGroups.forEach((group, geoIndex) => {
      if (!meshRefs.current[geoIndex]) return;

      group.forEach((data, i) => {
        const timeOffset = data.position[0] * 0.1;
        const x = data.position[0] + Math.sin(t * 0.5 + timeOffset) * 0.1;
        const y = data.position[1] + Math.cos(t * 0.5 + timeOffset) * 0.1;
        const z = data.position[2];

        dummy.position.set(x, y, z);
        dummy.rotation.x = Math.sin(t * 0.3 + timeOffset);
        dummy.rotation.y = Math.cos(t * 0.4 + timeOffset);
        dummy.updateMatrix();
        meshRefs.current[geoIndex].setMatrixAt(i, dummy.matrix);
      });
      if (meshRefs.current[geoIndex].instanceMatrix) {
          meshRefs.current[geoIndex].instanceMatrix.needsUpdate = true;
      }
    });
  });

  // Use a material that suggests heat or stress (Orange)
  const material = <meshStandardMaterial color={ACCENT_COLOR} emissive={ACCENT_COLOR} emissiveIntensity={0.5} metalness={0.9} roughness={0.1} />;

  return (
    <group position={[0, 0, 0]}>
      {geometries.map((geo, index) => (
        <instancedMesh 
          key={index}
          ref={el => meshRefs.current[index] = el}
          args={[geo, null, instanceData.filter(d => d.geometryIndex === index).length]} 
        >
          {material}
        </instancedMesh>
      ))}
    </group>
  );
};


// Custom Model Loader Component (Using GLB)
const CustomRoverModel = () => {
  // Path points to the file in the public folder
  const { scene } = useGLTF('/rover_model.glb'); 
  const modelRef = useRef();
  
  useEffect(() => {
    if (scene) {
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                // Apply a simple white material to the imported model
                child.material = new THREE.MeshStandardMaterial({ 
                    color: UI_GRAY, 
                    metalness: 0.8, 
                    roughness: 0.2 
                });
            }
        });
    }
  }, [scene]);
  
  useFrame(() => {
    if(modelRef.current) {
        modelRef.current.rotation.y += 0.005; 
    }
  });

  return (
    <primitive object={scene} scale={1.5} ref={modelRef} position={[0, -0.7, 0]} /> 
  );
};

// Generic Project Model (Placeholder for others)
const GenericCADModel = ({ color }) => (
  <group>
    <mesh castShadow receiveShadow>
      <torusKnotGeometry args={[1, 0.3, 100, 16]} />
      <meshStandardMaterial color={color} roughness={0.2} metalness={0.9} />
    </mesh>
  </group>
);

// Scene Manager - Now uses the Instanced Mesh
const BackgroundScene = () => {
  const groupRef = useRef();
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.02; 
  });

  return (
    <group ref={groupRef}>
      <BackgroundInstances />
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[0, 0, -10]} castShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color={ACCENT_COLOR} emissive={ACCENT_COLOR} emissiveIntensity={5} />
        </mesh>
      </Float>
    </group>
  );
};

// Simple text loader for 3D environment
const TextLoader = () => (
  <mesh>
    <boxGeometry args={[0, 0, 0]} />
    <meshBasicMaterial color="white" transparent opacity={0} />
    <Text 
        position={[0, 0, 0]} 
        color={UI_GRAY}
        fontSize={0.3} 
        anchorX="center" 
        anchorY="middle"
    >
      LOADING MODEL...
    </Text>
  </mesh>
);

// New component to encapsulate the modal's 3D logic
const ProjectCanvas = ({ project }) => {
  return (
    <Canvas shadows>
        {/* Use Suspense immediately inside the Canvas to catch asset loading errors */}
        <Suspense fallback={<TextLoader />}>
            <PerspectiveCamera makeDefault position={[4, 3, 5]} />
            <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.5} />
            
            <ambientLight intensity={0.8} />
            <directionalLight 
                position={[10, 10, 10]} 
                intensity={1} 
                castShadow 
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-far={50}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
            />
            <Environment preset="city" />
            
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
                {project.id === 'rover' ? (
                <CustomRoverModel /> 
                ) : (
                <GenericCADModel color={project.colorStr} />
                )}
            </Float>
            
            <AccumulativeShadows 
                frames={100} 
                alphaTest={0.85} 
                scale={10} 
                rotation={[Math.PI / 2, 0, 0]} 
                position={[0, -0.7, 0]} 
                color={ACCENT_COLOR} 
                opacity={0.5}
            >
                <RandomizedLight amount={8} radius={5} ambient={0.5} intensity={1} position={[5, 5, -10]} bias={0.001} />
            </AccumulativeShadows>
        </Suspense>
    </Canvas>
  );
};

// --- UI COMPONENTS ---

const Navbar = ({ activeSection, scrollToSection }) => {
  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'profile', label: 'Profile' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F0F]/90 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 font-extrabold text-xl tracking-tighter text-white">
            <Wrench className={`w-6 h-6 text-orange-500`} />
            <span>MECH<span className="text-orange-500">.ENG</span></span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 relative ${
                    activeSection === item.id ? 'text-orange-500' : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  {item.label}
                  {activeSection === item.id && (
                     <motion.span 
                        layoutId="underline" 
                        className="absolute bottom-0 left-0 right-0 h-[3px] bg-orange-500 rounded-t-sm" 
                     />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="md:hidden">
            <button className="text-zinc-300 hover:text-white p-2">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const ProjectModal = ({ project, onClose }) => {
  if (!project) return null;

  // Map old blue/cyan to new accent color for consistency
  const projectColor = project.id === 'rover' ? ACCENT_COLOR : project.colorStr;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-7xl h-[85vh] bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-black/80">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-orange-500/80 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Left: Interactive 3D View */}
        <div className="w-full md:w-2/3 h-1/2 md:h-full bg-black relative">
          <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/60 text-orange-500 text-xs font-mono border border-orange-500/50 rounded">
            INTERACTIVE SIMULATION
          </div>
          <ProjectCanvas project={project} />
        </div>
        
        {/* Right: Details */}
        <div className="w-full md:w-1/3 h-1/2 md:h-full overflow-y-auto p-8 bg-[#1f2937]/30 border-l border-white/5">
          <div className={`p-4 rounded-xl mb-6`} style={{ backgroundColor: `${projectColor}1A`, color: projectColor }}>
            {project.icon}
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">{project.title}</h2>
          <p className="text-zinc-500 text-sm mb-6 font-mono">{project.date || "Fall 2024"}</p>
          
          <div className="prose prose-invert prose-sm mb-8 text-zinc-300">
            <p className="border-l-4 pl-4" style={{ borderColor: projectColor }}>{project.fullDescription || project.description}</p>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 border-b border-white/10 pb-1">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map(tag => (
                <span key={tag} className="px-2 py-1 text-xs rounded-full border text-white font-mono" style={{ borderColor: `${projectColor}80`, backgroundColor: `${projectColor}1A` }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 border-b border-white/10 pb-1">Gallery</h3>
            <div className="grid grid-cols-2 gap-2">
               {[1,2,3,4].map(i => (
                 <div key={i} className="aspect-square bg-white/5 rounded hover:bg-white/10 transition-colors flex items-center justify-center text-zinc-500 text-xs border border-dashed border-white/20">
                   Figure {i}
                 </div>
               ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/5">
             <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: '#c25500' }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-700/30"
             >
                <Download size={16} /> Technical Report
             </motion.button>
             <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 bg-transparent hover:bg-white/5 text-orange-500 rounded-lg font-bold text-sm transition-all border border-orange-500/50 flex items-center justify-center gap-2"
             >
                <GitBranch size={16} /> GitHub Source
             </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Skill Card component using Framer Motion for animation
const SkillCard = ({ name, level, tools, icon: Icon }) => {
    // Determine color based on skill level, mimicking a heat map
    const skillColor = level > 90 ? 'text-orange-500' : level > 80 ? 'text-yellow-500' : 'text-zinc-400';

    return (
        <motion.div 
            className="p-6 bg-[#1a1a1a] rounded-xl border border-white/5 hover:border-orange-500 transition-all cursor-default relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
        >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent`} style={{ width: `${level}%` }}></div>
            
            <div className="flex items-center gap-4 mb-4">
                <Icon size={28} className={skillColor} />
                <span className="font-bold text-white text-xl">{name}</span>
            </div>
            
            <p className="text-zinc-400 text-xs mb-4">{tools}</p>
            
            <div className="flex justify-end">
                <span className={`text-3xl font-extrabold font-mono ${skillColor}`}>{level}%</span>
            </div>
        </motion.div>
    );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [selectedProject, setSelectedProject] = useState(null);
  const sectionsRef = useRef({});

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'profile', 'projects', 'skills', 'contact'];
      const current = sections.find(section => {
        const element = sectionsRef.current[section];
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= window.innerHeight / 3 && rect.bottom >= window.innerHeight / 3;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = sectionsRef.current[id];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const projects = [
    {
      id: "rover",
      title: "3D Printed Rover for EFX",
      description: "A functional modular rover chassis designed for the EFX planetary exploration challenge, emphasizing 3D printability and custom suspension.",
      fullDescription: "This project involved the complete design lifecycle of a planetary rover prototype. I used Fusion 360 for the chassis design, focusing on printability and structural integrity using PLA+ and PETG filaments. The rover utilizes a rocker-bogie suspension system adapted for 3D printing to navigate rough terrain. The wheels are a compliant mechanism design to absorb shock without pneumatic tires.",
      tags: ["Fusion 360", "3D Printing", "Arduino", "Rocker-Bogie"],
      icon: <Target size={24} />,
      color: "red",
      colorStr: "#FF6B00"
    },
    {
      id: "fea",
      title: "Cycloidal Gearbox FEA",
      description: "Finite Element Analysis of a high-reduction cycloidal drive used in robotic joints, optimized for weight reduction and stress safety factors.",
      fullDescription: "Performed static structural analysis to identify stress concentrations under maximum torque loads. Topology optimization was applied to the housing to reduce mass by 22% while maintaining a Factor of Safety of 2.5. This project highlights proficiency in advanced simulation techniques.",
      tags: ["SolidWorks", "ANSYS", "Matlab", "Optimization"],
      icon: <Cog size={24} />,
      color: "orange",
      colorStr: "#FF9900" // A secondary orange tone
    },
    {
      id: "cfd",
      title: "Drone Aerodynamics CFD",
      description: "Computational Fluid Dynamics simulation of propeller thrust and body drag for a custom quadcopter frame, aiming to improve battery efficiency.",
      fullDescription: "Simulated airflow over the drone fuselage using OpenFOAM. The analysis led to a fuselage redesign that reduced drag by 14% at cruising speeds, demonstrating a deep understanding of fluid dynamics and optimization.",
      tags: ["OpenFOAM", "CFD", "Aerodynamics", "Python"],
      icon: <Wind size={24} />,
      color: "blue",
      colorStr: "#FF6B00" // Back to main accent
    },
    {
      id: "suspension",
      title: "Vehicle Dynamics Simulation",
      description: "Multi-body dynamic simulation of a double wishbone suspension, optimizing damper coefficients for off-road terrain handling.",
      fullDescription: "Created a mathematical model of a quarter-car suspension and ran simulations in MATLAB Simulink to tune the damping ratios for critical damping response. This confirms expertise in dynamic system modeling and control.",
      tags: ["ADAMS", "Simulink", "Vehicle Dynamics", "MATLAB"],
      icon: <Layers size={24} />,
      color: "purple",
      colorStr: "#FF9900" // Secondary orange tone
    }
  ];

  const skills = [
    { name: "CAD Design", level: 95, tools: "SolidWorks, Fusion 360, CATIA", icon: Wrench },
    { name: "FEA & CFD", level: 88, tools: "ANSYS, COMSOL, OpenFOAM", icon: FlaskConical },
    { name: "Dynamics & Control", level: 90, tools: "ROS, Arduino, PLC, PID", icon: Zap },
    { name: "Scripting & Data", level: 82, tools: "Python, MATLAB, C++, Git", icon: Code }
  ];

  const statItems = [
    { label: "Design Projects", val: "15+", icon: <Target size={24} className="text-orange-500" /> },
    { label: "Simulation Hours", val: "500+", icon: <FlaskConical size={24} className="text-orange-500" /> },
    { label: "Robotics Lead", val: "2 Years", icon: <Zap size={24} className="text-orange-500" /> },
    { label: "Code Repositories", val: "20+", icon: <GitBranch size={24} className="text-orange-500" /> }
  ];

  return (
    <div className="bg-[#0F0F0F] text-zinc-100 min-h-screen font-sans selection:bg-orange-500/30">
      {/* Background 3D Scene */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Canvas shadows dpr={[1, 2]}>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
            <color attach="background" args={[BACKGROUND_COLOR]} /> 
            <ambientLight intensity={0.5} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color={ACCENT_COLOR} />
            <BackgroundScene />
            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
        {/* Subtle wireframe grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-repeat bg-[size:30px_30px] [background-image:linear-gradient(to_right,gray_1px,transparent_1px),linear-gradient(to_bottom,gray_1px,transparent_1px)]"></div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#0F0F0F]/90 via-[#0F0F0F]/30 to-[#0F0F0F]/90"></div>
      </div>

      <Navbar 
        activeSection={activeSection} 
        scrollToSection={scrollToSection}
      />

      <main className="relative z-10 pt-16">
        
        {/* HERO SECTION */}
        <section id="hero" ref={el => sectionsRef.current.hero = el} className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-mono mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                DESIGN LEAD: Fall 2025 Graduation
              </div>
              <h1 className="text-6xl md:text-9xl font-extrabold tracking-tight text-white mb-6 leading-none">
                <span className="text-zinc-400 font-light">COMPUTATIONAL</span> <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-400">MECHANICAL</span> <br/>
                ENGINEER.
              </h1>
              <p className="text-xl text-zinc-300 max-w-3xl mb-10 leading-relaxed font-light mt-6 border-l-4 border-orange-500 pl-4">
                Specializing in advanced **Finite Element Analysis (FEA)**, Robotics, and robust **CAD-to-Manufacture** pipelines.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.button 
                  onClick={() => scrollToSection('projects')} 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-lg transition-all flex items-center gap-3 shadow-xl shadow-orange-600/30 border border-orange-500/50"
                >
                   View Analysis <Gauge size={20} />
                </motion.button>
                <motion.button 
                  onClick={() => scrollToSection('contact')} 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-transparent hover:bg-white/10 text-orange-500 rounded-lg font-bold text-lg transition-all border border-zinc-700 flex items-center gap-3"
                >
                   Contact Me <Mail size={20} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PROFILE / SUMMARY SECTION */}
        <section id="profile" ref={el => sectionsRef.current.profile = el} className="py-24 px-4 sm:px-6 lg:px-8 border-y border-white/10 bg-[#1a1a1a]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Left Column: Stats */}
            <div className="md:col-span-1 space-y-6">
              <h2 className="text-4xl font-extrabold mb-8 text-white border-b-4 border-orange-500/50 pb-2 inline-block">Professional Summary</h2>
              <p className="text-zinc-300 leading-relaxed mb-8">
                I am a highly driven final-year Mechanical Engineering student with a passion for **data-driven design optimization** and hands-on fabrication. I leverage simulation software (FEA/CFD) and programming (Python/MATLAB) to deliver robust, efficient, and manufacturable solutions across robotics and automotive disciplines.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {statItems.map((stat, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="p-4 bg-[#0F0F0F] rounded-lg border border-orange-500/30 flex flex-col items-start"
                    >
                        {stat.icon}
                        <div className="text-3xl font-extrabold text-white mt-2">{stat.val}</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest">{stat.label}</div>
                    </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="md:col-span-2">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {/* Education */}
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="p-8 bg-[#0F0F0F] border border-white/10 rounded-xl"
                 >
                    <h3 className="text-2xl font-bold text-white mb-2">B.S. Mechanical Engineering</h3>
                    <p className="text-orange-500 font-mono mb-2">University of Technology</p>
                    <p className="text-zinc-400 text-sm">Graduation: May 2025 | GPA: 3.8/4.0</p>
                    <p className="text-zinc-500 text-sm mt-2">Specialization in Advanced Dynamics and Computational Methods.</p>
                 </motion.div>
                 {/* Experience Placeholder */}
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="p-8 bg-[#0F0F0F] border border-white/10 rounded-xl"
                 >
                    <h3 className="text-2xl font-bold text-white mb-2">Design & Analysis Intern</h3>
                    <p className="text-orange-500 font-mono mb-2">Precision Dynamics Corp.</p>
                    <p className="text-zinc-400 text-sm">Summer 2024</p>
                    <p className="text-zinc-500 text-sm mt-2">Reduced fixture vibration by 30% through modal analysis and material changes.</p>
                 </motion.div>
               </div>
               
               {/* Certifications and Links */}
               <div className="mt-8">
                   <h3 className="text-lg font-bold text-white mb-4 border-b border-zinc-700/50 pb-2">Credentials & Documents</h3>
                   <div className="flex flex-wrap gap-4">
                       <span className="px-4 py-2 bg-orange-500/10 text-orange-300 rounded-full text-sm border border-orange-500/50">CSWP - SolidWorks Professional</span>
                       <span className="px-4 py-2 bg-orange-500/10 text-orange-300 rounded-full text-sm border border-orange-500/50">Certified ANSYS Associate</span>
                       <a href="#" className="px-4 py-2 bg-white text-[#0F0F0F] rounded-full text-sm font-bold hover:bg-zinc-300 transition-colors flex items-center gap-2">
                           View Resume <Download size={16} />
                       </a>
                   </div>
               </div>
            </div>
          </div>
        </section>

        {/* SKILLS SECTION */}
        <section id="skills" ref={el => sectionsRef.current.skills = el} className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0F0F0F] border-b border-white/10">
           <div className="max-w-7xl mx-auto">
              <h2 className="text-5xl font-extrabold mb-12 flex items-center gap-3 text-white">
                 <Gauge className="text-orange-500" size={38} />
                 The Technical Arsenal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {skills.map((skill, index) => (
                    <SkillCard key={index} {...skill} />
                  ))}
              </div>
           </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" ref={el => sectionsRef.current.projects = el} className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0F0F0F]">
          <div className="max-w-7xl mx-auto">
             <div className="mb-12">
                <h2 className="text-5xl font-extrabold mb-4 text-white">Core Engineering Projects</h2>
                <p className="text-zinc-400 max-w-xl text-lg">Detailed analyses, CAD models, and simulations demonstrating core competencies.</p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {projects.map((project, index) => (
                 <motion.div
                   key={index}
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: index * 0.1 }}
                   onClick={() => setSelectedProject(project)}
                   whileHover={{ y: -6, boxShadow: `0 10px 20px -5px ${ACCENT_COLOR}60` }} 
                   className="group cursor-pointer bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden transition-all duration-300 relative p-6 hover:border-orange-500"
                 >
                    <div className="mb-4 text-orange-500">
                         {project.icon}
                    </div>
                   
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-500 transition-colors">{project.title}</h3>
                    <p className="text-zinc-400 text-sm mb-4 line-clamp-3">{project.description}</p>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-700/50">
                       {project.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-3 py-1 text-xs rounded-full bg-orange-500/10 text-orange-300 font-mono">{tag}</span>
                       ))}
                    </div>
                 </motion.div>
               ))}
             </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" ref={el => sectionsRef.current.contact = el} className="py-24 px-4 sm:px-6 lg:px-8 bg-[#1a1a1a] border-t border-white/10">
           <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-5xl font-extrabold mb-6 text-white">Let's build the future, together.</h2>
              <p className="text-zinc-400 text-xl mb-12 max-w-3xl mx-auto">
                 I am actively seeking full-time and internship opportunities where I can apply my analytical and design skills.
              </p>
              <div className="flex justify-center gap-6 mb-16">
                 <motion.a 
                    href="mailto:johndoe@email.com" 
                    whileHover={{ scale: 1.1, backgroundColor: ACCENT_COLOR, color: BACKGROUND_COLOR }}
                    whileTap={{ scale: 0.9 }}
                    className="p-5 bg-white/5 rounded-full text-orange-400 border border-orange-400/50 transition-all shadow-lg shadow-orange-900/30"
                 >
                    <Mail size={28} />
                 </motion.a>
                 <motion.a 
                    href="#" 
                    whileHover={{ scale: 1.1, backgroundColor: ACCENT_COLOR, color: BACKGROUND_COLOR }}
                    whileTap={{ scale: 0.9 }}
                    className="p-5 bg-white/5 rounded-full text-orange-400 border border-orange-400/50 transition-all shadow-lg shadow-orange-900/30"
                 >
                    <Linkedin size={28} />
                 </motion.a>
                 <motion.a 
                    href="#" 
                    whileHover={{ scale: 1.1, backgroundColor: ACCENT_COLOR, color: BACKGROUND_COLOR }}
                    whileTap={{ scale: 0.9 }}
                    className="p-5 bg-white/5 rounded-full text-orange-400 border border-orange-400/50 transition-all shadow-lg shadow-orange-900/30"
                 >
                    <Github size={28} />
                 </motion.a>
              </div>
              <footer className="text-zinc-600 text-sm">
                 DESIGNED & BUILT IN REACT/THREE.JS • © {new Date().getFullYear()}
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
