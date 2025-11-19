import React, { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  Environment, 
  Float, 
  ContactShadows, 
  OrbitControls, 
  useGLTF, 
  Text, 
  AccumulativeShadows, 
  RandomizedLight,
  Stars
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
  Code,
  Terminal,
  ChevronRight,
  MousePointer2
} from 'lucide-react';

// --- THEME CONFIG ---
const THEME = {
  bg: '#09090b',        // Deep Zinc Black
  text: '#f8fafc',      // Slate 50
  accent: '#0ea5e9',    // Sky 500 (CAD Blue)
  muted: '#64748b',     // Slate 500
  border: '#27272a',    // Zinc 800
  surface: '#18181b',   // Zinc 900
};

// --- 3D ASSETS ---

// 1. PROCEDURAL GEAR COMPONENT
// Creates a technical-looking gear geometry programmatically
const TechnicalGear = ({ position, rotation, size = 1, teeth = 12, speed = 1, color, wireframe = false }) => {
  const meshRef = useRef();
  
  // Create gear shape
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = size;
    const innerRadius = size * 0.85;
    const holeRadius = size * 0.4;
    
    const numTeeth = teeth;
    const angleStep = (Math.PI * 2) / (numTeeth * 2);

    for (let i = 0; i < numTeeth * 2; i++) {
      const angle = i * angleStep;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    
    // Center hole
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, holeRadius, 0, Math.PI * 2, false);
    shape.holes.push(holePath);

    return new THREE.ExtrudeGeometry(shape, { 
      depth: 0.2 * size, 
      bevelEnabled: true, 
      bevelThickness: 0.05 * size, 
      bevelSize: 0.05 * size, 
      bevelSegments: 2 
    });
  }, [size, teeth]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * speed * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial 
        color={wireframe ? THEME.accent : color || '#334155'} 
        roughness={0.5} 
        metalness={0.8} 
        wireframe={wireframe}
        emissive={wireframe ? THEME.accent : '#000000'}
        emissiveIntensity={wireframe ? 0.5 : 0}
      />
    </mesh>
  );
};

// 2. BACKGROUND SCENE
// A composition of gears creating a "machine" feel
const EngineeringBackground = () => {
  const groupRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Gentle floating of the entire assembly
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.1;
      groupRef.current.position.y = Math.sin(t * 0.2) * 0.2;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.5, 0, 0]} position={[2, 0, -5]}>
      {/* Main Drive Gear */}
      <TechnicalGear position={[-2, 2, 0]} size={2} teeth={16} speed={0.2} color="#1e293b" />
      
      {/* Wireframe Accent Gear */}
      <TechnicalGear position={[0.5, 2, 0.5]} size={1} teeth={8} speed={-0.4} wireframe={true} />
      
      {/* Secondary System */}
      <TechnicalGear position={[-2, -1.5, -1]} size={3} teeth={24} speed={-0.13} color="#0f172a" />
      <TechnicalGear position={[2.5, -1.5, 1]} size={1.5} teeth={12} speed={0.26} color="#334155" />
      
      {/* Connecting Shafts (Abstract cylinders) */}
      <mesh position={[-2, 2, -2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 8, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
      </mesh>

       <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
         {/* Floating Particles */}
         {Array.from({ length: 20 }).map((_, i) => (
           <mesh key={i} position={[
             (Math.random() - 0.5) * 15,
             (Math.random() - 0.5) * 15,
             (Math.random() - 0.5) * 10
           ]}>
             <octahedronGeometry args={[0.05]} />
             <meshBasicMaterial color={THEME.accent} transparent opacity={0.4} />
           </mesh>
         ))}
       </Float>
    </group>
  );
};

// 3. CUSTOM GLB LOADER (For the Rover)
const CustomRoverModel = () => {
  const { scene } = useGLTF('/rover_model.glb'); 
  const modelRef = useRef();
  
  useEffect(() => {
    if (scene) {
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                // Apply a clean "clay" material for better aesthetics
                child.material = new THREE.MeshStandardMaterial({ 
                    color: '#e2e8f0', 
                    roughness: 0.5,
                    metalness: 0.2
                });
            }
        });
    }
  }, [scene]);
  
  useFrame(() => {
    if(modelRef.current) modelRef.current.rotation.y += 0.002; 
  });

  return <primitive object={scene} scale={1.5} ref={modelRef} position={[0, -0.7, 0]} />;
};

// Generic Placeholder Model
const GenericCADModel = ({ color }) => (
  <group>
    <mesh castShadow receiveShadow>
      <torusKnotGeometry args={[0.8, 0.2, 100, 16]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
    </mesh>
  </group>
);

// 4. PROJECT CANVAS (Isolated 3D View)
const ProjectCanvas = ({ project }) => {
  return (
    <Canvas shadows camera={{ position: [4, 3, 5], fov: 50 }}>
        <Suspense fallback={null}>
            <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.5} />
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
            <Environment preset="studio" />
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
                {project.id === 'rover' ? <CustomRoverModel /> : <GenericCADModel color={project.colorStr} />}
            </Float>
            <AccumulativeShadows frames={100} alphaTest={0.85} scale={10} position={[0, -0.75, 0]} opacity={0.6} color={THEME.accent}>
                <RandomizedLight amount={8} radius={5} ambient={0.5} intensity={1} position={[5, 5, -10]} bias={0.001} />
            </AccumulativeShadows>
        </Suspense>
    </Canvas>
  );
};


// --- UI COMPONENTS ---

const Navbar = ({ activeSection, scrollToSection }) => {
  const navItems = [
    { id: 'hero', label: '01 // HOME' },
    { id: 'profile', label: '02 // PROFILE' },
    { id: 'projects', label: '03 // PROJECTS' },
    { id: 'contact', label: '04 // CONTACT' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center">
      <div className="max-w-7xl w-full mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-3 text-white font-mono tracking-tighter cursor-pointer" onClick={() => scrollToSection('hero')}>
           <div className="w-8 h-8 bg-sky-500/10 border border-sky-500/50 rounded flex items-center justify-center">
              <Cog className="w-5 h-5 text-sky-500 animate-spin-slow" />
           </div>
           <span className="font-bold text-lg">MECH<span className="text-sky-500">.DEV</span></span>
        </div>

        <div className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`text-xs font-mono tracking-widest transition-all duration-300 ${
                activeSection === item.id ? 'text-sky-500' : 'text-zinc-500 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button className="md:hidden text-zinc-400">
           <Menu size={24} />
        </button>
      </div>
    </nav>
  );
};

const ProjectCard = ({ project, onClick, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="group relative bg-zinc-900/50 border border-white/5 rounded-lg overflow-hidden cursor-pointer hover:border-sky-500/50 transition-all duration-300"
    >
      {/* Top Bar (CAD Window Style) */}
      <div className="h-8 bg-black/40 border-b border-white/5 flex items-center justify-between px-3">
        <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full bg-${project.color}-500`}></div>
           {project.id.toUpperCase()}_REV03.ASM
        </span>
        <Maximize2 size={12} className="text-zinc-600 group-hover:text-sky-500 transition-colors" />
      </div>

      <div className="p-6">
        <div className="mb-4 p-3 bg-white/5 w-fit rounded-md text-sky-500 group-hover:text-white group-hover:bg-sky-600 transition-all">
           {project.icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">{project.title}</h3>
        <p className="text-zinc-400 text-sm line-clamp-3 mb-4 leading-relaxed">{project.description}</p>
        
        <div className="flex flex-wrap gap-2">
           {project.tags.slice(0,3).map(tag => (
             <span key={tag} className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 border border-white/10 rounded bg-black/20">
               {tag}
             </span>
           ))}
        </div>
      </div>
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}

const ProjectModal = ({ project, onClose }) => {
  if (!project) return null;
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
    >
      <div className="w-full max-w-6xl h-[85vh] bg-zinc-950 border border-white/10 rounded-xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
         {/* Left: 3D Viewport */}
         <div className="w-full md:w-2/3 h-1/2 md:h-full relative bg-zinc-900">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
               <span className="px-2 py-1 bg-black/60 border border-white/10 text-[10px] text-sky-500 font-mono rounded">VIEW: ISOMETRIC</span>
               <span className="px-2 py-1 bg-black/60 border border-white/10 text-[10px] text-zinc-500 font-mono rounded">ZOOM: 100%</span>
            </div>
            <ProjectCanvas project={project} />
            <div className="absolute bottom-4 right-4 text-zinc-600 text-[10px] font-mono">
               RENDER_ENGINE: THREE.JS_R154
            </div>
         </div>

         {/* Right: Data Panel */}
         <div className="w-full md:w-1/3 h-1/2 md:h-full bg-zinc-950 border-l border-white/10 p-8 overflow-y-auto relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20}/></button>
            
            <div className="mb-8">
               <div className="text-xs font-mono text-sky-500 mb-2">PROJECT_ID: {project.id.toUpperCase()}</div>
               <h2 className="text-3xl font-bold text-white mb-4">{project.title}</h2>
               <p className="text-zinc-400 text-sm leading-relaxed">{project.fullDescription || project.description}</p>
            </div>

            <div className="space-y-6">
               <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 border-b border-white/10 pb-2">Technical Specifications</h3>
                  <div className="flex flex-wrap gap-2">
                     {project.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 text-xs font-mono text-zinc-300 bg-zinc-900 border border-white/10 rounded">{tag}</span>
                     ))}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 py-3 bg-white text-black rounded font-bold text-sm hover:bg-sky-500 hover:text-white transition-colors">
                     <Download size={16} /> Report
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 bg-transparent border border-white/20 text-white rounded font-bold text-sm hover:border-white transition-colors">
                     <Github size={16} /> Source
                  </button>
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
}

// --- MAIN APP ---

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [selectedProject, setSelectedProject] = useState(null);
  const sectionsRef = useRef({});

  const scrollToSection = (id) => {
    const element = sectionsRef.current[id];
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  // PROJECTS DATA
  const projects = [
    {
      id: "rover",
      title: "Autonomous Rover Chassis",
      description: "Modular planetary exploration chassis featuring a custom rocker-bogie suspension system optimized for additive manufacturing.",
      fullDescription: "Designed from the ground up using Fusion 360, this rover utilizes a compliant rocker-bogie mechanism to traverse unstructured terrain. The chassis was optimized for FDM 3D printing, minimizing support material while maximizing structural rigidity. Integrated with ROS 2 for autonomous navigation.",
      tags: ["Fusion 360", "ROS 2", "3D Printing", "FEA"],
      icon: <Cpu size={24} />,
      color: "red", colorStr: "#ef4444"
    },
    {
      id: "fea",
      title: "Cycloidal Drive FEA",
      description: "Static and fatigue analysis of a high-reduction cycloidal gearbox for robotic joint applications.",
      tags: ["ANSYS", "SolidWorks", "Machine Design"],
      icon: <Cog size={24} />,
      color: "orange", colorStr: "#f97316"
    },
    {
      id: "cfd",
      title: "UAV Aerodynamics Analysis",
      description: "CFD simulation of a custom quadcopter frame to optimize thrust efficiency and reduce drag.",
      tags: ["OpenFOAM", "CFD", "Python"],
      icon: <Wind size={24} />,
      color: "blue", colorStr: "#3b82f6"
    },
    {
      id: "suspension",
      title: "Multi-Body Dynamics",
      description: "Double wishbone suspension simulation to optimize damper coefficients for off-road performance.",
      tags: ["ADAMS", "Simulink", "Dynamics"],
      icon: <Layers size={24} />,
      color: "purple", colorStr: "#a855f7"
    }
  ];

  return (
    <div className="bg-zinc-950 text-slate-50 min-h-screen font-sans selection:bg-sky-500/30">
      
      {/* 3D BACKGROUND LAYER */}
      <div className="fixed inset-0 z-0">
        <Canvas dpr={[1, 2]} gl={{ antialias: true }}>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
            <color attach="background" args={['#09090b']} />
            
            {/* Cinematic Lighting */}
            <ambientLight intensity={0.2} />
            <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={1} color={THEME.accent} />
            <spotLight position={[-10, -10, -5]} angle={0.5} penumbra={1} intensity={0.5} color="white" />
            
            <EngineeringBackground />
            
            <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
            {/* Subtle fog for depth */}
            <fog attach="fog" args={['#09090b', 5, 20]} />
          </Suspense>
        </Canvas>
        
        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ 
               backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
               backgroundSize: '40px 40px'
             }}>
        </div>
        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-zinc-950/80 via-transparent to-zinc-950/80"></div>
      </div>

      <Navbar activeSection={activeSection} scrollToSection={scrollToSection} />

      <main className="relative z-10 pt-20">
        
        {/* HERO SECTION */}
        <section id="hero" ref={el => sectionsRef.current.hero = el} className="min-h-screen flex flex-col justify-center px-6 lg:px-12">
           <div className="max-w-5xl">
              <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                 <div className="flex items-center gap-3 mb-6">
                    <div className="h-[1px] w-12 bg-sky-500"></div>
                    <span className="text-sky-500 font-mono text-sm tracking-widest">SYSTEM_ONLINE // V2.4</span>
                 </div>
                 
                 <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight mb-6">
                    Precision Engineering. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-slate-400">
                       Digital Simulation.
                    </span>
                 </h1>
                 
                 <p className="text-xl text-slate-400 max-w-2xl leading-relaxed font-light mb-10">
                    Bridging the gap between theoretical mechanics and digital fabrication. 
                    Specializing in computational analysis, robotics systems, and advanced manufacturing.
                 </p>

                 <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => scrollToSection('projects')}
                      className="px-8 py-4 bg-white text-black font-bold rounded hover:bg-sky-400 transition-all flex items-center gap-2"
                    >
                       View Blueprints <ChevronRight size={16} />
                    </button>
                    <button 
                      onClick={() => scrollToSection('contact')}
                      className="px-8 py-4 border border-white/20 text-white font-bold rounded hover:bg-white/5 transition-all"
                    >
                       Contact Me
                    </button>
                 </div>
              </motion.div>
           </div>
           
           {/* Scroll Indicator */}
           <motion.div 
              animate={{ y: [0, 10, 0] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500"
           >
              <span className="text-[10px] font-mono tracking-widest">SCROLL</span>
              <MousePointer2 size={16} />
           </motion.div>
        </section>

        {/* PROFILE & STATS */}
        <section id="profile" ref={el => sectionsRef.current.profile = el} className="py-32 px-6 lg:px-12 bg-zinc-950/50 border-t border-white/5 backdrop-blur-sm">
           <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                 <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Terminal className="text-sky-500" />
                    Engineering Profile
                 </h2>
                 <p className="text-slate-400 leading-relaxed mb-6 text-lg">
                    I am a final-year Mechanical Engineering student obsessed with optimization. I don't just design parts; I simulate their performance under stress, fluid flow, and thermal loads before a single prototype is made.
                 </p>
                 <p className="text-slate-400 leading-relaxed mb-8">
                    My workflow integrates traditional CAD with modern computational methods (FEA/CFD) to deliver robust, validated engineering solutions.
                 </p>
                 
                 <div className="grid grid-cols-2 gap-4">
                    {[
                       { label: "CAD Proficiency", val: "Expert" },
                       { label: "FEA Hours", val: "500+" },
                       { label: "Projects", val: "15+" },
                       { label: "Status", val: "Open for Work" }
                    ].map((stat, i) => (
                       <div key={i} className="p-4 border border-white/10 rounded bg-zinc-900/50">
                          <div className="text-xs text-sky-500 font-mono mb-1">{stat.label}</div>
                          <div className="text-xl font-bold text-white">{stat.val}</div>
                       </div>
                    ))}
                 </div>
              </div>
              
              {/* Tech Stack Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="p-6 border border-white/10 rounded bg-zinc-900 hover:border-sky-500/30 transition-colors">
                    <Wrench className="text-sky-500 mb-4" size={28} />
                    <h3 className="font-bold mb-2">Design & CAD</h3>
                    <p className="text-sm text-zinc-500">SolidWorks, Fusion 360, Inventor, GD&T</p>
                 </div>
                 <div className="p-6 border border-white/10 rounded bg-zinc-900 hover:border-sky-500/30 transition-colors">
                    <FlaskConical className="text-sky-500 mb-4" size={28} />
                    <h3 className="font-bold mb-2">Simulation</h3>
                    <p className="text-sm text-zinc-500">ANSYS Mechanical, Fluent, OpenFOAM</p>
                 </div>
                 <div className="p-6 border border-white/10 rounded bg-zinc-900 hover:border-sky-500/30 transition-colors">
                    <Cpu className="text-sky-500 mb-4" size={28} />
                    <h3 className="font-bold mb-2">Robotics</h3>
                    <p className="text-sm text-zinc-500">ROS 2, Arduino, PLC, Mechatronics</p>
                 </div>
                 <div className="p-6 border border-white/10 rounded bg-zinc-900 hover:border-sky-500/30 transition-colors">
                    <Code className="text-sky-500 mb-4" size={28} />
                    <h3 className="font-bold mb-2">Computation</h3>
                    <p className="text-sm text-zinc-500">Python, MATLAB, C++, Git</p>
                 </div>
              </div>
           </div>
        </section>

        {/* PROJECTS GRID */}
        <section id="projects" ref={el => sectionsRef.current.projects = el} className="py-32 px-6 lg:px-12">
           <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-12">
                 <div>
                    <h2 className="text-4xl font-bold mb-4">Selected Projects</h2>
                    <p className="text-zinc-500 font-mono">Directory: /engineering/portfolio/2024</p>
                 </div>
                 <div className="hidden md:block h-[1px] flex-1 bg-white/10 mx-8 mb-4"></div>
                 <button className="text-sky-500 hover:text-white transition-colors flex items-center gap-2">
                    View All Archives <ChevronRight size={16}/>
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {projects.map((proj, i) => (
                    <ProjectCard 
                       key={proj.id} 
                       project={proj} 
                       index={i} 
                       onClick={() => setSelectedProject(proj)} 
                    />
                 ))}
              </div>
           </div>
        </section>

        {/* CONTACT FOOTER */}
        <section id="contact" ref={el => sectionsRef.current.contact = el} className="py-32 px-6 bg-zinc-950 border-t border-white/10">
           <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-5xl font-bold mb-8">Ready to collaborate?</h2>
              <p className="text-zinc-400 text-lg mb-12">
                 Currently seeking opportunities in Mechanical Design and Robotics Engineering.
                 Let's discuss how I can contribute to your engineering team.
              </p>
              
              <div className="flex justify-center gap-8 mb-16">
                 <a href="#" className="flex flex-col items-center gap-2 group">
                    <div className="p-4 rounded-full bg-white/5 group-hover:bg-sky-500 transition-colors">
                       <Mail size={24} className="text-white" />
                    </div>
                    <span className="text-xs font-mono text-zinc-500 group-hover:text-white">EMAIL</span>
                 </a>
                 <a href="#" className="flex flex-col items-center gap-2 group">
                    <div className="p-4 rounded-full bg-white/5 group-hover:bg-sky-500 transition-colors">
                       <Linkedin size={24} className="text-white" />
                    </div>
                    <span className="text-xs font-mono text-zinc-500 group-hover:text-white">LINKEDIN</span>
                 </a>
                 <a href="#" className="flex flex-col items-center gap-2 group">
                    <div className="p-4 rounded-full bg-white/5 group-hover:bg-sky-500 transition-colors">
                       <Github size={24} className="text-white" />
                    </div>
                    <span className="text-xs font-mono text-zinc-500 group-hover:text-white">GITHUB</span>
                 </a>
              </div>
              
              <div className="text-zinc-600 text-xs font-mono">
                 © {new Date().getFullYear()} // DESIGNED WITH REACT-THREE-FIBER
              </div>
           </div>
        </section>

      </main>

      {/* MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </AnimatePresence>

    </div>
  );
}