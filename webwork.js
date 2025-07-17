import React, { useState, useEffect, useCallback } from 'react';
import { Cpu, Newspaper, BrainCircuit, BookOpen, Home, ArrowRight, Rss, Zap, Sparkles, X, LoaderCircle } from 'lucide-react';

// --- Particle Background Component ---
const ParticleBackground = () => {
    useEffect(() => {
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particles = [];
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 1.5 + 1;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
                this.color = `rgba(0, 255, 255, ${Math.random() * 0.5 + 0.2})`;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.size > 0.1) this.size -= 0.01;
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        let animationFrameId;
        const initParticles = () => {
            const particleCount = Math.floor((canvas.width * canvas.height) / 10000);
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
            }
        };

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                if (particles[i].size <= 0.1) {
                    particles.splice(i, 1);
                    i--;
                    particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
                }
            }
            animationFrameId = requestAnimationFrame(animateParticles);
        };
        
        initParticles();
        animateParticles();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        }
    }, []);

    return <canvas id="particle-canvas" className="absolute top-0 left-0 w-full h-full z-0 opacity-50"></canvas>;
};


// --- Mock Data ---
const newsData = [
    { id: 1, title: "DeepMind's New Model Achieves Unprecedented Protein Folding Accuracy", source: "Nature", date: "2025-07-16", url: "https://www.nature.com/", snippet: "The latest iteration of AlphaFold demonstrates a significant leap in predicting complex protein structures, paving the way for new drug discoveries.", tags: ['AI', 'Biotech'] },
    { id: 2, title: "Boston Dynamics Unveils 'Guardian', a Robotic Dog for Industrial Inspection", source: "Boston Dynamics", date: "2025-07-15", url: "https://bostondynamics.com/", snippet: "The Guardian model is equipped with advanced thermal and acoustic sensors for autonomous monitoring of hazardous industrial environments.", tags: ['Robotics', 'Hardware'] },
    { id: 3, title: "OpenAI Announces GPT-5 with Advanced Multimodal Reasoning", source: "OpenAI Blog", date: "2025-07-14", url: "https://openai.com/blog/", snippet: "The next-gen language model can interpret and reason about video, audio, and complex diagrams simultaneously.", tags: ['AI', 'LLM'] },
    { id: 4, title: "The Rise of Swarm Robotics in Precision Agriculture", source: "IEEE Spectrum", date: "2025-07-13", url: "https://spectrum.ieee.org/", snippet: "Small, autonomous drones are now working in coordinated swarms to monitor crop health and optimize resource usage with remarkable efficiency.", tags: ['Robotics', 'Agriculture'] },
    { id: 5, title: "Tesla's Optimus Gen 2 Shows Off New Dexterous Hand Movements", source: "Tesla AI Day", date: "2025-07-11", url: "https://www.tesla.com/ai", snippet: "A new video demonstrates the humanoid robot delicately handling fragile objects, a major milestone for general-purpose robotics.", tags: ['Robotics', 'Hardware', 'Humanoid'] },
    { id: 6, title: "Ethical AI: New Framework Proposed for Auditing Autonomous Systems", source: "MIT Technology Review", date: "2025-07-10", url: "https://www.technologyreview.com/", snippet: "Researchers propose a standardized framework to ensure AI systems in critical sectors like healthcare and finance are fair, transparent, and accountable.", tags: ['AI', 'Ethics'] }
];

const resourcesData = {
    "Core AI & Machine Learning": [
        { id: 1, title: "Machine Learning by Andrew Ng", type: "Online Course", platform: "Coursera", url: "https://www.coursera.org/learn/machine-learning" },
        { id: 2, title: "Deep Learning Specialization", type: "Online Course", platform: "Coursera", url: "https://www.coursera.org/specializations/deep-learning" },
        { id: 3, title: "Pattern Recognition and Machine Learning", type: "Book", author: "C. Bishop", url: "#" },
    ],
    "Robotics": [
        { id: 6, title: "Robotics: Modelling, Planning and Control", type: "Book", author: "B. Siciliano", url: "#" },
        { id: 7, title: "ROS (Robot Operating System) Tutorials", type: "Documentation", platform: "ROS.org", url: "http://wiki.ros.org/ROS/Tutorials" },
        { id: 8, title: "Modern Robotics Specialization", type: "Online Course", platform: "Coursera", url: "https://www.coursera.org/specializations/modernrobotics" },
    ],
    "Advanced Topics": [
        { id: 10, title: "Reinforcement Learning: An Introduction", type: "Book", author: "Sutton & Barto", url: "http://incompleteideas.net/book/the-book-2nd.html" },
        { id: 11, title: "Computer Vision: Algorithms and Applications", type: "Book", author: "R. Szeliski", url: "http://szeliski.org/Book/" },
        { id: 12, "title": "Natural Language Processing with Transformers", "type": "Book", "author": "L. Tunstall", "url": "#" },
    ]
};

// --- Gemini API Helper ---
const callGeminiAPI = async (prompt, isJson = false) => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        ...(isJson && {
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                }
            }
        })
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            console.error("Unexpected API response structure:", result);
            throw new Error("Invalid response structure from Gemini API.");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
};


// --- Components ---

const Modal = ({ title, content, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn" onClick={onClose}>
        <div className="bg-slate-800 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-2xl p-6 m-4 relative" onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center"><Sparkles size={20} className="mr-2"/> {title}</h2>
            <div className="text-slate-300 max-h-[60vh] overflow-y-auto pr-2">{content}</div>
        </div>
    </div>
);


const NavItem = ({ icon: Icon, label, onClick, isActive }) => (
    <button onClick={onClick} className={`flex items-center w-full px-4 py-3 text-left transition-all duration-300 ease-in-out group ${isActive ? 'bg-cyan-400/10 text-cyan-300 border-r-4 border-cyan-400' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}>
        <Icon className={`w-6 h-6 mr-4 transition-transform duration-300 ${isActive ? 'scale-110 text-cyan-300' : 'group-hover:scale-110 text-white'}`} />
        <span className="font-medium">{label}</span>
    </button>
);

const Sidebar = ({ currentPage, setCurrentPage }) => (
    <aside className="w-64 bg-slate-900/70 backdrop-blur-lg border-r border-slate-700/50 flex flex-col fixed h-full z-20">
        <div className="flex items-center justify-center h-20 border-b border-slate-700/50"><Cpu className="w-8 h-8 text-cyan-400 animate-pulse" /><h1 className="ml-3 text-xl font-bold text-white tracking-wider">AI & Robotics Hub</h1></div>
        <nav className="flex-grow mt-6 space-y-2">
            <NavItem icon={Home} label="Dashboard" onClick={() => setCurrentPage('dashboard')} isActive={currentPage === 'dashboard'} />
            <NavItem icon={Newspaper} label="Latest News" onClick={() => setCurrentPage('news')} isActive={currentPage === 'news'} />
            <NavItem icon={BookOpen} label="Learning Resources" onClick={() => setCurrentPage('resources')} isActive={currentPage === 'resources'} />
        </nav>
        <div className="p-4 border-t border-slate-700/50 text-slate-500 text-xs">
            <p>&copy; 2025 AI & Robotics Hub. All rights reserved.</p>
        </div>
    </aside>
);

const Dashboard = ({ setCurrentPage, trendingTopics }) => (
    <div className="p-8 md:p-12 animate-fadeIn">
        <div className="relative overflow-hidden rounded-2xl bg-slate-800/50 p-10 border border-slate-700/50 shadow-2xl shadow-cyan-500/10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.15)_0%,_transparent_60%)] animate-pulse-slow"></div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 relative">The Future is <span className="text-cyan-400">Now</span>.</h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mb-8 relative">Welcome to your central hub for breakthroughs in AI and Robotics. Explore real-time news and access AI-powered learning paths.</p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setCurrentPage('news')} className="flex items-center justify-center px-6 py-3 font-semibold text-white bg-cyan-500 rounded-lg shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105">Explore News <Newspaper className="w-5 h-5 ml-2" /></button>
                <button onClick={() => setCurrentPage('resources')} className="flex items-center justify-center px-6 py-3 font-semibold text-white bg-slate-700 rounded-lg hover:bg-slate-600 transition-all duration-300 transform hover:scale-105">Start Learning <ArrowRight className="w-5 h-5 ml-2" /></button>
            </div>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                <div className="flex items-center mb-4"><Rss className="w-6 h-6 text-cyan-400" /><h2 className="ml-3 text-2xl font-bold text-white">Live News Feed</h2></div>
                <ul className="space-y-3">
                    {newsData.slice(0, 4).map(item => (
                        <li key={item.id} className="text-slate-300 hover:text-cyan-400 transition-colors duration-200"><a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-start"><ArrowRight className="w-4 h-4 mr-2 mt-1.5 flex-shrink-0" /><span>{item.title}</span></a></li>
                    ))}
                </ul>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                <div className="flex items-center mb-4"><Zap className="w-6 h-6 text-cyan-400" /><h2 className="ml-3 text-2xl font-bold text-white">Trending Topics</h2></div>
                <div className="flex flex-wrap gap-2">
                    {trendingTopics.length > 0 ? trendingTopics.map(topic => (
                        <span key={topic} className="px-3 py-1 bg-cyan-400/10 text-cyan-300 text-sm font-medium rounded-full cursor-pointer hover:bg-cyan-400/20 transition-colors">{topic}</span>
                    )) : <p className="text-sm text-slate-400">✨ Analyzing trends...</p>}
                </div>
            </div>
        </div>
    </div>
);

const NewsPage = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [modalContent, setModalContent] = useState(null);
    const [isSummarizing, setIsSummarizing] = useState(null);

    const filters = ['All', 'AI', 'Robotics', 'Hardware', 'Ethics'];
    const filteredNews = activeFilter === 'All' ? newsData : newsData.filter(item => item.tags.includes(activeFilter));

    const handleSummarize = async (article) => {
        setIsSummarizing(article.id);
        try {
            const prompt = `Summarize the following news article in a single, concise sentence. Title: "${article.title}". Snippet: "${article.snippet}"`;
            const summary = await callGeminiAPI(prompt);
            setModalContent({ title: "✨ AI Summary", content: <p>{summary}</p> });
        } catch (error) {
            setModalContent({ title: "Error", content: <p>Could not generate summary. Please try again later.</p> });
        } finally {
            setIsSummarizing(null);
        }
    };

    return (
        <>
            {modalContent && <Modal title={modalContent.title} content={modalContent.content} onClose={() => setModalContent(null)} />}
            <div className="p-8 md:p-12 animate-fadeIn">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
                    <div className="flex items-center mb-4 md:mb-0"><Newspaper className="w-8 h-8 text-cyan-400" /><h1 className="ml-4 text-4xl font-bold text-white">Latest News</h1></div>
                    <div className="flex items-center gap-2 p-1 bg-slate-800/60 border border-slate-700 rounded-lg">
                        {filters.map(filter => (
                            <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeFilter === filter ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700/50'}`}>{filter}</button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredNews.map((item, index) => (
                        <div key={item.id} style={{ animationDelay: `${index * 100}ms` }} className="animate-fadeInUp">
                            <NewsCard article={item} onSummarize={handleSummarize} isSummarizing={isSummarizing === item.id} />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

const NewsCard = ({ article, onSummarize, isSummarizing }) => (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 transition-all duration-300 hover:border-cyan-400/50 hover:scale-[1.02] hover:bg-slate-800/80 group h-full flex flex-col">
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="p-6 flex-grow">
            <div className="flex gap-2 mb-3">
                {article.tags.map(tag => <span key={tag} className="text-xs font-semibold text-cyan-300 bg-cyan-900/50 px-2 py-0.5 rounded-full">{tag}</span>)}
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300">{article.title}</h3>
            <p className="text-slate-400 mb-4 text-sm leading-relaxed">{article.snippet}</p>
        </a>
        <div className="px-6 pb-4 flex flex-col gap-3">
             <button onClick={() => onSummarize(article)} disabled={isSummarizing} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-cyan-500/10 text-cyan-300 rounded-lg hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {isSummarizing ? <LoaderCircle size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isSummarizing ? 'Summarizing...' : '✨ Summarize with AI'}
            </button>
            <div className="flex justify-between items-center text-xs text-slate-500 pt-3 border-t border-slate-700/50">
                <span>Source: <span className="font-semibold text-slate-400">{article.source}</span></span>
                <span>{article.date}</span>
            </div>
        </div>
    </div>
);

const ResourceCard = ({ title, type, platform, author, url }) => (
    <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex flex-col justify-between h-full transition-all duration-300 hover:border-cyan-400/50 hover:scale-[1.02] hover:bg-slate-800/80">
        <div>
            <span className="text-xs font-semibold uppercase text-cyan-400 tracking-wider">{type}</span>
            <h3 className="text-lg font-bold text-white mt-2 mb-2">{title}</h3>
            <p className="text-sm text-slate-400 mb-4">{platform && `Platform: ${platform}`}{author && `Author: ${author}`}</p>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-block mt-auto px-4 py-2 text-center font-semibold text-sm bg-slate-700 text-white rounded-lg hover:bg-cyan-500 transition-colors duration-300">Go to Resource</a>
    </div>
);

const ResourcesPage = () => {
    const [goal, setGoal] = useState('');
    const [modalContent, setModalContent] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGeneratePath = async () => {
        if (!goal.trim()) return;
        setIsGenerating(true);
        try {
            const resourcesList = Object.entries(resourcesData).map(([category, items]) => 
                `${category}:\n${items.map(item => `- ${item.title} (${item.type})`).join('\n')}`
            ).join('\n\n');
            
            const prompt = `As an expert tutor in AI and Robotics, create a simple, step-by-step learning path for a student with the goal: "${goal}". Use the following list of available resources. Recommend a sequence of 2-4 resources from the list and briefly explain why each one is a good next step. If a resource is not on the list, suggest what kind of topic they should search for. Keep the language encouraging and clear.\n\nAvailable Resources:\n${resourcesList}`;
            
            const path = await callGeminiAPI(prompt);
            const formattedPath = <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: path.replace(/\n/g, '<br />') }} />;
            setModalContent({ title: "✨ Your Custom Learning Path", content: formattedPath });
        } catch (error) {
            setModalContent({ title: "Error", content: <p>Could not generate learning path. Please try again later.</p> });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            {modalContent && <Modal title={modalContent.title} content={modalContent.content} onClose={() => setModalContent(null)} />}
            <div className="p-8 md:p-12 animate-fadeIn">
                <div className="flex items-center mb-8"><BookOpen className="w-8 h-8 text-cyan-400" /><h1 className="ml-4 text-4xl font-bold text-white">Learning Resources</h1></div>
                
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 mb-12">
                    <h2 className="text-2xl font-bold text-white mb-3 flex items-center"><Sparkles size={20} className="text-cyan-400 mr-3" /> ✨ AI Learning Path Generator</h2>
                    <p className="text-slate-400 mb-4">Describe your learning goal, and our AI will create a personalized study plan for you.</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g., 'Get started with computer vision'" className="flex-grow bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
                        <button onClick={handleGeneratePath} disabled={isGenerating} className="flex items-center justify-center px-6 py-2 font-semibold text-white bg-cyan-500 rounded-lg shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            {isGenerating ? <LoaderCircle size={20} className="animate-spin" /> : 'Generate Path'}
                        </button>
                    </div>
                </div>

                <div className="space-y-12">
                    {Object.entries(resourcesData).map(([category, items]) => (
                        <section key={category}>
                            <div className="flex items-center mb-6"><BrainCircuit className="w-6 h-6 text-cyan-400/80" /><h2 className="ml-3 text-2xl font-semibold text-white">{category}</h2></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.map(item => <ResourceCard key={item.id} {...item} />)}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </>
    );
};

const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-slate-900 flex justify-center items-center z-50">
        <div className="flex flex-col items-center">
            <Cpu className="w-16 h-16 text-cyan-400 animate-spin" style={{animationDuration: '2s'}}/>
            <p className="text-white text-lg mt-4 tracking-widest">INITIALIZING INTERFACE...</p>
        </div>
    </div>
);

export default function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(true);
    const [trendingTopics, setTrendingTopics] = useState([]);

    const fetchTrendingTopics = useCallback(async () => {
        try {
            const titles = newsData.map(n => n.title).join(', ');
            const prompt = `From the following list of tech news headlines, identify the 6 most important and distinct technical concepts or topics. Return them as a JSON array of strings. Headlines: ${titles}`;
            const topicsJson = await callGeminiAPI(prompt, true);
            const topics = JSON.parse(topicsJson);
            setTrendingTopics(topics);
        } catch (error) {
            console.error("Failed to fetch dynamic trending topics:", error);
            // Fallback to static topics on error
            setTrendingTopics(["AGI", "Reinforcement Learning", "Humanoid Robots", "Generative AI", "Neural Networks", "SLAM"]);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
            fetchTrendingTopics();
        }, 1500); 
        return () => clearTimeout(timer);
    }, [fetchTrendingTopics]);

    const renderPage = () => {
        switch (currentPage) {
            case 'news': return <NewsPage />;
            case 'resources': return <ResourcesPage />;
            case 'dashboard': default: return <Dashboard setCurrentPage={setCurrentPage} trendingTopics={trendingTopics} />;
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-slate-900 min-h-screen text-slate-200 font-sans">
            <ParticleBackground />
            <div className="relative z-10 flex">
                <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
                <main className="flex-1 ml-64">
                    {renderPage()}
                </main>
            </div>
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                body { font-family: 'Inter', sans-serif; background-color: #0f172a; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.5s ease-in-out forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeInUp { animation: fadeInUp 0.5s ease-in-out forwards; opacity: 0; }
                @keyframes pulse-slow { 0%, 100% { transform: scale(1); opacity: 0.1; } 50% { transform: scale(1.5); opacity: 0.05; } }
                .animate-pulse-slow { animation: pulse-slow 8s infinite ease-in-out; }
            `}</style>
        </div>
    );
}
