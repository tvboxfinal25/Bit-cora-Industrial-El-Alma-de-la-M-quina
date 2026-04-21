/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  PenTool, 
  Sparkles, 
  Layers, 
  Settings, 
  BookOpen, 
  Brain, 
  Feather, 
  ShieldCheck, 
  FileDown, 
  Quote, 
  CheckCircle2, 
  Heart,
  HelpCircle,
  User,
  MessageSquare,
  Book,
  Shield,
  ClipboardList,
  RotateCcw,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Toaster, toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- DATA ---
const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=engineer',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=mechanic',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=technician',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=expert',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=creative',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=pro'
];

const MAZO_A = [
  { nombre: "Cigüeñal", descripcion: "Eje que permite la transformación del movimiento rectilíneo en circular o viceversa." },
  { nombre: "Pistón", descripcion: "Elemento que recibe la presión de expansión de los gases en motores de combustión." },
  { nombre: "Torno Paralelo", descripcion: "Máquina herramienta que permite mecanizar piezas de forma geométrica de revolución." },
  { nombre: "Engranaje Helicoidal", descripcion: "Pieza dentada que transmite potencia mediante contacto oblicuo." },
  { nombre: "Calibrador Pie de Rey", descripcion: "Instrumento para medir dimensiones con alta precisión." },
  { nombre: "Soldadura MIG", descripcion: "Proceso de soldadura por arco bajo gas protector." },
  { nombre: "Mandril", descripcion: "Dispositivo para sujetar piezas o herramientas en máquinas rotativas." },
  { nombre: "Biela", descripcion: "Elemento mecánico que une el pistón con el cigüeñal." },
  { nombre: "Lubricación Forzada", descripcion: "Sistema que asegura el flujo constante de aceite bajo presión." },
  { nombre: "Resistencia de Materiales", descripcion: "Estudio de la capacidad de los sólidos para resistir esfuerzos sin deformarse." }
];

const MAZO_B = [
  { nombre: "La Sangre", descripcion: "Simboliza el sacrificio, la vida entregada y el vínculo vital del trabajador con su obra." },
  { nombre: "El Abismo", descripcion: "Representa el miedo a lo desconocido y el vacío existencial frente a la industrialización." },
  { nombre: "El Martillo", descripcion: "Símbolo de la fuerza creativa pero también del poder destructor del hombre." },
  { nombre: "La Cadena", descripcion: "Sugiere la esclavitud moderna, la repetición y el cautiverio del espíritu." },
  { nombre: "El Fuego", descripcion: "Símbolo de transformación radical, pasión y peligro purificador." },
  { nombre: "La Rueda", descripcion: "Representa el ciclo eterno, el destino y el avance imparable de la historia." },
  { nombre: "El Espejo", descripcion: "Refleja la verdad oculta y la identidad fragmentada del ser social." },
  { nombre: "La Piedra", descripcion: "Inmutabilidad, solidez y el peso de las responsabilidades éticas." },
  { nombre: "El Laberinto", descripcion: "Dificultad de encontrar salidas éticas en un sistema complejo." },
  { nombre: "La Balanza", descripcion: "Justicia, equilibrio y la medida de nuestras decisiones." }
];

const RANKS = [
  { level: 1, name: "Aprendiz", minXP: 0, maxXP: 150 },
  { level: 2, name: "Operador", minXP: 151, maxXP: 400 },
  { level: 3, name: "Maestro", minXP: 401, maxXP: 800 },
  { level: 4, name: "Gran Maestro", minXP: 801, maxXP: 1500 },
  { level: 5, name: "Leyenda Técnica", minXP: 1501, maxXP: 9999 }
];

const INSIGNIAS = {
  CRITICO: { id: "CRITICO", name: "Pensador Crítico", icon: Brain, color: "bg-amber-500" },
  NARRADOR: { id: "NARRADOR", name: "Narrador Técnico", icon: Feather, color: "bg-emerald-500" },
  ETICO: { id: "ETICO", name: "Conciencia Ética", icon: ShieldCheck, color: "bg-indigo-500" },
  TRIVIAL: { id: "TRIVIAL", name: "Erudito Industrial", icon: HelpCircle, color: "bg-orange-500" }
};

const ACTIVITIES = [
  { id: 'writing', name: '1. Bitácora Crítica', icon: PenTool, color: 'text-cyan-400', desc: 'Análisis literario' },
  { id: 'quiz', name: '2. Trivia Histórica', icon: HelpCircle, color: 'text-orange-400', desc: 'Desafío de Lillo' },
  { id: 'empathy', name: '3. Mapa Empatía', icon: User, color: 'text-purple-400', desc: 'Sentir del obrero' },
  { id: 'debate', name: '4. Sala Debate', icon: MessageSquare, color: 'text-blue-400', desc: 'Dilemas éticos' },
  { id: 'glossary', name: '5. Glosario Forja', icon: Book, color: 'text-emerald-400', desc: 'Simbología técnica' },
  { id: 'checklist', name: '6. Protocolo Ético', icon: ClipboardList, color: 'text-red-400', desc: 'Seguridad humana' }
];

const QUIZ_QUESTIONS = [
  { 
    q: "¿En qué mineral se enfocaba la mina de Lota en el siglo XIX?", 
    options: ["Salitre", "Carbón", "Cobre"], 
    correct: 1,
    feedback: "La mina de Lota (escenario de 'Subterra') extraía carbón, combustible central para la industrialización sin compasión."
  },
  { 
    q: "¿Qué representa la 'máquina' en el contexto de Baldomero Lillo?", 
    options: ["Un aliado del hombre", "Un mecanismo que devora la humanidad", "Una herramienta de liberación"], 
    correct: 1,
    feedback: "Para Lillo, la máquina industrial no es emancipadora; representa un sistema implacable que consume la vida del obrero."
  },
  { 
    q: "Según Chevalier, ¿qué simboliza 'el engranaje'?", 
    options: ["La perfección divina", "La fatalidad y la pérdida de voluntad", "El progreso infinito"], 
    correct: 1,
    feedback: "El engranaje arrastra a quien lo toca, simbolizando un estado de fatalidad donde el trabajador pierde su voluntad."
  },
  { 
    q: "¿Cómo termina el protagonista en el relato 'El alma de la máquina'?", 
    options: ["Huyendo de la mina", "Vencido por la fatiga y el hambre", "Muriendo en un accidente"], 
    correct: 2,
    feedback: "En el relato de Lillo, la alienación y el desgaste físico llevan al colapso final del trabajador entre la maquinaria."
  },
  { 
    q: "¿Qué simboliza 'La Sangre' en la perspectiva crítica de la obra?", 
    options: ["Violencia innecesaria", "El vínculo vital y sacrificio del obrero", "Un desperdicio técnico"], 
    correct: 1,
    feedback: "La sangre simboliza el sacrificio humano extremo: la energía vital robada para alimentar a la máquina inerte."
  }
];

interface UserData {
  nombre: string;
  avatar: string;
  puntos: number;
  nivel: number;
  badges: string[];
  usedConcepts?: string[];
}

interface EvaluationResult {
  score: string;
  feedbackConcepts: string;
  feedbackEthics: string;
  points: number;
}

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [regName, setRegName] = useState('');
  const [tempAvatar, setTempAvatar] = useState(AVATARS[0]);
  
  const [activeTab, setActiveTab] = useState('writing');
  const [empathyMap, setEmpathyMap] = useState({ siente: '', piensa: '', dice: '', hace: '' });
  const [isEmpathyDone, setIsEmpathyDone] = useState(false);
  const [isDebateDone, setIsDebateDone] = useState(false);
  const [isGlossaryDone, setIsGlossaryDone] = useState(false);
  const [answeredQuiz, setAnsweredQuiz] = useState<number[]>([]);
  const [checklist, setChecklist] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('forja_checklist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  useEffect(() => {
    localStorage.setItem('forja_checklist', JSON.stringify(checklist));
  }, [checklist]);
  
  const [cards, setCards] = useState<{ a: typeof MAZO_A[0] | null, b: typeof MAZO_B[0] | null }>({ a: null, b: null });
  const [essay, setEssay] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const evaluationRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // FORCE RESET for version migration
    const VERSION = '4.0';
    const savedVersion = localStorage.getItem('bitacora_version');
    
    if (savedVersion !== VERSION) {
      localStorage.clear();
      localStorage.setItem('bitacora_version', VERSION);
      window.location.reload();
      return;
    }

    const saved = localStorage.getItem('bitacora_user_v4');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.usedConcepts) parsed.usedConcepts = [];
      setUser(parsed);
    }
  }, []);

  const saveToLocal = (data: UserData) => {
    if (!data.usedConcepts) data.usedConcepts = [];
    localStorage.setItem('bitacora_user_v4', JSON.stringify(data));
    setUser(data);
  };

  const handleRegister = () => {
    if (!regName.trim()) return;
    const newUser: UserData = {
      nombre: regName.trim(),
      avatar: tempAvatar,
      puntos: 0,
      nivel: 1,
      badges: [],
      usedConcepts: []
    };
    saveToLocal(newUser);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  };

  const drawCards = () => {
    const a = MAZO_A[Math.floor(Math.random() * MAZO_A.length)];
    const b = MAZO_B[Math.floor(Math.random() * MAZO_B.length)];
    setCards({ a, b });
    setEvaluation(null);
  };

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const canEval = wordCount >= 60 && cards.a && cards.b;

  const addXP = (amount: number, badgeKey?: string) => {
    if (!user) return;
    const newPuntos = user.puntos + amount;
    const newRank = [...RANKS].reverse().find(r => newPuntos >= r.minXP) || RANKS[0];
    const newBadges = [...user.badges];
    
    if (badgeKey && !newBadges.includes(badgeKey)) {
      newBadges.push(badgeKey);
    }

    saveToLocal({
      ...user,
      puntos: newPuntos,
      nivel: newRank.level,
      badges: newBadges
    });
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.8 } });
  };

  const evaluate = () => {
    if (wordCount < 60) {
      toast.error("Tu análisis debe tener al menos 60 palabras.");
      return;
    }
    if (!cards.a || !cards.b) {
      toast.warning("Primero debes extraer tus Conceptos de Taller en el panel izquierdo.");
      return;
    }
    
    setIsEvaluating(true);
    setEvaluation(null);

    setTimeout(() => {
      let pts = 50;
      const mechName = cards.a!.nombre.toLowerCase();
      const symbName = cards.b!.nombre.toLowerCase();
      const essayLower = essay.toLowerCase();

      const hasMechanic = essayLower.includes(mechName);
      const hasSymbol = essayLower.includes(symbName);
      const hasEthics = /bienestar|responsabilidad|humano|ético|ética|sociedad/.test(essayLower);

      if (hasMechanic) pts += 30;
      if (hasSymbol) pts += 30;
      if (hasEthics) pts += 40;
      if (wordCount > 100) pts += 20;

      let feedbackConceptsTxt = "Excelente uso de los conceptos robados. Has tejido una red coherente entre lo técnico y lo simbólico.";
      if (!hasMechanic && !hasSymbol) {
        feedbackConceptsTxt = `Tu análisis debe integrar explícitamente los conceptos de '${cards.a!.nombre}' y '${cards.b!.nombre}'. ¡Intenta conectarlos para forjar el vínculo!`;
      } else if (!hasMechanic) {
        feedbackConceptsTxt = `Integraste bien lo simbólico, pero no incorporaste el concepto técnico de '${cards.a!.nombre}' en tu reflexión.`;
      } else if (!hasSymbol) {
        feedbackConceptsTxt = `Bien por el lado técnico, pero te faltó incorporar el símbolo literario de '${cards.b!.nombre}' en tu reflexión.`;
      }

      const evalData = {
        score: pts > 140 ? 'A+' : (pts > 90 ? 'B' : 'C'),
        feedbackConcepts: feedbackConceptsTxt,
        feedbackEthics: hasEthics
          ? "Felicidades. Tu texto demuestra que comprendes que la técnica existe solo al servicio de la vida."
          : "Lograste lo técnico, pero te faltó profundizar en la dimensión humana y ética solicitada.",
        points: pts
      };

      setEvaluation(evalData);

      if (user) {
        const newPuntos = user.puntos + pts;
        const newRank = [...RANKS].reverse().find(r => newPuntos >= r.minXP) || RANKS[0];
        const newBadges = [...user.badges];
        const newUsedConcepts = [...(user.usedConcepts || [])];
        
        if (pts > 140 && !newBadges.includes("CRITICO")) newBadges.push("CRITICO");
        if (wordCount > 120 && !newBadges.includes("NARRADOR")) newBadges.push("NARRADOR");
        if (hasEthics && pts > 120 && !newBadges.includes("ETICO")) newBadges.push("ETICO");
        
        if (hasMechanic && !newUsedConcepts.includes(cards.a!.nombre)) newUsedConcepts.push(cards.a!.nombre);
        if (hasSymbol && !newUsedConcepts.includes(cards.b!.nombre)) newUsedConcepts.push(cards.b!.nombre);

        saveToLocal({
          ...user,
          puntos: newPuntos,
          nivel: newRank.level,
          badges: newBadges,
          usedConcepts: newUsedConcepts
        });
      }

      setIsEvaluating(false);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      toast.success("¡Bitácora evaluada con éxito!");
      
      // Auto-scroll to result
      setTimeout(() => {
        evaluationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 1500);
  };

  const exportPDF = async () => {
    if (!pdfRef.current || !user) return;
    
    // 3) Verificar carga de dependencias
    console.log("Verificando librerías...");
    console.log("jsPDF typeof:", typeof jsPDF);
    console.log("html2canvas typeof:", typeof html2canvas);
    
    // 1) Mensaje visible en pantalla antes de descargar
    const toastId = toast.loading("Procesando imagen y generando PDF...", { duration: 10000 });
    setIsEvaluating(true);
    
    try {
      const element = pdfRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
        scrollY: -window.scrollY
      });
      
      console.log("Canvas generado exitosamente.");
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = `Bitacora_Industrial_${user.nombre.replace(/\s+/g, '_')}.pdf`;
      
      // 2) Enlace con atributo download y target=_blank para bypassear iframe block
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.target = '_blank'; // Intenta abrir en nueva pestaña si la descarga falla por sandbox
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      
      toast.dismiss(toastId);
      toast.success("¡PDF generado! Revisa tus descargas.", { duration: 5000 });
    } catch (err) {
      console.error("PDF Export Error detallado:", err);
      toast.dismiss(toastId);
      toast.error(`Error al generar el archivo: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="clay-card w-full max-w-lg p-8 space-y-6 text-center"
        >
          <h2 className="text-3xl font-bold text-slate-800">¡Bienvenido al Taller!</h2>
          <p className="text-slate-600">Para comenzar tu bitácora, ingresa tus datos:</p>
          <input 
            type="text" 
            value={regName}
            onChange={(e) => setRegName(e.target.value)}
            placeholder="Tu nombre artístico o técnico" 
            className="w-full clay-input text-lg"
          />
          <div className="space-y-4">
            <p className="font-semibold text-slate-700">Selecciona tu Avatar:</p>
            <div className="grid grid-cols-3 gap-4">
              {AVATARS.map((url) => (
                <img 
                  key={url}
                  src={url} 
                  onClick={() => setTempAvatar(url)}
                  className={`cursor-pointer w-16 h-16 mx-auto rounded-full bg-slate-100 p-1 transition-all ${tempAvatar === url ? 'ring-4 ring-blue-500 scale-110' : 'opacity-70 hover:opacity-100'}`}
                  alt="avatar option"
                />
              ))}
            </div>
          </div>
          <button onClick={handleRegister} className="w-full clay-button bg-blue-600 text-white text-xl">
            Iniciar Experiencia
          </button>
        </motion.div>
      </div>
    );
  }

  const currentRank = [...RANKS].reverse().find(r => user.puntos >= r.minXP) || RANKS[0];
  const nextRank = RANKS[RANKS.indexOf(currentRank) + 1] || { minXP: user.puntos + 1000 };
  const xpProgress = ((user.puntos - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 pt-20 px-4">
      <Toaster richColors position="bottom-right" />
      
      <AnimatePresence>
        {showRestartModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-red-500/30 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
              <div className="flex flex-col items-center text-center gap-4">
                <div className="bg-red-500/20 p-4 rounded-full text-red-500">
                  <RotateCcw size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">¿Reiniciar Programa?</h3>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                    Estás a punto de borrar todos tus registros locales. Perderás tu rango, insignias y progreso en los módulos. <strong className="text-red-400">Esta acción no se puede deshacer.</strong>
                  </p>
                </div>
                <div className="flex gap-3 w-full mt-4">
                  <button 
                    onClick={() => setShowRestartModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-[10px] text-white bg-slate-800 hover:bg-slate-700 transition"
                  >
                    Mantener Progreso
                  </button>
                  <button 
                    onClick={() => { localStorage.clear(); window.location.reload(); }}
                    className="flex-1 py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-[10px] text-white bg-red-600 hover:bg-red-500 shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] transition transform hover:-translate-y-0.5"
                  >
                    Confirmar Borrado
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSummaryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-cyan-500/30 w-full max-w-md rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500" />
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <User size={24} className="text-cyan-400" /> Resumen de Progreso
                  </h3>
                  <button onClick={() => setShowSummaryModal(false)} className="text-slate-400 hover:text-white transition">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <img src={user.avatar} className="w-16 h-16 rounded-full border-2 border-cyan-500/50" />
                    <div>
                      <h4 className="font-bold text-lg text-white">{user.nombre}</h4>
                      <p className="text-cyan-400 text-xs font-black uppercase tracking-widest">{currentRank.name} - NIVEL {user.nivel}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/50 p-3 flex flex-col justify-center items-center rounded-xl border border-white/5">
                      <span className="text-2xl font-black text-white">{user.puntos}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Experiencia (XP)</span>
                    </div>
                    <div className="bg-slate-800/50 p-3 flex flex-col justify-center items-center rounded-xl border border-white/5">
                      <span className="text-2xl font-black text-green-400">
                        {[
                          (user.usedConcepts || []).length > 0, 
                          answeredQuiz.length === QUIZ_QUESTIONS.length,
                          checklist.length === 5,
                          isGlossaryDone
                        ].filter(Boolean).length} / 4
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Módulos Completos</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Insignias Adquiridas</h5>
                    {user.badges.length > 0 ? (
                      <div className="flex gap-2 flex-wrap">
                        {user.badges.map(key => {
                          const b = INSIGNIAS[key as keyof typeof INSIGNIAS];
                          if (!b) return null;
                          const Icon = b.icon;
                          return (
                            <div key={key} className={`px-2 py-1.5 rounded-lg flex items-center gap-2 ${b.color} shadow-lg`} title={b.name}>
                              <Icon size={12} className="text-white" />
                              <span className="text-[9px] font-bold text-white uppercase">{b.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No tienes insignias todavía. Completa módulos para ganar reconocimientos.</p>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => setShowSummaryModal(false)}
                  className="w-full mt-2 py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-[10px] text-white bg-cyan-600 hover:bg-cyan-500 transition"
                >
                  Cerrar Resumen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dashboard */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-16 flex items-center justify-between px-8 bg-black/60 border-b border-cyan-500/30 glass rounded-none fixed top-0 w-full z-50 backdrop-blur-2xl"
      >
        {/* Branding Area */}
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500 p-1.5 rounded-lg">
            <Settings className="text-white" size={16} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-[10px] font-black uppercase tracking-widest leading-none text-white">Bitácora Industrial</h1>
            <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-tighter mt-0.5">El Alma de la Máquina</p>
          </div>
        </div>

        {/* Identity area */}
        <div className="flex items-center gap-4 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 relative">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div className="relative">
              <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-cyan-500/50 group-hover:border-cyan-400 group-hover:scale-110 transition-all shadow-lg" />
              <div className="absolute -bottom-1 -right-1 bg-cyan-600 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold text-[8px] shadow-lg">
                {user.nivel}
              </div>
            </div>
            <div>
              <h2 className="text-[10px] font-black leading-none text-white uppercase group-hover:text-cyan-300 transition-colors">{user.nombre}</h2>
              <p className="text-[8px] opacity-60 uppercase tracking-widest">{currentRank.name}</p>
            </div>
          </div>

          <AnimatePresence>
            {showProfileDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-[120%] left-0 w-64 bg-slate-900 border border-white/20 p-4 rounded-xl shadow-2xl z-50 flex flex-col gap-3"
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Progreso Global</span>
                  <span className="text-xs font-bold text-cyan-400">{user.puntos} XP</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[9px] uppercase font-bold text-slate-300">Rango Actual:</span>
                  <span className="text-[10px] font-black text-white">{currentRank.name}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[9px] uppercase font-bold text-slate-300">Módulos Completados:</span>
                  <span className="text-[10px] font-black text-green-400">
                    {[
                      (user.usedConcepts || []).length > 0, 
                      answeredQuiz.length === QUIZ_QUESTIONS.length,
                      checklist.length === 5,
                      isGlossaryDone
                    ].filter(Boolean).length} / 4
                  </span>
                </div>

                <div className="border-t border-white/10 pt-2 mt-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-2">Últimas Insignias</span>
                  <div className="flex gap-2 flex-wrap">
                    {user.badges.slice(-3).map(key => {
                      const b = INSIGNIAS[key as keyof typeof INSIGNIAS];
                      if (!b) return null;
                      const Icon = b.icon;
                      return (
                        <div key={key} className={`w-6 h-6 rounded flex items-center justify-center ${b.color} shadow-lg`} title={b.name}>
                          <Icon size={10} className="text-white" />
                        </div>
                      );
                    })}
                    {user.badges.length === 0 && <span className="text-[9px] italic text-slate-500">Aún no hay insignias</span>}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setShowProfileDropdown(false);
                    setShowSummaryModal(true);
                  }}
                  className="w-full mt-2 py-2 px-3 rounded-lg font-bold uppercase tracking-wider text-[9px] text-white bg-white/10 hover:bg-white/20 transition flex items-center justify-center gap-2"
                >
                  <User size={12} /> Ver Resumen Detallado
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Stats & Tools */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col gap-1 items-end">
            <div className="flex justify-between w-32 text-[8px] text-cyan-400 uppercase font-black">
              <span>XP</span>
              <span>{user.puntos} / {nextRank.minXP}</span>
            </div>
            <div className="w-32 h-1 bg-black/40 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
              />
            </div>
          </div>

          <button 
            onClick={() => setShowRestartModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/50 text-[8px] font-black text-red-100 uppercase hover:bg-red-500 transition-all group"
          >
            <RotateCcw size={10} className="group-hover:rotate-[-180deg] transition-transform duration-500" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
        </div>
      </motion.header>

        {/* User Statistics & Badges Row */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass p-4 bg-white/5 border border-white/10 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Insignias</h3>
            <div className="flex gap-2">
              {Object.keys(INSIGNIAS).map(key => {
                const b = INSIGNIAS[key as keyof typeof INSIGNIAS];
                const hasIt = user.badges.includes(key);
                const Icon = b.icon;
                return (
                  <div key={key} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${hasIt ? b.color + ' shadow-lg scale-110' : 'bg-white/5 opacity-20 grayscale border border-white/5'}`} title={b.name}>
                    <Icon size={14} className="text-white" />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="glass p-4 bg-white/5 border border-white/10 flex flex-col justify-center gap-1.5">
            <h3 className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Leyenda de Rangos</h3>
            <div className="flex justify-between items-center text-[9px] font-mono opacity-80">
              <span className="text-slate-400">Aprendiz: 0-150</span>
              <span className="text-cyan-400">Operador: 151-400</span>
              <span className="text-purple-400">Maestro: 401-800</span>
            </div>
          </div>
          
          <div className="glass p-4 bg-white/5 border border-white/10 flex flex-col justify-center gap-1">
            <h3 className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Estado de Bitácora</h3>
            <span className={`text-[10px] font-bold ${evaluation ? 'text-green-400' : 'text-orange-400'}`}>
              {evaluation ? `COMPLETADA - NOTA: ${evaluation.score}` : 'PENDIENTE DE EVALUACIÓN'}
            </span>
          </div>
        </div>

      {/* Activity Selection Hub - Prominent and High Contrast */}
      <section className="relative z-10 glass !bg-black/60 p-6 border-2 border-cyan-500/30">
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-cyan-400">Ruta de Formación Técnica</h2>
            <p className="text-[10px] text-slate-300 mt-1 uppercase">Selecciona un módulo para forjar tu competencia</p>
          </div>
          
          <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
            {ACTIVITIES.map((act, idx) => {
              const Icon = act.icon;
              const isActive = activeTab === act.id;
              return (
                <button
                  key={act.id}
                  onClick={() => {
                    setActiveTab(act.id);
                    toast.success(`Entrando a: ${act.name}`, { duration: 1000 });
                  }}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl transition-all border relative overflow-hidden ${
                    isActive 
                    ? 'bg-cyan-500 border-white/40 shadow-[0_0_30px_rgba(6,182,212,0.5)] scale-105 z-10' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-black/20'}`}>
                    <Icon size={24} className={isActive ? 'text-white' : act.color} />
                  </div>
                  
                  <div className="text-center">
                    <span className={`block text-[10px] font-black uppercase leading-tight ${isActive ? 'text-white' : 'text-white/90'}`}>
                      {act.name}
                    </span>
                    <span className={`text-[8px] mt-1 block uppercase opacity-80 font-bold ${isActive ? 'text-white' : ''}`}>
                      {act.desc}
                    </span>
                  </div>

                  {isActive && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute inset-0 border-2 border-white/50 rounded-2xl pointer-events-none"
                    />
                  )}
                  
                  {/* Step number badge */}
                  <div className="absolute top-2 right-2 text-[8px] font-black opacity-50">
                    0{idx + 1}
                  </div>
                </button>
              )
            })}
          </nav>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="grid lg:grid-cols-12 gap-8">
        
        {/* Shared Sidebar: Concept Forge */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 space-y-6 text-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-white/10 pb-2 flex items-center justify-center gap-2">
              <Layers size={14} className="text-cyan-400" /> FORJA DE CONCEPTOS
            </h2>
            <button onClick={drawCards} className="clay-button w-full bg-cyan-600 hover:bg-cyan-500 text-xs py-4 flex items-center gap-2 justify-center">
              <Sparkles size={16} /> ROBAR NUEVAS CARTAS
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {cards.a && (
                <motion.div 
                  key={cards.a.nombre}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className={`clay-card p-5 bg-slate-800/50 border-l-4 text-left relative ${user?.usedConcepts?.includes(cards.a.nombre) ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'border-cyan-500'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-cyan-400">Mecanica</span>
                      <h3 className="text-lg font-bold mt-1 text-white flex items-center gap-2">
                        {cards.a.nombre}
                        {user?.usedConcepts?.includes(cards.a.nombre) && (
                          <span className="text-[8px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Dominado
                          </span>
                        )}
                      </h3>
                    </div>
                    <Settings className={`${user?.usedConcepts?.includes(cards.a.nombre) ? 'text-green-500/40' : 'text-cyan-500/30'}`} size={20} />
                  </div>
                  <p className="text-xs opacity-90 text-slate-300 leading-relaxed mt-2 italic">{cards.a.descripcion}</p>
                </motion.div>
              )}
              {cards.b && (
                <motion.div 
                  key={cards.b.nombre}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`clay-card p-5 bg-slate-800/50 border-l-4 text-left relative ${user?.usedConcepts?.includes(cards.b.nombre) ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'border-orange-500'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-orange-400">Simbolismo</span>
                      <h3 className="text-lg font-bold mt-1 text-white flex items-center gap-2">
                        {cards.b.nombre}
                        {user?.usedConcepts?.includes(cards.b.nombre) && (
                          <span className="text-[8px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Dominado
                          </span>
                        )}
                      </h3>
                    </div>
                    <BookOpen className={`${user?.usedConcepts?.includes(cards.b.nombre) ? 'text-green-500/40' : 'text-orange-500/30'}`} size={20} />
                  </div>
                  <p className="text-xs opacity-90 text-slate-300 leading-relaxed mt-2 italic">{cards.b.descripcion}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Dynamic Zone */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {activeTab === 'writing' && (
              <motion.div 
                key="writing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass p-6 h-full flex flex-col gap-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-black text-slate-200 uppercase tracking-wider border-b border-white/10 pb-2 flex-1">
                    ACTIVIDAD 1: BITÁCORA CRÍTICA
                  </h2>
                  <div className="text-right ml-4">
                    <span className={`text-[10px] font-mono bg-black/30 px-3 py-1 rounded-full border border-white/10 ${wordCount >= 60 ? 'text-green-400' : 'text-red-400 font-bold shadow-[0_0_8px_rgba(248,113,113,0.3)]'}`}>
                      PALABRAS: {wordCount} / 60
                    </span>
                  </div>
                </div>

                {/* --- PROGRESS STEPPER --- */}
                <div className="flex items-center w-full mt-2 mb-8 px-4">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center relative w-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
                      !!cards.a && !!cards.b ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                    }`}>
                      {!!cards.a && !!cards.b ? <CheckCircle2 size={16} /> : '1'}
                    </div>
                    <span className={`absolute top-10 whitespace-nowrap text-[9px] uppercase font-black tracking-widest ${!!cards.a && !!cards.b ? 'text-green-400' : 'text-cyan-400'}`}>Conceptos</span>
                  </div>

                  {/* Line 1 */}
                  <div className={`flex-1 h-[2px] mx-2 rounded-full transition-all duration-500 ${!!cards.a && !!cards.b ? 'bg-green-500' : 'bg-white/10'}`} />

                  {/* Step 2 */}
                  <div className="flex flex-col items-center relative w-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
                      wordCount >= 60 ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 
                      (!!cards.a && !!cards.b ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-700 text-white/50')
                    }`}>
                      {wordCount >= 60 ? <CheckCircle2 size={16} /> : '2'}
                    </div>
                    <span className={`absolute top-10 whitespace-nowrap text-[9px] uppercase font-black tracking-widest ${
                      wordCount >= 60 ? 'text-green-400' : 
                      (!!cards.a && !!cards.b ? 'text-cyan-400' : 'text-slate-400')
                    }`}>Análisis</span>
                  </div>

                  {/* Line 2 */}
                  <div className={`flex-1 h-[2px] mx-2 rounded-full transition-all duration-500 ${wordCount >= 60 ? 'bg-green-500' : 'bg-white/10'}`} />

                  {/* Step 3 */}
                  <div className="flex flex-col items-center relative w-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
                      !!evaluation ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 
                      (wordCount >= 60 ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-700 text-white/50')
                    }`}>
                      {!!evaluation ? <CheckCircle2 size={16} /> : '3'}
                    </div>
                    <span className={`absolute top-10 whitespace-nowrap text-[9px] uppercase font-black tracking-widest ${
                      !!evaluation ? 'text-green-400' : 
                      (wordCount >= 60 ? 'text-cyan-400' : 'text-slate-400')
                    }`}>Evalúa</span>
                  </div>
                </div>
                
                <p className="text-[11px] opacity-90 italic max-w-lg leading-relaxed border-l-2 border-white/40 pl-3 text-slate-200">
                  "¿Cómo se protege el bienestar humano frente a la eficiencia de la máquina? Asume tu responsabilidad social como futuro técnico combinando ambos conceptos."
                </p>

                <textarea 
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                  placeholder="Escribe aquí tu análisis..." 
                  className="flex-1 clay-input text-sm leading-relaxed min-h-[300px] resize-none"
                />

                {wordCount < 60 && (
                  <div className="text-center">
                    <p className="inline-block text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full uppercase tracking-wider font-bold animate-pulse">
                      Faltan {60 - wordCount} palabras para habilitar la evaluación
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button 
                    onClick={evaluate} 
                    disabled={isEvaluating} 
                    className={`flex-1 clay-button text-xs py-4 transition-all ${
                      isEvaluating ? 'bg-slate-700' : 
                      (wordCount >= 60 && cards.a && cards.b) ? 'bg-green-600 active:scale-95 hover:bg-green-500' : 'bg-slate-600 opacity-80 cursor-pointer'
                    }`}
                  >
                    {isEvaluating ? 'ANALIZANDO BITÁCORA...' : 'EVALUAR TEXTO'}
                  </button>
                  <button onClick={exportPDF} disabled={!evaluation} className="flex-1 clay-button bg-slate-700 text-xs py-4">PDF</button>
                </div>
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div key="quiz" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#f8fafc]">Trivia Baldomero Lillo</h3>
                  <div className="text-[10px] bg-cyan-500/20 px-3 py-1 rounded-full text-cyan-400 font-bold">
                    PROGRESO: {answeredQuiz.length} / {QUIZ_QUESTIONS.length}
                  </div>
                </div>
                <div className="space-y-6">
                  {QUIZ_QUESTIONS.map((q, i) => {
                    const isDone = answeredQuiz.includes(i);
                    return (
                      <div key={i} className={`space-y-3 p-4 rounded-xl transition-opacity ${isDone ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                        <p className="text-xs font-bold text-slate-200">{i+1}. {q.q}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {q.options.map((opt, oi) => (
                            <button 
                              key={oi} 
                              disabled={isEvaluating || isDone}
                              onClick={() => {
                                if(oi === q.correct) {
                                  toast.success(`¡Excelente! ${q.feedback}`, { duration: 6000 });
                                  if(!isDone) { 
                                    addXP(20); 
                                    setAnsweredQuiz(prev => [...prev, i]);
                                    if(answeredQuiz.length + 1 === QUIZ_QUESTIONS.length) {
                                      addXP(50, 'TRIVIAL');
                                      toast.success("¡Has completado toda la trivia!", { icon: "🏆", duration: 4000 });
                                    }
                                  }
                                } else {
                                  toast.error(
                                    <div className="flex flex-col gap-1">
                                      <span className="font-bold">Incorrecto. La respuesta correcta es '{q.options[q.correct]}'.</span>
                                      <span className="text-xs opacity-90 leading-relaxed font-normal">{q.feedback}</span>
                                    </div>,
                                    { duration: 8000 }
                                  );
                                }
                              }}
                              className={`clay-button text-[10px] py-3 ${isDone ? 'bg-black/10' : 'bg-black/30 hover:bg-black/50'}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'empathy' && (() => {
              const EMPATHY_FIELDS = [
                { key: 'piensa', label: 'PIENSA', placeholder: 'Ej: Reflexiona sobre la alienación técnica, el desgaste diario operando la máquina y la pérdida de identidad frente al automatismo...' },
                { key: 'siente', label: 'SIENTE', placeholder: 'Ej: Siente terror a ser mutilado, angustia por la repetición constante y sofoco frente a las duras condiciones...' },
                { key: 'dice', label: 'DICE', placeholder: 'Ej: Manifiesta su agotamiento en silencios, frases de sumisión y quejas ahogadas por miedo a ser despedido...' },
                { key: 'hace', label: 'HACE', placeholder: 'Ej: Ejecuta movimientos mecánicos ciegamente, arriesga su integridad en los engranajes y obedece instrucciones...' }
              ];
              
              const isAllValid = EMPATHY_FIELDS.every(field => {
                const text = empathyMap[field.key as keyof typeof empathyMap];
                return (text.trim() ? text.trim().split(/\s+/).length : 0) >= 10;
              });

              return (
                <motion.div key="empathy" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-8 space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#f8fafc]">Mapa de Empatía: El Obrero</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {EMPATHY_FIELDS.map(field => {
                      const text = empathyMap[field.key as keyof typeof empathyMap];
                      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
                      return (
                        <div key={field.key} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold opacity-50 tracking-widest uppercase">{field.label}</label>
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full transition-colors ${words >= 10 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400 animate-pulse'}`}>
                              {words} / 10 palabras
                            </span>
                          </div>
                          <textarea 
                            className="w-full clay-input h-32 text-xs leading-relaxed resize-none" 
                            placeholder={field.placeholder} 
                            value={text}
                            onChange={(e) => setEmpathyMap({...empathyMap, [field.key]: e.target.value})}
                          />
                        </div>
                      )
                    })}
                  </div>
                  <button 
                    disabled={!isAllValid}
                    onClick={() => {
                      if (!isEmpathyDone) {
                        addXP(50);
                        setIsEmpathyDone(true);
                        toast.success("Perfil de empatía guardado");
                      } else {
                        toast.info("Perfil actualizado (ya recibiste los puntos)");
                      }
                    }} 
                    className={`clay-button w-full text-[10px] py-4 transition-all uppercase tracking-wider ${!isAllValid ? 'bg-slate-800 opacity-60 cursor-not-allowed text-red-400 font-bold' : (isEmpathyDone ? 'bg-slate-700' : 'bg-purple-600 hover:scale-[1.02] active:scale-95')}`}
                  >
                    {!isAllValid ? 'Faltan palabras en algunos campos' : (isEmpathyDone ? 'PERFIL EDITADO Y GUARDADO' : 'GUARDAR PERFIL EMPÁTICO (+50 XP)')}
                  </button>
                </motion.div>
              );
            })()}

            {activeTab === 'debate' && (
              <motion.div key="debate" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass p-8 space-y-8 text-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#f8fafc]">Dilema de Producción</h3>
                <p className="text-sm opacity-80 leading-relaxed px-12 italic">
                  "Si la máquina garantiza el pan de miles de familias, ¿es justificable que una sola vida se pierda en sus engranajes?"
                </p>
                <div className="flex justify-center gap-6">
                  <button 
                    onClick={() => {
                      if (!isDebateDone) { addXP(30); setIsDebateDone(true); }
                      toast.info("Respuesta ética registrada");
                    }} 
                    className={`clay-button px-8 py-4 text-[10px] ${isDebateDone ? 'bg-slate-700 opacity-50' : 'bg-red-900/50 hover:bg-red-800'}`}
                  >
                    INJUSTIFICABLE
                  </button>
                  <button 
                    onClick={() => {
                      if (!isDebateDone) { addXP(10); setIsDebateDone(true); }
                      toast.warning("Has priorizado la eficiencia");
                    }} 
                    className={`clay-button px-8 py-4 text-[10px] ${isDebateDone ? 'bg-slate-700 opacity-50' : 'bg-slate-800 hover:bg-slate-700'}`}
                  >
                    NECESARIO
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'glossary' && (
              <motion.div key="glossary" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#f8fafc]">DICCIONARIO DE SÍMBOLOS FORJADOS</h3>
                <p className="text-[10px] opacity-80 text-slate-300 italic">La integración entre la precisión técnica y la profundidad literaria.</p>
                <div className="grid md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                  {MAZO_A.slice(0, 8).map((tech, i) => {
                    const symb = MAZO_B[i % MAZO_B.length];
                    return (
                      <div key={i} className="flex flex-col gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-cyan-500/50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <span className="text-[8px] font-black text-cyan-400 uppercase tracking-tighter">Materialidad Técnica</span>
                            <h4 className="text-xs font-bold text-white mb-1">{tech.nombre}</h4>
                            <p className="text-[9px] opacity-90 text-slate-300 leading-tight">{tech.descripcion}</p>
                          </div>
                          <div className="w-px h-12 bg-white/10" />
                          <div className="flex-1 text-right">
                            <span className="text-[8px] font-black text-orange-400 uppercase tracking-tighter">Esencia Simbólica</span>
                            <h4 className="text-xs font-bold text-white mb-1">{symb.nombre}</h4>
                            <p className="text-[9px] opacity-90 text-slate-300 leading-tight italic">{symb.descripcion}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <button 
                  onClick={() => {
                    if (!isGlossaryDone) { addXP(20); setIsGlossaryDone(true); }
                    toast.success("Conceptos integrados en tu conocimiento técnico");
                  }} 
                  className={`clay-button w-full text-xs mt-4 ${isGlossaryDone ? 'bg-slate-700 opacity-50' : 'bg-emerald-600'}`}
                >
                  {isGlossaryDone ? 'CONOCIMIENTO EXPANDIDO' : 'EXPANDIR CONOCIMIENTO (+20 XP)'}
                </button>
              </motion.div>
            )}

            {activeTab === 'checklist' && (
              <motion.div key="checklist" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} className="glass p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#f8fafc]">Checklist: Ética en el Taller</h3>
                  <div className="text-[10px] text-cyan-400 font-black">
                    {checklist.length} / 5 COMPLETADOS
                  </div>
                </div>
                <div className="grid gap-3">
                  {[
                    "Protección de la dignidad humana sobre la meta.",
                    "Mantención preventiva como acto de cuidado social.",
                    "Diálogo abierto sobre riesgos mecánicos.",
                    "Uso de tecnología para reducir fatiga obrera.",
                    "Empatía hacia el compañero en el puesto crítico."
                  ].map((val, i) => (
                    <label key={i} className={`flex items-center gap-4 p-4 clay-card cursor-pointer transition-all ${checklist.includes(i) ? 'bg-cyan-500/20 border-cyan-500/50 opacity-80' : 'bg-slate-800/30'}`}>
                      <input 
                        type="checkbox" 
                        checked={checklist.includes(i)}
                        className="w-4 h-4 accent-cyan-500 rounded" 
                        onChange={(e) => {
                          if(e.target.checked && !checklist.includes(i)) {
                            setChecklist(prev => [...prev, i]);
                            addXP(10);
                            if(checklist.length + 1 === 5) {
                              addXP(50, 'ETICO');
                              toast.success("¡Protocolo Ético completado!", { icon: "🛡️" });
                            }
                          }
                        }}
                      />
                      <span className="text-xs">{val}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Evaluation Result */}
      <AnimatePresence>
        {evaluation && (
          <motion.section 
            ref={evaluationRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="animate-fade-in mb-20"
          >
            <div className="glass p-8 border border-white/20">
              <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-[#f8fafc]">DICTAMEN DE TALLER</h2>
                  <p className="text-[10px] opacity-50 uppercase mt-1">Resultado de bitácora crítica</p>
                </div>
                <div className="text-5xl font-black text-cyan-400">{evaluation.score}</div>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/30"><CheckCircle2 size={16} /></div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-slate-300">Integración Técnica</h4>
                      <p className="text-xs opacity-90 leading-relaxed">{evaluation.feedbackConcepts}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 border border-orange-500/30"><Heart size={16} /></div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-slate-300">Dimensión Ética</h4>
                      <p className="text-xs opacity-90 leading-relaxed">{evaluation.feedbackEthics}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col justify-center items-center text-center">
                  <Quote className="text-white/10 mb-4 rotate-180" size={24} />
                  <p className="text-xs opacity-90 italic leading-relaxed">
                    "Tu responsabilidad como técnico no termina en el engranaje, comienza en el corazón de quien lo opera."
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* PDF Export Template */}
      <div className="fixed top-[-9999px] left-[-9999px] pointer-events-none">
        <div ref={pdfRef} className="p-12 w-[800px]" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
          <div className="flex justify-between items-center border-b-2 pb-4 mb-8" style={{ borderColor: '#0f172a' }}>
            <h1 className="text-2xl font-black">Bitácora del Taller: El Alma de la Máquina</h1>
            <span className="font-bold" style={{ color: '#64748b' }}>{new Date().toLocaleDateString('es-CL')}</span>
          </div>
          <div className="flex items-center gap-6 mb-12">
            <img 
              src={user.avatar} 
              className="w-20 h-20 rounded-full border-2" 
              style={{ borderColor: '#3b82f6' }}
              alt="avatar" 
              crossOrigin="anonymous" 
            />
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#2563eb' }}>{user.nombre}</h2>
              <p className="uppercase font-black text-xs" style={{ color: '#64748b' }}>{currentRank.name}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 mb-12 p-6 rounded-2xl" style={{ backgroundColor: '#f8fafc' }}>
            <div>
              <h3 className="font-black text-xs uppercase mb-1" style={{ color: '#ea580c' }}>Concepto Técnico</h3>
              <p className="font-bold">{cards.a?.nombre}</p>
              <p className="text-sm italic" style={{ color: '#475569' }}>{cards.a?.descripcion}</p>
            </div>
            <div>
              <h3 className="font-black text-xs uppercase mb-1" style={{ color: '#9333ea' }}>Símbolo Literario</h3>
              <p className="font-bold">{cards.b?.nombre}</p>
              <p className="text-sm italic" style={{ color: '#475569' }}>{cards.b?.descripcion}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-black border-l-4 pl-4" style={{ borderColor: '#3b82f6' }}>Reflexión Crítica:</h3>
            <div className="whitespace-pre-wrap leading-relaxed" style={{ color: '#1e293b' }}>
              {essay}
            </div>
          </div>
          <div className="mt-20 pt-8 border-t text-center text-[10px]" style={{ borderColor: '#e2e8f0', color: '#94a3b8' }}>
            Programa PACE-UDA, 2026. Asesoría Pedagógica.
          </div>
        </div>
      </div>

      <footer className="h-12 flex items-center justify-center bg-black/40 text-[10px] opacity-80 text-slate-300 uppercase tracking-widest fixed bottom-0 left-0 w-full z-50">
        Creado por: Christian Núñez, Asesor Pedagógico, Programa PACE-UDA, 2026.
      </footer>
    </div>
  );
}
