// ===== HO'OPONOPONO APP - SCRIPT COMPLETO E FUNCIONAL =====

// Desabilitar console em produção
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.log = console.warn = console.error = console.info = console.debug = () => {};
    document.body.setAttribute('data-production', 'true');
}

// Sistema de persistência usando localStorage com fallback para memória
const StorageManager = {
    KEYS: {
        MODULES: 'hooponopono_modules',
        AUDIOS: 'hooponopono_audios',
        DIARY: 'hooponopono_diary',
        USER: 'hooponopono_user'
    },

    save(key, data) {
        try {
            const serialized = JSON.stringify(data);
            if (typeof Storage !== "undefined") {
                localStorage.setItem(key, serialized);
            } else {
                this.memoryStorage = this.memoryStorage || {};
                this.memoryStorage[key] = data;
            }
            return true;
        } catch (error) {
            this.memoryStorage = this.memoryStorage || {};
            this.memoryStorage[key] = data;
            return false;
        }
    },

    load(key, defaultValue = null) {
        try {
            if (typeof Storage !== "undefined") {
                const item = localStorage.getItem(key);
                if (item) {
                    return JSON.parse(item);
                }
            }
            
            if (this.memoryStorage && this.memoryStorage[key]) {
                return this.memoryStorage[key];
            }
        } catch (error) {
            // Fallback silencioso
        }
        
        return defaultValue;
    },

    remove(key) {
        try {
            if (typeof Storage !== "undefined") {
                localStorage.removeItem(key);
            }
            if (this.memoryStorage) {
                delete this.memoryStorage[key];
            }
        } catch (error) {
            // Silencioso
        }
    }
};

// Sistema de notificações toast
const ToastManager = {
    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    },

    success(message) {
        this.show(message, 'success');
    },

    error(message) {
        this.show(message, 'error');
    }
};

// ===== VARIÁVEIS GLOBAIS =====
let userName = '';
let currentPage = 1;
let totalPages = 1;
let diaryEntries = [];
let selectedImage = null;
let postId = 0;
let isAdmin = false;
let cliquesSecretos = 0;
let tempoUltimoClique = 0;

// Configuração do Admin
const ADMIN_PASSWORD = '31536000';
const ADMIN_USERNAME = 'Rita Mattos';

// Variáveis para o editor
let moduloAtualEditor = null;
let paginaAtualEditor = 0;
let elementosContador = 0;
let audiosPersonalizados = [];
let audioAtualTocando = null;

// Conteúdo dos módulos (agora persistente)
let modules = {};

// ===== FUNÇÃO PRINCIPAL CORRIGIDA =====
function entrarApp() {
    console.log('🚀 Função entrarApp chamada');
    
    try {
        const nomeInput = document.getElementById('name');
        const splash = document.getElementById('splash');
        const main = document.getElementById('main');
        const welcome = document.getElementById('welcome');
        
        // Verificar se os elementos existem
        if (!nomeInput || !splash || !main) {
            console.error('❌ Elementos não encontrados');
            alert('Erro: Elementos da página não encontrados!');
            return;
        }
        
        const nome = nomeInput.value.trim();
        if (!nome) {
            alert('Por favor, digite seu nome antes de continuar! 📝');
            nomeInput.focus();
            return;
        }
        
        console.log('✅ Nome válido, iniciando app...');
        
        // Definir userName
        userName = nome;
        
        // Salvar usuário
        StorageManager.save(StorageManager.KEYS.USER, { nome, lastLogin: new Date().toISOString() });
        
        // Atualizar welcome
        if (welcome) {
            welcome.textContent = `Bem-vindo, ${nome}`;
        }
        
        // Esconder splash e mostrar main
        splash.style.display = 'none';
        main.style.display = 'block';
        
        // Carregar dados na interface
        try {
            if (typeof carregarModulosNaInterface === 'function') {
                carregarModulosNaInterface();
            }
            if (typeof carregarAudiosNaInterface === 'function') {
                carregarAudiosNaInterface();
            }
            if (typeof atualizarDiario === 'function') {
                atualizarDiario();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
        }
        
        console.log('✅ App iniciado com sucesso!');
        
        // Mostrar toast de sucesso
        if (typeof ToastManager !== 'undefined') {
            ToastManager.success(`Bem-vindo, ${nome}! 🌺`);
        }
        
    } catch (error) {
        console.error('❌ Erro na função entrarApp:', error);
        alert('Erro ao iniciar o app: ' + error.message);
    }
}

// TORNAR FUNÇÃO GLOBAL IMEDIATAMENTE
window.entrarApp = entrarApp;
// ===== INICIALIZAÇÃO =====
async function inicializarDadosPadrao() {
    const modulosPadrao = {
        1: {
            title: "Módulo 1: Descobrindo o Ho'oponopono",
            description: "Introdução à prática havaiana - 9 páginas",
            pages: [
                {
                    title: "🌺 Aloha! Bem-vindo",
                    content: `<p style="line-height: 1.8; font-size: 1.1em;">Você está prestes a descobrir uma antiga prática havaiana que tem o poder de transformar sua vida através do perdão, gratidão e amor.</p><div style="text-align: center; margin-top: 40px;"><p style="font-size: 1.3em; color: #10b981;">"A paz começa comigo"</p></div>`
                },
                {
                    title: "As 4 Frases Sagradas",
                    content: `<div style="background: rgba(139, 92, 246, 0.2); padding: 30px; border-radius: 15px; text-align: center;"><p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">Sinto muito</p><p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">Me perdoe</p><p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">Te amo</p><p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">Sou grato</p></div>`
                },
                {
                    title: "Como Praticar",
                    content: `<p style="line-height: 1.8; font-size: 1.1em;">Simplesmente repita as quatro frases sempre que surgir um problema, conflito ou memória dolorosa.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 20px;">Não precisa entender, apenas confie no processo.</p>`
                },
                {
                    title: "A Origem do Ho'oponopono",
                    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">Uma Sabedoria Ancestral</h3><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono é uma antiga prática havaiana de reconciliação e perdão que significa "corrigir" ou "tornar certo".</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Esta técnica sagrada foi usada por gerações para resolver conflitos familiares e comunitários, restaurando a harmonia através do amor incondicional.</p>`
                },
                {
                    title: "Dr. Ihaleakala Hew Len",
                    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">O Mestre Moderno</h3><p style="line-height: 1.8; font-size: 1.1em;">O Dr. Hew Len tornou o Ho'oponopono conhecido mundialmente após curar um hospital psiquiátrico inteiro usando apenas esta técnica.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ele nunca viu os pacientes pessoalmente - apenas estudou seus prontuários e aplicou Ho'oponopono em si mesmo.</p><div style="text-align: center; margin-top: 30px; font-style: italic; color: #10b981;">"O problema não está neles, está em mim"</div>`
                },
                {
                    title: "100% de Responsabilidade",
                    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">O Conceito Fundamental</h3><p style="line-height: 1.8; font-size: 1.1em;">No Ho'oponopono, você é 100% responsável por tudo que aparece em sua realidade.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Isso não significa culpa, mas sim o poder de transformar qualquer situação através da limpeza interior.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin-top: 20px; text-align: center;"><p style="font-size: 1.2em; color: #10b981;">"Se você quer mudar o mundo, comece por você mesmo"</p></div>`
                },
                {
                    title: "Memórias e Programas",
                    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">Limpando o Subconsciente</h3><p style="line-height: 1.8; font-size: 1.1em;">Nossas memórias e programas subconscientes criam nossa realidade atual.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">O Ho'oponopono limpa essas memórias, permitindo que a Inteligência Divina flua livremente através de nós.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando limpamos uma memória em nós, ela é automaticamente limpa em todos que compartilham essa mesma memória.</p>`
                },
                {
                    title: "A Prática Diária",
                    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">Vivendo Ho'oponopono</h3><p style="line-height: 1.8; font-size: 1.1em;">Pratique as 4 frases sempre que:</p><ul style="margin: 15px 0; padding-left: 20px; line-height: 1.8;"><li>Surgir um conflito ou problema</li><li>Sentir raiva, medo ou tristeza</li><li>Julgar alguém ou algo</li><li>Quiser limpar memórias antigas</li><li>Desejar paz e harmonia</li></ul><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Lembre-se: você está limpando para si mesmo, não para os outros.</p>`
                },
                {
                    title: "Seu Compromisso",
                    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🙏 Assumindo a Jornada</h3><p style="line-height: 1.8; font-size: 1.1em;">Você está pronto para assumir 100% de responsabilidade por sua vida?</p><div style="background: rgba(139, 92, 246, 0.2); padding: 30px; border-radius: 15px; text-align: center; margin: 20px 0;"><p style="font-size: 1.3em; color: #10b981; margin-bottom: 20px;">"Eu me comprometo a praticar Ho'oponopono diariamente"</p><p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">Sinto muito</p><p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">Me perdoe</p><p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">Te amo</p><p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">Sou grato</p></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center; color: #a78bfa;">Parabéns! Você completou o Módulo 1! 🌺</p>`
               },
                {  
                    title: "Os Três Selves Havaianos",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🧠 Unihipili - Subconsciente</h3><p style="line-height: 1.8; font-size: 1.1em;">A criança interior que guarda todas as memórias e emoções. É quem sente dor e precisa de cura.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">💭 Uhane - Mente Consciente</h3><p style="line-height: 1.8; font-size: 1.1em;">A parte racional que analisa e julga. Muitas vezes cria mais problemas tentando resolver.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">✨ Aumakua - Eu Superior</h3><p style="line-height: 1.8; font-size: 1.1em;">A conexão divina que tudo sabe e pode curar. Só age quando pedimos perdão.</p><div style="text-align: center; margin-top: 30px; color: #10b981; font-style: italic;">"A cura acontece quando os três selves estão alinhados"</div>`
},
{
    title: "Zero State - Estado Zero",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌟 O Estado de Vazio Divino</h3><p style="line-height: 1.8; font-size: 1.1em;">Zero State é quando você está livre de memórias e programas. Neste estado, a Inteligência Divina flui perfeitamente através de você.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Aqui não há passado nem futuro, apenas o momento presente em total paz e conexão.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="font-size: 1.4em; color: #10b981;">∅</p><p style="color: #e9d5ff; margin-top: 10px;">"No Zero State, você É a solução"</p></div><p style="line-height: 1.8; font-size: 1.1em;">O objetivo do Ho'oponopono é retornar constantemente a este estado sagrado.</p>`
},
{
    title: "Inspiração vs Memórias",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💡 Duas Fontes de Ação</h3><p style="line-height: 1.8; font-size: 1.1em;"><strong style="color: #10b981;">Inspiração Divina:</strong> Vem do Zero State. Ações perfeitas, sem esforço, no momento certo.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;"><strong style="color: #ef4444;">Memórias Reativas:</strong> Vem do passado. Repetição de padrões antigos e limitantes.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">✅ <strong>Sinais de Inspiração:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Paz interior mesmo em situações difíceis</li><li>Soluções aparecem naturalmente</li><li>Sincronicidades constantes</li><li>Ações fluem sem resistência</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono limpa as memórias para que a inspiração possa fluir.</p>`
},
{
    title: "Ferramentas de Limpeza",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🧹 Além das 4 Frases</h3><p style="line-height: 1.8; font-size: 1.1em;">Dr. Hew Len ensinou várias ferramentas para diferentes situações:</p><div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 15px;"><strong style="color: #8b5cf6;">🍓 Morangos Azuis:</strong> Para limpeza profunda de traumas</p><p style="font-size: 1.1em; margin-bottom: 15px;"><strong style="color: #10b981;">💧 Água de Ha:</strong> Para purificação e bênçãos</p><p style="font-size: 1.1em; margin-bottom: 15px;"><strong style="color: #f59e0b;">☀️ Luz Solar:</strong> Para energizar e iluminar</p><p style="font-size: 1.1em;"><strong style="color: #ef4444;">❤️ "Eu te amo":</strong> A ferramenta mais poderosa</p></div><p style="line-height: 1.8; font-size: 1.1em;">Use a ferramenta que sentir inspiração para usar em cada momento.</p>`
},
{
    title: "Limpeza Financeira",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💰 Ho'oponopono e Prosperidade</h3><p style="line-height: 1.8; font-size: 1.1em;">Problemas financeiros são memórias de escassez, medo e limitação que podem ser limpas.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="font-size: 1.2em; color: #10b981; margin-bottom: 15px;">"Sinto muito pelas memórias de escassez em mim"</p><p style="font-size: 1.2em; color: #10b981; margin-bottom: 15px;">"Me perdoe por criar limitação"</p><p style="font-size: 1.2em; color: #10b981; margin-bottom: 15px;">"Te amo, abundância divina"</p><p style="font-size: 1.2em; color: #10b981;">"Sou grato pela prosperidade que flui"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você limpa as memórias de limitação, a abundância natural do universo pode fluir através de você.</p>`
},
{
    title: "Relacionamentos e Ho'oponopono",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💕 Curando Conexões</h3><p style="line-height: 1.8; font-size: 1.1em;">Conflitos nos relacionamentos são espelhos de memórias internas que precisam ser limpas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa as memórias em você, automaticamente limpa na outra pessoa também.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong>✨ Prática para Relacionamentos:</strong></p><ol style="padding-left: 20px; line-height: 1.6;"><li>Quando alguém te irritar, agradeça pelo espelho</li><li>Aplique as 4 frases em você mesmo</li><li>Não tente mudar a outra pessoa</li><li>Confie que a limpeza funcionará</li></ol></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center; color: #10b981; font-style: italic;">"O que eu vejo no outro, existe em mim"</p>`
},
{
    title: "Saúde e Cura Interior",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌿 Corpo como Espelho da Alma</h3><p style="line-height: 1.8; font-size: 1.1em;">Doenças e sintomas físicos podem ser manifestações de memórias emocionais não resolvidas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">O Ho'oponopono não substitui tratamento médico, mas pode ajudar na cura emocional que suporta a cura física.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 25px; border-radius: 15px; margin: 25px 0;"><p style="font-size: 1.1em; text-align: center; margin-bottom: 15px;"><strong>🙏 Oração de Cura:</strong></p><p style="color: #10b981; text-align: center; line-height: 1.6;">"Divindade, sinto muito pelas memórias em mim que criaram este desequilíbrio. Me perdoe. Te amo. Sou grato pela perfeita saúde que és."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Lembre-se: você não é responsável por causar a doença, mas pode se responsabilizar por limpar as memórias relacionadas.</p>`
},
{
    title: "Ho'oponopono no Trabalho",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💼 Transformando o Ambiente Profissional</h3><p style="line-height: 1.8; font-size: 1.1em;">Aplique Ho'oponopono silenciosamente em reuniões, conflitos e desafios profissionais.</p><div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 15px;"><strong>📋 Situações Práticas:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li><strong>Chefe irritado:</strong> "Sinto muito pela raiva que vejo em mim"</li><li><strong>Colega difícil:</strong> "Me perdoe por julgar"</li><li><strong>Projeto fracassando:</strong> "Te amo, situação perfeita"</li><li><strong>Estresse geral:</strong> "Sou grato pela paz que sou"</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Ninguém precisa saber que você está praticando. A limpeza acontece em silêncio e transforma todo o ambiente.</p>`
},
{
    title: "Criando com a Divindade",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎨 Manifestação através do Zero State</h3><p style="line-height: 1.8; font-size: 1.1em;">No Ho'oponopono, não tentamos manifestar com a mente. Limpamos as memórias e permitimos que a Divindade crie através de nós.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 25px; border-radius: 15px; margin: 25px 0;"><p style="font-size: 1.1em; text-align: center; margin-bottom: 15px;"><strong>🌟 Processo de Criação Divina:</strong></p><ol style="padding-left: 20px; line-height: 1.6;"><li>Identifique o desejo ou problema</li><li>Aplique Ho'oponopono nas memórias relacionadas</li><li>Chegue ao Zero State (vazio/paz)</li><li>Permita que a inspiração divina guie as ações</li><li>Agradeça pela perfeição em manifestação</li></ol></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center; color: #10b981; font-style: italic;">"Eu não sei, mas a Divindade sabe e age através de mim"</p>`
},
{
    title: "Perdoando o Imperdoável",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💔 Curando Feridas Profundas</h3><p style="line-height: 1.8; font-size: 1.1em;">Para traumas e mágoas muito profundas, o Ho'oponopono oferece um caminho suave de cura.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você não precisa perdoar com força de vontade. Apenas limpe as memórias e permita que o perdão aconteça naturalmente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; margin: 25px 0;"><p style="font-size: 1.1em; text-align: center; margin-bottom: 15px;"><strong>🌸 Para Traumas Profundos:</strong></p><p style="color: #10b981; text-align: center; line-height: 1.8;">"Sinto muito pela dor que carrego.<br>Me perdoe por manter essa memória viva.<br>Te amo, criança ferida em mim.<br>Sou grato pela cura que já está acontecendo."</p></div><p style="line-height: 1.8; font-size: 1.1em;">O perdão verdadeiro é um presente da Divindade, não um esforço pessoal.</p>`
},
{
    title: "Vivendo em Gratidão Constante",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🙏 O Poder Transformador do Obrigado</h3><p style="line-height: 1.8; font-size: 1.1em;">Gratidão é a frequência mais alta do Ho'oponopono. Quando você agradece, automaticamente se alinha com a abundância divina.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 25px; border-radius: 15px; margin: 25px 0;"><p style="font-size: 1.1em; margin-bottom: 15px;"><strong>✨ Gratidão Diária:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Agradeça ao despertar por estar vivo</li><li>Agradeça pelos problemas que te fazem crescer</li><li>Agradeça pelas pessoas difíceis que te ensinam</li><li>Agradeça pela oportunidade de limpar memórias</li><li>Agradeça por ser um instrumento da Divindade</li></ul></div><div style="text-align: center; margin-top: 30px;"><p style="font-size: 1.4em; color: #10b981; margin-bottom: 10px;">🌺 MAHALO 🌺</p><p style="color: #a78bfa; font-style: italic;">(Obrigado em havaiano - "Que haja respeito mútuo")</p></div>`
},
{
    title: "Seu Novo Começo",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌅 Tornando-se um Praticante</h3><p style="line-height: 1.8; font-size: 1.1em;">Parabéns! Você concluiu uma jornada profunda de 20 páginas sobre Ho'oponopono. Agora você possui as ferramentas para transformar sua vida.</p><div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(16, 185, 129, 0.3)); padding: 30px; border-radius: 20px; text-align: center; margin: 30px 0;"><p style="font-size: 1.3em; color: #ffffff; margin-bottom: 20px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🌟 CERTIFICADO DE CONCLUSÃO 🌟</p><p style="font-size: 1.1em; color: #e9d5ff; margin-bottom: 20px;">Você é agora um praticante de Ho'oponopono</p><p style="font-size: 1.5em; margin: 15px 0; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Sinto muito</p><p style="font-size: 1.5em; margin: 15px 0; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Me perdoe</p><p style="font-size: 1.5em; margin: 15px 0; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Te amo</p><p style="font-size: 1.5em; margin: 15px 0; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Sou grato</p></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center; color: #10b981;">Continue praticando diariamente. O mundo precisa de mais paz, e você é o instrumento! 🌺</p>`
                }
            ]
        },
        2: {
          title: "Módulo 2: A Ciência da Responsabilidade",
    description: "100% de responsabilidade",
    pages: [
        {
            title: "🌟 Bem-vindo ao Módulo 2",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🚀 Aprofundando Sua Jornada</h3><p style="line-height: 1.8; font-size: 1.1em;">Agora que você conhece as 4 frases sagradas, vamos mergulhar mais profundo na filosofia do Ho'oponopono.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 15px; text-align: center; margin: 20px 0;"><p style="font-size: 1.2em; color: #10b981;">"Quando você assume 100% de responsabilidade,</p><p style="font-size: 1.2em; color: #10b981;">você ganha 100% do poder"</p></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center; color: #c4b5fd; font-style: italic;">Prepare-se para descobrir o verdadeiro poder da responsabilidade total! 🌺</p>`
        },
        {
            title: "🔬 A Base Científica",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🧬 Ho'oponopono e a Ciência</h3><p style="line-height: 1.8; font-size: 1.1em;">Pesquisas modernas confirmam o que os antigos havaianos já sabiam: nossa mente tem poder direto sobre a realidade.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #10b981;">🔬 Evidências:</strong></p><p style="margin: 5px 0;">• Neuroplasticidade cerebral</p><p style="margin: 5px 0;">• Influência quântica do observador</p><p style="margin: 5px 0;">• Epigenética emocional</p></div><p style="line-height: 1.8; font-size: 1.1em;">O Ho'oponopono trabalha com estes princípios científicos naturalmente.</p>`
        },
        {
            title: "⚖️ Responsabilidade vs Culpa",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎭 A Grande Diferença</h3><p style="line-height: 1.8; font-size: 1.1em;">Responsabilidade Total não significa que você causou tudo. Significa que você pode limpar tudo.</p><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;"><div style="background: rgba(239, 68, 68, 0.2); padding: 15px; border-radius: 10px;"><h4 style="color: #ef4444; margin-bottom: 8px;">❌ Culpa</h4><p style="font-size: 0.9em;">• Paralisa</p><p style="font-size: 0.9em;">• Vitimiza</p><p style="font-size: 0.9em;">• Aponta dedos</p></div><div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 10px;"><h4 style="color: #10b981; margin-bottom: 8px;">✅ Responsabilidade</h4><p style="font-size: 0.9em;">• Empodera</p><p style="font-size: 0.9em;">• Transforma</p><p style="font-size: 0.9em;">• Assume o poder</p></div></div>`
        },
        {
            title: "🧠 Como Funciona a Mente",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🗺️ O Mapa Mental</h3><p style="line-height: 1.8; font-size: 1.1em;">Entenda como pensamentos e memórias criam sua realidade.</p><div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 15px; margin: 20px 0; text-align: center;"><p style="color: #8b5cf6; margin: 8px 0;">🎭 Memórias Inconscientes</p><p style="color: #c4b5fd;">↓</p><p style="color: #f59e0b; margin: 8px 0;">💭 Pensamentos Automáticos</p><p style="color: #c4b5fd;">↓</p><p style="color: #ef4444; margin: 8px 0;">😰 Emoções Reativas</p><p style="color: #c4b5fd;">↓</p><p style="color: #10b981; margin: 8px 0;">🌍 Realidade Externa</p></div><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono limpa na origem!</p>`
        },
        {
            title: "🌊 O Oceano de Memórias",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌊 Mergulhando no Inconsciente</h3><p style="line-height: 1.8; font-size: 1.1em;">Carregamos milhões de memórias que influenciam nossa vida sem percebermos.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #10b981;">🧬 Tipos de Memórias:</strong></p><p style="margin: 5px 0;">• Ancestrais (dos antepassados)</p><p style="margin: 5px 0;">• Familiares (da infância)</p><p style="margin: 5px 0;">• Pessoais (desta vida)</p><p style="margin: 5px 0;">• Coletivas (da humanidade)</p></div><p style="line-height: 1.8; font-size: 1.1em;">A boa notícia: você pode limpar todas!</p>`
        },
        {
            title: "🔍 Identificando Memórias Ativas",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🚨 Sinais de Alerta</h3><p style="line-height: 1.8; font-size: 1.1em;">Certas situações "disparam" memórias antigas. Aprenda a reconhecê-las.</p><div style="background: rgba(239, 68, 68, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #ef4444;">🚨 Memórias Ativas:</strong></p><p style="margin: 5px 0;">• Reações emocionais intensas</p><p style="margin: 5px 0;">• Pensamentos obsessivos</p><p style="margin: 5px 0;">• Padrões que se repetem</p><p style="margin: 5px 0;">• Pessoas que sempre irritam</p></div><div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 10px; text-align: center;"><p style="color: #10b981;"><strong>"Se te incomoda, é memória para limpar"</strong></p></div>`
        },
        {
            title: "🔄 O Ciclo das Memórias",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌀 Quebrando Padrões</h3><p style="line-height: 1.8; font-size: 1.1em;">Memórias não limpas criam ciclos que se repetem até serem liberadas.</p><div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 15px; margin: 20px 0; text-align: center;"><p style="color: #ef4444; margin: 5px 0;">Situação Trigger</p><p style="color: #c4b5fd;">↓</p><p style="color: #f59e0b; margin: 5px 0;">Memória Ativada</p><p style="color: #c4b5fd;">↓</p><p style="color: #8b5cf6; margin: 5px 0;">Reação Emocional</p><p style="color: #c4b5fd;">↓</p><p style="color: #10b981; margin: 5px 0;">Resultado que Confirma</p></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center; color: #10b981; font-style: italic;">Ho'oponopono quebra este ciclo!</p>`
        },
        {
            title: "⚡ Tipos de Limpeza",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">✨ Instantânea vs Gradual</h3><p style="line-height: 1.8; font-size: 1.1em;">Algumas memórias se dissolvem rapidamente, outras precisam de mais tempo. Ambos são perfeitos.</p><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;"><div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 10px;"><h4 style="color: #10b981; margin-bottom: 8px;">⚡ Instantânea</h4><p style="font-size: 0.9em;">• Alívio imediato</p><p style="font-size: 0.9em;">• Mudança súbita</p><p style="font-size: 0.9em;">• Leveza total</p></div><div style="background: rgba(139, 92, 246, 0.2); padding: 15px; border-radius: 10px;"><h4 style="color: #8b5cf6; margin-bottom: 8px;">🌱 Gradual</h4><p style="font-size: 0.9em;">• Por camadas</p><p style="font-size: 0.9em;">• Melhora progressiva</p><p style="font-size: 0.9em;">• Cura profunda</p></div></div><p style="line-height: 1.8; font-size: 1.1em;">Confie no timing divino!</p>`
        },
        {
            title: "💎 A Regra de Ouro",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌟 O Princípio Fundamental</h3><p style="line-height: 1.8; font-size: 1.1em;">Existe uma regra simples que transforma sua vida quando aplicada consistentemente.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="font-size: 1.3em; color: #10b981; margin-bottom: 15px;"><strong>💎 REGRA DE OURO</strong></p><p style="font-size: 1.2em; color: #e9d5ff;">"Tudo que aparece na sua vida</p><p style="font-size: 1.2em; color: #e9d5ff;">é uma oportunidade de limpeza"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Problemas = Presentes disfarçados</p><p style="line-height: 1.8; font-size: 1.1em;">Conflitos = Espelhos para cura</p>`
        },
        {
            title: "🎨 Personalizando as Frases",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎭 Adaptando para Situações</h3><p style="line-height: 1.8; font-size: 1.1em;">Você pode adaptar as 4 frases mantendo a essência para situações específicas.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #10b981;">💰 Para Dinheiro:</strong></p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Sinto muito pelas memórias de escassez"</p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Me perdoe por limitar abundância"</p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Te amo, prosperidade infinita"</p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Sou grato pela abundância"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Nas próximas páginas, veremos mais exemplos!</p>`
        },
        {
            title: "🚶‍♀️ Ho'oponopono em Movimento",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌀 Praticando em Ação</h3><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono não é apenas sentado. Pode ser feito caminhando, trabalhando, vivendo!</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #10b981;">🌟 Práticas Dinâmicas:</strong></p><p style="margin: 5px 0;">• Caminhando: frases com os passos</p><p style="margin: 5px 0;">• Respirando: uma frase por respiração</p><p style="margin: 5px 0;">• Trabalhando: mentalmente durante tarefas</p><p style="margin: 5px 0;">• Esperando: em filas e trânsito</p></div><div style="text-align: center; margin-top: 20px;"><p style="color: #10b981; font-style: italic;">"Transforme cada momento em limpeza"</p></div>`
        },
        {
            title: "😊 Ho'oponopono e Emoções",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎭 Limpando Estados Emocionais</h3><p style="line-height: 1.8; font-size: 1.1em;">Cada emoção carrega informações sobre memórias. Use-as como guia, não resista.</p><div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong>🎭 Emoções como Mestras:</strong></p><p style="color: #ef4444; margin: 3px 0;"><strong>😠 Raiva:</strong> Memórias de injustiça</p><p style="color: #f59e0b; margin: 3px 0;"><strong>😰 Medo:</strong> Memórias de perigo</p><p style="color: #8b5cf6; margin: 3px 0;"><strong>😢 Tristeza:</strong> Memórias de perda</p><p style="color: #ef4444; margin: 3px 0;"><strong>😤 Frustração:</strong> Memórias de impotência</p></div><div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 10px; text-align: center;"><p style="color: #10b981;">Sinta → Aceite → Ho'oponopono → Deixe ir</p></div>`
        },
        {
            title: "💔 Limpeza de Traumas",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌸 Curando Feridas Profundas</h3><p style="line-height: 1.8; font-size: 1.1em;">Para traumas profundos, use abordagem suave. O Ho'oponopono pode curar até feridas ancestrais.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #8b5cf6;">🌸 Para Traumas:</strong></p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Sinto muito pela dor que carrego"</p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Me perdoe por manter ferida viva"</p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Te amo, criança ferida em mim"</p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Sou grato pela cura que começou"</p></div><p style="line-height: 1.8; font-size: 1.1em; color: #10b981;">Seja gentil e paciente consigo mesmo 💚</p>`
        },
        {
            title: "💰 Limpeza Financeira",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💎 Bloqueios de Abundância</h3><p style="line-height: 1.8; font-size: 1.1em;">Dificuldades financeiras refletem memórias de escassez e desvalorização.</p><div style="background: rgba(239, 68, 68, 0.2); padding: 15px; border-radius: 10px; margin: 15px 0;"><p style="font-size: 1.1em; margin-bottom: 8px;"><strong style="color: #ef4444;">💸 Memórias Limitantes:</strong></p><p style="font-size: 0.9em; margin: 3px 0;">• "Dinheiro é sujo"</p><p style="font-size: 0.9em; margin: 3px 0;">• "Não mereço abundância"</p><p style="font-size: 0.9em; margin: 3px 0;">• "Só ricos ficam ricos"</p></div><div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 10px; text-align: center;"><p style="color: #10b981; margin: 3px 0;">Ao pagar contas: "Te amo, dinheiro que circula"</p><p style="color: #10b981; margin: 3px 0;">Vendo preços: "Me perdoe por limitar prosperidade"</p></div>`
        },
        {
            title: "💕 Relacionamentos",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👥 Curando Conexões</h3><p style="line-height: 1.8; font-size: 1.1em;">Conflitos relacionais são espelhos de memórias internas. Cure-se e cure a relação.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 15px; border-radius: 10px; margin: 15px 0;"><p style="font-size: 1.1em; margin-bottom: 8px;"><strong style="color: #8b5cf6;">💔 Padrões para Limpar:</strong></p><p style="font-size: 0.9em; margin: 3px 0;">• Codependência → Memórias de abandono</p><p style="font-size: 0.9em; margin: 3px 0;">• Ciúme → Memórias de traição</p><p style="font-size: 0.9em; margin: 3px 0;">• Controle → Memórias de insegurança</p></div><div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 10px;"><p style="color: #10b981; text-align: center;"><strong>💖 Prática:</strong></p><p style="color: #e9d5ff; text-align: center; font-size: 0.95em;">Pessoa irrita = agradeça pelo espelho e limpe</p></div>`
        },
        {
            title: "🌿 Saúde e Cura",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌿 Corpo como Espelho</h3><p style="line-height: 1.8; font-size: 1.1em;">Sintomas físicos podem ser manifestações de memórias emocionais não resolvidas.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; text-align: center; margin-bottom: 10px;"><strong>🙏 Oração de Cura:</strong></p><p style="color: #e9d5ff; text-align: center; font-size: 0.95em; margin: 3px 0;">"Sinto muito pelas memórias que criaram</p><p style="color: #e9d5ff; text-align: center; font-size: 0.95em; margin: 3px 0;">este desequilíbrio. Me perdoe."</p><p style="color: #e9d5ff; text-align: center; font-size: 0.95em; margin: 3px 0;">"Te amo. Sou grato pela perfeita</p><p style="color: #e9d5ff; text-align: center; font-size: 0.95em; margin: 3px 0;">saúde que és, Divindade."</p></div><p style="line-height: 1.8; font-size: 1.1em;">⚠️ Ho'oponopono complementa, nunca substitui tratamento médico.</p>`
        },
        {
            title: "💼 Ho'oponopono no Trabalho",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💼 Transformando o Ambiente</h3><p style="line-height: 1.8; font-size: 1.1em;">Aplique silenciosamente em reuniões, conflitos e desafios profissionais.</p><div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong>📋 Situações Práticas:</strong></p><p style="margin: 3px 0;"><strong>Chefe irritado:</strong> "Sinto muito pela raiva em mim"</p><p style="margin: 3px 0;"><strong>Colega difícil:</strong> "Me perdoe por julgar"</p><p style="margin: 3px 0;"><strong>Projeto complicado:</strong> "Te amo, solução perfeita"</p><p style="margin: 3px 0;"><strong>Estresse:</strong> "Sou grato pela paz"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Ninguém precisa saber. A limpeza é silenciosa e transforma tudo! ✨</p>`
        },
        {
            title: "🎨 Criando com a Divindade",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌟 Manifestação Divina</h3><p style="line-height: 1.8; font-size: 1.1em;">No Ho'oponopono, não tentamos manifestar com a mente. Limpamos e deixamos a Divindade criar.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #10b981;">🌟 Processo Divino:</strong></p><p style="margin: 3px 0;">1. Identifique desejo/problema</p><p style="margin: 3px 0;">2. Aplique Ho'oponopono</p><p style="margin: 3px 0;">3. Chegue ao Zero State</p><p style="margin: 3px 0;">4. Siga a inspiração divina</p><p style="margin: 3px 0;">5. Agradeça pela perfeição</p></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center; color: #10b981; font-style: italic;">"Eu não sei, mas a Divindade sabe"</p>`
        },
        {
            title: "💔 Perdoando o Imperdoável",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💎 Cura de Feridas Profundas</h3><p style="line-height: 1.8; font-size: 1.1em;">Para traumas e mágoas muito profundas, Ho'oponopono oferece um caminho suave.</p><p style="line-height: 1.8; font-size: 1.1em;">Você não precisa perdoar à força. Apenas limpe e deixe o perdão acontecer naturalmente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="color: #e9d5ff; text-align: center; font-size: 0.95em; margin: 5px 0;">"Sinto muito pela dor que carrego"</p><p style="color: #e9d5ff; text-align: center; font-size: 0.95em; margin: 5px 0;">"Me perdoe por manter essa memória viva"</p><p style="color: #e9d5ff; text-align: center; font-size: 0.95em; margin: 5px 0;">"Te amo, criança ferida em mim"</p><p style="color: #e9d5ff; text-align: center; font-size: 0.95em; margin: 5px 0;">"Sou grato pela cura que já começou"</p></div><p style="line-height: 1.8; font-size: 1.1em;">O perdão verdadeiro é um presente da Divindade, não esforço pessoal.</p>`
        },
        {
            title: "🙏 Gratidão Constante",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌟 O Poder do Obrigado</h3><p style="line-height: 1.8; font-size: 1.1em;">Gratidão é a frequência mais alta do Ho'oponopono. Quando agradece, se alinha com abundância divina.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #10b981;">✨ Gratidão Diária:</strong></p><p style="margin: 3px 0;">• Ao despertar: por estar vivo</p><p style="margin: 3px 0;">• Pelos problemas: que fazem crescer</p><p style="margin: 3px 0;">• Pelas pessoas difíceis: que ensinam</p><p style="margin: 3px 0;">• Pela oportunidade: de limpar memórias</p></div>            <div style="text-align: center; margin-top: 20px;"><p style="font-size: 1.2em; color: #10b981;">🌺 MAHALO 🌺</p><p style="color: #a78bfa; font-style: italic;">(Obrigado em havaiano)</p></div>`
        },
        {
            title: "🌅 Rotina Matinal",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌅 Começando o Dia Limpo</h3><p style="line-height: 1.8; font-size: 1.1em;">Como você começa o dia determina a qualidade de tudo que vem depois.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #10b981;">☀️ Rotina Sugerida:</strong></p><p style="margin: 5px 0;"><strong>1.</strong> Ao despertar: "Sou grato por este novo dia"</p><p style="margin: 5px 0;"><strong>2.</strong> No banho: Deixe a água levar as memórias</p><p style="margin: 5px 0;"><strong>3.</strong> No café: "Te amo, dia perfeito"</p><p style="margin: 5px 0;"><strong>4.</strong> Antes de sair: "Me perdoe por qualquer erro"</p></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center; color: #10b981; font-style: italic;">Inicie cada dia em Zero State!</p>`
        },
        {
            title: "🌙 Rotina Noturna",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌙 Limpando o Dia</h3><p style="line-height: 1.8; font-size: 1.1em;">Antes de dormir, limpe tudo que aconteceu durante o dia para não levar memórias para o sonho.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #8b5cf6;">🌙 Limpeza Noturna:</strong></p><p style="margin: 5px 0;"><strong>1.</strong> Revise o dia mentalmente</p><p style="margin: 5px 0;"><strong>2.</strong> Para cada situação difícil: Ho'oponopono</p><p style="margin: 5px 0;"><strong>3.</strong> Agradeça pelas lições</p><p style="margin: 5px 0;"><strong>4.</strong> Durma em paz e gratidão</p></div><div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 10px; text-align: center;"><p style="color: #10b981;">"Sinto muito, me perdoe, te amo, sou grato por tudo hoje"</p></div>`
        },
        {
            title: "🚗 Ho'oponopono no Trânsito",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🚗 Transformando o Estresse</h3><p style="line-height: 1.8; font-size: 1.1em;">Trânsito é uma oportunidade perfeita para limpeza. Transforme irritação em paz.</p><div style="background: rgba(239, 68, 68, 0.2); padding: 15px; border-radius: 10px; margin: 15px 0;"><p style="font-size: 1.1em; margin-bottom: 8px;"><strong style="color: #ef4444;">🚨 Situações Comuns:</strong></p><p style="font-size: 0.9em; margin: 3px 0;">• Trânsito parado</p><p style="font-size: 0.9em; margin: 3px 0;">• Motorista imprudente</p><p style="font-size: 0.9em; margin: 3px 0;">• Atraso para compromisso</p></div><div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 10px;"><p style="color: #10b981; text-align: center; margin: 3px 0;">Parado: "Sou grato por este tempo para limpar"</p><p style="color: #10b981; text-align: center; margin: 3px 0;">Irritado: "Me perdoe pela impaciência em mim"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Chegue aos destinos em paz! 🕊️</p>`
        },
        {
            title: "🍽️ Limpeza Durante Refeições",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🍽️ Alimentando Corpo e Alma</h3><p style="line-height: 1.8; font-size: 1.1em;">Refeições são momentos sagrados. Limpe a comida e a si mesmo enquanto se alimenta.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #10b981;">🍽️ Prática Alimentar:</strong></p><p style="margin: 5px 0;"><strong>Antes:</strong> "Te amo, alimento sagrado"</p><p style="margin: 5px 0;"><strong>Durante:</strong> Coma conscientemente</p><p style="margin: 5px 0;"><strong>Mastigando:</strong> "Sou grato pela nutrição"</p><p style="margin: 5px 0;"><strong>Depois:</strong> "Me perdoe por qualquer desperdício"</p></div><p style="line-height: 1.8; font-size: 1.1em;">A comida absorve suas intenções e vibração! Abençoe tudo que entra no seu corpo. 🙏</p>`
        },
        {
            title: "💻 Ho'oponopono Digital",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💻 Limpando o Mundo Virtual</h3><p style="line-height: 1.8; font-size: 1.1em;">Redes sociais e tecnologia também podem ser campos de limpeza e transformação.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 15px; border-radius: 10px; margin: 15px 0;"><p style="font-size: 1.1em; margin-bottom: 8px;"><strong style="color: #8b5cf6;">📱 Momentos Digitais:</strong></p><p style="font-size: 0.9em; margin: 3px 0;">• Post irritante: "Sinto muito pelo julgamento"</p><p style="font-size: 0.9em; margin: 3px 0;">• Notícia ruim: "Me perdoe por atrair isso"</p><p style="font-size: 0.9em; margin: 3px 0;">• Tecnologia lenta: "Te amo, paciência"</p></div><div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 10px; text-align: center;"><p style="color: #10b981;">Antes de postar: "Que isso traga paz ao mundo"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Seja um farol de luz no mundo digital! ✨</p>`
        },
        {
            title: "🏠 Limpeza do Ambiente",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🏠 Purificando Espaços</h3><p style="line-height: 1.8; font-size: 1.1em;">Ambientes absorvem energia. Use Ho'oponopono para limpar casas, escritórios e qualquer lugar.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #10b981;">🏡 Limpeza Espacial:</strong></p><p style="margin: 5px 0;"><strong>Entrando:</strong> "Sou grato por este espaço sagrado"</p><p style="margin: 5px 0;"><strong>Limpando:</strong> "Te amo, harmonia perfeita"</p><p style="margin: 5px 0;"><strong>Organizando:</strong> "Me perdoe por qualquer bagunça"</p><p style="margin: 5px 0;"><strong>Saindo:</strong> "Sinto muito, que a paz permaneça"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Sua casa reflete seu estado interno. Limpe dentro, limpe fora! 🏡</p>`
        },
        {
            title: "🌍 Ho'oponopono Global",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌍 Curando o Planeta</h3><p style="line-height: 1.8; font-size: 1.1em;">Você pode usar Ho'oponopono para situações mundiais: guerras, pandemias, crises ambientais.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #8b5cf6;">🌍 Para o Mundo:</strong></p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Sinto muito pelas memórias de guerra"</p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Me perdoe por contribuir com o ódio"</p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Te amo, Terra sagrada"</p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Sou grato pela paz mundial"</p></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center; color: #10b981; font-style: italic;">Cada pessoa que se cura, cura o mundo inteiro! 🌏</p>`
        },
        {
            title: "👶 Ho'oponopono com Crianças",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👶 Pequenos Mestres</h3><p style="line-height: 1.8; font-size: 1.1em;">Crianças são naturalmente próximas ao Zero State. Elas podem ensinar muito sobre amor incondicional.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 10px; margin: 15px 0;"><p style="font-size: 1.1em; margin-bottom: 8px;"><strong style="color: #10b981;">👶 Com Crianças Difíceis:</strong></p><p style="font-size: 0.9em; margin: 3px 0;">• Birra: "Sinto muito pela frustração em mim"</p><p style="font-size: 0.9em; margin: 3px 0;">• Desobediência: "Me perdoe por criar resistência"</p><p style="font-size: 0.9em; margin: 3px 0;">• Agressividade: "Te amo, paz interior"</p></div><div style="background: rgba(139, 92, 246, 0.2); padding: 15px; border-radius: 10px; text-align: center;"><p style="color: #8b5cf6;">Ensine pelo exemplo: crianças sentem sua vibração</p></div><p style="line-height: 1.8; font-size: 1.1em;">Elas nos mostram o que precisa ser curado! 🌟</p>`
        },
        {
            title: "🌟 Sinais de Progresso",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">✨ Como Saber que Está Funcionando</h3><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono funciona mesmo quando não vemos resultados imediatos. Aprenda a reconhecer os sinais.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #10b981;">🌟 Sinais de Limpeza:</strong></p><p style="margin: 3px 0;">• Mais paz nas situações difíceis</p><p style="margin: 3px 0;">• Sincronicidades aumentando</p><p style="margin: 3px 0;">• Pessoas reagindo melhor a você</p><p style="margin: 3px 0;">• Soluções aparecendo naturalmente</p><p style="margin: 3px 0;">• Menos reatividade emocional</p></div><p style="line-height: 1.8; font-size: 1.1em;">Confie no processo, mesmo sem ver resultados externos imediatos! 🙏</p>`
        },
        {
            title: "🎓 Sua Jornada Continua",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🚀 Próximos Passos</h3><p style="line-height: 1.8; font-size: 1.1em;">Parabéns! Você completou o Módulo 2 e agora entende profundamente a ciência da responsabilidade total.</p><div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(16, 185, 129, 0.3)); padding: 25px; border-radius: 20px; text-align: center; margin: 25px 0;"><p style="font-size: 1.2em; color: #ffffff; margin-bottom: 15px;">🏆 MÓDULO 2 COMPLETO 🏆</p><p style="font-size: 1.1em; color: #e9d5ff; margin-bottom: 15px;">Você agora é um praticante avançado</p><div style="margin: 15px 0;"><p style="font-size: 1.1em; margin: 5px 0; color: #ffffff;">Sinto muito</p><p style="font-size: 1.1em; margin: 5px 0; color: #ffffff;">Me perdoe</p><p style="font-size: 1.1em; margin: 5px 0; color: #ffffff;">Te amo</p><p style="font-size: 1.1em; margin: 5px 0; color: #ffffff;">Sou grato</p></div></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center; color: #10b981;">Continue praticando! O Módulo 3 te espera! 🌺</p>`
        }
    ]
}
};        

    modules = modulosPadrao;
    audiosPersonalizados = [];
    diaryEntries = StorageManager.load(StorageManager.KEYS.DIARY, []);
}

// ===== SISTEMA DE ACESSO ADMIN =====
function contarCliquesSecretos() {
    const agora = Date.now();
    
    if (agora - tempoUltimoClique > 3000) {
        cliquesSecretos = 0;
    }
    
    cliquesSecretos++;
    tempoUltimoClique = agora;
    
    const logo = document.getElementById('logoSecret');
    if (logo) {
        logo.style.transform = 'scale(1.1)';
        setTimeout(() => {
            logo.style.transform = 'scale(1)';
        }, 150);
    }
    
    if (cliquesSecretos >= 5) {
        const botaoAdmin = document.getElementById('botaoAdminSecreto');
        if (botaoAdmin) {
            botaoAdmin.style.display = 'block';
            botaoAdmin.style.opacity = '0';
            botaoAdmin.style.transform = 'scale(0.5)';
            botaoAdmin.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                botaoAdmin.style.opacity = '1';
                botaoAdmin.style.transform = 'scale(1)';
            }, 100);
            
            ToastManager.success('🔐 Acesso Admin Desbloqueado!');
        }
        
        cliquesSecretos = 0;
    }
}

// ===== CARREGAR MÓDULOS NA INTERFACE =====
function carregarModulosNaInterface() {
    const container = document.getElementById('modulesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.entries(modules).forEach(([id, module]) => {
        const card = document.createElement('div');
        card.className = 'module-card';
        card.onclick = () => abrirModulo(parseInt(id));
        
        card.innerHTML = `
            <div class="module-number">${id}</div>
            <h3 style="color: #e9d5ff; margin-bottom: 10px; font-size: clamp(1.1em, 4vw, 1.3em);">${module.title}</h3>
            <p style="color: #c4b5fd; font-size: clamp(0.9em, 3vw, 1em);">${module.description}</p>
            <p style="color: #86efac; margin-top: 10px; font-size: clamp(0.8em, 2.5vw, 0.9em);">✨ ${module.pages.length} página${module.pages.length !== 1 ? 's' : ''}</p>
        `;
        
        container.appendChild(card);
    });
}

// ===== CARREGAR ÁUDIOS NA INTERFACE =====
function carregarAudiosNaInterface() {
    const audioGrid = document.getElementById('audioGrid');
    const mensagem = document.getElementById('mensagemSemAudios');
    
    if (!audioGrid || !mensagem) return;
    
    if (audiosPersonalizados.length === 0) {
        mensagem.style.display = 'block';
        const audiosAntigos = audioGrid.querySelectorAll('[id^="audio-container-"]');
        audiosAntigos.forEach(audio => audio.remove());
    } else {
        mensagem.style.display = 'none';
        const audiosAntigos = audioGrid.querySelectorAll('[id^="audio-container-"]');
        audiosAntigos.forEach(audio => audio.remove());
        
        audiosPersonalizados.forEach(audioData => {
            criarElementoAudio(audioData);
        });
    }
}
// ===== FUNÇÕES ADMIN =====
function abrirLoginAdmin() {
    const loginModal = document.getElementById('loginAdmin');
    if (loginModal) {
        loginModal.style.display = 'flex';
    }
}

function fecharLoginAdmin() {
    const loginModal = document.getElementById('loginAdmin');
    if (loginModal) {
        loginModal.style.display = 'none';
        document.getElementById('adminUser').value = '';
        document.getElementById('adminPass').value = '';
    }
}

function fazerLoginAdmin() {
    const user = document.getElementById('adminUser').value.trim();
    const pass = document.getElementById('adminPass').value.trim();
    
    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
        isAdmin = true;
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('userLevel').textContent = 'Nível: Administrador';
        fecharLoginAdmin();
        
        if (document.getElementById('main').style.display === 'none' || !document.getElementById('main').style.display) {
            userName = user;
            document.getElementById('welcome').textContent = `Bem-vindo, ${user}`;
            document.getElementById('splash').style.display = 'none';
            document.getElementById('main').style.display = 'block';
            carregarModulosNaInterface();
            carregarAudiosNaInterface();
            atualizarDiario();
        }
        
        ToastManager.success('Login admin realizado com sucesso! 🔐');
    } else {
        ToastManager.error('Credenciais inválidas! ❌');
    }
}

function logoutAdminSimples() {
    // Parar qualquer áudio tocando
    if (audioAtualTocando) {
        try {
            if (audioAtualTocando.pause) audioAtualTocando.pause();
            if (audioAtualTocando.source && audioAtualTocando.source.stop) audioAtualTocando.source.stop();
        } catch (e) {}
        audioAtualTocando = null;
    }
    
    // Resetar variáveis
    isAdmin = false;
    userName = '';
    
    // Voltar para tela inicial
    document.getElementById('main').style.display = 'none';
    document.getElementById('splash').style.display = 'flex';
    
    // Limpar campos
    document.getElementById('name').value = '';
    document.getElementById('welcome').textContent = 'Bem-vindo';
    document.getElementById('userLevel').textContent = 'Nível: Iniciante';
    
    // Esconder painéis admin
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('painelAdmin').style.display = 'none';
    document.getElementById('botaoAdminSecreto').style.display = 'none';
    
    // Recarregar áudios sem botões de excluir
    carregarAudiosNaInterface();
    
    ToastManager.success('Logout admin realizado! 👤');
}

function abrirPainelAdmin() {
    if (isAdmin) {
        document.getElementById('painelAdmin').style.display = 'block';
        carregarSeletorModulos();
        atualizarEstatisticas();
    } else {
        ToastManager.error('Acesso negado! Faça login como admin primeiro.');
    }
}

function fecharPainelAdmin() {
    document.getElementById('painelAdmin').style.display = 'none';
}

function carregarSeletorModulos() {
    const seletor = document.getElementById('seletorModulo');
    if (!seletor) return;
    
    seletor.innerHTML = '<option value="">Selecione um módulo para editar</option>';
    
    Object.entries(modules).forEach(([id, module]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = module.title;
        seletor.appendChild(option);
    });
}

function atualizarEstatisticas() {
    const statModulos = document.getElementById('statModulos');
    const statPaginas = document.getElementById('statPaginas');
    const statAudios = document.getElementById('statAudios');
    
    if (statModulos) statModulos.textContent = Object.keys(modules).length;
    
    if (statPaginas) {
        let totalPaginas = 0;
        Object.values(modules).forEach(mod => {
            totalPaginas += mod.pages.length;
        });
        statPaginas.textContent = totalPaginas;
    }
    
    if (statAudios) statAudios.textContent = audiosPersonalizados.length;
}

// ===== CRIAR NOVO MÓDULO =====
function criarNovoModulo() {
    const titulo = document.getElementById('novoModuloTitulo').value.trim();
    const descricao = document.getElementById('novoModuloDescricao').value.trim();
    
    if (!titulo || !descricao) {
        ToastManager.error('Digite o título e a descrição do módulo!');
        return;
    }
    
    const novoId = Math.max(...Object.keys(modules).map(k => parseInt(k)), 0) + 1;
    modules[novoId] = {
        title: titulo,
        description: descricao,
        pages: [
            {
                title: "Página Inicial",
                content: `<p style="line-height: 1.8; font-size: 1.1em;">${descricao}</p>`
            }
        ]
    };
    
    // Salvar e atualizar IMEDIATAMENTE
    StorageManager.save(StorageManager.KEYS.MODULES, modules);
    carregarModulosNaInterface();
    carregarSeletorModulos();
    atualizarEstatisticas();
    
    document.getElementById('novoModuloTitulo').value = '';
    document.getElementById('novoModuloDescricao').value = '';
    
    ToastManager.success('Módulo criado com sucesso! ✅ Disponível para todos os usuários!');
}

function carregarModuloEditor() {
    const moduloId = document.getElementById('seletorModulo').value;
    if (!moduloId) {
        document.getElementById('editorPaginas').style.display = 'none';
        return;
    }
    
    moduloAtualEditor = moduloId;
    document.getElementById('editorPaginas').style.display = 'block';
    atualizarListaPaginas();
}

function atualizarListaPaginas() {
    const modulo = modules[moduloAtualEditor];
    const lista = document.getElementById('listaPaginas');
    
    lista.innerHTML = modulo.pages.map((page, index) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: clamp(8px, 2vw, 10px); margin-bottom: 5px; background: rgba(0,0,0,0.3); border-radius: 5px; gap: 10px;">
            <span style="color: white; font-size: clamp(12px, 3vw, 14px); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis;">Página ${index + 1}: ${page.title}</span>
            <button style="background: #8b5cf6; color: white; border: none; padding: clamp(4px, 1vw, 5px) clamp(8px, 2vw, 10px); border-radius: 3px; cursor: pointer; font-size: clamp(11px, 2.5vw, 13px); min-height: 32px; white-space: nowrap;" onclick="editarPagina(${index})">Editar</button>
        </div>
    `).join('');
}

// ===== EDITOR DE PÁGINAS =====
function editarPagina(index) {
    paginaAtualEditor = index;
    const modulo = modules[moduloAtualEditor];
    const pagina = modulo.pages[index];
    
    document.getElementById('editorPaginaAtual').style.display = 'block';
    document.getElementById('numeroPaginaAtual').textContent = index + 1;
    document.getElementById('tituloPagina').value = pagina.title;
    
    const areaConteudo = document.getElementById('areaConteudo');
    areaConteudo.innerHTML = '';
    elementosContador = 0;
    
    // Se há conteúdo, extrair e criar campos editáveis
    if (pagina.content && pagina.content.trim()) {
        extrairECriarCamposEditaveis(pagina.content, areaConteudo);
    } else {
        areaConteudo.innerHTML = '<p style="color: #999; text-align: center;">Clique nos botões acima para adicionar elementos à página</p>';
    }
}

function extrairECriarCamposEditaveis(htmlContent, container) {
    const parser = new DOMParser();
    const doc = parser.parseFromString('<div>' + htmlContent + '</div>', 'text/html');
    const elementos = doc.body.firstChild.children;
    
    for (let elemento of elementos) {
        if (elemento.tagName === 'H1' || elemento.tagName === 'H2') {
            adicionarElementoExistente('titulo', elemento.textContent);
        } else if (elemento.tagName === 'H3' || elemento.tagName === 'H4') {
            adicionarElementoExistente('subtitulo', elemento.textContent);
        } else if (elemento.tagName === 'P') {
            adicionarElementoExistente('texto', elemento.textContent);
        } else if (elemento.tagName === 'DIV' && elemento.innerHTML.includes('Sinto muito')) {
            adicionarElementoEspecial('frases4');
        }
    }
    
    if (container.children.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">Clique nos botões acima para adicionar elementos à página</p>';
    }
}

function adicionarElementoExistente(tipo, conteudo) {
    elementosContador++;
    const areaConteudo = document.getElementById('areaConteudo');
    
    if (areaConteudo.innerHTML.includes('Clique nos botões')) {
        areaConteudo.innerHTML = '';
    }
    
    let novoElemento = '';
    
    switch (tipo) {
        case 'titulo':
            novoElemento = `
                <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #8b5cf6; border-radius: 5px; position: relative;">
                    <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                    <label style="color: #8b5cf6; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 5px;">📝 Título</label>
                    <input type="text" value="${conteudo}" placeholder="Digite o título..." style="width: 100%; padding: clamp(6px, 2vw, 8px); background: rgba(0,0,0,0.3); border: 1px solid #8b5cf6; border-radius: 3px; color: #8b5cf6; font-size: clamp(14px, 3vw, 16px);">
                </div>
            `;
            break;
        case 'subtitulo':
            novoElemento = `
                <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #10b981; border-radius: 5px; position: relative;">
                    <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                    <label style="color: #10b981; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 5px;">📋 Subtítulo</label>
                    <input type="text" value="${conteudo}" placeholder="Digite o subtítulo..." style="width: 100%; padding: clamp(6px, 2vw, 8px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; font-size: clamp(14px, 3vw, 16px);">
                </div>
            `;
            break;
        case 'texto':
            novoElemento = `
                <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #f59e0b; border-radius: 5px; position: relative;">
                    <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                    <label style="color: #f59e0b; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 5px;">📄 Texto</label>
                    <textarea placeholder="Digite o texto..." style="width: 100%; height: clamp(80px, 20vw, 100px); padding: clamp(6px, 2vw, 8px); background: rgba(0,0,0,0.3); border: 1px solid #f59e0b; border-radius: 3px; color: white; resize: vertical; font-size: clamp(14px, 3vw, 16px);">${conteudo}</textarea>
                </div>
            `;
            break;
    }
    
    areaConteudo.insertAdjacentHTML('beforeend', novoElemento);
}

function adicionarElementoEspecial(tipo) {
    elementosContador++;
    const areaConteudo = document.getElementById('areaConteudo');
    
    if (areaConteudo.innerHTML.includes('Clique nos botões')) {
        areaConteudo.innerHTML = '';
    }
    
    if (tipo === 'frases4') {
        const novoElemento = `
            <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #a78bfa; border-radius: 5px; position: relative;">
                <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                <label style="color: #a78bfa; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 10px;">🌺 As 4 Frases Sagradas</label>
                <div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 10px; text-align: center;">
                    <div style="margin-bottom: 10px;">
                        <label style="color: #10b981; font-size: clamp(10px, 2vw, 12px);">Frase 1:</label>
                        <input type="text" value="Sinto muito" style="width: 100%; margin-top: 5px; padding: clamp(4px, 1vw, 6px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; text-align: center; font-size: clamp(12px, 3vw, 14px);">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label style="color: #10b981; font-size: clamp(10px, 2vw, 12px);">Frase 2:</label>
                        <input type="text" value="Me perdoe" style="width: 100%; margin-top: 5px; padding: clamp(4px, 1vw, 6px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; text-align: center; font-size: clamp(12px, 3vw, 14px);">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label style="color: #10b981; font-size: clamp(10px, 2vw, 12px);">Frase 3:</label>
                        <input type="text" value="Te amo" style="width: 100%; margin-top: 5px; padding: clamp(4px, 1vw, 6px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; text-align: center; font-size: clamp(12px, 3vw, 14px);">
                    </div>
                    <div>
                        <label style="color: #10b981; font-size: clamp(10px, 2vw, 12px);">Frase 4:</label>
                        <input type="text" value="Sou grato" style="width: 100%; margin-top: 5px; padding: clamp(4px, 1vw, 6px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; text-align: center; font-size: clamp(12px, 3vw, 14px);">
                    </div>
                </div>
            </div>
        `;
        areaConteudo.insertAdjacentHTML('beforeend', novoElemento);
    }
}
// ===== CONTINUAÇÃO DO EDITOR DE PÁGINAS =====
function adicionarElemento(tipo) {
    elementosContador++;
    const areaConteudo = document.getElementById('areaConteudo');
    
    // Remover mensagem padrão se existir
    if (areaConteudo.innerHTML.includes('Clique nos botões')) {
        areaConteudo.innerHTML = '';
    }
    
    let novoElemento = '';
    
    switch (tipo) {
        case 'titulo':
            novoElemento = `
                <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #8b5cf6; border-radius: 5px; position: relative;">
                    <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                    <label style="color: #8b5cf6; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 5px;">📝 Título</label>
                    <input type="text" placeholder="Digite o título..." style="width: 100%; padding: clamp(6px, 2vw, 8px); background: rgba(0,0,0,0.3); border: 1px solid #8b5cf6; border-radius: 3px; color: #8b5cf6; font-size: clamp(14px, 3vw, 16px);">
                </div>
            `;
            break;
        case 'subtitulo':
            novoElemento = `
                <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #10b981; border-radius: 5px; position: relative;">
                    <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                    <label style="color: #10b981; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 5px;">📋 Subtítulo</label>
                    <input type="text" placeholder="Digite o subtítulo..." style="width: 100%; padding: clamp(6px, 2vw, 8px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; font-size: clamp(14px, 3vw, 16px);">
                </div>
            `;
            break;
        case 'texto':
            novoElemento = `
                <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #f59e0b; border-radius: 5px; position: relative;">
                    <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                    <label style="color: #f59e0b; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 5px;">📄 Texto</label>
                    <textarea placeholder="Digite o texto..." style="width: 100%; height: clamp(80px, 20vw, 100px); padding: clamp(6px, 2vw, 8px); background: rgba(0,0,0,0.3); border: 1px solid #f59e0b; border-radius: 3px; color: white; resize: vertical; font-size: clamp(14px, 3vw, 16px);"></textarea>
                </div>
            `;
            break;
        case 'imagem':
            novoElemento = `
                <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #ef4444; border-radius: 5px; position: relative;">
                    <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                    <label style="color: #ef4444; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 5px;">🖼️ Imagem</label>
                    <input type="file" accept="image/*" onchange="processarImagemUpload(this, ${elementosContador})" style="width: 100%; padding: clamp(6px, 2vw, 8px); background: rgba(0,0,0,0.3); border: 1px solid #ef4444; border-radius: 3px; color: white; font-size: clamp(14px, 3vw, 16px); margin-bottom: 10px;">
                    <div id="preview-${elementosContador}" style="display: none; text-align: center; margin-top: 10px;">
                        <img id="img-preview-${elementosContador}" style="max-width: 100%; max-height: 200px; border-radius: 5px; border: 1px solid #ef4444;">
                        <p style="color: #ef4444; font-size: clamp(10px, 2.5vw, 12px); margin-top: 5px;">Preview da imagem</p>
                    </div>
                    <input type="hidden" id="base64-${elementosContador}" value="">
                </div>
            `;
            break;
        case 'frases4':
            novoElemento = `
                <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #a78bfa; border-radius: 5px; position: relative;">
                    <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                    <label style="color: #a78bfa; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 10px;">🌺 As 4 Frases Sagradas</label>
                    <div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 10px; text-align: center;">
                        <div style="margin-bottom: 10px;">
                            <label style="color: #10b981; font-size: clamp(10px, 2vw, 12px);">Frase 1:</label>
                            <input type="text" value="Sinto muito" style="width: 100%; margin-top: 5px; padding: clamp(4px, 1vw, 6px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; text-align: center; font-size: clamp(12px, 3vw, 14px);">
                        </div>
                        <div style="margin-bottom: 10px;">
                            <label style="color: #10b981; font-size: clamp(10px, 2vw, 12px);">Frase 2:</label>
                            <input type="text" value="Me perdoe" style="width: 100%; margin-top: 5px; padding: clamp(4px, 1vw, 6px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; text-align: center; font-size: clamp(12px, 3vw, 14px);">
                        </div>
                        <div style="margin-bottom: 10px;">
                            <label style="color: #10b981; font-size: clamp(10px, 2vw, 12px);">Frase 3:</label>
                            <input type="text" value="Te amo" style="width: 100%; margin-top: 5px; padding: clamp(4px, 1vw, 6px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; text-align: center; font-size: clamp(12px, 3vw, 14px);">
                        </div>
                        <div>
                            <label style="color: #10b981; font-size: clamp(10px, 2vw, 12px);">Frase 4:</label>
                            <input type="text" value="Sou grato" style="width: 100%; margin-top: 5px; padding: clamp(4px, 1vw, 6px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; text-align: center; font-size: clamp(12px, 3vw, 14px);">
                        </div>
                    </div>
                </div>
            `;
            break;
    }
    
    areaConteudo.insertAdjacentHTML('beforeend', novoElemento);
}

function removerElemento(id) {
    const elemento = document.querySelector(`[data-elemento="${id}"]`);
    if (elemento) {
        elemento.remove();
        
        // Se não há mais elementos, mostrar mensagem padrão
        const areaConteudo = document.getElementById('areaConteudo');
        if (areaConteudo.children.length === 0) {
            areaConteudo.innerHTML = '<p style="color: #999; text-align: center;">Clique nos botões acima para adicionar elementos à página</p>';
        }
    }
}

function processarImagemUpload(input, elementoId) {
    const arquivo = input.files[0];
    
    if (!arquivo) {
        const preview = document.getElementById(`preview-${elementoId}`);
        if (preview) preview.style.display = 'none';
        return;
    }
    
    if (!arquivo.type.startsWith('image/')) {
        ToastManager.error('Por favor, selecione apenas arquivos de imagem!');
        input.value = '';
        return;
    }
    
    // Verificar tamanho (máximo 5MB)
    if (arquivo.size > 5 * 1024 * 1024) {
        ToastManager.error('Imagem muito grande! Máximo 5MB.');
        input.value = '';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const base64 = e.target.result;
        
        // Salvar base64 no campo hidden
        const hiddenInput = document.getElementById(`base64-${elementoId}`);
        if (hiddenInput) {
            hiddenInput.value = base64;
        }
        
        // Mostrar preview
        const preview = document.getElementById(`preview-${elementoId}`);
        const imgPreview = document.getElementById(`img-preview-${elementoId}`);
        
        if (preview && imgPreview) {
            imgPreview.src = base64;
            preview.style.display = 'block';
        }
        
        ToastManager.success('Imagem carregada com sucesso! 📸');
    };
    
    reader.onerror = function() {
        ToastManager.error('Erro ao ler a imagem!');
        input.value = '';
    };
    
    reader.readAsDataURL(arquivo);
}

function adicionarNovaPagina() {
    const modulo = modules[moduloAtualEditor];
    modulo.pages.push({
        title: `Nova Página ${modulo.pages.length + 1}`,
        content: '<p style="line-height: 1.8; font-size: 1.1em;">Conteúdo da nova página...</p>'
    });
    
    StorageManager.save(StorageManager.KEYS.MODULES, modules);
    carregarModulosNaInterface();
    atualizarListaPaginas();
    atualizarEstatisticas();
    editarPagina(modulo.pages.length - 1);
}

function salvarPaginaAtual() {
    const titulo = document.getElementById('tituloPagina').value.trim();
    
    if (!titulo) {
        ToastManager.error('Digite o título da página!');
        return;
    }
    
    // Gerar HTML a partir dos elementos visuais
    const areaConteudo = document.getElementById('areaConteudo');
    let htmlFinal = '';
    
    const elementos = areaConteudo.querySelectorAll('[data-elemento]');
    elementos.forEach(elemento => {
        const label = elemento.querySelector('label').textContent;
        
        if (label.includes('Título')) {
            const valor = elemento.querySelector('input').value;
            htmlFinal += `<h2 style="color: #8b5cf6; font-size: 1.5em; margin-bottom: 15px;">${valor}</h2>`;
        } else if (label.includes('Subtítulo')) {
            const valor = elemento.querySelector('input').value;
            htmlFinal += `<h3 style="color: #10b981; font-size: 1.3em; margin-bottom: 10px;">${valor}</h3>`;
        } else if (label.includes('Texto')) {
            const valor = elemento.querySelector('textarea').value;
            htmlFinal += `<p style="line-height: 1.8; font-size: 1.1em; margin-bottom: 15px;">${valor}</p>`;
        } else if (label.includes('Imagem')) {
            const hiddenInput = elemento.querySelector('input[type="hidden"]');
            const base64Value = hiddenInput ? hiddenInput.value : '';
            if (base64Value) {
                htmlFinal += `<div style="text-align: center; margin: 20px 0;"><img src="${base64Value}" style="max-width: 100%; border-radius: 10px;" alt="Imagem"></div>`;
            }
        } else if (label.includes('4 Frases')) {
            const inputs = elemento.querySelectorAll('input');
            htmlFinal += `<div style="background: rgba(139, 92, 246, 0.2); padding: 30px; border-radius: 15px; text-align: center;">`;
            inputs.forEach(input => {
                htmlFinal += `<p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">${input.value}</p>`;
            });
            htmlFinal += `</div>`;
        }
    });
    
    // Salvar no módulo
    const modulo = modules[moduloAtualEditor];
    modulo.pages[paginaAtualEditor].title = titulo;
    modulo.pages[paginaAtualEditor].content = htmlFinal;
    
    StorageManager.save(StorageManager.KEYS.MODULES, modules);
    
    // Atualizar interface para todos os usuários
    carregarModulosNaInterface();
    atualizarListaPaginas();
    atualizarEstatisticas();
    
    ToastManager.success('Página salva com sucesso! ✅ Disponível para todos os usuários!');
}

function excluirPaginaAtual() {
    if (confirm('Tem certeza que deseja excluir esta página?')) {
        const modulo = modules[moduloAtualEditor];
        if (modulo.pages.length > 1) {
            modulo.pages.splice(paginaAtualEditor, 1);
            
            StorageManager.save(StorageManager.KEYS.MODULES, modules);
            carregarModulosNaInterface();
            atualizarListaPaginas();
            atualizarEstatisticas();
            document.getElementById('editorPaginaAtual').style.display = 'none';
            
            ToastManager.success('Página excluída! ✅');
        } else {
            ToastManager.error('Não é possível excluir a última página do módulo!');
        }
    }
}

// ===== SISTEMA DE ÁUDIOS =====
function adicionarAudio() {
    if (!isAdmin) {
        ToastManager.error('Apenas administradores podem adicionar áudios!');
        return;
    }
    
    const arquivo = document.getElementById('uploadAudio').files[0];
    const nome = document.getElementById('nomeAudio').value.trim();
    const descricao = document.getElementById('descricaoAudio').value.trim() || 'Áudio de Ho\'oponopono';
    
    if (!arquivo || !nome) {
        ToastManager.error('Selecione um arquivo e digite o nome!');
        return;
    }
    
    if (!arquivo.type.startsWith('audio/') && !arquivo.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
        ToastManager.error('Por favor, selecione um arquivo de áudio válido!');
        return;
    }
    
    mostrarStatusUpload('🔄 Carregando arquivo...', 'info');
    const botaoUpload = document.getElementById('btnUploadAudio');
    botaoUpload.innerHTML = '⌛ Processando...';
    botaoUpload.disabled = true;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const audioData = {
                id: Date.now(),
                nome: nome,
                descricao: descricao,
                arquivo: e.target.result,
                tamanho: Math.round(arquivo.size / 1024),
                tipo: arquivo.type || 'audio/mpeg',
                nomeArquivo: arquivo.name
            };
            
            audiosPersonalizados.push(audioData);
            StorageManager.save(StorageManager.KEYS.AUDIOS, audiosPersonalizados);
            
            criarElementoAudio(audioData);
            
            // Esconder mensagem "sem áudios"
            const mensagem = document.getElementById('mensagemSemAudios');
            if (mensagem) {
                mensagem.style.display = 'none';
            }
            
            // Limpar campos
            document.getElementById('uploadAudio').value = '';
            document.getElementById('nomeAudio').value = '';
            document.getElementById('descricaoAudio').value = '';
            
            mostrarStatusUpload('✅ Áudio adicionado com sucesso!', 'success');
            atualizarEstatisticas();
            
            setTimeout(() => {
                ocultarStatusUpload();
            }, 3000);
            
        } catch (error) {
            mostrarStatusUpload('❌ Erro ao processar arquivo', 'error');
            setTimeout(() => ocultarStatusUpload(), 5000);
        }
        
        botaoUpload.innerHTML = '📤 Adicionar Áudio';
        botaoUpload.disabled = false;
    };
    
    reader.onerror = function(error) {
        mostrarStatusUpload('❌ Erro ao ler arquivo', 'error');
        setTimeout(() => ocultarStatusUpload(), 5000);
        
        botaoUpload.innerHTML = '📤 Adicionar Áudio';
        botaoUpload.disabled = false;
    };
    
    reader.readAsDataURL(arquivo);
}

function mostrarStatusUpload(mensagem, tipo) {
    const status = document.getElementById('statusUpload');
    const texto = document.getElementById('statusTexto');
    
    if (!status || !texto) return;
    
    texto.textContent = mensagem;
    status.style.display = 'block';
    
    switch(tipo) {
        case 'info':
            status.style.background = 'rgba(59, 130, 246, 0.2)';
            status.style.border = '1px solid rgba(59, 130, 246, 0.5)';
            status.style.color = '#93c5fd';
            break;
        case 'success':
            status.style.background = 'rgba(16, 185, 129, 0.2)';
            status.style.border = '1px solid rgba(16, 185, 129, 0.5)';
            status.style.color = '#6ee7b7';
            break;
        case 'error':
            status.style.background = 'rgba(239, 68, 68, 0.2)';
            status.style.border = '1px solid rgba(239, 68, 68, 0.5)';
            status.style.color = '#fca5a5';
            break;
    }
}

function ocultarStatusUpload() {
    const status = document.getElementById('statusUpload');
    if (status) {
        status.style.display = 'none';
    }
}
// ===== CONTINUAÇÃO DO SISTEMA DE ÁUDIOS =====
function criarElementoAudio(audioData) {
    const audioGrid = document.querySelector('#audioContent .modules-grid');
    if (!audioGrid) return;
    
    const novoAudio = document.createElement('div');
    novoAudio.className = 'audio-card';
    novoAudio.style.cssText = 'background: rgba(30, 0, 60, 0.3); backdrop-filter: blur(10px); border-radius: 20px; padding: clamp(15px, 4vw, 20px); border: 1px solid rgba(139, 92, 246, 0.3); position: relative; min-height: 200px;';
    novoAudio.id = `audio-container-${audioData.id}`;
    novoAudio.setAttribute('data-audio-id', audioData.id);
    
    novoAudio.innerHTML = `
        <div class="audio-play-btn" style="width: clamp(50px, 12vw, 60px); height: clamp(50px, 12vw, 60px); background: linear-gradient(135deg, #8b5cf6, #10b981); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: clamp(24px, 6vw, 30px); margin-bottom: 15px; cursor: pointer; transition: all 0.3s ease;" 
             onclick="reproduzirAudio(${audioData.id})" id="play-btn-${audioData.id}">▶</div>
        
        <h3 style="color: #e9d5ff; margin-bottom: 10px; font-size: clamp(1.1em, 4vw, 1.3em);">${audioData.nome}</h3>
        <p style="color: #c4b5fd; font-size: clamp(0.9em, 3vw, 1em);">${audioData.descricao} • ${audioData.tamanho}KB</p>
        <p style="color: #86efac; font-size: clamp(0.7em, 2.5vw, 0.8em);">Formato: ${audioData.tipo.split('/')[1]?.toUpperCase() || 'MP3'}</p>
        
        <div style="margin-top: 15px; display: none;" id="controls-${audioData.id}">
            <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: clamp(8px, 2vw, 10px);">
                <div style="display: flex; align-items: center; gap: clamp(8px, 2vw, 10px); margin-bottom: 8px;">
                    <button style="background: #8b5cf6; color: white; border: none; width: clamp(28px, 7vw, 30px); height: clamp(28px, 7vw, 30px); border-radius: 50%; cursor: pointer; font-size: clamp(12px, 3vw, 14px); min-height: 32px;" id="pause-btn-${audioData.id}" onclick="pausarAudio(${audioData.id})">⏸</button>
                    <button style="background: #10b981; color: white; border: none; width: clamp(28px, 7vw, 30px); height: clamp(28px, 7vw, 30px); border-radius: 50%; cursor: pointer; font-size: clamp(12px, 3vw, 14px); min-height: 32px;" id="stop-btn-${audioData.id}" onclick="pararAudio(${audioData.id})">⏹</button>
                    <span style="color: #c4b5fd; font-size: clamp(11px, 2.5vw, 13px);" id="time-${audioData.id}">00:00 / 00:00</span>
                </div>
                <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; cursor: pointer;">
                    <div style="height: 100%; background: linear-gradient(135deg, #8b5cf6, #10b981); border-radius: 2px; width: 0%; transition: width 0.1s;" id="progress-${audioData.id}"></div>
                </div>
            </div>
        </div>
    `;
    
    audioGrid.appendChild(novoAudio);
    
    // ADICIONAR BOTÃO EXCLUIR APENAS PARA ADMIN
    if (isAdmin) {
        const btnExcluir = document.createElement('button');
        btnExcluir.innerHTML = '🗑️ Excluir';
        btnExcluir.style.cssText = 'position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 13px; font-weight: bold; z-index: 10; min-height: 32px;';
        btnExcluir.setAttribute('data-audio-id', audioData.id);
        
        btnExcluir.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            excluirAudioCompleto(audioData.id);
        });
        
        novoAudio.appendChild(btnExcluir);
    }
}

function excluirAudioCompleto(audioId) {
    if (!confirm('Tem certeza que deseja excluir este áudio?')) return;
    
    try {
        // Parar áudio se estiver tocando
        if (audioAtualTocando) {
            try {
                if (audioAtualTocando.pause) audioAtualTocando.pause();
                if (audioAtualTocando.source && audioAtualTocando.source.stop) audioAtualTocando.source.stop();
                audioAtualTocando = null;
            } catch (e) {}
        }
        
        // Remover elemento visual
        const container = document.getElementById(`audio-container-${audioId}`);
        if (container) container.remove();
        
        // Remover do array
        const index = audiosPersonalizados.findIndex(audio => audio.id == audioId);
        if (index !== -1) audiosPersonalizados.splice(index, 1);
        
        // Salvar alterações
        StorageManager.save(StorageManager.KEYS.AUDIOS, audiosPersonalizados);
        
        // Mostrar mensagem se não há mais áudios
        if (audiosPersonalizados.length === 0) {
            const mensagem = document.getElementById('mensagemSemAudios');
            if (mensagem) mensagem.style.display = 'block';
        }
        
        atualizarEstatisticas();
        ToastManager.success('Áudio excluído com sucesso! 🗑️');
        
    } catch (error) {
        ToastManager.error('Erro ao excluir áudio');
    }
}

function reproduzirAudio(audioId) {
    // Parar qualquer áudio que esteja tocando
    if (audioAtualTocando) {
        try {
            if (audioAtualTocando.pause) audioAtualTocando.pause();
            if (audioAtualTocando.source && audioAtualTocando.source.stop) audioAtualTocando.source.stop();
            resetarInterfaceAudio(audioAtualTocando.dataset?.audioId);
        } catch (e) {}
        audioAtualTocando = null;
    }
    
    // Encontrar o áudio no array
    const audioData = audiosPersonalizados.find(a => a.id === audioId);
    if (!audioData) {
        ToastManager.error('Áudio não encontrado!');
        return;
    }
    
    try {
        // Usar Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const base64Data = audioData.arquivo.split(',')[1];
        const binaryString = atob(base64Data);
        const arrayBuffer = new ArrayBuffer(binaryString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
        }
        
        const controls = document.getElementById(`controls-${audioId}`);
        const playBtn = document.getElementById(`play-btn-${audioId}`);
        
        if (!controls || !playBtn) {
            ToastManager.error('Erro na interface. Recarregue a página.');
            return;
        }
        
        controls.style.display = 'block';
        playBtn.innerHTML = '⌛';
        playBtn.style.background = 'linear-gradient(135deg, #f59e0b, #8b5cf6)';
        
        audioContext.decodeAudioData(arrayBuffer)
            .then(audioBuffer => {
                const timeDisplay = document.getElementById(`time-${audioId}`);
                if (timeDisplay) {
                    timeDisplay.textContent = `00:00 / ${formatarTempo(audioBuffer.duration)}`;
                }
                
                const source = audioContext.createBufferSource();
                const gainNode = audioContext.createGain();
                
                source.buffer = audioBuffer;
                source.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                audioAtualTocando = {
                    source: source,
                    gainNode: gainNode,
                    audioContext: audioContext,
                    buffer: audioBuffer,
                    startTime: 0,
                    pauseTime: 0,
                    isPlaying: false,
                    dataset: { audioId: audioId }
                };
                
                source.onended = function() {
                    resetarInterfaceAudio(audioId);
                    audioAtualTocando = null;
                };
                
                playBtn.innerHTML = '⏸';
                playBtn.style.background = 'linear-gradient(135deg, #ef4444, #f59e0b)';
                
                const startTime = audioContext.currentTime;
                audioAtualTocando.startTime = startTime;
                audioAtualTocando.isPlaying = true;
                
                source.start(0);
                iniciarTimerProgresso(audioId, audioBuffer.duration, startTime, audioContext);
            })
            .catch(error => {
                tentarReproducaoFallback(audioId, audioData);
            });
        
    } catch (error) {
        tentarReproducaoFallback(audioId, audioData);
    }
}

function tentarReproducaoFallback(audioId, audioData) {
    try {
        const base64Data = audioData.arquivo.split(',')[1];
        const binaryData = atob(base64Data);
        const arrayBuffer = new ArrayBuffer(binaryData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < binaryData.length; i++) {
            uint8Array[i] = binaryData.charCodeAt(i);
        }
        
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
        const blobUrl = URL.createObjectURL(blob);
        
        const audio = new Audio();
        audio.src = blobUrl;
        audio.dataset.audioId = audioId;
        audioAtualTocando = audio;
        
        audio.play().then(() => {
            const playBtn = document.getElementById(`play-btn-${audioId}`);
            if (playBtn) {
                playBtn.innerHTML = '⏸';
                playBtn.style.background = 'linear-gradient(135deg, #ef4444, #f59e0b)';
            }
        }).catch(() => {
            ToastManager.error('❌ Não foi possível reproduzir este arquivo.');
            resetarInterfaceAudio(audioId);
            audioAtualTocando = null;
        });
        
    } catch (error) {
        ToastManager.error('❌ Não foi possível reproduzir este arquivo.');
        resetarInterfaceAudio(audioId);
        audioAtualTocando = null;
    }
}

function iniciarTimerProgresso(audioId, duracao, startTime, audioContext) {
    const intervalId = setInterval(() => {
        if (!audioAtualTocando || !audioAtualTocando.isPlaying) {
            clearInterval(intervalId);
            return;
        }
        
        const tempoAtual = audioContext.currentTime - startTime;
        const progress = document.getElementById(`progress-${audioId}`);
        const timeDisplay = document.getElementById(`time-${audioId}`);
        
        if (progress && timeDisplay && tempoAtual <= duracao) {
            const porcentagem = (tempoAtual / duracao) * 100;
            progress.style.width = `${porcentagem}%`;
            timeDisplay.textContent = `${formatarTempo(tempoAtual)} / ${formatarTempo(duracao)}`;
        }
        
        if (tempoAtual >= duracao) {
            clearInterval(intervalId);
            resetarInterfaceAudio(audioId);
            audioAtualTocando = null;
        }
    }, 100);
}

function pausarAudio(audioId) {
    if (!audioAtualTocando) return;
    
    if (audioAtualTocando.source) {
        if (audioAtualTocando.isPlaying) {
            audioAtualTocando.source.stop();
            audioAtualTocando.isPlaying = false;
            document.getElementById(`play-btn-${audioId}`).innerHTML = '▶';
            document.getElementById(`pause-btn-${audioId}`).innerHTML = '▶';
        } else {
            ToastManager.error('Para retomar, clique no botão play principal');
        }
    } else {
        if (audioAtualTocando.dataset && audioAtualTocando.dataset.audioId == audioId) {
            if (audioAtualTocando.paused) {
                audioAtualTocando.play();
                document.getElementById(`play-btn-${audioId}`).innerHTML = '⏸';
                document.getElementById(`pause-btn-${audioId}`).innerHTML = '⏸';
            } else {
                audioAtualTocando.pause();
                document.getElementById(`play-btn-${audioId}`).innerHTML = '▶';
                document.getElementById(`pause-btn-${audioId}`).innerHTML = '▶';
            }
        }
    }
}

function pararAudio(audioId) {
    if (!audioAtualTocando) return;
    
    if (audioAtualTocando.source) {
        if (audioAtualTocando.isPlaying) {
            audioAtualTocando.source.stop();
        }
        audioAtualTocando.isPlaying = false;
        resetarInterfaceAudio(audioId);
        audioAtualTocando = null;
    } else {
        if (audioAtualTocando.dataset && audioAtualTocando.dataset.audioId == audioId) {
            audioAtualTocando.pause();
            audioAtualTocando.currentTime = 0;
            resetarInterfaceAudio(audioId);
            audioAtualTocando = null;
        }
    }
}

function resetarInterfaceAudio(audioId) {
    const playBtn = document.getElementById(`play-btn-${audioId}`);
    const controls = document.getElementById(`controls-${audioId}`);
    const progress = document.getElementById(`progress-${audioId}`);
    const timeDisplay = document.getElementById(`time-${audioId}`);
    
    if (playBtn) {
        playBtn.innerHTML = '▶';
        playBtn.style.background = 'linear-gradient(135deg, #8b5cf6, #10b981)';
    }
    if (controls) controls.style.display = 'none';
    if (progress) progress.style.width = '0%';
    if (timeDisplay) timeDisplay.textContent = '00:00 / 00:00';
}

function formatarTempo(segundos) {
    if (isNaN(segundos)) return '00:00';
    
    const minutos = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    
    return `${minutos.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
}

// ===== EFEITOS SONOROS =====
function criarSomPagina() {
    // Criar som de página virando usando Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Criar som sintético de papel
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.3, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
        // Som de papel com frequência variável
        const t = i / audioContext.sampleRate;
        const freq1 = 800 + Math.sin(t * 20) * 200; // Frequência principal
        const freq2 = 1200 + Math.sin(t * 15) * 150; // Frequência secundária
        
        let sample = Math.sin(2 * Math.PI * freq1 * t) * 0.3;
        sample += Math.sin(2 * Math.PI * freq2 * t) * 0.2;
        
        // Envelope para simular o "whoosh" do papel
        const envelope = Math.exp(-t * 8) * (1 - Math.exp(-t * 30));
        
        // Adicionar ruído para simular textura do papel
        const noise = (Math.random() - 0.5) * 0.1;
        
        data[i] = (sample + noise) * envelope * 0.4;
    }
    
    return buffer;
}

function tocarSomPagina() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = criarSomPagina();
        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Volume baixo para não incomodar
        gainNode.gain.value = 0.3;
        
        source.start(0);
    } catch (error) {
        // Se não conseguir tocar o som, não faz nada (modo silencioso)
    }
}

// ===== NAVEGAÇÃO =====
function irPara(secao) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    
    event.target.closest('.nav-item').classList.add('active');
    const contentElement = document.getElementById(secao + 'Content');
    if (contentElement) {
        contentElement.classList.add('active');
    }
}
// ===== MÓDULOS E LEITOR =====
function abrirModulo(num) {
    const module = modules[num];
    if (!module) {
        ToastManager.error('Módulo em desenvolvimento! 🚧');
        return;
    }
    
    currentPage = 1;
    totalPages = module.pages.length;
    
    document.getElementById('bookTitle').textContent = module.title;
    
    const container = document.getElementById('flipbook');
    container.innerHTML = '';
    
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        module.pages.forEach((page, index) => {
            const spreadDiv = document.createElement('div');
            spreadDiv.className = `page-spread ${index === 0 ? 'current' : 'hidden'}`;
            spreadDiv.id = `spread${index + 1}`;
            
            spreadDiv.innerHTML = `
                <div class="page-left">
                    <div class="page-content" style="padding: 20px; padding-bottom: 80px; max-height: calc(100vh - 140px); overflow-y: auto;">
                        <h2 style="margin-bottom: 20px; color: #8b5cf6;">${page.title}</h2>
                        <div style="line-height: 1.6;">${page.content}</div>
                        <div class="page-number" style="position: absolute; bottom: 100px; right: 20px; color: #666;">${index + 1}</div>
                    </div>
                </div>
            `;
            
            container.appendChild(spreadDiv);
        });
        totalPages = module.pages.length;
    } else {
        totalPages = Math.ceil(module.pages.length / 2);
        
        for (let i = 0; i < module.pages.length; i += 2) {
            const spreadDiv = document.createElement('div');
            spreadDiv.className = `page-spread ${i === 0 ? 'current' : 'hidden'}`;
            spreadDiv.id = `spread${Math.floor(i / 2) + 1}`;
            
            const leftPage = module.pages[i];
            const rightPage = module.pages[i + 1];
            
            let leftContent = '';
            let rightContent = '';
            
            if (leftPage) {
                leftContent = `
                    <div class="page-left">
                        <div class="page-content" style="padding: 20px; padding-bottom: 60px;">
                            <h2 style="margin-bottom: 20px; color: #8b5cf6;">${leftPage.title}</h2>
                            <div style="line-height: 1.6;">${leftPage.content}</div>
                            <div class="page-number" style="position: absolute; bottom: 80px; left: 20px; color: #666;">${i + 1}</div>
                        </div>
                    </div>
                `;
            }
            
            if (rightPage) {
                rightContent = `
                    <div class="page-right">
                        <div class="page-content" style="padding: 20px; padding-bottom: 60px;">
                            <h2 style="margin-bottom: 20px; color: #8b5cf6;">${rightPage.title}</h2>
                            <div style="line-height: 1.6;">${rightPage.content}</div>
                            <div class="page-number" style="position: absolute; bottom: 80px; right: 20px; color: #666;">${i + 2}</div>
                        </div>
                    </div>
                `;
            } else {
                rightContent = `
                    <div class="page-right">
                        <div class="page-content" style="padding: 20px;">
                            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">
                                <p style="text-align: center; font-style: italic;">Fim do módulo</p>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            spreadDiv.innerHTML = leftContent + rightContent;
            container.appendChild(spreadDiv);
        }
    }
    
    document.getElementById('book').style.display = 'block';
    atualizarPagina();
    
    // INICIALIZAR AUTO-HIDE DA NAVEGAÇÃO
    setTimeout(() => {
        initNavigationAutoHide();
    }, 500);
}

function paginaAnterior() {
    if (currentPage > 1) {
        // TOCAR SOM DA PÁGINA
        tocarSomPagina();
        
        const paginaAtual = document.getElementById(`spread${currentPage}`);
        if (paginaAtual) {
            paginaAtual.className = 'page-spread hidden';
        }
        
        currentPage--;
        
        const paginaAnterior = document.getElementById(`spread${currentPage}`);
        if (paginaAnterior) {
            paginaAnterior.className = 'page-spread current';
        }
        
        atualizarPagina();
    }
}

function proximaPagina() {
    if (currentPage < totalPages) {
        // TOCAR SOM DA PÁGINA
        tocarSomPagina();
        
        const paginaAtual = document.getElementById(`spread${currentPage}`);
        if (paginaAtual) {
            paginaAtual.className = 'page-spread hidden';
        }
        
        currentPage++;
        
        const proximaPagina = document.getElementById(`spread${currentPage}`);
        if (proximaPagina) {
            proximaPagina.className = 'page-spread current';
        }
        
        atualizarPagina();
    }
}

function fecharLivro() {
    document.getElementById('book').style.display = 'none';
}

function atualizarPagina() {
    document.getElementById('pageInfo').textContent = `Página ${currentPage} de ${totalPages}`;
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        prevBtn.style.opacity = currentPage === 1 ? '0.3' : '1';
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.style.opacity = currentPage === totalPages ? '0.3' : '1';
    }
}

// SISTEMA DE AUTO-HIDE PARA BOTÕES
let navigationTimeout;
let isNavigationVisible = true;

function showNavigation() {
    const nav = document.querySelector('.book-navigation');
    if (nav) {
        nav.style.opacity = '1';
        nav.style.transform = 'translateX(-50%) translateY(0)';
        isNavigationVisible = true;
    }
}

function hideNavigation() {
    const nav = document.querySelector('.book-navigation');
    if (nav) {
        nav.style.opacity = '0.3';
        nav.style.transform = 'translateX(-50%) translateY(20px)';
        isNavigationVisible = false;
    }
}

function resetNavigationTimer() {
    clearTimeout(navigationTimeout);
    showNavigation();
    
    navigationTimeout = setTimeout(() => {
        hideNavigation();
    }, 3000); // Esconde após 3 segundos
}

// Event listeners para mostrar navegação
function initNavigationAutoHide() {
    const bookContainer = document.getElementById('flipbook');
    if (bookContainer) {
        // Mostrar navegação ao tocar/mover
        bookContainer.addEventListener('touchstart', resetNavigationTimer);
        bookContainer.addEventListener('touchmove', resetNavigationTimer);
        bookContainer.addEventListener('mousemove', resetNavigationTimer);
        bookContainer.addEventListener('scroll', resetNavigationTimer);
        
        // Timer inicial
        resetNavigationTimer();
    }
}

// ===== DIÁRIO =====
function salvarDiario() {
    const texto = document.getElementById('diaryText').value.trim();
    if (!texto) {
        ToastManager.error('Por favor, escreva algo antes de salvar! 📝');
        return;
    }
    
    diaryEntries.unshift({
        date: new Date().toLocaleString('pt-BR'),
        text: texto
    });
    
    StorageManager.save(StorageManager.KEYS.DIARY, diaryEntries);
    
    document.getElementById('diaryText').value = '';
    atualizarDiario();
    ToastManager.success('Entrada salva com sucesso! 🌺');
}

function atualizarDiario() {
    const container = document.getElementById('entradas');
    if (!container) return;
    
    if (diaryEntries.length === 0) {
        container.innerHTML = '<p style="color: #c4b5fd; text-align: center; font-size: clamp(1em, 3vw, 1.1em);">Suas entradas aparecerão aqui</p>';
    } else {
        container.innerHTML = diaryEntries.map(entry => `
            <div style="margin-bottom: 15px; padding: clamp(12px, 3vw, 15px); background: rgba(0, 0, 0, 0.2); border-radius: 10px;">
                <div style="color: #a78bfa; font-size: clamp(0.8em, 2.5vw, 0.9em); margin-bottom: 5px;">${entry.date}</div>
                <p style="line-height: 1.6; font-size: clamp(1em, 3vw, 1.1em);">${entry.text}</p>
            </div>
        `).join('');
    }
}

// ===== COMUNIDADE =====
function publicarPost() {
    const texto = document.getElementById('postText').value.trim();
    if (!texto && !selectedImage) {
        ToastManager.error('Por favor, escreva algo ou adicione uma imagem antes de publicar! 💬');
        return;
    }
    
    postId++;
    const container = document.getElementById('posts');
    
    let imagemHtml = '';
    if (selectedImage) {
        imagemHtml = `<div style="margin: 15px 0;"><img src="${selectedImage}" style="max-width: 100%; max-height: 400px; border-radius: 10px; border: 1px solid rgba(139, 92, 246, 0.3);"></div>`;
    }
    
    const postHtml = `
        <div style="background: rgba(30, 0, 60, 0.3); backdrop-filter: blur(10px); border-radius: 20px; padding: clamp(15px, 4vw, 20px); border: 1px solid rgba(139, 92, 246, 0.3); margin-bottom: 15px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <div style="width: clamp(35px, 8vw, 40px); height: clamp(35px, 8vw, 40px); background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: clamp(1em, 4vw, 1.2em);">${userName.charAt(0).toUpperCase()}</div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: bold; font-size: clamp(1em, 3.5vw, 1.1em);">${userName}</div>
                    <div style="color: #c4b5fd; font-size: clamp(0.8em, 2.5vw, 0.9em);">agora mesmo</div>
                </div>
                <button style="background: #ef4444; color: white; border: none; padding: clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px); border-radius: 5px; cursor: pointer; font-size: clamp(0.7em, 2vw, 0.8em); min-height: 32px;" onclick="this.parentElement.parentElement.remove(); ToastManager.success('Post excluído!')">🗑️ Excluir</button>
            </div>
            <p style="line-height: 1.6; margin-bottom: 15px; font-size: clamp(1em, 3vw, 1.1em);">${texto}</p>
            ${imagemHtml}
            
            <div style="border-top: 1px solid rgba(139, 92, 246, 0.2); padding-top: 15px;">
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <input type="text" placeholder="Adicione um comentário..." style="flex: 1; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 15px; padding: clamp(6px, 2vw, 8px) clamp(12px, 3vw, 15px); color: white; font-size: clamp(0.8em, 2.5vw, 0.9em);" onkeypress="if(event.key==='Enter') comentar(this, '${postId}')">
                    <button style="background: #8b5cf6; color: white; border: none; padding: clamp(6px, 2vw, 8px) clamp(12px, 3vw, 15px); border-radius: 15px; cursor: pointer; font-size: clamp(0.8em, 2.5vw, 0.9em); min-height: 40px;" onclick="comentar(this.previousElementSibling, '${postId}')">💬</button>
                </div>
                <div id="comentarios-${postId}"></div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('afterbegin', postHtml);
    document.getElementById('postText').value = '';
    removerImagem();
    ToastManager.success('Post publicado com sucesso! 🎉');
}

function mostrarPreview(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            selectedImage = e.target.result;
            document.getElementById('previewImg').src = selectedImage;
            document.getElementById('imagePreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        ToastManager.error('Por favor, selecione um arquivo de imagem válido! 🖼️');
    }
}

function removerImagem() {
    selectedImage = null;
    document.getElementById('imageUpload').value = '';
    document.getElementById('imagePreview').style.display = 'none';
}

function comentar(input, postId) {
    const texto = input.value.trim();
    if (!texto) {
        ToastManager.error('Digite um comentário antes de enviar! 💭');
        return;
    }
    
    const comentariosDiv = document.getElementById('comentarios-' + postId);
    
    const comentarioHtml = `
        <div style="background: rgba(0, 0, 0, 0.2); border-radius: 10px; padding: clamp(8px, 2vw, 10px); margin-bottom: 8px; border-left: 3px solid #8b5cf6;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
                    <div style="width: clamp(20px, 5vw, 25px); height: clamp(20px, 5vw, 25px); background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: clamp(0.7em, 2vw, 0.8em); flex-shrink: 0;">${userName.charAt(0).toUpperCase()}</div>
                    <span style="font-weight: bold; font-size: clamp(0.8em, 2.5vw, 0.9em);">${userName}</span>
                    <span style="color: #c4b5fd; font-size: clamp(0.7em, 2vw, 0.8em);">agora</span>
                </div>
                <button style="background: #ef4444; color: white; border: none; padding: clamp(2px, 0.5vw, 3px) clamp(4px, 1vw, 7px); border-radius: 3px; cursor: pointer; font-size: clamp(0.6em, 1.5vw, 0.7em); min-height: 24px; flex-shrink: 0;" onclick="this.parentElement.parentElement.remove(); ToastManager.success('Comentário excluído!')">🗑️</button>
            </div>
            <p style="font-size: clamp(0.8em, 2.5vw, 0.9em); line-height: 1.4; margin-left: clamp(28px, 7vw, 33px);">${texto}</p>
        </div>
    `;
    
    comentariosDiv.insertAdjacentHTML('beforeend', comentarioHtml);
    input.value = '';
}

// ===== INICIALIZAÇÃO FINAL =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 DOM carregado, configurando eventos...');
    
    // Inicializar dados
    inicializarDadosPadrao();
    
    // Verificar usuário salvo
    try {
        const usuarioSalvo = StorageManager.load(StorageManager.KEYS.USER);
        if (usuarioSalvo && usuarioSalvo.nome && !isAdmin) {
            const nameInput = document.getElementById('name');
            if (nameInput) nameInput.value = usuarioSalvo.nome;
        }
    } catch (e) {
        console.log('Primeiro acesso ou erro ao carregar usuário');
    }
    
    // Event listeners
    const nameInput = document.getElementById('name');
    if (nameInput) {
        nameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                console.log('⌨️ Enter pressionado no campo nome');
                entrarApp();
            }
        });
        console.log('✅ Event listener Enter adicionado ao campo nome');
    } else {
        console.error('❌ Campo nome não encontrado');
    }
    
    const btnIniciar = document.getElementById('btnIniciarJornada');
    if (btnIniciar) {
        // Adicionar event listener adicional por segurança
        btnIniciar.addEventListener('click', function(e) {
            console.log('🖱️ Botão clicado via addEventListener');
            entrarApp();
        });
        console.log('✅ Event listener adicional adicionado ao botão');
    } else {
        console.error('❌ Botão iniciar jornada não encontrado');
    }
    
    // Configurar logo para acesso admin
    const logo = document.getElementById('logoSecret');
    if (logo) {
        logo.onclick = contarCliquesSecretos;
    }
    
    console.log('🎉 Todos os event listeners configurados!');
});

// Gestos touch para mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', function(e) {
    if (!touchStartX || !touchStartY) return;

    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    let diffX = touchStartX - touchEndX;
    let diffY = touchStartY - touchEndY;

    if (document.getElementById('book').style.display === 'block') {
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                proximaPagina();
            } else {
                paginaAnterior();
            }
        }
    }

    touchStartX = 0;
    touchStartY = 0;
}, { passive: true });

// Prevenir F12 e ferramentas de desenvolvedor em produção
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'J') ||
            (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
            return false;
        }
    });
    
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
}

// Funções globais para compatibilidade - TODAS AS FUNÇÕES EXPOSTAS
window.ToastManager = ToastManager;
window.contarCliquesSecretos = contarCliquesSecretos;
window.entrarApp = entrarApp; // ESTA É A MAIS IMPORTANTE
window.abrirLoginAdmin = abrirLoginAdmin;
window.fecharLoginAdmin = fecharLoginAdmin;
window.fazerLoginAdmin = fazerLoginAdmin;
window.logoutAdminSimples = logoutAdminSimples;
window.abrirPainelAdmin = abrirPainelAdmin;
window.fecharPainelAdmin = fecharPainelAdmin;
window.criarNovoModulo = criarNovoModulo;
window.carregarModuloEditor = carregarModuloEditor;
window.editarPagina = editarPagina;
window.adicionarNovaPagina = adicionarNovaPagina;
window.salvarPaginaAtual = salvarPaginaAtual;
window.excluirPaginaAtual = excluirPaginaAtual;
window.adicionarAudio = adicionarAudio;
window.reproduzirAudio = reproduzirAudio;
window.pausarAudio = pausarAudio;
window.pararAudio = pararAudio;
window.irPara = irPara;
window.abrirModulo = abrirModulo;
window.paginaAnterior = paginaAnterior;
window.proximaPagina = proximaPagina;
window.fecharLivro = fecharLivro;
window.salvarDiario = salvarDiario;
window.publicarPost = publicarPost;
window.mostrarPreview = mostrarPreview;
window.removerImagem = removerImagem;
window.comentar = comentar;
window.adicionarElemento = adicionarElemento;
window.removerElemento = removerElemento;
window.extrairECriarCamposEditaveis = extrairECriarCamposEditaveis;
window.adicionarElementoExistente = adicionarElementoExistente;
window.adicionarElementoEspecial = adicionarElementoEspecial;
window.processarImagemUpload = processarImagemUpload;
window.criarSomPagina = criarSomPagina;
window.tocarSomPagina = tocarSomPagina;

console.log('🌺 Ho\'oponopono App carregado com sucesso!');
