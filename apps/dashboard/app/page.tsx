"use client";

import { motion } from "framer-motion";
import { Shield, Check, X, ArrowRight, Zap, Lock, Box, Terminal, CircleCheck, Search, Database } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* ----------------------------------------------------------------------
          NAVBAR (Inspired by Screenshot 1)
      ---------------------------------------------------------------------- */}
      <nav className="fixed top-0 w-full flex items-center justify-between px-6 py-4 bg-[#050505]/80 backdrop-blur-md z-50 border-b border-white/5">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight uppercase">Agent Governance</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="#platform" className="hover:text-white transition-colors">Platform</Link>
            <Link href="#solutions" className="hover:text-white transition-colors">Solutions</Link>
            <Link href="#resources" className="hover:text-white transition-colors">Resources</Link>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors hidden md:block">Sign in</Link>
          <Link href="/dashboard" className="px-5 py-2.5 bg-white text-black rounded-md hover:bg-gray-200 transition-colors">
            Get a demo
          </Link>
        </div>
      </nav>

      {/* ----------------------------------------------------------------------
          HERO SECTION (Inspired by Screenshot 1)
      ---------------------------------------------------------------------- */}
      <section className="relative pt-40 pb-20 px-6 max-w-[1400px] mx-auto min-h-[90vh] flex flex-col justify-center">
        {/* Glowy Border Frame */}
        <div className="absolute inset-0 top-32 bottom-12 left-6 right-6 border border-white/10 rounded-sm pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10 h-full">
          {/* Left: Copy */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center"
          >
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] mb-6">
              Secure Runtime <br/>Access for Autonomous<br/>AI Environments
            </h1>
            <p className="text-lg text-gray-400 max-w-lg mb-10 leading-relaxed font-light">
              Connect to Agent systems fast—cut execution downtime, enforce Zero Trust via the Model Context Protocol, and simplify operations.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="px-6 py-3.5 bg-white text-black rounded-md font-medium hover:bg-gray-200 transition-colors">
                Get a demo
              </Link>
              <Link href="https://github.com" className="px-6 py-3.5 bg-[#222] text-white rounded-md font-medium hover:bg-[#333] border border-white/5 transition-colors">
                Talk to an expert
              </Link>
            </div>
          </motion.div>
          
          {/* Right: 3D Stacked Graphic (Inspired by new Screenshot) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative flex items-center justify-center perspective-[2000px] preserve-3d h-[500px]"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
            
            {/* Stacked Frame 1 (Back/Dark) */}
            <motion.div 
              initial={{ rotateY: -20, rotateX: 10, z: -100 }}
              animate={{ rotateY: -15, rotateX: 5, z: -50 }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              className="absolute w-64 h-96 border border-white/5 bg-[#050505] rounded shadow-2xl opacity-50 flex items-start p-4"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-500 font-mono">
                Operator API V1 &gt;
              </div>
            </motion.div>

            {/* Stacked Frame 2 (Middle/Main Image) */}
            <motion.div 
              initial={{ rotateY: -20, rotateX: 10, z: 0 }}
              animate={{ rotateY: -15, rotateX: 5, z: 20 }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              className="absolute w-72 h-[420px] border border-white/20 bg-black rounded shadow-[0_0_50px_rgba(59,130,246,0.2)] overflow-hidden flex flex-col"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Corner markers */}
              <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-white" />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white" />
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white" />
              <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-white" />
              
              <div className="absolute top-6 left-6 px-3 py-1 bg-black/60 backdrop-blur-sm border border-white/20 rounded text-xs text-white font-medium z-10 flex items-center gap-2">
                Agent Node <ArrowRight className="w-3 h-3" />
              </div>
              <img src="https://images.unsplash.com/photo-1620825937374-87fc7d628284?q=80&w=1000" className="w-full h-full object-cover mix-blend-lighten opacity-80" alt="Tech" />
            </motion.div>

            {/* Stacked Frame 3 (Front/Overlay) */}
            <motion.div 
              initial={{ rotateY: -20, rotateX: 10, z: 100 }}
              animate={{ rotateY: -15, rotateX: 5, z: 150 }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              className="absolute w-80 h-[460px] border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded shadow-[0_0_40px_rgba(59,130,246,0.1)] backdrop-blur-[2px] pointer-events-none"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Corner markers */}
              <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-blue-400" />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-400" />
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-blue-400" />
              <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-blue-400" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ----------------------------------------------------------------------
          CHALLENGES GRID (Inspired by Screenshot 2)
      ---------------------------------------------------------------------- */}
      <section className="border-t border-white/10 bg-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto px-6 py-32 relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 mb-16">
            <div className="lg:col-span-8">
              <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">Overcome Agent Security Challenges</h2>
            </div>
            <div className="lg:col-span-4 flex items-end">
              <p className="text-gray-400 text-sm leading-relaxed pb-2">
                In autonomous environments, every second matters. From delayed vendor access to administrative overhead, legacy solutions slow response times and increase risk.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border border-white/10 rounded-sm overflow-hidden relative group">
            {/* Col 1 */}
            <div className="p-10 border-r border-white/10 bg-[#050505]">
              <h3 className="font-semibold text-lg mb-8">Common Agent Security Challenges</h3>
              <ul className="space-y-6">
                {[
                  "Unpredictable payload mutations",
                  "Incompatibility with legacy enterprise systems",
                  "Burdensome audits and compliance reporting",
                  "Difficult-to-scale third-party tool workflows",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-gray-400 text-sm">
                    <X className="w-4 h-4 mt-0.5 text-gray-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Col 2 */}
            <div className="p-10 border-r border-white/10 bg-[#050505]">
              <h3 className="font-semibold text-lg mb-8">How We Solve It</h3>
              <ul className="space-y-6">
                {[
                  "Sub-30ms policy evaluation—faster response times",
                  "Support for MCP and 65,000+ protocol schemas",
                  "Built-in alignment with NIST 800-53, SOC2, and GDPR",
                  "Frictionless tool whitelisting and scaleable supply chains",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-white text-sm font-medium">
                    <Check className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Col 3 Image */}
            <div className="relative h-64 md:h-auto bg-[#111] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000" 
                alt="Cybersecurity" 
                className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale mix-blend-luminosity group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>

          {/* Quote block */}
          <div className="mt-24 text-center border-t border-b border-white/5 py-16 px-4">
            <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto leading-relaxed mb-4">
              "71 percent of organizations still rely on unmonitored jump boxes for Autonomous Agent remote access."
            </p>
            <p className="text-sm text-gray-500 font-mono">SANS 2026 State of Agent Cybersecurity</p>
          </div>

        </div>
      </section>

      {/* ----------------------------------------------------------------------
          LEGACY VS ZERO TRUST (Inspired by Screenshot 3)
      ---------------------------------------------------------------------- */}
      <section className="bg-[#050505] border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 py-32">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 border border-white/10 rounded-sm">
            <div className="p-12 border-b lg:border-b-0 lg:border-r border-white/10">
              <h2 className="text-4xl font-medium tracking-tight leading-tight mb-6">
                Why Legacy Security Tools Fail in Agent Environments
              </h2>
              <p className="text-gray-400 leading-relaxed text-sm">
                Many industrial organizations still depend on IT-centric tools like API Gateways, Firewalls, and WAFs for agent access—but these tools weren't built for today's dynamic LLMs. In autonomous environments, they increase risk, add complexity, and delay critical actions.
              </p>
            </div>
            <div className="p-0 flex flex-col">
              <div className="flex border-b border-white/10">
                <button className="flex-1 py-4 text-sm font-medium border-b-2 border-white text-white">API Gateways</button>
                <button className="flex-1 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-300">Firewalls</button>
                <button className="flex-1 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-300">WAFs</button>
              </div>
              <div className="p-12 flex-1">
                <div className="flex items-center gap-2 mb-4 text-white font-medium">
                  <Database className="w-4 h-4" /> Static Gateways
                </div>
                <p className="text-gray-400 text-sm mb-8">Not built for dynamic generative payloads.</p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-sm text-gray-300"><X className="w-3 h-3 text-gray-500"/> Incompatible with semantic intents</li>
                  <li className="flex items-center gap-3 text-sm text-gray-300"><X className="w-3 h-3 text-gray-500"/> High latency disrupts real-time loops</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 p-10 border border-white/10 rounded-sm flex flex-col md:flex-row items-center gap-8 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050505] to-[#050505]">
            <div className="w-20 h-20 rounded-full border border-blue-500/30 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">We replace legacy tools with a unified platform purpose-built for Agents.</h3>
              <p className="text-sm text-gray-400">Minimizing risk, reducing overhead and complexity, delivering Zero Trust at scale.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 mt-32 mb-16 gap-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">Modernizing Secure Access for Agents with Zero Trust</h2>
            </div>
            <div className="flex items-end pb-2">
               <p className="text-sm text-gray-400 leading-relaxed">
                 Runtime Policy Enforcement is the industry-standard solution for connecting LLMs to external systems—but traditional tools were not designed for generative security challenges. Modernizing with Zero Trust gives you stronger protection, faster response, and full operational control.
               </p>
            </div>
          </div>

          {/* Accordion & Graphic */}
          <div className="grid grid-cols-1 lg:grid-cols-2 border border-white/10 rounded-sm overflow-hidden min-h-[500px]">
            {/* Left side Accordion */}
            <div className="flex flex-col border-r border-white/10 bg-[#050505]">
              <div 
                className={`p-8 border-b border-white/10 cursor-pointer transition-colors ${activeTab === 1 ? 'bg-white/5' : 'hover:bg-white/5'}`}
                onClick={() => setActiveTab(1)}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-4 items-center">
                    <span className="font-mono text-xs text-purple-400">01</span>
                    <span className="font-medium text-white">Runtime Policy Engine</span>
                  </div>
                </div>
                {activeTab === 1 && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-400 leading-relaxed pl-8">
                    Connect internal and external agents to sensitive data securely. We deliver purpose-built RBAC for autonomous workflows—with tailored evaluation methods and scalable deployment.
                  </motion.p>
                )}
              </div>
              <div 
                className={`p-8 border-b border-white/10 cursor-pointer transition-colors ${activeTab === 2 ? 'bg-white/5' : 'hover:bg-white/5'}`}
                onClick={() => setActiveTab(2)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <span className="font-mono text-xs text-purple-400">02</span>
                    <span className="font-medium text-white">Threat Intelligence</span>
                  </div>
                  <span className="text-gray-600">+</span>
                </div>
              </div>
              <div 
                className={`p-8 cursor-pointer transition-colors ${activeTab === 3 ? 'bg-white/5' : 'hover:bg-white/5'}`}
                onClick={() => setActiveTab(3)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <span className="font-mono text-xs text-purple-400">03</span>
                    <span className="font-medium text-white">MCP Trust Registry</span>
                  </div>
                  <span className="text-gray-600">+</span>
                </div>
              </div>
            </div>

            {/* Right side Diagram Graphic */}
            <div className="relative bg-[#020202] p-12 flex items-center justify-center overflow-hidden">
               {/* Animated Diagram */}
               <div className="relative z-10 flex items-center gap-8 w-full max-w-md">
                 
                 {/* User Node */}
                 <div className="relative shrink-0 flex items-center justify-center">
                   <div className="w-16 h-16 rounded-full border border-purple-500/50 flex items-center justify-center bg-[#111] shadow-[0_0_20px_rgba(168,85,247,0.3)] z-10 relative">
                     <CircleCheck className="w-6 h-6 text-purple-400" />
                   </div>
                   {/* Ripple */}
                   <div className="absolute inset-0 border border-purple-500/30 rounded-full animate-ping" style={{ animationDuration: '3s'}} />
                 </div>

                 {/* Connection Line */}
                 <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-blue-500/50 relative">
                   <motion.div 
                     className="absolute top-[-2px] left-0 w-4 h-[5px] bg-white rounded-full shadow-[0_0_10px_#fff]"
                     animate={{ x: [0, 100, 200] }}
                     transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                   />
                 </div>

                 {/* Middle Box (Firewall) */}
                 <div className="shrink-0 w-32 h-24 border border-blue-500/30 bg-[#0A0A0A] rounded flex flex-col items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.1)] relative z-10">
                   <Shield className="w-6 h-6 text-blue-400 mb-2" />
                   <span className="text-[10px] font-mono text-gray-300">Policy Engine</span>
                 </div>

                 {/* Connection Line 2 */}
                 <div className="w-12 h-px bg-blue-500/50" />

                 {/* Final Node Stack */}
                 <div className="flex flex-col gap-4">
                   {["Database", "Internal API", "File System"].map((name, i) => (
                     <div key={i} className="w-32 h-12 border border-white/10 bg-[#111] rounded flex flex-col justify-center px-3">
                       <span className="text-[9px] text-gray-500 uppercase tracking-widest">Access</span>
                       <span className="text-xs text-white truncate">{name}</span>
                     </div>
                   ))}
                 </div>
               </div>

               {/* Background Glows */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 blur-[100px] pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------------
          METRICS & FOOTER (Inspired by Screenshot 4)
      ---------------------------------------------------------------------- */}
      <section className="border-t border-white/10 bg-[#0A0A0A]">
         <div className="max-w-[1400px] mx-auto px-6 py-32">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
              <h2 className="text-4xl font-medium tracking-tight">Real-World Results from<br/>Leading Technology Startups</h2>
              <button className="px-6 py-3 bg-[#111] hover:bg-[#222] border border-white/10 text-white rounded text-sm transition-colors">
                Calculate your savings
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 border border-white/10 rounded-sm mb-16">
               {[
                 { title: "$45K+ Saved", subtitle: "Per Incident Quarantined", icon: Lock, color: "text-purple-500" },
                 { title: "30-ms", subtitle: "Policy Evaluation Latency", icon: Zap, color: "text-blue-500" },
                 { title: "0-Day", subtitle: "Full Monorepo Rollout", icon: Box, color: "text-emerald-500" },
               ].map((metric, i) => (
                 <div key={i} className="p-12 border-b md:border-b-0 md:border-r border-white/10 last:border-r-0 bg-[#050505] flex flex-col justify-between min-h-[300px]">
                   <metric.icon className={`w-16 h-16 ${metric.color} mb-12`} />
                   <div>
                     <h3 className="text-2xl font-semibold text-white mb-2">{metric.title}</h3>
                     <p className="text-sm text-gray-500 font-medium">{metric.subtitle}</p>
                   </div>
                 </div>
               ))}
            </div>

            <div className="border border-white/10 rounded-sm p-10 flex flex-col lg:flex-row gap-12 bg-[#050505]">
              <div className="w-full lg:w-1/2 h-64 md:h-80 rounded overflow-hidden">
                <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000" alt="Server Room" className="w-full h-full object-cover grayscale opacity-60" />
              </div>
              <div className="w-full lg:w-1/2 flex flex-col justify-center">
                <p className="text-xl md:text-2xl font-light leading-relaxed mb-6 text-white">
                  With our Secure Runtime Access, engineers no longer have to blindly trust agent outputs. Teams can now respond, monitor, and approve actions remotely in minutes.
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Enterprise-grade governance for YC startups and fortune 500 fleets.
                </p>
              </div>
            </div>

         </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#020202] py-20 px-6">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-white">Agent Governance</span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs mb-6">
              Building the firewall for the autonomous era. Secure your AI infrastructure today.
            </p>
            <div className="text-xs text-gray-600">
              © 2026 Agent Governance. All rights reserved.
            </div>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white">Platform</Link></li>
              <li><Link href="#" className="hover:text-white">Zero Trust</Link></li>
              <li><Link href="#" className="hover:text-white">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white">Documentation</Link></li>
              <li><Link href="#" className="hover:text-white">Blog</Link></li>
              <li><Link href="#" className="hover:text-white">Case Studies</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white">About</Link></li>
              <li><Link href="#" className="hover:text-white">Careers</Link></li>
              <li><Link href="#" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
