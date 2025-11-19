import React, { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  Environment, 
  Float, 
  OrbitControls, 
  useGLTF, 
  Text,
  Stars,
  Center
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
  MousePointer2,
  Maximize,
  Layers as LayersIcon,
  ArrowRight,
  Ruler,
  Settings,
  Crosshair
} from 'lucide-react';

// --- THEME CONFIG ---
const THEME = {
  bg: '#09090b',        // Deep Zinc Black
  text: '#f8fafc',      // Slate 50
  accent: '#0ea5e9',    // Sky 500 (CAD Blue)
  warning: '#f59e0b',   // Amber 500 (Engineering Warning)
  muted: '#64748b',     // Slate 500
  border: '#27272a',    // Zinc 800
  surface: '#18181b',   // Zinc 900
};

// --- 3D ASSETS ---

// 1. PROCEDURAL GEAR COMPONENT
const TechnicalGear = ({ position, rotation, size = 1, teeth = 12, speed = 1, color, wireframe = false }) => {
  const meshRef = useRef();
  
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

// 2. PROCEDURAL DRONE (Background Element)
const Drone = () => {
  const groupRef = useRef();
  
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    
    // Flight Path: Figure-8ish motion
    groupRef.current.position.x = Math.sin(t * 0.5) * 8;
    groupRef.current.position.y = Math.cos(t * 0.3) * 4 + 2;
    groupRef.current.position.z = Math.sin(t * 0.2) * 5 - 5;
    
    // Banking
    groupRef.current.rotation.z = -Math.cos(t * 0.5) * 0.2;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;
  });

  return (
    <group ref={groupRef} scale={0.5}>
       {/* Body */}
       <mesh>
         <boxGeometry args={[1, 0.2, 1]} />
         <meshStandardMaterial color="#334155" />
       </mesh>
       {/* Arms */}
       <mesh rotation={[0, Math.PI/4, 0]}>
         <boxGeometry args={[2.5, 0.1, 0.2]} />
         <meshStandardMaterial color="#1e293b" />
       </mesh>
       <mesh rotation={[0, -Math.PI/4, 0]}>
         <boxGeometry args={[2.5, 0.1, 0.2]} />
         <meshStandardMaterial color="#1e293b" />
       </mesh>
       {/* Propellers (Visual only) */}
       {[[-1, 0, 1], [1, 0, 1], [-1, 0, -1], [1, 0, -1]].map((pos, i) => (
         <mesh key={i} position={[pos[0], 0.2, pos[2]]}>
            <cylinderGeometry args={[0.4, 0.4, 0.05, 8]} />
            <meshStandardMaterial color={THEME.accent} emissive={THEME.accent} emissiveIntensity={0.5} transparent opacity={0.6} />
         </mesh>
       ))}
    </group>
  );
};

// 3. BACKGROUND SCENE COMPONENT
const MainScene = () => {
  const groupRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.1;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
      <color attach="background" args={['#09090b']} />
      
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={1} color={THEME.accent} />
      <spotLight position={[-10, -10, -5]} angle={0.5} penumbra={1} intensity={0.5} color="white" />
      
      {/* Background Machinery */}
      <group ref={groupRef} rotation={[0.5, 0, 0]} position={[2, 0, -5]}>
        <TechnicalGear position={[-2, 2, 0]} size={2} teeth={16} speed={0.2} color="#1e293b" />
        <TechnicalGear position={[0.5, 2, 0.5]} size={1} teeth={8} speed={-0.4} wireframe={true} />
        <TechnicalGear position={[-2, -1.5, -1]} size={3} teeth={24} speed={-0.13} color="#0f172a" />
        <TechnicalGear position={[2.5, -1.5, 1]} size={1.5} teeth={12} speed={0.26} color="#334155" />
        
        {/* Abstract Shafts/Pipes */}
        <mesh position={[-2, 2, -2]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 8, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Flying Drone Element */}
      <Drone />

      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
      <fog attach="fog" args={['#09090b', 5, 20]} />
    </>
  );
};

// 4. CUSTOM GLB LOADER
const CustomRoverModel = () => {
  const { scene } = useGLTF('/rover_model.glb'); 
  
  useEffect(() => {
    if (scene) {
        scene.traverse((child) => {
            if (child.isMesh) {
                child.geometry.computeBoundingBox();
                const size = new THREE.Vector3();
                child.geometry.boundingBox.getSize(size);
                
                if (size.x > 10 || size.z > 10) {
                  child.visible = false;
                  return; 
                }

                child.castShadow = true;
                child.receiveShadow = true;
                child.material = new THREE.MeshStandardMaterial({ 
                    color: '#64748b',
                    roughness: 0.7,
                    metalness: 0.5
                });
            }
        });
    }
  }, [scene]);
  
  return (
    <Center top>
      <primitive object={scene} scale={1.5} />
    </Center>
  );
};

const GenericCADModel = ({ color }) => (
  <Center top>
    <mesh castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
    </mesh>
  </Center>
);

// 5. PROJECT SCENE COMPONENT
const ProjectScene = ({ project }) => {
  return (
    <>
      <OrbitControls enablePan={true} autoRotate autoRotateSpeed={0.8} makeDefault />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.0} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.3} color="#0ea5e9" />
      <Environment preset="city" />
      
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.1} floatingRange={[-0.05, 0.05]}>
          {project.id === 'rover' ? <CustomRoverModel /> : <GenericCADModel color={project.colorStr} />}
      </Float>
      
      <group position={[0, -0.5, 0]}>
        <gridHelper args={[20, 20, '#1e293b', '#0f172a']} />
      </group>
    </>
  );
};

// --- UI COMPONENTS ---

// Animated Mechanical Diagram for Hero Section
const MechanicalDiagram = () => {
  return (
    <div className="relative w-full h-64 md:h-80 border border-white/10 bg-zinc-900/30 backdrop-blur-sm rounded-lg p-6 flex flex-col">
       <div className="flex justify-between items-center border-b border-zinc-700/50 pb-2 mb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-500">
             <Settings size={12} className="animate-spin-slow"/>
             <span>ASSEMBLY_VIEW_1.0</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">SCALE: 1:1</span>
       </div>

       <div className="flex-1 relative overflow-hidden">
          {/* Decorative Grid Background */}
          <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '20px 20px' }}>
          </div>
          
          {/* Animated Piston/Crank Mechanism (SVG) */}
          <svg viewBox="0 0 200 150" className="w-full h-full">
             <defs>
                <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                   <line stroke="#334155" strokeWidth="1" y2="4"/>
                </pattern>
             </defs>
             
             {/* Base/Cylinder */}
             <rect x="70" y="20" width="60" height="100" fill="none" stroke="#475569" strokeWidth="2" />
             
             {/* Piston Head (Animating up/down) */}
             <motion.rect 
                x="75" y="40" width="50" height="30" rx="2"
                fill="url(#hatch)" stroke="#94a3b8" strokeWidth="2"
                animate={{ y: [0, 40, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
             />
             
             {/* Connecting Rod */}
             <motion.line 
                x1="100" y1="70" x2="100" y2="130"
                stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round"
                animate={{ 
                   y1: [0, 40, 0],
                   x2: [0, 20, 0, -20, 0], // Mocking rotary motion X offset
                   y2: [0, 0, 0, 0, 0] // Fixed crank center Y relative to motion
                }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
             />

             {/* Crank Wheel */}
             <circle cx="100" cy="130" r="15" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 2"/>
             <motion.circle 
                cx="100" cy="130" r="4" fill="#0ea5e9"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                style={{ originX: "100px", originY: "130px" }} // Rotate around center
             />
             
             {/* Dimension Lines */}
             <line x1="60" y1="20" x2="60" y2="120" stroke="#f59e0b" strokeWidth="1" markerEnd="url(#arrow)" />
             <text x="40" y="70" fill="#f59e0b" fontSize="8" fontFamily="monospace" transform="rotate(-90 40,70)">100mm STROKE</text>
          </svg>

          {/* Overlay Data */}
          <div className="absolute top-2 right-2 text-[10px] font-mono text-zinc-400 flex flex-col gap-1">
             <span className="flex justify-between w-20"><span>RPM:</span> <span className="text-white">1500</span></span>
             <span className="flex justify-between w-20"><span>LOAD:</span> <span className="text-white">45N</span></span>
             <span className="flex justify-between w-20"><span>TEMP:</span> <span className="text-emerald-400">NOM</span></span>
          </div>
       </div>

       <div className="mt-4 flex justify-between items-end">
          <div className="flex gap-2">
             <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-mono text-zinc-400">SIMULATION_RUNNING</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-600">FIG 1.4 - KINEMATICS</span>
       </div>
    </div>
  );
};

const Navbar = ({ activeSection, scrollToSection }) => {
  const navItems = [
    { id: 'hero', label: 'STATUS' },
    { id: 'profile', label: 'PROFILE' },
    { id: 'projects', label: 'PROJECTS' },
    { id: 'contact', label: 'CONTACT' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-white/10 h-16 flex items-center shadow-lg shadow-black/50">
      <div className="max-w-7xl w-full mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-3 text-white font-mono tracking-tighter cursor-pointer" onClick={() => scrollToSection('hero')}>
           <div className="w-8 h-8 bg-sky-500/20 border border-sky-500 rounded flex items-center justify-center relative overflow-hidden group">
              <Cog className="w-5 h-5 text-sky-500 animate-spin-slow group-hover:text-white transition-colors" />
           </div>
           <span className="font-bold text-lg tracking-widest">MECH<span className="text-sky-500">.OS</span></span>
        </div>

        <div className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`text-xs font-mono tracking-widest transition-all duration-300 py-1 border-b-2 ${
                activeSection === item.id ? 'text-sky-400 border-sky-400' : 'text-zinc-500 border-transparent hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button className="md:hidden text-zinc-400 hover:text-white">
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
      className="group relative bg-zinc-900/50 border border-white/5 rounded-lg overflow-hidden cursor-pointer hover:border-sky-500/50 transition-all duration-300 h-full flex flex-col"
    >
      <div className="h-8 bg-zinc-950 border-b border-white/5 flex items-center justify-between px-3">
        <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-2">
           <div className={`w-1.5 h-1.5 rounded-full bg-${project.color}-500 animate-pulse`}></div>
           {project.id.toUpperCase()}.OBJ
        </span>
        <div className="text-zinc-700 group-hover:text-sky-500 transition-colors"><Maximize size={12} /></div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4 p-3 bg-white/5 w-fit rounded-md text-sky-500 group-hover:text-white group-hover:bg-sky-600 transition-all shadow-inner">
           {project.icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">{project.title}</h3>
        <p className="text-zinc-400 text-sm line-clamp-3 mb-4 leading-relaxed flex-1">{project.description}</p>
        
        <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
           {project.tags.slice(0,3).map(tag => (
             <span key={tag} className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 border border-white/5 rounded bg-black/40">
               {tag}
             </span>
           ))}
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-sky-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}

const Lightbox = ({ src, onClose }) => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl"
    onClick={onClose}
  >
    <button className="absolute top-4 right-4 text-white/50 hover:text-white p-2"><X size={32} /></button>
    <img src={src} alt="Full view" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl shadow-sky-900/20" />
  </motion.div>
);

const ProjectModal = ({ project, onClose }) => {
  const [lightboxImg, setLightboxImg] = useState(null);

  if (!project) return null;
  
  return (
    <>
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm"
    >
      <div className="w-[95vw] max-w-[1800px] h-[92vh] bg-zinc-950 border border-white/10 rounded-xl overflow-hidden flex flex-col lg:flex-row shadow-2xl shadow-black relative">
         
         <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-20 p-2 bg-black/50 text-white/50 hover:text-white rounded-full border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 transition-all"
          >
            <X size={20}/>
         </button>

         {/* Left: 3D Viewport */}
         <div className="w-full lg:w-2/3 h-1/2 lg:h-full relative bg-zinc-900 border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 pointer-events-none">
               <span className="text-xs font-mono text-sky-500 tracking-widest">INTERACTIVE_VIEWPORT</span>
               <h2 className="text-2xl font-bold text-white">{project.title}</h2>
            </div>
            <Canvas shadows camera={{ position: [4, 4, 6], fov: 45 }}>
              <color attach="background" args={['#09090b']} />
              <Suspense fallback={
                 <Text position={[0,0,0]} fontSize={0.5} color="white">LOADING ASSETS...</Text>
              }>
                <ProjectScene project={project} />
              </Suspense>
            </Canvas>
            
            <div className="absolute bottom-6 left-6 flex items-center gap-4 text-[10px] font-mono text-zinc-500">
               <div className="flex items-center gap-1"><MousePointer2 size={10}/> DRAG TO ROTATE</div>
               <div className="flex items-center gap-1"><Maximize size={10}/> SCROLL TO ZOOM</div>
            </div>
         </div>

         {/* Right: Data Panel */}
         <div className="w-full lg:w-1/3 h-1/2 lg:h-full bg-zinc-950 p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent flex flex-col">
            
            <div className="mb-8">
               <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-${project.color}-500/10 text-${project.color}-500 border border-${project.color}-500/20`}>
                    Status: Complete
                  </span>
                  <span className="text-[10px] font-mono text-zinc-600">ID: {project.id.toUpperCase()}</span>
               </div>
               
               <p className="text-zinc-300 text-sm leading-7 border-l-2 border-zinc-800 pl-4">
                 {project.fullDescription || project.description}
               </p>
            </div>

            <div className="space-y-8 flex-1">
               <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Code size={14} className="text-sky-500" /> System Architecture
                  </h3>
                  <div className="flex flex-wrap gap-2">
                     {project.tags.map(tag => (
                        <span key={tag} className="px-3 py-1.5 text-xs font-mono text-sky-100 bg-sky-900/20 border border-sky-500/20 rounded-md">
                           {tag}
                        </span>
                     ))}
                  </div>
               </div>

               <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <LayersIcon size={14} className="text-sky-500" /> Render Gallery
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                     {[1,2,3,4].map(i => (
                       <div 
                          key={i} 
                          onClick={() => setLightboxImg(`https://placehold.co/1200x800/1a1a1a/FFF?text=Project+Image+${i}`)}
                          className="aspect-video bg-zinc-900 rounded border border-white/5 hover:border-sky-500/50 transition-all cursor-zoom-in flex items-center justify-center group relative overflow-hidden"
                       >
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                            <Maximize size={20} className="text-white" />
                         </div>
                         <span className="text-xs font-mono text-zinc-600 group-hover:opacity-0">FIG_0{i}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/5 mt-auto">
                <button className="flex items-center justify-center gap-2 py-3 bg-white text-black rounded font-bold text-sm hover:bg-sky-400 hover:text-white transition-all shadow-lg shadow-white/5">
                    <Download size={16} /> Specifications
                </button>
                <button className="flex items-center justify-center gap-2 py-3 bg-zinc-900 border border-white/10 text-white rounded font-bold text-sm hover:border-sky-500 hover:text-sky-400 transition-all">
                    <GitBranch size={16} /> Repository
                </button>
            </div>
         </div>
      </div>
    </motion.div>
    <AnimatePresence>
      {lightboxImg && <Lightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />}
    </AnimatePresence>
    </>
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
      
      <div className="fixed inset-0 z-0">
        <Canvas dpr={[1, 2]} gl={{ antialias: true }}>
          <Suspense fallback={null}>
            <MainScene />
          </Suspense>
        </Canvas>
        
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ 
               backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
               backgroundSize: '40px 40px'
             }}>
        </div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-zinc-950/80 via-transparent to-zinc-950/80"></div>
      </div>

      <Navbar activeSection={activeSection} scrollToSection={scrollToSection} />

      <main className="relative z-10 pt-20">
        
        {/* REDESIGNED HERO: TECHNICAL BLUEPRINT FOCUS */}
        <section id="hero" ref={el => sectionsRef.current.hero = el} className="min-h-screen flex flex-col justify-center px-6 lg:px-12">
           <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left: Typography */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.8 }}
              >
                 <div className="flex items-center gap-3 mb-6">
                    <span className="px-2 py-1 bg-sky-900/30 border border-sky-500/30 text-sky-400 text-[10px] font-mono tracking-widest rounded">
                       OPERATIONAL STATUS: ACTIVE
                    </span>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-sky-500/50 to-transparent"></div>
                 </div>
                 
                 <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight leading-none mb-6">
                    ADVANCED <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-slate-200">MECHANICAL</span> <br />
                    SYSTEMS.
                 </h1>
                 
                 <div className="flex gap-8 border-l-2 border-zinc-800 pl-6 mb-10">
                    <div>
                       <div className="text-2xl font-bold text-white">CAD</div>
                       <div className="text-xs text-zinc-500 font-mono">DESIGN</div>
                    </div>
                    <div>
                       <div className="text-2xl font-bold text-white">FEA</div>
                       <div className="text-xs text-zinc-500 font-mono">ANALYSIS</div>
                    </div>
                    <div>
                       <div className="text-2xl font-bold text-white">CAM</div>
                       <div className="text-xs text-zinc-500 font-mono">MFG</div>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button 
                      onClick={() => scrollToSection('projects')}
                      className="px-8 py-4 bg-white text-black font-bold text-sm rounded hover:bg-sky-400 hover:text-white transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                       <BoxSelect size={16} /> VIEW PORTFOLIO
                    </button>
                    <button 
                      onClick={() => scrollToSection('contact')}
                      className="px-8 py-4 bg-transparent text-zinc-300 border border-zinc-700 font-bold text-sm rounded hover:border-sky-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                       CONTACT
                    </button>
                 </div>
              </motion.div>

              {/* Right: Live Mechanical Diagram */}
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 0.3, duration: 0.8 }}
                 className="hidden lg:block"
              >
                 <MechanicalDiagram />
                 
                 {/* Schematic Annotations */}
                 <div className="mt-4 flex justify-between text-[10px] font-mono text-zinc-600">
                    <div className="flex gap-4">
                       <span>REF: ISO-9001</span>
                       <span>TOL: ±0.01mm</span>
                    </div>
                    <span>DRAWING NO. 44-2B</span>
                 </div>
              </motion.div>

           </div>
           
           <motion.div 
              animate={{ y: [0, 10, 0] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600"
           >
              <span className="text-[10px] font-mono tracking-widest">SCROLL_DOWN</span>
              <MousePointer2 size={16} />
           </motion.div>
        </section>

        {/* ... (Rest of sections: Profile, Projects, Contact remain unchanged) ... */}
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

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </AnimatePresence>

    </div>
  );
}