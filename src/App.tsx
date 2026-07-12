import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, Calendar, Camera, MessageCircle, CheckCircle, Gift, Lock, LogOut, Menu, X, Upload, Trash2, Download } from 'lucide-react';
import { auth, db, storage } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, deleteDoc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { handleFirestoreError, OperationType } from './lib/firebaseUtils';

const pixPhone = "63992613726";

const isEsgotado = (name: string): boolean => {
  if (!name) return false;
  const norm = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const esgotados = [
    'panela de pressao',
    'sanduicheira',
    'jogo de talheres',
    'jogo de talheires',
    'liquidificador',
    'jogo da tabuas de corte',
    'jogo de tabuas de corte',
    'tabua de corte',
    'lixeira',
    'conjunto de 3 assadeiras',
    'assadeiras',
    'travesseiro nasa',
    'travesseiro',
    'jogo de lencol queen 4 pecas',
    'jogo de lencol queen',
    'lencol queen',
    'portes de vidro p/mantimentos',
    'potes de vidro p/mantimentos',
    'potes de vidro',
    'portes de vidro',
    'potes para mantimentos',
    'jogo de banho',
    'jogo de banho especial barrado',
    'jogo de banho especial',
    'banho especial barrado',
    'jogo banho luxo especial barrado bordado richilieu 5 pecas',
    'luxo especial barrado',
    'richilieu',
    'bordado richilieu',
    'panela eletrica de arroz',
    'panela eletrica',
    'panela de arroz'
  ];
  return esgotados.some(item => norm.includes(item) || item.includes(norm));
};

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'História', href: '/sobre' },
  { name: 'O Evento', href: '/casamento' },
  { name: 'Fotos', href: '/fotos' },
  { name: 'Recados', href: '/recados' },
  { name: 'Confirmar Presença', href: '/confirmacao' },
  { name: 'Presentes', href: '/presentes' },
];

function SharedLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen watercolor-bg flex flex-col font-sans relative overflow-x-hidden">
      {/* Imagem Floral Canto Superior Esquerdo - O usuário fará upload */}
      <img 
        src="/flor-esq.png" 
        alt="" 
        className="absolute top-0 left-0 w-48 md:w-80 pointer-events-none z-10 animate-fade-in-up MixBlendMultiply"
        style={{ mixBlendMode: 'multiply', opacity: 0.8 }}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      {/* Imagem Floral Canto Superior Direito - O usuário fará upload */}
      <img 
        src="/flor-dir.png" 
        alt="" 
        className="absolute top-0 right-0 w-48 md:w-80 pointer-events-none z-10 animate-fade-in-up"
        style={{ mixBlendMode: 'multiply', opacity: 0.8, transform: 'scaleX(-1)' }}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />

      {/* Top Header Section */}
      <header className="pt-24 pb-16 px-4 flex flex-col items-center">
        <div className="font-script text-6xl md:text-8xl lg:text-[7rem] mb-12 select-none flex items-center justify-center gap-3 md:gap-5">
          <Link to="/" className="flex items-center gap-3 md:gap-6">
            <span style={{ color: '#0000FF' }}>Gabriel</span>
            <span style={{ color: '#ce9b2c' }} className="text-4xl md:text-6xl lg:text-[4.5rem] mt-4 md:mt-6">&</span>
            <span style={{ color: '#0000FF' }}>Josivania</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-wrap justify-center gap-4 max-w-5xl items-center">
          {navLinks.map((link) => (
            <NavLink 
              key={link.name} 
              to={link.href} 
            className={({isActive}) => `px-3 py-1 text-base md:text-lg font-medium transition-colors ${isActive ? 'bg-slate-800 text-white font-semibold' : 'bg-slate-700 text-white hover:bg-slate-800'}`}
            >
              {link.name}
            </NavLink>
          ))}
          <Link to="/admin" className="text-sm md:text-base font-medium text-slate-400 hover:text-[#8C7A6B] transition-colors flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
             <Lock className="w-3.5 h-3.5" /> <span>Admin</span>
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden fixed top-6 right-6 p-2 text-blue-400 hover:bg-blue-100 rounded-full transition-colors z-50 bg-white/80 backdrop-blur shadow-sm"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* Mobile Sidebar Navigation */}
      <aside className={`fixed inset-0 bg-white/95 backdrop-blur-md z-40 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 md:hidden flex flex-col items-center justify-center space-y-6 p-8`}>
        {navLinks.map((link) => (
          <NavLink 
            key={link.name} 
            to={link.href} 
            className={({isActive}) => `px-6 py-2 w-full text-center text-xl font-medium transition-colors ${isActive ? 'bg-slate-800 text-white font-semibold' : 'bg-slate-700 text-white hover:bg-slate-800'}`}
          >
            {link.name}
          </NavLink>
        ))}
        <Link to="/admin" className="text-xl font-medium text-blue-800 flex items-center gap-2 pt-8 border-t border-blue-50 w-full justify-center">
           <Lock size={20} /> Admin
        </Link>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center w-full px-4 sm:px-6 py-8 max-w-6xl mx-auto animate-fade-in-up">
        <Outlet />
      </main>

      <footer className="py-12 border-t border-blue-100/50 text-center text-slate-400 text-sm">
        <p>Josi & Gabriel &bull; 13 de Agosto de 2026</p>
      </footer>
    </div>
  );
}

function Countdown() {
  const targetDate = new Date('2026-08-13T18:30:00').getTime();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex gap-6 sm:gap-10 justify-center mt-8 p-6 max-w-lg mx-auto">
      <div className="flex flex-col items-center">
        <span className="text-4xl sm:text-5xl font-light text-[#0000FF]">{timeLeft.days}</span>
        <span className="text-[10px] uppercase tracking-widest text-[#E0AA3E] mt-2">Dias</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-4xl sm:text-5xl font-light text-[#0000FF]">{timeLeft.hours.toString().padStart(2, '0')}</span>
        <span className="text-[10px] uppercase tracking-widest text-[#E0AA3E] mt-2">Horas</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-4xl sm:text-5xl font-light text-[#0000FF]">{timeLeft.minutes.toString().padStart(2, '0')}</span>
        <span className="text-[10px] uppercase tracking-widest text-[#E0AA3E] mt-2">Minutos</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-4xl sm:text-5xl font-light text-[#0000FF]">{timeLeft.seconds.toString().padStart(2, '0')}</span>
        <span className="text-[10px] uppercase tracking-widest text-[#E0AA3E] mt-2">Segundos</span>
      </div>
    </div>
  );
}

function Inicio() {
  const [homeImage, setHomeImage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'site_images', 'home'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().base64) {
        setHomeImage(docSnap.data().base64);
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="relative text-center w-full max-w-5xl mx-auto space-y-12 pb-20">
      {/* Framed Photo */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-12 z-20">
        <div className="bg-white p-2 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 relative overflow-hidden">
          <div className="overflow-hidden aspect-[16/10] relative rounded-xl">
            <img 
              src={homeImage || "/capa-home.jpg"} 
              alt="Alianças - Josi e Gabriel" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Removed small corner images per request */}

      <div className="space-y-4 pt-10">
        <p className="text-[#E0AA3E] font-medium tracking-[0.2em] uppercase text-sm">Save the Date</p>
        <h2 className="text-xl md:text-3xl font-serif text-[#0000FF] italic">01 de Agosto de 2026 - Uberlândia MG</h2>
        <h2 className="text-xl md:text-3xl font-serif text-[#0000FF] italic mt-2">13 de Agosto de 2026 - Araguaína TO</h2>
      </div>

      <Countdown />
    </div>
  );
}

function Historia() {
  return (
    <div className="w-full space-y-12 bg-white/60 backdrop-blur-sm p-8 md:p-16 rounded-[3rem] border border-blue-100/50 text-center shadow-sm">
      <div className="space-y-4">
        <Heart className="w-8 h-8 text-blue-300 mx-auto opacity-50" />
        <h2 className="text-4xl md:text-5xl font-script text-[#ce9b2c]">Nossa História</h2>
      </div>
      <div className="space-y-8 text-slate-600 leading-relaxed text-lg max-w-3xl mx-auto text-left font-light">
        <p className="first-letter:text-5xl first-letter:font-script first-letter:text-blue-400 first-letter:mr-3 first-letter:float-left">Nossa história começou muito antes do nosso primeiro encontro. Deus, em Sua bondade, escreveu cada detalhe do nosso caminho e nos uniu no tempo certo.</p>
        <p>Uma certeza silenciosa de que deveria mandar uma mensagem, e aquela simples atitude mudou completamente nossas vidas.</p>
        <p>Antes mesmo de qualquer promessa, já sentindo um pequeno pedaço do que viria da conexão inesperada, veio a decisão: orar juntos.</p>
        <p>Em poucos dias, percebemos que compartilhamos muito mais do que gostos parecidos. Sonhamos parecido, acreditamos nas mesmas coisas, desejamos o mesmo futuro e carregamos os mesmos princípios no coração.</p>
        <p>Cada conversa se tornava mais longa. A oração nos fortalecia, a sinceridade nos aproximava e o cuidado conquistava diariamente. Entre chamadas de vídeo no fim do dia, estudos da Bíblia, risadas, perguntas profundas e planos para o futuro, fomos entendendo que o amor também nasce na amizade, na admiração e na presença constante.</p>
        <p>O primeiro encontro foi inesquecível. Parecia que o coração já reconhecia alguém que esperou por muito tempo. Cada abraço trouxe paz, cada olhar transmitia carinho e cada momento parecia confirmar aquilo que Deus já havia colocado em nossos corações.</p>
        <p>Hoje olhamos para trás com gratidão por cada detalhe da nossa caminhada. Nada foi por acaso. Deus conduziu nossa história com amor, propósito e cuidado.</p>
        <p className="font-medium text-blue-800 text-center italic mt-8 pt-6 border-t border-blue-50">"E agora, diante de uma nova etapa, seguimos escolhendo um ao outro todos os dias, construindo sonhos, fortalecendo nossa fé e colocando Deus sempre no centro de tudo aquilo que ainda iremos viver juntos."</p>
      </div>
    </div>
  );
}

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); 
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

function Casamento() {
  const [eventImage, setEventImage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, setUser);
    const unsub = onSnapshot(doc(db, 'site_images', 'evento'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().base64) {
        setEventImage(docSnap.data().base64);
      }
    });
    return () => unsub();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        if (!auth.currentUser) {
          await signInWithPopup(auth, new GoogleAuthProvider());
        }
        const base64 = await compressImage(e.target.files[0]);
        await setDoc(doc(db, 'site_images', 'evento'), { base64 });
        alert('Foto atualizada com sucesso!');
      } catch (err: any) {
        console.error(err);
        if (err.code === 'permission-denied') {
          alert('Apenas o administrador (gabrielcalid@gmail.com) pode mudar a foto.');
        } else {
          alert('Erro ao atualizar foto. Tente novamente.');
        }
      }
    }
  };

  return (
    <div className="w-full space-y-12 bg-white/60 backdrop-blur-sm p-8 md:p-16 rounded-[3rem] border border-blue-100/50 text-center shadow-sm">
      <div className="space-y-4">
        <Calendar className="w-8 h-8 text-blue-300 mx-auto opacity-50" />
        <h2 className="text-4xl md:text-5xl font-script text-[#ce9b2c]">O Casamento</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-12 text-left items-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-blue-900 font-medium uppercase tracking-widest text-xs">Data e Horário</h3>
            <p className="text-xl text-slate-700 font-light">13 de Agosto de 2026 às 18:30h</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-blue-900 font-medium uppercase tracking-widest text-xs">Local</h3>
            <div className="text-xl text-slate-700 font-light space-y-1">
              <p>Igreja Adventista do Sétimo Dia</p>
              <p>Bairro: Eldorado</p>
              <p>Rua: Guatemala S/N</p>
              <p className="text-lg text-slate-500 italic mt-2">Próximo à praça do Bairro Eldorado.</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-blue-50/50 rounded-2xl overflow-hidden shadow-inner border border-blue-100/50 flex items-center justify-center relative">
            <img 
              src={eventImage || "/foto-evento.jpg"} 
              alt="Foto do Evento ou Convite" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  e.currentTarget.nextElementSibling.classList.remove('hidden');
                }
              }}
            />
            <div className="text-center p-8 absolute inset-0 flex flex-col items-center justify-center hidden">
               <Camera className="w-12 h-12 text-blue-200 mx-auto mb-4" />
               <p className="text-blue-300 font-light italic">Nenhuma foto adicionada</p>
            </div>
          </div>
          
          {(user?.email === 'gabrielcalid@gmail.com' || user?.email === 'josi.bio21@gmail.com') && (
            <label className="flex items-center justify-center gap-2 w-full py-4 bg-blue-400 hover:bg-blue-500 text-white font-medium rounded-2xl transition-all shadow-md active:scale-[0.98] cursor-pointer">
              <Upload className="w-5 h-5" /> Mudar Foto do Evento
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

function Fotos() {
  const [galleryImages, setGalleryImages] = useState<Record<number, string>>({});
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, setUser);
    const unsub = onSnapshot(doc(db, 'site_images', 'galeria'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().images) {
        setGalleryImages(docSnap.data().images);
      }
    });
    return () => unsub();
  }, []);

  const handleUpload = async (pos: number, file: File) => {
    try {
      if (!auth.currentUser) {
        await signInWithPopup(auth, new GoogleAuthProvider());
      }
      const base64 = await compressImage(file);
      const currentDoc = await getDoc(doc(db, 'site_images', 'galeria'));
      const images = currentDoc.exists() ? currentDoc.data().images || {} : {};
      images[pos] = base64;
      await setDoc(doc(db, 'site_images', 'galeria'), { images });
      alert(`Momento ${pos} atualizado com sucesso!`);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'permission-denied') {
        alert('Apenas o administrador (gabrielcalid@gmail.com) pode mudar a foto.');
      } else {
        alert('Erro ao atualizar. Tente novamente.');
      }
    }
  };

  return (
    <div className="w-full space-y-12 bg-white/60 backdrop-blur-sm p-8 md:p-16 rounded-[3rem] border border-blue-100/50 text-center shadow-sm">
      <div className="space-y-4">
        <Camera className="w-8 h-8 text-blue-300 mx-auto opacity-50" />
        <h2 className="text-4xl md:text-5xl font-script text-[#ce9b2c]">Nossos Momentos</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-square bg-white p-2 md:p-3 shadow-md rounded-[1rem] transform odd:rotate-1 even:-rotate-1 hover:rotate-0 transition-all duration-300 border border-slate-50 group relative">
            <div className="w-full h-full bg-blue-50/50 flex items-center justify-center overflow-hidden relative rounded-lg">
              <img 
                src={galleryImages[i] || `/foto-galeria-${i}.jpg`} 
                alt={`Momento ${i}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.classList.remove('hidden');
                  }
                }}
              />
              <div className="text-center p-4 absolute inset-0 flex flex-col items-center justify-center hidden bg-blue-50/50">
                <Camera className="w-8 h-8 text-blue-200 mx-auto mb-2" />
                <span className="text-blue-300 font-light italic text-sm mt-1">Vazio</span>
              </div>
            </div>
            
            {(user?.email === 'gabrielcalid@gmail.com' || user?.email === 'josi.bio21@gmail.com') && (
              <label className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1rem] cursor-pointer">
                <Upload className="w-8 h-8 text-white mb-2" />
                <span className="text-white text-xs font-medium px-2 text-center">Alterar Foto</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleUpload(i, e.target.files[0]);
                    }
                  }} 
                  className="hidden" 
                />
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Recados() {
  const [messages, setMessages] = useState<any[]>([]);
  const [msgName, setMsgName] = useState('');
  const [msgPhone, setMsgPhone] = useState('');
  const [msgText, setMsgText] = useState('');

  useEffect(() => {
    const qMsg = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsubMsg = onSnapshot(qMsg, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'messages'));

    return () => unsubMsg();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgName || !msgText) return;
    try {
      await addDoc(collection(db, 'messages'), {
        name: msgName,
        phone: msgPhone || '',
        text: msgText,
        createdAt: serverTimestamp()
      });
      setMsgName('');
      setMsgPhone('');
      setMsgText('');
      alert('Mensagem enviada com sucesso!');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'messages');
    }
  };

  return (
    <div className="w-full space-y-12 max-w-3xl mx-auto">
      <div className="text-center space-y-4">
        <MessageCircle className="w-8 h-8 text-[#ce9b2c] mx-auto opacity-50" />
        <h2 className="text-4xl md:text-5xl font-script text-[#ce9b2c]">Deixe seu Recado</h2>
      </div>

      <form onSubmit={handleSendMessage} className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-black font-semibold ml-1">Seu Nome</label>
              <input required type="text" value={msgName} onChange={e => setMsgName(e.target.value)} placeholder="Como você quer ser identificado?" className="w-full px-5 py-4 rounded-2xl bg-slate-50 text-slate-800 placeholder-slate-400 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-black font-semibold ml-1">WhatsApp (Opcional)</label>
              <input type="text" value={msgPhone} onChange={e => setMsgPhone(e.target.value)} placeholder="(00) 00000-0000" className="w-full px-5 py-4 rounded-2xl bg-slate-50 text-slate-800 placeholder-slate-400 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-black font-semibold ml-1">Sua Mensagem</label>
            <textarea required value={msgText} onChange={e => setMsgText(e.target.value)} rows={4} placeholder="Escreva algo carinhoso..." className="w-full px-5 py-4 rounded-[1.5rem] bg-slate-50 text-slate-800 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none placeholder-slate-400"></textarea>
          </div>
          <button type="submit" className="w-full py-4 mt-6 bg-[#0000FF] hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-[0.98] cursor-pointer">Enviar Recado com Carinho</button>
        </div>
      </form>

      {messages.length > 0 && (
        <div className="space-y-8 pt-6">
          <h3 className="text-xl font-light text-blue-400 text-center tracking-[0.2em] uppercase">Mural de Afetos</h3>
          <div className="grid gap-6">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white/40 border border-white/60 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Heart size={40} className="text-blue-400" />
                </div>
                <p className="text-slate-600 font-light leading-relaxed italic mb-4">"{msg.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="h-px bg-blue-100 flex-grow"></div>
                  <p className="text-sm text-blue-400 font-medium tracking-wide">Com amor, {msg.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Confirmacao() {
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvps, setRsvps] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'rsvps'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRsvps(msgs);
    });
    return () => unsub();
  }, []);

  const handleSendRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName || !rsvpPhone) return;
    try {
      await addDoc(collection(db, 'rsvps'), {
        name: rsvpName,
        phone: rsvpPhone,
        createdAt: serverTimestamp()
      });
      setRsvpName('');
      setRsvpPhone('');
      alert('Presença confirmada!');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'rsvps');
    }
  };

  return (
    <div className="w-full space-y-12 max-w-2xl mx-auto">
      <div className="text-center space-y-4">
        <CheckCircle className="w-8 h-8 text-[#ce9b2c] mx-auto opacity-50" />
        <h2 className="text-4xl md:text-5xl font-script text-[#ce9b2c]">Confirmar Presença</h2>
        <p className="text-slate-500 font-light max-w-sm mx-auto tracking-wide">É uma alegria imensa ter você conosco. Por favor, confirme até 30 dias antes.</p>
      </div>

      <form onSubmit={handleSendRsvp} className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
        
        <div className="relative z-10 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-black font-semibold ml-1">Nome Completo</label>
            <input required type="text" value={rsvpName} onChange={e => setRsvpName(e.target.value)} placeholder="Como está no convite?" className="w-full px-5 py-4 rounded-2xl bg-slate-50 text-slate-800 placeholder-slate-400 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-black font-semibold ml-1">Telefone WhatsApp</label>
            <input required type="text" value={rsvpPhone} onChange={e => setRsvpPhone(e.target.value)} placeholder="(00) 00000-0000" className="w-full px-5 py-4 rounded-2xl bg-slate-50 text-slate-800 placeholder-slate-400 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <button type="submit" className="w-full py-4 mt-6 bg-[#0000FF] hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-[0.98] cursor-pointer">Confirmar Minha Presença</button>
        </div>
      </form>

      {rsvps.length > 0 && (
        <div className="pt-8 space-y-6">
          <h3 className="text-2xl font-script text-slate-700 text-center">Presenças Confirmadas ({rsvps.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rsvps.map((rsvp: any) => (
              <div key={rsvp.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-700">{rsvp.name}</span>
                  <span className="text-xs text-slate-500">{rsvp.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <button 
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        await deleteDoc(doc(db, 'rsvps', rsvp.id));
                      } catch(err: any) {
                        console.error(err);
                        alert('Erro ao excluir presença: ' + err.message);
                      }
                    }} 
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-slate-50 rounded-full transition-all"
                    title="Excluir presença"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Presentes() {
  const [gifts, setGifts] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Quick Edit States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editMpLink, setEditMpLink] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    const qGift = query(collection(db, 'gifts'), orderBy('createdAt', 'asc'));
    const unsubGift = onSnapshot(qGift, (snapshot) => {
      setGifts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'gifts'));

    return () => {
      unsubAuth();
      unsubGift();
    };
  }, []);

  const isAdmin = user?.email === 'gabrielcalid@gmail.com' || user?.email === 'josi.bio21@gmail.com';

  const startEditing = (gift: any) => {
    setEditingId(gift.id);
    setEditName(gift.name);
    setEditValue(gift.value.toString());
    setEditMpLink(gift.mercadoPagoLink || '');
  };

  const handleQuickUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      setIsUpdating(true);
      await updateDoc(doc(db, 'gifts', editingId), {
        name: editName,
        value: parseFloat(editValue),
        mercadoPagoLink: editMpLink
      });
      setEditingId(null);
      alert('Item atualizado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar item.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePhotoUpdate = async (giftId: string, file: File) => {
    try {
      const base64 = await compressImage(file);
      await updateDoc(doc(db, 'gifts', giftId), {
        imageUrls: [base64]
      });
      alert('Foto atualizada!');
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar foto.');
    }
  };

  return (
    <div className="w-full space-y-12">
      <div className="text-center space-y-4">
        <Gift className="w-8 h-8 text-blue-300 mx-auto opacity-50" />
        <h2 className="text-4xl md:text-5xl font-script text-[#ce9b2c]">Lista de Presentes</h2>
        <p className="text-slate-500 font-light max-w-lg mx-auto tracking-wide">Sua presença é nosso maior presente! Se desejar nos presentear, preparamos algumas sugestões abaixo.</p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6 pb-20">
        {gifts.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 font-light italic">
            Nenhum presente cadastrado ainda.
          </div>
        ) : (
          gifts.map(gift => {
            const valueStr = gift.value.toFixed(2);
            const [intPart, decPart] = valueStr.split('.');
            const isEditingThis = editingId === gift.id;

            return (
              <div key={gift.id} className="bg-white/80 p-3 shadow-sm rounded-sm border border-slate-200/60 flex flex-col group transition-all hover:shadow-md relative overflow-hidden">
                {/* Admin Controls Overlay */}
                {isAdmin && !isEditingThis && (
                  <div className="absolute inset-x-0 top-0 z-20 p-2 flex justify-between items-start pointer-events-none">
                    <button 
                      onClick={() => startEditing(gift)}
                      className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all active:scale-90 pointer-events-auto"
                      title="Editar Nome/Valor/Link"
                    >
                      <Lock size={16} />
                    </button>
                    
                    <div className="flex flex-col gap-2 items-end">
                      <label className="px-3 py-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full shadow-lg hover:bg-rose-600 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 pointer-events-auto uppercase tracking-tighter">
                        <Camera size={12} />
                        Alterar Foto
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handlePhotoUpdate(gift.id, e.target.files[0]);
                            }
                          }} 
                        />
                      </label>
                    </div>
                  </div>
                )}

                <div className="h-48 bg-slate-100 relative overflow-hidden rounded-sm">
                  {gift.imageUrls && gift.imageUrls[0] ? (
                    <img src={gift.imageUrls[0]} alt={gift.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gift className="w-10 h-10 text-slate-300" />
                    </div>
                  )}
                  {isEsgotado(gift.name) && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                      <span className="bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-sm shadow-md">
                        Esgotado
                      </span>
                    </div>
                  )}
                  {isAdmin && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                       <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-black/40 px-2 py-1 rounded">Visualização Admin</span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex-grow flex flex-col text-center items-center justify-between">
                  {isEditingThis ? (
                    <form onSubmit={handleQuickUpdate} className="w-full space-y-3 py-2">
                       <input required value={editName} onChange={e => setEditName(e.target.value)} className="w-full text-xs p-2 border border-blue-200 rounded outline-none focus:ring-1 focus:ring-blue-400" placeholder="Nome" />
                       <input required type="number" step="0.01" value={editValue} onChange={e => setEditValue(e.target.value)} className="w-full text-xs p-2 border border-blue-200 rounded outline-none focus:ring-1 focus:ring-blue-400" placeholder="Valor" />
                       <input value={editMpLink} onChange={e => setEditMpLink(e.target.value)} className="w-full text-xs p-2 border border-blue-200 rounded outline-none focus:ring-1 focus:ring-blue-400" placeholder="Link Pagamento Mercado Pago" />
                       <div className="flex gap-2">
                         <button type="submit" disabled={isUpdating} className="flex-grow py-2 bg-green-600 text-white text-[10px] font-bold rounded uppercase">{isUpdating ? '...' : 'Salvar'}</button>
                         <button type="button" onClick={() => setEditingId(null)} className="py-2 px-4 bg-slate-200 text-slate-600 text-[10px] font-bold rounded uppercase">Canc</button>
                       </div>
                    </form>
                  ) : (
                    <>
                      <h3 className="font-semibold text-blue-600 text-xs tracking-wider uppercase mb-4 h-10 flex items-center justify-center leading-tight w-full px-2">{gift.name}</h3>
                      <div className="text-slate-500 mb-6 flex items-baseline justify-center gap-1">
                        <span className="text-sm font-medium">R$</span>
                        <span className="text-4xl font-light">{intPart}</span>
                        <span className="text-sm font-medium">,{decPart}</span>
                      </div>
                      {((gift as any).purchasedCount || 0) >= 2 || isEsgotado(gift.name) ? (
                        <button 
                          disabled
                          className="mt-auto block w-3/4 py-2 bg-slate-300 text-white text-sm font-medium rounded-sm shadow-sm cursor-not-allowed">
                          {isEsgotado(gift.name) ? 'Esgotado' : 'Já Presenteado'}
                        </button>
                      ) : (
                        <div className="mt-auto w-full flex flex-col items-center gap-2">
                           <button 
                            onClick={() => navigate('/pagamento-pix', { state: { gift } })}
                            className="block w-3/4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 text-sm font-medium rounded-sm transition-all shadow-sm active:scale-[0.98] cursor-pointer">
                            Presentear via Pix
                          </button>
                          {(gift as any).mercadoPagoLink ? (
                            <div className="w-full flex flex-col items-center gap-1">
                              <button 
                                onClick={() => window.open((gift as any).mercadoPagoLink, '_blank')}
                                className="block w-3/4 py-2 bg-[#0000FF] hover:bg-[#0000CC] text-white text-sm font-medium rounded-sm transition-all shadow-sm active:scale-[0.98] cursor-pointer">
                                Cartão Crédito / Débito
                              </button>
                              {isAdmin && (
                                <button 
                                  onClick={() => startEditing(gift)}
                                  className="text-[9px] text-blue-500 hover:underline font-bold uppercase tracking-tighter"
                                >
                                  Alterar Link de Pagamento
                                </button>
                              )}
                            </div>
                          ) : isAdmin ? (
                            <button 
                              onClick={() => startEditing(gift)}
                              className="block w-3/4 py-2 bg-amber-50 text-amber-600 text-[10px] font-black uppercase border border-amber-200 rounded-sm hover:bg-amber-100 transition-colors">
                              + Configurar Link Pagamento
                            </button>
                          ) : null}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function PagamentoPix() {
  const location = useLocation();
  const navigate = useNavigate();
  const gift = location.state?.gift;
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!gift) {
    return (
      <div className="p-8 text-center mt-20 w-full space-y-4">
        <p className="text-slate-600 text-lg font-light">Nenhum presente selecionado.</p>
        <button onClick={() => navigate('/presentes')} className="text-blue-400 underline font-medium cursor-pointer">Voltar para a lista</button>
      </div>
    );
  }

  const handleConfirmPurchase = async () => {
    if (((gift as any).purchasedCount || 0) >= 2 || isEsgotado(gift.name)) {
      alert("Este presente já foi esgotado ou presenteado o limite de vezes!");
      return navigate('/presentes');
    }
    
    // We only try to update if it's not a dummy ID (dummy IDs start with 'm')
    if (gift.id.startsWith('m')) {
      setConfirmed(true);
      return;
    }

    try {
      setIsConfirming(true);
      const giftRef = doc(db, 'gifts', gift.id);
      await updateDoc(giftRef, {
        purchasedCount: increment(1)
      });
      setConfirmed(true);
    } catch (e) {
      console.error(e);
      alert("Houve um erro ao confirmar ou o presente já foi presenteado por outra pessoa.");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-12 bg-white/70 backdrop-blur-md p-8 md:p-12 rounded-[3.5rem] border border-blue-100/50 shadow-sm text-center relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1.5 bg-blue-300"></div>
      
      <div className="space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mx-auto shadow-inner border border-blue-100/50">
          <Gift className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-script text-blue-400">Presentear com Pix</h2>
      </div>
      
      <div className="space-y-2">
        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Você escolheu</p>
        <p className="text-xl font-light text-slate-800 italic">{gift.name}</p>
        <p className="text-4xl font-light text-blue-400 tracking-tight">R$ {gift.value.toFixed(2)}</p>
      </div>
      
      {confirmed ? (
        <div className="space-y-6 text-center bg-white/50 p-6 rounded-[2rem] border border-green-100">
          <div className="w-12 h-12 bg-green-50 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-medium text-slate-700">Confirmado com sucesso!</h3>
          <p className="text-sm text-slate-500">Agradecemos imensamente pelo seu carinho e presente.</p>
        </div>
      ) : (
        <div className="space-y-6 text-left bg-white/50 p-6 rounded-[2rem] border border-blue-50/50">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-blue-900 font-bold mb-3 opacity-50">Chave Pix (Celular)</p>
            <div className="relative group">
              <div className="bg-slate-50 w-full py-4 rounded-2xl font-mono text-2xl font-semibold text-blue-900 tracking-widest text-center border border-blue-100 group-hover:border-blue-200 transition-colors">
                {pixPhone}
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => {
              navigator.clipboard.writeText(pixPhone);
              alert("Chave Pix copiada com sucesso!");
            }}
            className="w-full py-4 bg-blue-400 hover:bg-blue-500 text-white font-medium rounded-2xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            Copiar Chave Pix
          </button>
  
          <ul className="text-[11px] text-slate-400 space-y-2 pt-2 px-1 font-medium leading-relaxed">
            <li className="flex gap-2"><span>&bull;</span> Abra seu app do banco e escolha Pix Escanear ou Pagar.</li>
            <li className="flex gap-2"><span>&bull;</span> Use a chave celular acima e confira o valor.</li>
            <li className="flex gap-2 text-rose-400 font-bold mt-4"><span>&bull;</span> Importante: Após fazer o Pix, clique no botão abaixo para confirmar.</li>
          </ul>

          <button 
            onClick={handleConfirmPurchase}
            disabled={isConfirming}
            className="w-full py-4 mt-6 bg-rose-400 hover:bg-rose-500 text-white font-medium rounded-2xl transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {isConfirming ? 'Confirmando...' : 'Já fiz o Pix e confirmo a doação'}
          </button>
        </div>
      )}

      <div className="pt-4">
        <p className="text-sm text-blue-300 mb-8 italic font-light tracking-wide">Deus abençoe imensamente sua vida! ❤️</p>
        <button onClick={() => navigate('/presentes')} className="text-slate-400 hover:text-blue-400 transition-colors font-medium cursor-pointer flex items-center justify-center gap-2 mx-auto text-sm">
          &larr; Voltar para a lista
        </button>
      </div>
    </div>
  );
}

// --- Admin Panel ---
function AdminPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState(false);
  const navigate = useNavigate();

  const [rsvps, setRsvps] = useState<any[]>([]);
  const [gifts, setGifts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  // Gift Form
  const [giftName, setGiftName] = useState('');
  const [giftValue, setGiftValue] = useState('');
  const [mercadoPagoLink, setMercadoPagoLink] = useState('');
  const [giftFiles, setGiftFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Gift Editing
  const [editingGiftId, setEditingGiftId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editMpLink, setEditMpLink] = useState('');
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isAuthenticatedAdmin) return;
    
    // Listen RSVPs
    const qRsvp = query(collection(db, 'rsvps'), orderBy('createdAt', 'desc'));
    const unsubRsvp = onSnapshot(qRsvp, (snapshot) => {
      setRsvps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'rsvps'));

    // Listen Gifts
    const qGift = query(collection(db, 'gifts'), orderBy('createdAt', 'desc'));
    const unsubGift = onSnapshot(qGift, (snapshot) => {
      setGifts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'gifts'));

    // Listen Messages
    const qMsg = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsubMsg = onSnapshot(qMsg, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'messages'));

    return () => {
      unsubRsvp();
      unsubGift();
      unsubMsg();
    }
  }, [isAuthenticatedAdmin]);

  const logout = () => {
    navigate('/');
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 3); // max 3
      setGiftFiles(files);
    }
  };

  const handleAddGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftName || !giftValue) return;

    try {
      setIsUploading(true);
      const imageUrls: string[] = [];

      for (const file of giftFiles) {
        try {
          const base64 = await compressImage(file);
          imageUrls.push(base64);
        } catch (e) {
          console.error("Erro ao processar imagem", e);
        }
      }

      await addDoc(collection(db, 'gifts'), {
        name: giftName,
        value: parseFloat(giftValue),
        mercadoPagoLink: mercadoPagoLink,
        imageUrls: imageUrls,
        createdAt: serverTimestamp(),
        purchasedCount: 0
      });
      
      setGiftName('');
      setGiftValue('');
      setMercadoPagoLink('');
      setGiftFiles([]);
      alert('Presente adicionado!');
    } catch (error) {
      console.error(error);
      alert('Erro ao adicionar presente. Verifique se a foto não é muito grande.');
    } finally {
      setIsUploading(false);
    }
  }

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const [deletingRsvpId, setDeletingRsvpId] = useState<string | null>(null);
  const [confirmingRsvpId, setConfirmingRsvpId] = useState<string | null>(null);

  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [confirmingMessageId, setConfirmingMessageId] = useState<string | null>(null);

  const handleDeleteMessage = async (id: string) => {
    if (!id) return;

    if (confirmingMessageId !== id) {
      setConfirmingMessageId(id);
      setTimeout(() => {
        setConfirmingMessageId(prev => prev === id ? null : prev);
      }, 4000);
      return;
    }

    try {
      setDeletingMessageId(id);
      setConfirmingMessageId(null);
      const msgRef = doc(db, 'messages', id);
      await deleteDoc(msgRef);
      alert('Recado excluído!');
    } catch (error: any) {
      console.error('Erro ao excluir recado:', error);
      alert('Erro ao excluir recado: ' + error.message);
      handleFirestoreError(error, OperationType.DELETE, `messages/${id}`);
    } finally {
      setDeletingMessageId(null);
    }
  }

  const handleDeleteRsvp = async (id: string) => {
    if (!id) return;

    if (confirmingRsvpId !== id) {
      setConfirmingRsvpId(id);
      setTimeout(() => {
        setConfirmingRsvpId(prev => prev === id ? null : prev);
      }, 4000);
      return;
    }

    try {
      setDeletingRsvpId(id);
      setConfirmingRsvpId(null);
      const rsvpRef = doc(db, 'rsvps', id);
      await deleteDoc(rsvpRef);
      alert('Confirmação de presença excluída!');
    } catch (error: any) {
      console.error('Erro ao excluir presença:', error);
      alert('Erro ao excluir presença: ' + error.message);
      handleFirestoreError(error, OperationType.DELETE, `rsvps/${id}`);
    } finally {
      setDeletingRsvpId(null);
    }
  }

  const handleDeleteGift = async (id: string) => {
    if (!id) return;
    
    // Custom confirmation logic to avoid iframe window.confirm blocks
    if (confirmingId !== id) {
      setConfirmingId(id);
      // Automatically reset confirmation after 4 seconds
      setTimeout(() => {
        setConfirmingId(prev => prev === id ? null : prev);
      }, 4000);
      return;
    }

    try {
      setDeletingId(id);
      setConfirmingId(null);
      console.log('Iniciando exclusão do documento:', id);
      const giftRef = doc(db, 'gifts', id);
      await deleteDoc(giftRef);
      console.log('Documento excluído com sucesso');
      alert('Presente removido!');
    } catch (error: any) {
       console.error('Erro ao excluir:', error);
       const errorMsg = error.code === 'permission-denied' 
         ? 'Permissão negada. Verifique se você é o admin (gabrielcalid@gmail.com).' 
         : 'Erro: ' + (error.message || 'Erro desconhecido');
       alert(errorMsg);
       handleFirestoreError(error, OperationType.DELETE, `gifts/${id}`);
    } finally {
      setDeletingId(null);
    }
  }

  const handleEditGift = (gift: any) => {
    setEditingGiftId(gift.id);
    setEditName(gift.name);
    setEditValue(gift.value.toString());
    setEditMpLink(gift.mercadoPagoLink || '');
    setEditFiles([]);
  };

  const handleUpdateGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGiftId || !editName || !editValue) return;

    try {
      setIsUpdating(true);
      const giftRef = doc(db, 'gifts', editingGiftId);
      const giftDoc = await getDoc(giftRef);
      if (!giftDoc.exists()) throw new Error('Presente não encontrado');

      let imageUrls = giftDoc.data().imageUrls || [];

      if (editFiles.length > 0) {
        imageUrls = [];
        for (const file of editFiles) {
          const base64 = await compressImage(file);
          imageUrls.push(base64);
        }
      }

      await updateDoc(giftRef, {
        name: editName,
        value: parseFloat(editValue),
        mercadoPagoLink: editMpLink,
        imageUrls: imageUrls
      });

      setEditingGiftId(null);
      alert('Presente atualizado!');
    } catch (error: any) {
      console.error(error);
      alert('Erro ao atualizar presente: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 font-medium">Carregando painel...</div>
      </div>
    );
  }

  if (!isAuthenticatedAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl text-center max-w-md w-full border border-slate-100">
          <div className="w-20 h-20 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-script text-slate-800 mb-4">Senha Administrativa</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (adminPassword === 'josi2121') {
              setIsAuthenticatedAdmin(true);
            } else {
              alert('Senha incorreta.');
            }
          }}>
            <input 
              type="password"
              placeholder="Digite a senha"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-4 text-center"
              autoFocus
            />
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all cursor-pointer"
            >
              Acessar Painel
            </button>
          </form>
          <button 
            onClick={() => navigate('/')}
            className="w-full mt-4 bg-slate-50 hover:bg-slate-200 text-slate-500 font-medium py-2 px-6 rounded-xl transition-all cursor-pointer text-sm"
          >
            Voltar para o site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white text-slate-800 p-6 shadow-sm flex justify-between items-center z-10 relative border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md">
            <Lock className="w-5 h-5"/> 
          </div>
          <div>
            <h1 className="font-semibold text-slate-800 flex items-center gap-2">
              Painel Administrativo
              <span className="text-[9px] bg-green-500 text-white px-2 py-0.5 rounded-full uppercase font-black tracking-widest">Admin</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Administrador</p>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all group"
          title="Sair do painel"
        >
          <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-4 py-8 space-y-12">
        <div className="mb-4">
          <Link to="/" className="text-blue-600 hover:underline text-sm font-medium">&larr; Voltar ao site</Link>
        </div>

        {/* RSVP Table */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-medium text-slate-800">Confirmações ({rsvps.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-sm">
                <tr>
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Telefone</th>
                  <th className="px-6 py-3 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rsvps.map(rsvp => (
                  <tr key={rsvp.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">{rsvp.name}</td>
                    <td className="px-6 py-4">{rsvp.phone}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteRsvp(rsvp.id)}
                        disabled={deletingRsvpId === rsvp.id}
                        className={`p-2 rounded-xl transition-all inline-flex items-center justify-center cursor-pointer disabled:opacity-50 ${
                          confirmingRsvpId === rsvp.id 
                            ? 'bg-red-600 text-white hover:bg-red-700 font-medium text-xs px-3 py-1 shadow-sm' 
                            : 'text-slate-400 hover:text-red-500 hover:bg-slate-100'
                        }`}
                        title={confirmingRsvpId === rsvp.id ? 'Confirmar exclusão' : 'Excluir presença'}
                      >
                        {confirmingRsvpId === rsvp.id ? (
                          <span>Excluir?</span>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {rsvps.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">Nenhuma confirmação ainda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Mural de Recados Table */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-medium text-slate-800">Recados Recebidos ({messages.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-sm">
                <tr>
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">WhatsApp</th>
                  <th className="px-6 py-3 font-medium">Recado</th>
                  <th className="px-6 py-3 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {messages.map(msg => (
                  <tr key={msg.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-800">{msg.name}</td>
                    <td className="px-6 py-4 text-slate-500">{msg.phone || 'Não informado'}</td>
                    <td className="px-6 py-4 max-w-xs md:max-w-md truncate md:whitespace-normal italic text-slate-600">"{msg.text}"</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        disabled={deletingMessageId === msg.id}
                        className={`p-2 rounded-xl transition-all inline-flex items-center justify-center cursor-pointer disabled:opacity-50 ${
                          confirmingMessageId === msg.id 
                            ? 'bg-red-600 text-white hover:bg-red-700 font-medium text-xs px-3 py-1 shadow-sm' 
                            : 'text-slate-400 hover:text-red-500 hover:bg-slate-100'
                        }`}
                        title={confirmingMessageId === msg.id ? 'Confirmar exclusão' : 'Excluir recado'}
                      >
                        {confirmingMessageId === msg.id ? (
                          <span>Excluir?</span>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {messages.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Nenhum recado ainda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Images Management */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-8">
          <h2 className="text-xl font-medium text-slate-800">Gerenciar Imagens do Site</h2>
          
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Foto "Capa do Site" (Home)</h3>
              <p className="text-xs text-slate-500 mb-4">Escolha a foto principal que aparecerá na entrada do site.</p>
              <input 
                type="file" 
                accept="image/*"
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    try {
                      const base64 = await compressImage(e.target.files[0]);
                      await setDoc(doc(db, 'site_images', 'home'), { base64 });
                      alert('Foto da capa atualizada!');
                    } catch(err) {
                      alert('Erro ao atualizar. Tente uma foto menor.');
                    }
                  }
                }}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Foto "O Evento"</h3>
              <p className="text-xs text-slate-500 mb-4">Escolha uma foto para destacar o espaço "O Evento / Convite".</p>
              <input 
                type="file" 
                accept="image/*"
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    try {
                      const base64 = await compressImage(e.target.files[0]);
                      await setDoc(doc(db, 'site_images', 'evento'), { base64 });
                      alert('Foto do evento atualizada!');
                    } catch(err) {
                      alert('Erro ao atualizar. Tente uma foto menor.');
                    }
                  }
                }}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Fotos "Nossos Momentos"</h3>
              <p className="text-xs text-slate-500 mb-4">Adicione até 6 fotos para a galeria do site.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(pos => (
                  <div key={pos} className="border border-slate-200 bg-white p-3 rounded-lg flex flex-col items-center text-center gap-2">
                    <span className="text-xs font-medium text-slate-500">Espaço {pos}</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          try {
                            const base64 = await compressImage(e.target.files[0]);
                            const currentDoc = await getDoc(doc(db, 'site_images', 'galeria'));
                            const images = currentDoc.exists() ? currentDoc.data().images || {} : {};
                            images[pos] = base64;
                            await setDoc(doc(db, 'site_images', 'galeria'), { images });
                            alert(`Foto da galeria (espaço ${pos}) atualizada!`);
                          } catch(err) {
                            alert('Erro ao atualizar foto. Tente uma foto menor.');
                          }
                        }
                      }}
                      className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Gift Management */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-8">
          <h2 className="text-xl font-medium text-slate-800">Gerenciar Presentes</h2>
          
          <form onSubmit={handleAddGift} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-slate-700 mb-4">Adicionar Novo</h3>
            </div>
            <div>
              <label className="block text-sm text-slate-500 mb-1">Nome do Presente</label>
              <input required type="text" value={giftName} onChange={e => setGiftName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100" />
            </div>
            <div>
              <label className="block text-sm text-slate-500 mb-1">Valor (R$)</label>
              <input required type="number" step="0.01" min="0" value={giftValue} onChange={e => setGiftValue(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-500 mb-1">Link de Pagamento Mercado Pago (Opcional)</label>
              <input type="url" value={mercadoPagoLink} onChange={e => setMercadoPagoLink(e.target.value)} placeholder="https://link.mercadopago.com.br/..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-500 mb-1">Fotos (até 3)</label>
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleFileChange} 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50" 
              />
              {giftFiles.length > 0 && (
                <p className="text-xs text-slate-500 mt-2">{giftFiles.length} arquivo(s) selecionado(s)</p>
              )}
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button disabled={isUploading} type="submit" className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2">
                {isUploading ? 'Adicionando...' : 'Adicionar'}
              </button>
            </div>
          </form>

          <div className="divide-y divide-slate-100 pt-4">
            {gifts.map(gift => (
              <div key={gift.id} className="py-6 border-b border-slate-50 last:border-0">
                {editingGiftId === gift.id ? (
                  <form onSubmit={handleUpdateGift} className="space-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nome</label>
                        <input required type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Valor</label>
                        <input required type="number" step="0.01" value={editValue} onChange={e => setEditValue(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Link Mercado Pago</label>
                      <input type="url" value={editMpLink} onChange={e => setEditMpLink(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Alterar Fotos (Opcional)</label>
                      <input type="file" multiple accept="image/*" onChange={e => e.target.files && setEditFiles(Array.from(e.target.files))} className="w-full text-xs" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setEditingGiftId(null)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 cursor-pointer">Cancelar</button>
                      <button type="submit" disabled={isUpdating} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50">
                        {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {gift.imageUrls && gift.imageUrls[0] ? (
                         <img src={gift.imageUrls[0]} alt="" className="w-16 h-16 rounded-xl object-cover shadow-sm border border-white" />
                      ): (
                        <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 border-dashed">
                          <Gift className="w-8 h-8" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-800">{gift.name}</p>
                        <p className="text-sm text-blue-600 font-medium">R$ {gift.value.toFixed(2)}</p>
                        {gift.mercadoPagoLink && (
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle size={10} className="text-green-500" />
                            <span className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">Link MP Ativo</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditGift(gift)}
                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteGift(gift.id)} 
                        disabled={deletingId === gift.id}
                        className={`px-4 py-2 rounded-lg transition-all text-sm font-medium cursor-pointer disabled:opacity-50 ${
                          confirmingId === gift.id 
                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-md transform scale-105' 
                            : 'text-red-500 hover:bg-red-50'
                        }`}
                      >
                        {deletingId === gift.id ? 'Excluindo...' : confirmingId === gift.id ? 'Certeza?' : 'Excluir'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SharedLayout />}>
        <Route index element={<Inicio />} />
        <Route path="sobre" element={<Historia />} />
        <Route path="casamento" element={<Casamento />} />
        <Route path="fotos" element={<Fotos />} />
        <Route path="recados" element={<Recados />} />
        <Route path="confirmacao" element={<Confirmacao />} />
        <Route path="presentes" element={<Presentes />} />
        <Route path="pagamento-pix" element={<PagamentoPix />} />
      </Route>
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  );
}
