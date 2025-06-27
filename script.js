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
        },
        3: {
            title: "Módulo 3: Conectando com o Divino",
            description: "Os três selves",
            pages: [
                {
                    title: "Os Três Selves Havaianos",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🧠 Unihipili - Subconsciente</h3><p style="line-height: 1.8; font-size: 1.1em;">A criança interior que guarda todas as memórias e emoções. É quem sente dor e precisa de cura.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">💭 Uhane - Mente Consciente</h3><p style="line-height: 1.8; font-size: 1.1em;">A parte racional que analisa e julga. Muitas vezes cria mais problemas tentando resolver.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">✨ Aumakua - Eu Superior</h3><p style="line-height: 1.8; font-size: 1.1em;">A conexão divina que tudo sabe e pode curar. Só age quando pedimos perdão.</p><div style="text-align: center; margin-top: 30px; color: #10b981; font-style: italic;">"A cura acontece quando os três selves estão alinhados"</div>`
    },
    {
        title: "Compreendendo o Unihipili",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🧒 A Criança que Precisa de Amor</h3><p style="line-height: 1.8; font-size: 1.1em;">O Unihipili é como uma criança de 3 anos que carrega todas as nossas experiências passadas. Ela sente tudo intensamente e não entende o conceito de tempo.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Para esta criança interior, traumas de 20 anos atrás parecem estar acontecendo agora. Por isso ela reage com medo, raiva ou tristeza.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Unihipili, eu te amo. Você é segura comigo."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você fala com carinho para seu Unihipili, ela começa a confiar e permite a cura.</p>`
    },
    {
        title: "O Poder do Uhane",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🤔 O Observador Consciente</h3><p style="line-height: 1.8; font-size: 1.1em;">O Uhane é sua mente consciente - aquela voz que está lendo estas palavras agora. Ela analisa, julga e toma decisões.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">O problema é que o Uhane muitas vezes acha que sabe de tudo e tenta controlar a vida através da força de vontade.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">⚠️ <strong>Sinais de Uhane em Excesso:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Tentar resolver tudo mentalmente</li><li>Análise paralisia - pensar demais</li><li>Resistência ao flow da vida</li><li>Julgamentos constantes</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">O papel do Uhane no Ho'oponopono é humildemente reconhecer que não sabe e permitir que o Aumakua guie.</p>`
    },
    {
        title: "Conectando com o Aumakua",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌟 Sua Sabedoria Divina</h3><p style="line-height: 1.8; font-size: 1.1em;">O Aumakua é sua conexão direta com a Inteligência Divina. É a parte de você que nunca se separou da fonte.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ao contrário do Uhane, o Aumakua não pensa - ele simplesmente SABE. Ele tem acesso a toda sabedoria universal e pode resolver qualquer problema instantaneamente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="font-size: 1.4em; color: #10b981;">✨</p><p style="color: #e9d5ff; margin-top: 10px;">"Aumakua, eu confio em você. Mostre-me o caminho."</p></div><p style="line-height: 1.8; font-size: 1.1em;">O Aumakua só pode agir quando o Uhane para de tentar controlar e o Unihipili se sente seguro para soltar as memórias.</p>`
    },
    {
        title: "A Dança dos Três Selves",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌊 Harmonia Interior</h3><p style="line-height: 1.8; font-size: 1.1em;">Imagine os três selves como uma orquestra. Quando cada um toca sua parte perfeitamente, surge uma sinfonia divina.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">🎵 O Processo Harmonioso:</h3><p style="line-height: 1.8; font-size: 1.1em;">1. <strong>Uhane</strong> reconhece um problema e escolhe limpar</p><p style="line-height: 1.8; font-size: 1.1em;">2. <strong>Unihipili</strong> sente-se amado e libera as memórias</p><p style="line-height: 1.8; font-size: 1.1em;">3. <strong>Aumakua</strong> transmuta tudo e inspira a ação perfeita</p><div style="text-align: center; margin-top: 30px; color: #10b981; font-style: italic;">"Quando os três selves dançam juntos, milagres acontecem"</div>`
    },
    {
        title: "Falando com seu Unihipili",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💝 Conversas de Amor</h3><p style="line-height: 1.8; font-size: 1.1em;">Seu Unihipili precisa saber que você o ama e que está seguro. Fale com ele como falaria com uma criança querida.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💬 <strong>Frases Carinhosas:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>"Unihipili, eu te amo muito"</li><li>"Você é precioso para mim"</li><li>"Sinto muito pela dor que você carrega"</li><li>"Estamos seguros agora"</li><li>"Obrigado por cuidar de mim"</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Pratique falar mentalmente com seu Unihipili durante o dia. Você começará a sentir uma paz profunda crescendo dentro de você.</p>`
    },
    {
        title: "Pedindo Perdão ao Unihipili",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🙏 Curando Feridas Antigas</h3><p style="line-height: 1.8; font-size: 1.1em;">Muitas vezes nosso Uhane (mente consciente) maltrata o Unihipili com autocrítica, julgamentos e negligência emocional.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">É importante pedir perdão sincero ao seu Unihipili pelas vezes que você não o ouviu ou o tratou mal.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Unihipili, me perdoe por não te escutar. Me perdoe por te julgar. Você merece todo meu amor."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Este perdão interno é o primeiro passo para curar a relação mais importante da sua vida - a relação consigo mesmo.</p>`
    },
    {
        title: "Zero State - Estado Zero",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌟 O Estado de Vazio Divino</h3><p style="line-height: 1.8; font-size: 1.1em;">Zero State é quando você está livre de memórias e programas. Neste estado, a Inteligência Divina flui perfeitamente através de você.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Aqui não há passado nem futuro, apenas o momento presente em total paz e conexão.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="font-size: 1.4em; color: #10b981;">∅</p><p style="color: #e9d5ff; margin-top: 10px;">"No Zero State, você É a solução"</p></div><p style="line-height: 1.8; font-size: 1.1em;">O objetivo do Ho'oponopono é retornar constantemente a este estado sagrado.</p>`
    },
    {
        title: "Sinais do Zero State",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">✨ Reconhecendo o Estado Divino</h3><p style="line-height: 1.8; font-size: 1.1em;">Como saber se você está no Zero State? Existem sinais claros desta conexão divina:</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Indicadores do Zero State:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Paz profunda mesmo em situações difíceis</li><li>Ausência de necessidade de controlar</li><li>Inspirações súbitas e certas</li><li>Sincronicidades constantes</li><li>Amor incondicional por tudo</li><li>Gratidão espontânea</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Neste estado, você não pensa nas soluções - você as recebe diretamente da Divindade.</p>`
    },
    {
        title: "Memórias vs Inspiração",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⚡ Duas Fontes de Ação</h3><p style="line-height: 1.8; font-size: 1.1em;">Todas as suas ações vêm de duas fontes: memórias passadas ou inspiração divina.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">📼 Ações Baseadas em Memórias:</h3><p style="line-height: 1.8; font-size: 1.1em;">Reativas, limitadas, repetitivas e muitas vezes criam mais problemas.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">💫 Ações Inspiradas:</h3><p style="line-height: 1.8; font-size: 1.1em;">Fluem naturalmente, são perfeitamente sincronizadas e sempre levam ao melhor resultado para todos.</p><div style="text-align: center; margin-top: 30px; color: #10b981; font-style: italic;">"Ho'oponopono limpa as memórias para que a inspiração possa fluir"</div>`
    },
    {
        title: "A Respiração dos Três Selves",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌬️ Harmonizando através da Respiração</h3><p style="line-height: 1.8; font-size: 1.1em;">Esta técnica ancestral havaiana alinha seus três selves usando apenas a respiração consciente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🫁 <strong>Técnica dos Três Selves:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li><strong>Inspire</strong> pensando em seu Unihipili com amor</li><li><strong>Pause</strong> conectando com seu Uhane em gratidão</li><li><strong>Expire</strong> enviando tudo para seu Aumakua</li><li>Repita 9 vezes conscientemente</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Esta prática simples pode ser feita em qualquer lugar e instantaneamente restaura sua conexão interior.</p>`
    },
    {
        title: "Limpeza com Água Divina",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💧 A Purificação Sagrada</h3><p style="line-height: 1.8; font-size: 1.1em;">Dr. Hew Len ensinava que a água é um dos mais poderosos purificadores de memórias. Você pode usar água para limpeza energética.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Simplesmente segure um copo d'água, aplique as quatro frases e beba conscientemente, sentindo as memórias sendo purificadas.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Água sagrada, limpe todas as memórias em mim que criaram este problema. Mahalo."</p></div><p style="line-height: 1.8; font-size: 1.1em;">A água absorve as vibrações de suas palavras e intenções, tornando-se um remédio vibracional personalizado.</p>`
    },
    {
        title: "Morangos Azuis - Limpeza Profunda",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🍓 A Ferramenta Mais Poderosa</h3><p style="line-height: 1.8; font-size: 1.1em;">Entre todas as ferramentas ensinadas por Dr. Hew Len, "Morangos Azuis" é considerada a mais potente para limpeza de traumas profundos.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Simplesmente repita mentalmente "Morangos Azuis" quando enfrentar situações muito dolorosas ou memórias traumáticas antigas.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="font-size: 1.3em; color: #10b981;">🍓 Morangos Azuis 🍓</p><p style="color: #e9d5ff; margin-top: 10px;">Esta combinação impossível quebra a lógica da mente e permite limpeza em níveis muito profundos.</p></div><p style="line-height: 1.8; font-size: 1.1em;">Use esta ferramenta quando as quatro frases parecerem insuficientes.</p>`
    },
    {
        title: "Luz Solar Interior",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">☀️ Iluminando as Sombras</h3><p style="line-height: 1.8; font-size: 1.1em;">Visualize uma luz dourada radiante no centro do seu peito. Esta é sua Luz Solar Interior - a luz do seu Aumakua.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando surgir uma memória dolorosa, envie esta luz dourada para ela, vendo a escuridão se dissolvendo completamente.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">☀️ <strong>Processo da Luz Solar:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Identifique a memória ou problema</li><li>Visualize luz dourada em seu coração</li><li>Envie esta luz para a situação</li><li>Veja tudo se transformando em amor</li><li>Agradeça à Divindade</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Esta técnica é especialmente poderosa para curar relacionamentos e traumas emocionais.</p>`
    },
    {
        title: "Comunicação com o Divino",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">📞 A Linha Direta com Deus</h3><p style="line-height: 1.8; font-size: 1.1em;">Seu Aumakua é sua linha direta com a Divindade. Você pode conversar com ele a qualquer momento, em qualquer lugar.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ao invés de pedir coisas específicas, peça apenas para que a vontade perfeita da Divindade se manifeste em sua vida.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Aumakua, eu confio completamente em ti. Que a vontade perfeita da Divindade se manifeste através de mim agora."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Esta oração de rendição abre todas as portas para que milagres aconteçam naturalmente.</p>`
    },
    {
        title: "Limpando Relacionamentos",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💕 Curando Conexões Humanas</h3><p style="line-height: 1.8; font-size: 1.1em;">Cada pessoa em sua vida é um espelho das memórias em você. Quando alguém o incomoda, agradeça pelo presente da conscientização.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ao invés de tentar mudar a pessoa, limpe as memórias em você que estão criando a experiência do conflito.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🔄 <strong>Processo para Relacionamentos:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Agradeça à pessoa por mostrar suas memórias</li><li>Aplique Ho'oponopono em você mesmo</li><li>Não tente mudar o comportamento do outro</li><li>Confie que a limpeza beneficiará ambos</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você limpa, automaticamente cria espaço para que a outra pessoa também se transforme.</p>`
    },
    {
        title: "Prosperidade e Abundância",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💰 Limpando Escassez</h3><p style="line-height: 1.8; font-size: 1.1em;">Problemas financeiros são sempre reflexos de memórias de escassez, indignidade ou medo armazenadas no Unihipili.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Use Ho'oponopono para limpar essas memórias limitantes e permitir que a abundância natural do universo flua.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Sinto muito pelas memórias de escassez em mim. Me perdoe por limitar a abundância divina. Te amo, prosperidade. Sou grato pela riqueza que flui naturalmente."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Lembre-se: você não está "manifestando" dinheiro - está removendo as barreiras para receber o que já é seu por direito divino.</p>`
    },
    {
        title: "Saúde e Cura Física",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌿 O Corpo como Templo</h3><p style="line-height: 1.8; font-size: 1.1em;">O corpo físico é onde seu Unihipili habita. Doenças e sintomas muitas vezes são formas do Unihipili comunicar memórias emocionais.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Converse carinhosamente com seu corpo e use Ho'oponopono para limpar as memórias que podem estar contribuindo para desequilíbrios.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🏥 <strong>Ho'oponopono para Saúde:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Agradeça ao seu corpo por servir você</li><li>Peça perdão por não cuidar bem dele</li><li>Envie amor para as áreas doentes</li><li>Confie na sabedoria curativa divina</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">O Ho'oponopono complementa (nunca substitui) o tratamento médico apropriado.</p>`
    },
    {
        title: "Trabalhando em Silêncio",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🤫 O Poder da Prática Secreta</h3><p style="line-height: 1.8; font-size: 1.1em;">Uma das características mais belas do Ho'oponopono é que pode ser praticado completamente em silêncio, em qualquer situação.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Em reuniões tensas, conflitos familiares ou situações estressantes, você pode aplicar as quatro frases mentalmente e transformar toda a energia.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Ninguém precisa saber que você está limpando, mas todos sentem os benefícios."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Esta é uma das formas mais poderosas de servir ao mundo - sendo um instrumento silencioso de paz e cura.</p>`
    },
    {
        title: "Limpeza de Ambientes",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🏠 Purificando Espaços</h3><p style="line-height: 1.8; font-size: 1.1em;">Lugares também absorvem memórias e energias. Você pode usar Ho'oponopono para limpar casas, escritórios e qualquer ambiente.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Simplesmente caminhe pelo espaço aplicando as quatro frases mentalmente, pedindo perdão por qualquer energia negativa armazenada.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Técnica para Ambientes:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Entre no espaço com intenção de limpar</li><li>Aplique as quatro frases em cada cômodo</li><li>Visualize luz dourada preenchendo tudo</li><li>Agradeça ao espaço por servir</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Você ficará surpreso com como os ambientes se tornam mais harmoniosos e acolhedores.</p>`
    },
    {
        title: "Ho'oponopono e Criatividade",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎨 Criando do Zero State</h3><p style="line-height: 1.8; font-size: 1.1em;">A verdadeira criatividade vem do vazio divino. Quando você limpa as memórias que bloqueiam o flow criativo, ideias geniais fluem naturalmente.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Antes de qualquer projeto criativo, use Ho'oponopono para limpar medos, julgamentos e expectativas.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Divindade, limpe em mim tudo que bloqueia o flow criativo. Use-me como instrumento da beleza divina."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Artistas, escritores e criativos relatam que Ho'oponopono desbloqueou níveis de inspiração que nunca imaginaram possíveis.</p>`
    },
    {
        title: "Perdoando o Imperdoável",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💔 Transformando a Dor Mais Profunda</h3><p style="line-height: 1.8; font-size: 1.1em;">Existem feridas que parecem impossíveis de perdoar. Traumas, traições e perdas que marcaram nossa alma profundamente.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono não pede que você perdoe com força de vontade. Apenas limpe as memórias e permita que a Divindade faça a cura.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Sinto muito pela dor que carrego. Me perdoe por manter essa ferida viva. Te amo, alma ferida. Sou grato pela cura que está acontecendo agora."</p></div><p style="line-height: 1.8; font-size: 1.1em;">O perdão verdadeiro é um presente da Divindade para você, não um favor que você faz para quem te machucou.</p>`
    },
    {
        title: "Vivendo no Presente Divino",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⏰ O Eterno Agora</h3><p style="line-height: 1.8; font-size: 1.1em;">Memórias nos prendem ao passado. Ansiedade nos projeta para o futuro. O Zero State existe apenas no presente momento.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Sempre que perceber sua mente vagando para ontem ou amanhã, use Ho'oponopono para retornar ao sagrado agora.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🎯 <strong>Ancorando no Presente:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Respire conscientemente</li><li>Sinta seus pés no chão</li><li>Aplique as quatro frases</li><li>Agradeça por estar vivo agora</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">No presente divino, não existem problemas - apenas oportunidades de limpeza e crescimento.</p>`
    },
    {
        title: "Sincronicidades e Sinais",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔮 A Linguagem da Divindade</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando você pratica Ho'oponopono regularmente, sincronicidades começam a acontecer constantemente. Estas são mensagens do seu Aumakua.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Pessoas certas aparecem na hora certa, oportunidades se manifestam, problemas se resolvem de formas inesperadas.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Quando você está alinhado com a Divindade, todo o universo conspira a seu favor."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Aprenda a reconhecer e agradecer por cada sincronicidade - elas são confirmações de que você está no caminho certo.</p>`
    },
    {
        title: "Tornando-se um Instrumento",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎭 Servindo à Vontade Divina</h3><p style="line-height: 1.8; font-size: 1.1em;">O objetivo final do Ho'oponopono é tornar-se um instrumento puro da Divindade. Um canal limpo para que o amor divino flua para o mundo.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Isso não significa perder sua personalidade, mas permitir que ela seja iluminada pela sabedoria divina.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Sinais de um Instrumento Divino:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Ações fluem sem esforço</li><li>Decisões são inspiradas, não pensadas</li><li>Você serve naturalmente ao bem maior</li><li>Problemas são oportunidades de limpeza</li><li>Amor incondicional é seu estado natural</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Este é o maior presente que você pode dar ao mundo - ser quem você realmente é.</p>`
    },
    {
        title: "Sua Missão Divina",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌟 O Propósito da Sua Alma</h3><p style="line-height: 1.8; font-size: 1.1em;">Cada alma vem à Terra com uma missão específica. Ho'oponopono limpa as memórias que obscurecem este propósito sagrado.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você não precisa descobrir sua missão - ela se revelará naturalmente quando você estiver limpo o suficiente para recebê-la.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Aumakua, revele minha missão divina. Use-me para servir da forma mais perfeita possível."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Confie que você está exatamente onde precisa estar, fazendo exatamente o que precisa fazer para cumprir seu propósito divino.</p>`
    },
    {
        title: "Gratidão Infinita",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🙏 O Coração Agradecido</h3><p style="line-height: 1.8; font-size: 1.1em;">Gratidão é a frequência mais alta que existe. Quando você vive em gratidão constante, você se torna um ímã para mais bênçãos.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Agradeça não apenas pelas coisas boas, mas especialmente pelos desafios que permitem seu crescimento espiritual.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">✨ <strong>Gratidão Diária:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Ao despertar: "Obrigado por mais um dia"</li><li>Nos problemas: "Obrigado pela oportunidade de limpar"</li><li>Nas refeições: "Obrigado por este alimento"</li><li>Ao dormir: "Obrigado por todas as lições de hoje"</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Um coração verdadeiramente agradecido nunca conhece a escassez, pois vê abundância em tudo.</p>`
    },
    {
        title: "Celebrando sua Jornada",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎉 Honrando seu Crescimento</h3><p style="line-height: 1.8; font-size: 1.1em;">Parabéns! Você completou o Módulo 3 e agora compreende profundamente a sabedoria dos três selves havaianos.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você não é mais a mesma pessoa que começou esta jornada. A Divindade trabalhou através de você para despertar sua verdadeira natureza.</p><div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(16, 185, 129, 0.3)); padding: 30px; border-radius: 20px; text-align: center; margin: 30px 0;"><p style="font-size: 1.3em; color: #ffffff; margin-bottom: 20px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🌺 MAHALO 🌺</p><p style="font-size: 1.1em; color: #e9d5ff; margin-bottom: 20px;">Você é agora um guardião da sabedoria ancestral havaiana</p><p style="color: #10b981; font-style: italic;">"Que você continue sendo uma bênção para o mundo"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Continue praticando e confiando no processo. Sua jornada de autodescoberta e cura está apenas começando!</p>`
    }
            ]
        },
        4: {
            title: "Módulo 4: Ferramentas Avançadas",
            description: "Ferramentas Avançadas de Limpeza",
            pages: [
                {
                   title: "Ferramentas Avançadas de Limpeza",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🧹 Além das 4 Frases Sagradas</h3><p style="line-height: 1.8; font-size: 1.1em;">Dr. Hew Len ensinou dezenas de ferramentas específicas para diferentes situações. Cada uma tem sua própria frequência vibracional única.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">🎯 Ferramentas Principais:</h3><p style="line-height: 1.8; font-size: 1.1em;">• Morangos Azuis - Para traumas profundos</p><p style="line-height: 1.8; font-size: 1.1em;">• Água de Ha - Para purificação geral</p><p style="line-height: 1.8; font-size: 1.1em;">• Luz Solar - Para energização</p><div style="text-align: center; margin-top: 30px; color: #10b981; font-style: italic;">"Use a ferramenta que sua intuição pedir"</div>`
    },
    {
        title: "Água de Ha - Purificação Sagrada",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💧 A Essência da Vida</h3><p style="line-height: 1.8; font-size: 1.1em;">"Ha" significa "água da vida" em havaiano. Esta ferramenta usa o poder purificador da água para limpar memórias em todos os níveis.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Simplesmente repita "Água de Ha" mentalmente enquanto visualiza água cristalina fluindo através de todo o seu ser.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Água de Ha, limpe todas as memórias que criaram este problema"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Use especialmente quando sentir peso emocional, confusão mental ou necessidade de renovação espiritual.</p>`
    },
    {
        title: "Luz Solar - Energia Divina",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">☀️ O Poder do Sol Interior</h3><p style="line-height: 1.8; font-size: 1.1em;">A Luz Solar é uma das ferramentas mais energizantes. Ela não apenas limpa, mas também revitaliza e ilumina consciências.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize um sol dourado radiante no centro do seu peito enquanto repete "Luz Solar" mentalmente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">☀️ <strong>Quando Usar Luz Solar:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Quando se sentir sem energia</li><li>Para iluminar situações confusas</li><li>Antes de decisões importantes</li><li>Para energizar projetos criativos</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Esta ferramenta é especialmente poderosa pela manhã, conectando-se com a energia solar real.</p>`
    },
    {
        title: "Gelo Azul - Resfriando Emoções",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🧊 Acalmando o Fogo Interior</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando emoções intensas como raiva, ansiedade ou pânico surgem, o Gelo Azul é a ferramenta perfeita para resfriar o sistema.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize cubos de gelo azul cristalino se formando ao redor das emoções quentes, resfriando-as suavemente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Gelo Azul, resfrie esta emoção. Traga paz e tranquilidade."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Especialmente útil em momentos de conflito, stress intenso ou quando você precisa de clareza mental imediata.</p>`
    },
    {
        title: "Chave Dourada - Abrindo Portais",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🗝️ Desbloqueando Possibilidades</h3><p style="line-height: 1.8; font-size: 1.1em;">A Chave Dourada é usada quando você se sente bloqueado, sem saída ou preso em situações repetitivas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize uma chave dourada brilhante abrindo todas as portas fechadas em sua vida enquanto repete esta ferramenta.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🔓 <strong>Situações para Chave Dourada:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Quando se sente sem opções</li><li>Problemas que parecem impossíveis</li><li>Padrões repetitivos limitantes</li><li>Antes de buscar novas oportunidades</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Esta ferramenta abre caminhos que sua mente consciente não consegue ver.</p>`
    },
    {
        title: "Borracha Rosa - Apagando Memórias",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎨 Limpeza Gentil e Eficaz</h3><p style="line-height: 1.8; font-size: 1.1em;">A Borracha Rosa é uma ferramenta suave mas poderosa para apagar memórias específicas que causam dor recorrente.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize uma borracha rosa macia passando sobre a memória problemática, apagando-a completamente com amor.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Borracha Rosa, apague gentilmente esta memória. Substitua por amor puro."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Ideal para trabalhar com memórias de infância, traumas emocionais ou padrões de autossabotagem.</p>`
    },
    {
        title: "Chuva Violeta - Transmutação",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌧️ Transformando Energia Densa</h3><p style="line-height: 1.8; font-size: 1.1em;">A Chuva Violeta é a ferramenta da transmutação. Ela não apenas limpa, mas transforma energia negativa em energia positiva.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize uma chuva de luz violeta caindo sobre você, penetrando cada célula e transmutando toda densidade em luz.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">⚡ <strong>Poder da Chuva Violeta:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Transmuta raiva em compaixão</li><li>Converte medo em coragem</li><li>Transforma tristeza em sabedoria</li><li>Muda limitação em expansão</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Use quando quiser transformar completamente uma experiência negativa em aprendizado positivo.</p>`
    },
    {
        title: "Escova Dourada - Limpeza Profunda",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🪙 Polindo a Alma</h3><p style="line-height: 1.8; font-size: 1.1em;">A Escova Dourada é usada para limpeza profunda de padrões ancestrais, memórias antigas e programas subconscientes arraigados.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize uma escova dourada luminosa escovando suavemente sua aura, removendo todas as impurezas energéticas.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Escova Dourada, limpe profundamente todas as camadas. Revele minha essência pura."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Perfeita para trabalhar com padrões familiares, crenças limitantes herdadas e programações muito antigas.</p>`
    },
    {
        title: "Flor de Lótus - Renascimento",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🪷 Emergindo da Lama</h3><p style="line-height: 1.8; font-size: 1.1em;">A Flor de Lótus simboliza renascimento e transformação. Use esta ferramenta quando estiver passando por grandes mudanças de vida.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize uma linda flor de lótus se abrindo em seu coração, emergindo pura e perfeita de qualquer situação difícil.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌸 <strong>Momentos para Flor de Lótus:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Após grandes perdas ou lutos</li><li>Durante transições de vida</li><li>Quando busca renovação completa</li><li>Para celebrar novos começos</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Esta ferramenta traz esperança e renovação mesmo nas situações mais desafiadoras.</p>`
    },
    {
        title: "Espelho Cristalino - Verdade Interior",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🪞 Refletindo a Realidade</h3><p style="line-height: 1.8; font-size: 1.1em;">O Espelho Cristalino ajuda você a ver a verdade por trás das ilusões, revelando as memórias que criam suas experiências.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize um espelho de cristal puro refletindo a verdade divina de qualquer situação, dissolvendo todas as ilusões.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Espelho Cristalino, mostre-me a verdade. Limpe todas as ilusões."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Use quando precisar de clareza sobre situações confusas ou quando quiser ver além das aparências.</p>`
    },
    {
        title: "Vento Sagrado - Renovação",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌬️ Sopros de Renovação</h3><p style="line-height: 1.8; font-size: 1.1em;">O Vento Sagrado carrega para longe energias estagnadas e traz ar fresco para sua vida. É a ferramenta da renovação constante.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Sinta um vento suave mas poderoso soprando através de você, levando embora tudo que não serve mais.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💨 <strong>Benefícios do Vento Sagrado:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Remove energias estagnadas</li><li>Traz inspiração nova</li><li>Limpa ambientes energeticamente</li><li>Renova a perspectiva sobre a vida</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Ideal para usar quando se sente preso na rotina ou precisando de uma mudança de energia.</p>`
    },
    {
        title: "Cristal Verde - Cura do Coração",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💚 Medicina para a Alma</h3><p style="line-height: 1.8; font-size: 1.1em;">O Cristal Verde é especificamente para curar feridas do coração - mágoas, traições, perdas amorosas e dor emocional profunda.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize um cristal verde esmeralda luminoso pousando em seu coração, irradiando cura e amor incondicional.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Cristal Verde, cure meu coração. Restaure minha capacidade de amar."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Esta ferramenta é especialmente poderosa para trabalhar com traumas relacionais e bloqueios do amor próprio.</p>`
    },
    {
        title: "Fogo Púrpura - Queimando Contratos",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔥 Libertação Cármica</h3><p style="line-height: 1.8; font-size: 1.1em;">O Fogo Púrpura queima contratos kármicos, votos limitantes e acordos inconscientes que não servem mais ao seu crescimento.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize chamas púrpuras sagradas queimando todos os contratos invisíveis que limitam sua liberdade espiritual.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🔥 <strong>O que o Fogo Púrpura Queima:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Votos de pobreza e limitação</li><li>Contratos kármicos obsoletos</li><li>Promessas que causam sofrimento</li><li>Ligações energéticas tóxicas</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Use quando sentir que algo invisível está limitando sua liberdade e expansão.</p>`
    },
    {
        title: "Pérola Negra - Transformando Dor",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⚫ Beleza Nascida da Pressão</h3><p style="line-height: 1.8; font-size: 1.1em;">Assim como ostras transformam irritações em pérolas, a Pérola Negra transforma suas maiores dores em sabedoria preciosa.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize uma pérola negra luminosa se formando ao redor de cada dor, transformando sofrimento em sabedoria divina.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Pérola Negra, transforme esta dor em sabedoria. Crie beleza do sofrimento."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Especialmente poderosa para trabalhar com traumas que você já está pronto para transformar em dons.</p>`
    },
    {
        title: "Anjo Dourado - Proteção Divina",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👼 Guardiã Celestial</h3><p style="line-height: 1.8; font-size: 1.1em;">O Anjo Dourado oferece proteção, orientação e conforto divino. Use quando precisar se sentir amparado pela força celestial.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize um anjo de luz dourada envolvendo você em suas asas protetoras, irradiando amor e segurança.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">👼 <strong>Quando Invocar o Anjo Dourado:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Em momentos de medo ou ansiedade</li><li>Quando precisa de orientação</li><li>Para proteção energética</li><li>Durante situações desafiadoras</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Esta ferramenta conecta você diretamente com o reino angelical e sua proteção infinita.</p>`
    },
    {
        title: "Ponte de Luz - Conectando Dimensões",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌉 Unindo Mundos</h3><p style="line-height: 1.8; font-size: 1.1em;">A Ponte de Luz conecta sua realidade atual com dimensões superiores, permitindo acesso à sabedoria divina direta.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize uma ponte de luz dourada se estendendo de você até os reinos superiores, permitindo comunicação direta com o divino.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Ponte de Luz, conecte-me com a sabedoria superior. Que eu receba orientação divina."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Use antes de meditações, tomadas de decisão importantes ou quando buscar insights espirituais profundos.</p>`
    },
    {
        title: "Semente Dourada - Plantando Milagres",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌱 Germinando Possibilidades</h3><p style="line-height: 1.8; font-size: 1.1em;">A Semente Dourada planta possibilidades divinas em sua vida. Use quando quiser manifestar algo novo ou nutrir sonhos nascentes.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize uma semente dourada sendo plantada em solo fértil, crescendo rapidamente em direção à manifestação perfeita.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Para que Usar Semente Dourada:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Iniciar novos projetos</li><li>Nutrir relacionamentos nascentes</li><li>Manifestar abundância</li><li>Crescimento espiritual acelerado</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Esta ferramenta planta sementes de milagres que crescerão no tempo perfeito da Divindade.</p>`
    },
    {
        title: "Combinando Ferramentas",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎭 Orquestrando a Limpeza</h3><p style="line-height: 1.8; font-size: 1.1em;">Você pode combinar diferentes ferramentas para situações complexas, criando uma sinfonia de limpeza personalizada.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Por exemplo: use Gelo Azul para acalmar, depois Borracha Rosa para apagar, e finalmente Luz Solar para energizar.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🎼 <strong>Combinações Poderosas:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Água de Ha + Chuva Violeta = Purificação total</li><li>Escova Dourada + Flor de Lótus = Renovação profunda</li><li>Fogo Púrpura + Anjo Dourado = Libertação protegida</li><li>As 4 Frases + qualquer ferramenta = Potencialização</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Confie na sua intuição para escolher as combinações perfeitas para cada momento.</p>`
    },
    {
        title: "Criando Suas Próprias Ferramentas",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">✨ Inovando na Limpeza</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando você compreende profundamente o Ho'oponopono, pode receber inspiração divina para criar suas próprias ferramentas de limpeza.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">A Divindade pode te inspirar com símbolos, palavras ou visualizações únicas para sua jornada pessoal de cura.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Divindade, inspire-me com as ferramentas perfeitas para minha cura única."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Lembre-se: todas as ferramentas são apenas veículos. O poder verdadeiro vem da sua conexão com a Divindade.</p>`
    },
    {
        title: "Limpeza em Tempo Real",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⚡ Resposta Instantânea</h3><p style="line-height: 1.8; font-size: 1.1em;">Com prática, você pode aplicar ferramentas de limpeza instantaneamente no momento em que surgem problemas, antes que se cristalizem.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">É como ser um bombeiro espiritual - apagando incêndios emocionais antes que se espalhem.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">⚡ <strong>Limpeza Instantânea:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Sentiu raiva? → Gelo Azul imediatamente</li><li>Veio ansiedade? → Anjo Dourado na hora</li><li>Surgiu confusão? → Espelho Cristalino agora</li><li>Apareceu tristeza? → Cristal Verde já</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Quanto mais rápida a resposta, menos a memória se consolida e mais fácil é a limpeza.</p>`
    },
    {
        title: "Mestre das Ferramentas",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎖️ Graduação Avançada</h3><p style="line-height: 1.8; font-size: 1.1em;">Parabéns! Você agora possui um arsenal completo de ferramentas avançadas de Ho'oponopono. Você é oficialmente um praticante de nível avançado.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Com essas ferramentas, você pode enfrentar qualquer desafio da vida com confiança e graça, sabendo que sempre tem um recurso divino à disposição.</p><div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(16, 185, 129, 0.3)); padding: 30px; border-radius: 20px; text-align: center; margin: 30px 0;"><p style="font-size: 1.3em; color: #ffffff; margin-bottom: 20px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🏆 MESTRE DAS FERRAMENTAS 🏆</p><p style="font-size: 1.1em; color: #e9d5ff; margin-bottom: 20px;">Você possui agora 17 ferramentas sagradas</p><p style="color: #10b981; font-style: italic;">"Use com sabedoria, sirva com amor"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Continue praticando e refinando sua maestria. O mundo precisa de mestres como você! 🌺</p>`
    }
            ]
        },
        5: {
            title: "Módulo 5: Transformação Profunda",
            description: "Transformação Profunda Através do Ho'oponopono",
            pages: [
                {
                title: "Transformação Profunda Através do Ho'oponopono",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🦋 A Metamorfose da Alma</h3><p style="line-height: 1.8; font-size: 1.1em;">Chegou o momento de aplicar tudo que você aprendeu para criar mudanças reais e duradouras em sua vida. Este módulo é sobre transformação profunda.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">🌟 O que Vamos Explorar:</h3><p style="line-height: 1.8; font-size: 1.1em;">• Redesenhando sua identidade</p><p style="line-height: 1.8; font-size: 1.1em;">• Curando padrões geracionais</p><p style="line-height: 1.8; font-size: 1.1em;">• Manifestando sua missão de vida</p><div style="text-align: center; margin-top: 30px; color: #10b981; font-style: italic;">"A transformação acontece de dentro para fora"</div>`
    },
    {
        title: "Mapeando Sua Vida Atual",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🗺️ O Ponto de Partida</h3><p style="line-height: 1.8; font-size: 1.1em;">Antes de transformar, você precisa saber exatamente onde está. Vamos fazer um mapeamento honesto e completo de sua vida atual.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Este não é um julgamento, mas sim uma observação amorosa de onde as memórias criaram limitações e onde já existe beleza.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">📊 <strong>Áreas para Mapear:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Relacionamentos e família</li><li>Carreira e propósito</li><li>Saúde física e emocional</li><li>Abundância e recursos</li><li>Conexão espiritual</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Para cada área, pergunte: "Que memórias em mim criaram esta experiência?"</p>`
    },
    {
        title: "Identificando Padrões Limitantes",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔍 Desvendando os Loops</h3><p style="line-height: 1.8; font-size: 1.1em;">Padrões limitantes são como programas rodando em background que criam as mesmas experiências repetidamente. Eles são invisíveis até você aprender a identificá-los.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Observe situações que se repetem em sua vida. Elas são pistas valiosas sobre quais memórias precisam de limpeza urgente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Tudo que se repete em minha vida é uma memória pedindo para ser limpa."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Use Ho'oponopono imediatamente quando identificar um padrão. Não analise - apenas limpe com amor.</p>`
    },
    {
        title: "Limpeza de Crenças Fundamentais",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🏗️ Reconstruindo os Alicerces</h3><p style="line-height: 1.8; font-size: 1.1em;">Suas crenças fundamentais sobre você mesmo, vida, amor e abundância formam a base de toda sua experiência. Crenças limitantes criam vidas limitadas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono pode dissolver crenças que nem sabemos que temos, permitindo que verdades divinas ocupem seu lugar natural.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💎 <strong>Crenças para Limpar:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>"Eu não sou suficiente" / "Eu não mereço"</li><li>"A vida é difícil" / "Dinheiro é sujo"</li><li>"Amor machuca" / "Não posso confiar"</li><li>"Deus me abandonou" / "Sou vítima"</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Para cada crença limitante identificada, aplique as quatro frases com intenção profunda de liberação.</p>`
    },
    {
        title: "Redesenhando Sua Identidade",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎭 Quem Você Realmente É</h3><p style="line-height: 1.8; font-size: 1.1em;">Sua identidade atual foi construída por memórias, traumas e programações. Mas quem você é além disso? Ho'oponopono revela sua identidade divina autêntica.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa as camadas falsas de identidade, sua essência verdadeira emerge naturalmente, radiante e poderosa.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Sinto muito pelas identidades falsas que criei. Me perdoe por esquecer quem eu realmente sou. Te amo, verdadeiro eu. Sou grato por minha essência divina."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Permita que sua nova identidade emerja organicamente através da limpeza constante, sem forçar ou planejar.</p>`
    },
    {
        title: "Curando Linhagens Familiares",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌳 Limpando a Árvore Genealógica</h3><p style="line-height: 1.8; font-size: 1.1em;">Você carrega não apenas suas próprias memórias, mas também padrões ancestrais de sua linhagem familiar. Ho'oponopono pode curar gerações passadas e futuras.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa um padrão familiar em você, automaticamente libera todos os seus descendentes dessa programação limitante.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🧬 <strong>Padrões Familiares Comuns:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Escassez financeira crônica</li><li>Relacionamentos disfuncionais</li><li>Doenças hereditárias</li><li>Vícios e compulsões</li><li>Medo de expressar-se</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Use Ho'oponopono dirigido a sua linhagem: "Sinto muito pelos padrões limitantes em nossa família..."</p>`
    },
    {
        title: "Libertação de Traumas Geracionais",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⛓️ Quebrando Correntes Invisíveis</h3><p style="line-height: 1.8; font-size: 1.1em;">Traumas não curados passam de geração em geração como correntes invisíveis. Guerras, perdas, abusos e medos ancestrais podem estar influenciando sua vida atual.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você pode ser o elo que quebra essas correntes para sempre, liberando não apenas você, mas toda sua linhagem familiar.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Divindade, limpe em mim todos os traumas ancestrais. Que eu seja o curador de minha linhagem. Liberte meus antepassados e descendentes."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Esta é uma das formas mais poderosas de servir - curando o passado e protegendo o futuro através da limpeza presente.</p>`
    },
    {
        title: "Transformando Relacionamentos Tóxicos",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💔 De Veneno a Medicina</h3><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos tóxicos são nossos maiores professores disfarçados. Eles espelham perfeitamente as memórias que mais precisam de cura em nós.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ao invés de fugir ou lutar, use Ho'oponopono para transformar a energia do relacionamento, começando sempre pela limpeza em você mesmo.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🔄 <strong>Processo de Transformação:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Pare de tentar mudar a outra pessoa</li><li>Foque apenas na limpeza de suas memórias</li><li>Agradeça pelo espelho que ela oferece</li><li>Aplique Ho'oponopono consistentemente</li><li>Permita que a situação se transforme naturalmente</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Milagres acontecem quando você muda sua frequência interna através da limpeza constante.</p>`
    },
    {
        title: "Criando Relacionamentos Sagrados",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💕 Conexões Divinas</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando você está limpo, atrai relacionamentos que refletem essa pureza. Relacionamentos sagrados são baseados no crescimento mútuo e amor incondicional.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Use Ho'oponopono preventivamente em todos os relacionamentos, mantendo o espaço energético limpo e harmonioso sempre.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Que todos os meus relacionamentos sejam bênçãos mútuas. Que eu seja instrumento de amor divino em cada conexão."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos sagrados não são livres de desafios, mas os desafios se tornam oportunidades de crescimento e aprofundamento do amor.</p>`
    },
    {
        title: "Descobrindo Sua Vocação Divina",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎯 O Chamado da Alma</h3><p style="line-height: 1.8; font-size: 1.1em;">Sua vocação verdadeira não é algo que você escolhe com a mente - é algo que emerge quando você está suficientemente limpo para recebê-la.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono remove as camadas de condicionamento que obscurecem seu propósito natural, permitindo que sua missão divina se revele.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Sinais de Vocação Autêntica:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Atividades que energizam ao invés de drenar</li><li>Talentos naturais que fluem sem esforço</li><li>Trabalho que serve ao bem maior</li><li>Sincronicidades constantes abrindo portas</li><li>Sensação de estar "em casa" fazendo isso</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Continue limpando memórias sobre trabalho, dinheiro e propósito até que sua vocação se revele naturalmente.</p>`
    },
    {
        title: "Manifestando Abundância Autêntica",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💰 Riqueza Que Flui Naturalmente</h3><p style="line-height: 1.8; font-size: 1.1em;">Abundância autêntica não vem de forçar ou manipular, mas de limpar todas as memórias que bloqueiam o fluxo natural da prosperidade divina.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você está verdadeiramente limpo, recursos surgem sincronisticamente para apoiar sua missão divina sem esforço ou ansiedade.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Sinto muito pelas memórias de escassez. Me perdoe por bloquear a abundância natural. Te amo, prosperidade divina. Sou grato pelo fluxo perfeito de recursos."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Abundância verdadeira inclui não apenas dinheiro, mas saúde, amor, criatividade, tempo e todas as formas de riqueza da vida.</p>`
    },
    {
        title: "Curando Sua Relação com Dinheiro",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💳 Transformando a Energia Financeira</h3><p style="line-height: 1.8; font-size: 1.1em;">Dinheiro é energia neutra, mas nossas memórias sobre ele criam toda nossa experiência financeira. Cure sua relação com dinheiro e transforme sua vida material.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Muitas pessoas têm memórias conflituosas: querem dinheiro mas acreditam que é "sujo" ou "não espiritual". Ho'oponopono resolve esses conflitos internos.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💡 <strong>Memórias Comuns sobre Dinheiro:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>"Dinheiro é a raiz de todo mal"</li><li>"Pessoas ricas são más"</li><li>"Não mereço abundância"</li><li>"Dinheiro acaba sempre"</li><li>"Tem que sofrer para ganhar dinheiro"</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Limpe cada crença limitante sobre dinheiro até que você possa recebê-lo com gratidão pura e usá-lo com sabedoria divina.</p>`
    },
    {
        title: "Saúde Perfeita Através da Limpeza",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌿 O Corpo como Templo Sagrado</h3><p style="line-height: 1.8; font-size: 1.1em;">Seu corpo é um templo sagrado onde seu Unihipili habita. Muitas doenças são manifestações físicas de memórias emocionais não resolvidas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono pode complementar qualquer tratamento médico, trabalhando nas raízes emocionais e espirituais dos desequilíbrios físicos.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Corpo sagrado, sinto muito pelas memórias que causaram este desequilíbrio. Me perdoe por não te honrar. Te amo, templo divino. Sou grato pela saúde perfeita que és."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Converse diariamente com seu corpo com amor e gratidão, aplicando Ho'oponopono em qualquer área que precise de cura.</p>`
    },
    {
        title: "Libertação de Vícios e Compulsões",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔓 Quebrando Correntes Invisíveis</h3><p style="line-height: 1.8; font-size: 1.1em;">Vícios e compulsões são tentativas do Unihipili de automedicar dores antigas. Ho'oponopono vai à raiz da dor, oferecendo cura verdadeira ao invés de escape temporário.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Trate seu vício com compaixão, não como inimigo. É uma parte ferida de você pedindo amor e cura através da única linguagem que conhece.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💪 <strong>Processo de Libertação:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Reconheça o vício sem julgamento</li><li>Agradeça por ele ter protegido você</li><li>Aplique Ho'oponopono à dor subjacente</li><li>Peça ajuda profissional quando necessário</li><li>Substitua gradualmente por hábitos saudáveis</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">A libertação verdadeira vem quando a dor original é curada, tornando o vício desnecessário naturalmente.</p>`
    },
    {
        title: "Desenvolvendo Intuição Divina",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔮 A Voz Interior da Sabedoria</h3><p style="line-height: 1.8; font-size: 1.1em;">Quanto mais você limpa memórias com Ho'oponopono, mais claramente consegue ouvir a voz da intuição divina - seu Aumakua falando diretamente com você.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Intuição não é pensamento - é saber direto que vem do silêncio. É sempre gentil, amorosa e guia você para o bem maior de todos.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Divindade, limpe tudo que bloqueia minha intuição. Que eu ouça claramente sua voz amorosa guiando cada passo."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Pratique seguir pequenas intuições diárias para fortalecer essa conexão sagrada entre você e a sabedoria universal.</p>`
    },
    {
        title: "Criando Um Lar Sagrado",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🏠 Santuário de Paz</h3><p style="line-height: 1.8; font-size: 1.1em;">Seu lar é o reflexo físico de seu estado interior. Use Ho'oponopono para transformar seu espaço em um santuário sagrado de paz e harmonia.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Cada objeto, cada cômodo pode ser abençoado e energeticamente limpo, criando um ambiente que nutre sua prática espiritual e bem-estar.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌸 <strong>Criando Espaço Sagrado:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Limpe energeticamente cada cômodo</li><li>Remova objetos que carregam memórias pesadas</li><li>Adicione elementos que inspiram paz</li><li>Crie um altar ou espaço de meditação</li><li>Mantenha a organização como prática espiritual</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Um lar sagrado suporta sua transformação e se torna refúgio para regeneração espiritual diária.</p>`
    },
    {
        title: "Educando Crianças com Ho'oponopono",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👶 Criando uma Nova Geração</h3><p style="line-height: 1.8; font-size: 1.1em;">Se você tem filhos ou trabalha com crianças, pode ensinar Ho'oponopono de forma simples e natural, dando-lhes ferramentas poderosas para a vida.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Crianças absorvem Ho'oponopono naturalmente porque ainda não têm resistências mentais. Elas podem transformar rapidamente raiva em amor.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Quando você se machucar ou ficar bravo, diga: 'Sinto muito, me perdoa, te amo, obrigado' e veja a mágica acontecer."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Mais importante que ensinar é modelar. Crianças aprendem pelo que veem você fazer, não pelo que você fala.</p>`
    },
    {
        title: "Ho'oponopono no Trabalho e Negócios",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💼 Transformando o Ambiente Profissional</h3><p style="line-height: 1.8; font-size: 1.1em;">Aplique Ho'oponopono silenciosamente em reuniões, negociações e conflitos profissionais. Você pode transformar ambientes tensos sem ninguém saber.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Negócios baseados em Ho'oponopono prosperam porque operam a partir de integridade, serviço genuíno e harmonia com o fluxo divino.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💡 <strong>Aplicações Profissionais:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Antes de reuniões importantes</li><li>Com clientes ou colegas difíceis</li><li>Para atrair oportunidades alinhadas</li><li>Na tomada de decisões complexas</li><li>Para resolver conflitos organizacionais</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Trabalho se torna serviço divino quando você limpa continuamente as memórias que criam drama e resistência.</p>`
    },
    {
        title: "Servindo ao Mundo Através da Limpeza",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌍 Curador Planetário</h3><p style="line-height: 1.8; font-size: 1.1em;">Cada vez que você pratica Ho'oponopono, não limpa apenas suas memórias pessoais, mas contribui para a cura coletiva da humanidade.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você pode aplicar Ho'oponopono em questões globais - guerras, pobreza, destruição ambiental - limpando em você as memórias que contribuem para esses problemas.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Sinto muito pelas memórias em mim que contribuem para o sofrimento mundial. Me perdoe. Te amo, humanidade. Sou grato pela paz que emerge."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Este é o serviço mais profundo - curar o mundo através de sua própria transformação interior contínua.</p>`
    },
    {
        title: "Preparando-se Para Crises",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⛈️ Navegando Tempestades com Graça</h3><p style="line-height: 1.8; font-size: 1.1em;">Crises são oportunidades intensivas de limpeza. Quando você está preparado com Ho'oponopono, pode navegar qualquer tempestade mantendo paz interior.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">A preparação não é acumular recursos externos, mas desenvolver recursos internos através da prática constante de limpeza.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🛡️ <strong>Preparação Espiritual:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Pratique Ho'oponopono diariamente</li><li>Desenvolva confiança na Divindade</li><li>Cultive desapego a resultados</li><li>Fortaleça sua fé através da experiência</li><li>Crie redes de apoio espiritual</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Quando a crise chegar, você já terá a ferramenta perfeita para transformá-la em bênção através da limpeza contínua.</p>`
    },
    {
        title: "Limpeza de Memórias Coletivas",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌐 Curando a Consciência Coletiva</h3><p style="line-height: 1.8; font-size: 1.1em;">Além das memórias pessoais e familiares, existem memórias coletivas da humanidade - guerras, pandemias, tragédias - que afetam todos nós subconscientemente.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você pode usar Ho'oponopono para limpar essas memórias coletivas, contribuindo para a cura de toda a humanidade através de sua limpeza individual.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Sinto muito pelas memórias coletivas de dor e separação. Me perdoe por carregá-las. Te amo, humanidade unificada. Sou grato pela cura planetária."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Este trabalho silencioso e invisível é uma das formas mais poderosas de servir ao planeta e às futuras gerações.</p>`
    },
    {
        title: "Desenvolvendo Compaixão Radical",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💖 Amor Sem Condições</h3><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono desenvolve naturalmente compaixão radical - a capacidade de amar incondicionalmente mesmo quem nos machuca, porque você entende que todos são vítimas de suas próprias memórias.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Esta compaixão não é fraqueza ou permissividade - é a força mais poderosa do universo, capaz de transformar qualquer situação através do amor puro.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💕 <strong>Sinais de Compaixão Radical:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Capacidade de perdoar instantaneamente</li><li>Ver a criança ferida em pessoas difíceis</li><li>Responder com amor ao invés de reagir</li><li>Sentir paz mesmo diante de agressão</li><li>Irradiar amor naturalmente</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você alcança este nível de compaixão, torna-se um instrumento de cura onde quer que vá.</p>`
    },
    {
        title: "Mestria em Tempos Difíceis",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💪 Força Interior Inabalável</h3><p style="line-height: 1.8; font-size: 1.1em;">A verdadeira mestria em Ho'oponopono se revela nos momentos mais difíceis. É fácil praticar quando tudo está bem - o desafio é manter a limpeza quando tudo desmorona.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Estes momentos são oportunidades preciosas de acelerar seu crescimento espiritual e demonstrar a si mesmo o poder transformador da prática.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Nos momentos mais sombrios, minha luz brilha mais forte. Sou grato pelas oportunidades de mostrar minha maestria."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Cada crise superada com Ho'oponopono fortalece sua fé e confiança na eficácia absoluta desta prática sagrada.</p>`
    },
    {
        title: "Criando Milagres Cotidianos",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">✨ A Vida Como Milagre Constante</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando Ho'oponopono se torna sua forma natural de viver, milagres param de ser eventos raros e se tornam ocorrências cotidianas normais.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Sincronicidades, soluções inesperadas, encontros divinos e manifestações perfeitas se tornam o tecido comum de sua existência diária.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Tipos de Milagres Cotidianos:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Pessoas certas aparecem no momento certo</li><li>Recursos surgem exatamente quando necessários</li><li>Problemas se resolvem sem sua interferência</li><li>Inspirações chegam como downloads divinos</li><li>Amor flui naturalmente em todas as relações</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Você não precisa mais "criar" milagres - você simplesmente vive em estado miraculoso constante através da limpeza.</p>`
    },
    {
        title: "Integrando Ho'oponopono Completamente",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔄 Vivendo a Prática</h3><p style="line-height: 1.8; font-size: 1.1em;">Integração completa significa que Ho'oponopono não é mais algo que você "faz" - é quem você "é". A limpeza se torna tão natural quanto respirar.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Neste nível, você não precisa se lembrar de praticar porque você É a prática viva. Cada pensamento, palavra e ação emerge do Zero State.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Eu não pratico Ho'oponopono. Eu SOU Ho'oponopono vivo. Cada respiração é uma oração, cada momento é uma limpeza."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Esta é a meta final - dissolução completa no processo divino de cura perpétua através do amor incondicional.</p>`
    },
    {
        title: "Tornando-se Professor/Curador",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👨‍🏫 Compartilhando o Dom</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando sua transformação é evidente, pessoas naturalmente serão atraídas para aprender com você. Ensinar Ho'oponopono é uma responsabilidade sagrada.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">O melhor ensino não vem de palavras, mas de ser um exemplo vivo da prática. Sua presença pacífica ensina mais que qualquer explicação.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">📚 <strong>Princípios para Ensinar:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Ensine apenas o que você vive</li><li>Seja humilde - você é apenas um canal</li><li>Continue limpando suas próprias memórias</li><li>Nunca cobre pelo amor divino</li><li>Respeite o ritmo de cada pessoa</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Lembre-se: você não está ensinando técnicas, está transmitindo uma forma divina de viver.</p>`
    },
    {
        title: "Sua Nova Vida Transformada",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌅 O Amanhecer de Uma Nova Existência</h3><p style="line-height: 1.8; font-size: 1.1em;">Parabéns! Você chegou ao final do Módulo 5 completamente transformado. Você não é mais a pessoa que começou esta jornada - você é um ser renovado, limpo e radiante.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Sua vida agora flui em harmonia divina. Problemas se tornaram oportunidades de limpeza, relacionamentos se transformaram em bênçãos mútuas, e trabalho se tornou serviço sagrado.</p><div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(16, 185, 129, 0.3)); padding: 30px; border-radius: 20px; text-align: center; margin: 30px 0;"><p style="font-size: 1.3em; color: #ffffff; margin-bottom: 20px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🌟 TRANSFORMAÇÃO COMPLETA 🌟</p><p style="font-size: 1.1em; color: #e9d5ff; margin-bottom: 20px;">Você agora vive em estado de graça constante</p><p style="color: #10b981; font-style: italic;">"Que sua luz ilumine o caminho para outros"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Continue praticando com alegria, sabendo que cada limpeza não apenas cura você, mas contribui para a cura de todo o planeta. Mahalo! 🌺</p>`
    }
            ]
        },
        6: {
            title: "Módulo 6: Ho'oponopono Avançado",
            description: "Ho'oponopono Avançado: Dominando a Arte da Limpeza",
            pages: [
                {
                   title: "Ho'oponopono Avançado: Dominando a Arte da Limpeza",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">✨ Elevando Sua Prática</h3><p style="line-height: 1.8; font-size: 1.1em;">Você já dominou os fundamentos. Agora é hora de aprofundar sua prática e descobrir técnicas avançadas que aceleram a transformação profunda.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">🚀 O que Vamos Explorar:</h3><p style="line-height: 1.8; font-size: 1.1em;">• Limpeza instantânea em situações críticas</p><p style="line-height: 1.8; font-size: 1.1em;">• Ho'oponopono para traumas profundos</p><p style="line-height: 1.8; font-size: 1.1em;">• Criando campos de energia limpa</p><div style="text-align: center; margin-top: 30px; color: #10b981; font-style: italic;">"A maestria vem da prática constante com amor"</div>`
  },
  {
    title: "Limpeza Instantânea em Situações de Crise",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⚡ Resposta Imediata</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando a vida nos desafia intensamente, precisamos de ferramentas que funcionem instantaneamente. Ho'oponopono pode ser sua ancora em qualquer tempestade.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Em momentos de crise, sua mente racional fica confusa, mas seu coração sempre sabe o caminho de volta à paz.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🆘 <strong>Protocolo de Emergência:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Respire profundamente 3 vezes</li><li>Coloque a mão no coração</li><li>Repita: "Sinto muito, me perdoe"</li><li>Continue até sentir alívio</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Lembre-se: a crise não é o problema, é a oportunidade de limpar memórias antigas que estavam esperando para ser liberadas.</p>`
  },
  {
    title: "Trabalhando com Traumas Profundos",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌊 Curando Feridas Ancestrais</h3><p style="line-height: 1.8; font-size: 1.1em;">Traumas profundos carregam uma intensidade especial porque geralmente envolvem múltiplas camadas de memórias - suas e de gerações passadas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Com Ho'oponopono, você não precisa reviver o trauma para curá-lo. Você simplesmente limpa as memórias que o mantêm ativo em seu sistema.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Eu limpo todas as memórias em mim que criaram esta dor."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Seja gentil consigo mesmo. Traumas profundos podem levar tempo para serem completamente limpos, e isso é perfeitamente normal.</p>`
  },
  {
    title: "Ho'oponopono para Relacionamentos Tóxicos",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💔 Transformando Veneno em Medicina</h3><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos tóxicos são espelhos poderosos que mostram exatamente quais memórias em você precisam ser limpas. Eles são dolorosos, mas também são professores.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ao limpar as memórias que atraíram a toxicidade, você automaticamente muda a dinâmica ou se liberta do relacionamento de forma natural.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🔄 <strong>Processo de Limpeza:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Identifique o gatilho emocional</li><li>Assuma 100% de responsabilidade</li><li>Limpe as memórias ativadas</li><li>Observe as mudanças sutis que começam a acontecer</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Lembre-se: você não está limpando a outra pessoa, está limpando as memórias em você que criaram esta experiência.</p>`
  },
  {
    title: "Criando Campos de Energia Limpa",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌟 O Poder da Presença Pura</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando você pratica Ho'oponopono consistentemente, começa a irradiar uma energia diferente. As pessoas sentem sua presença como um espaço seguro e pacífico.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você se torna um campo de limpeza ambulante, ajudando outros a se conectarem com sua própria paz interior apenas por estar presente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Minha presença é um presente de paz para o mundo."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Este é um dos maiores dons de Ho'oponopono: você se torna um agente de cura silencioso onde quer que vá.</p>`
  },
  {
    title: "Limpeza de Memórias Coletivas",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌍 Curando o Mundo Através de Si</h3><p style="line-height: 1.8; font-size: 1.1em;">As memórias não são apenas pessoais. Carregamos memórias coletivas da humanidade - guerras, injustiças, medos ancestrais. Podemos limpá-las também.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa uma memória coletiva em si mesmo, contribui para a cura de toda a humanidade. Este é um trabalho sagrado e poderoso.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌎 <strong>Memórias Coletivas Comuns:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Medo da escassez e pobreza</li><li>Traumas de guerra e violência</li><li>Separação e preconceito</li><li>Desconexão da natureza</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Ao sentir indignação com problemas mundiais, pergunte: "Que memória em mim precisa ser limpa?" E então limpe com amor.</p>`
  },
  {
    title: "Ho'oponopono nos Sonhos",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌙 Limpeza Durante o Sono</h3><p style="line-height: 1.8; font-size: 1.1em;">Seus sonhos são uma porta direta para o subconsciente onde as memórias ficam armazenadas. Você pode usar Ho'oponopono para limpar enquanto dorme.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Antes de dormir, programe sua mente para continuar a limpeza durante a noite. Muitas vezes você acordará com insights poderosos ou sensação de leveza.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Durante meu sono, limpo todas as memórias que precisam ser liberadas."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Pesadelos são oportunidades especiais de limpeza. Eles mostram memórias que estão prontas para serem transmutadas em luz.</p>`
  },
  {
    title: "Técnicas de Respiração com Ho'oponopono",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🫁 O Poder da Respiração Consciente</h3><p style="line-height: 1.8; font-size: 1.1em;">A respiração é a ponte entre o consciente e o subconsciente. Combinando respiração consciente com Ho'oponopono, você acelera profundamente o processo de limpeza.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Cada expiração carrega embora memórias antigas. Cada inspiração traz energia limpa e renovada para seu sistema.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌬️ <strong>Técnica da Respiração Limpa:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Inspire: "Sinto muito"</li><li>Retenha: "Me perdoe"</li><li>Expire: "Te amo"</li><li>Pausa: "Obrigado"</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Pratique por 5-10 minutos diariamente. Você sentirá uma paz profunda se instalando em todo seu ser.</p>`
  },
  {
    title: "Ho'oponopono para Situações Financeiras",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💰 Limpando Bloqueios de Abundância</h3><p style="line-height: 1.8; font-size: 1.1em;">Dinheiro é energia, e problemas financeiros sempre apontam para memórias de escassez, indignidade ou medo profundamente enraizadas em nosso sistema.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ao limpar essas memórias com Ho'oponopono, você permite que a abundância natural da vida flua mais livremente através de você.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Limpo todas as memórias em mim que bloqueiam minha abundância natural."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Não se concentre no dinheiro em si, mas nas memórias que criam a experiência de limitação. A abundância é seu estado natural.</p>`
  },
  {
    title: "Desenvolvendo Intuição Através da Limpeza",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔮 Despertando Sua Sabedoria Interior</h3><p style="line-height: 1.8; font-size: 1.1em;">Quanto mais você limpa memórias com Ho'oponopono, mais clara se torna sua intuição. As memórias são como ruído que interfere na recepção de sua sabedoria interior.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Sua intuição sempre esteve lá, esperando que você criasse espaço suficiente para ouvi-la. Ho'oponopono é essa criação de espaço.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">✨ <strong>Sinais de Intuição Desperta:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Sensações físicas antes de decisões</li><li>Sonhos que trazem orientação</li><li>Sincronicidades frequentes</li><li>Saber sem saber como sabe</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Confie nos primeiros impulsos que vêm após a prática de Ho'oponopono. Eles geralmente carregam orientação divina.</p>`
      },
    {
        title: "Ho'oponopono para Cura de Vícios e Dependências",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔗 Quebrando Correntes Invisíveis</h3><p style="line-height: 1.8; font-size: 1.1em;">Vícios são tentativas desesperadas de escapar de dores profundas. Por trás de cada dependência existe uma memória de abandono, rejeição ou trauma que precisa ser curada.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono não julga o vício, mas abraça com amor a dor que o criou. Quando você limpa a ferida original, o vício perde seu poder naturalmente.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🔄 <strong>Processo de Libertação:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>No momento do impulso, pause</li><li>Coloque a mão no coração</li><li>Diga: "Que memória em mim criou esta necessidade?"</li><li>Limpe com amor sem julgar</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Seja paciente consigo mesmo. A cura de vícios é uma jornada, não um destino. Cada momento de limpeza é uma vitória.</p>`
  },
  {
    title: "Transmutando Raiva em Poder Pessoal",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔥 Alquimia Emocional</h3><p style="line-height: 1.8; font-size: 1.1em;">A raiva é energia vital bloqueada. Quando você para de resistir à raiva e a limpa com Ho'oponopono, ela se transforma em poder pessoal autêntico.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Raiva não é má - é informação. Ela mostra onde seus limites foram violados e quais memórias de impotência precisam ser curadas.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Limpo todas as memórias em mim que transformaram meu poder em raiva."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você sente raiva, agradeça por ela estar mostrando o caminho de volta ao seu poder. Então limpe as memórias com amor.</p>`
  },
  {
    title: "Ho'oponopono para Medos e Fobias",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👻 Desmaterializando Fantasmas do Passado</h3><p style="line-height: 1.8; font-size: 1.1em;">Medos são memórias de situações onde você se sentiu vulnerável ou em perigo. Eles vivem no seu sistema como alertas de segurança desatualizados.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Com Ho'oponopono, você não precisa ser corajoso - você simplesmente limpa as memórias que criam a ilusão de perigo no presente.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Técnica do Medo Amoroso:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Quando o medo surgir, respire fundo</li><li>Diga: "Olá, medo. Obrigado por tentar me proteger"</li><li>Limpe: "Sinto muito, me perdoe, te amo, obrigado"</li><li>Sinta o medo se dissolvendo em amor</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Lembre-se: você não está eliminando o medo, está curando as memórias que o mantêm ativo desnecessariamente.</p>`
  },
  {
    title: "Criando Rituais Pessoais de Limpeza",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🕯️ Cerimônias Sagradas de Cura</h3><p style="line-height: 1.8; font-size: 1.1em;">Rituais criam um espaço sagrado que potencializa a limpeza. Eles sinalizam para seu subconsciente que algo importante está acontecendo.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você pode criar rituais simples mas poderosos que tornam sua prática de Ho'oponopono ainda mais efetiva e significativa.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Crio espaços sagrados onde a cura pode florescer."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Pode ser acender uma vela, tocar uma música especial, ou simplesmente criar um momento de silêncio. O importante é a intenção.</p>`
  },
  {
    title: "Ho'oponopono e a Cura do Corpo Físico",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💊 Medicina para a Alma</h3><p style="line-height: 1.8; font-size: 1.1em;">O corpo físico é um mapa das suas memórias emocionais. Doenças e sintomas são frequentemente manifestações de memórias não resolvidas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono trabalha na raiz energética da doença, limpando as memórias que criaram o desequilíbrio físico. Isso complementa, não substitui, cuidados médicos.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🏥 <strong>Protocolo de Cura Física:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Coloque as mãos na área afetada</li><li>Pergunte: "Que memória criou isso?"</li><li>Limpe com amor e gratidão</li><li>Visualize luz dourada curando a área</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Seu corpo é sábio. Ele sempre está tentando se comunicar com você através de sintomas. Escute com amor.</p>`
  },
  {
    title: "Limpeza de Memórias Familiares",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👨‍👩‍👧‍👦 Curando a Árvore Genealógica</h3><p style="line-height: 1.8; font-size: 1.1em;">Famílias compartilham memórias coletivas que passam de geração em geração. Padrões destrutivos se repetem até alguém ter coragem de limpá-los.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa uma memória familiar, está curando não apenas a si mesmo, mas a todos os seus ancestrais e descendentes. É um trabalho sagrado.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Limpo todas as memórias em minha linhagem que causaram sofrimento."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Você pode ser o ancestral curado que seus descendentes precisam, e o descendente que honra seus ancestrais com cura.</p>`
  },
  {
    title: "Ho'oponopono no Ambiente de Trabalho",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💼 Transformando Tensões Profissionais</h3><p style="line-height: 1.8; font-size: 1.1em;">O ambiente de trabalho é um laboratório perfeito para praticar Ho'oponopono. Conflitos, estresse e competição são oportunidades de limpeza constante.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você pode transformar qualquer ambiente tóxico em um espaço de paz simplesmente limpando as memórias em você que atraíram essa experiência.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🤝 <strong>Ho'oponopono Profissional:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Antes de reuniões, limpe expectativas</li><li>Durante conflitos, limpe em silêncio</li><li>Após discussões, libere ressentimentos</li><li>Envie amor para colegas difíceis</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Seu trabalho se torna um serviço de amor quando você o usa como oportunidade constante de crescimento e cura.</p>`
  },
  {
    title: "Desenvolvendo Compaixão Através da Limpeza",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💝 O Coração que Abraça Tudo</h3><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono desperta naturalmente a compaixão porque você começa a ver que todos estão lutando com suas próprias memórias dolorosas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Compaixão não é pena - é reconhecer que por trás de cada comportamento difícil existe uma alma ferida pedindo amor.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Vejo através dos olhos do amor, além das máscaras do medo."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você limpa o julgamento em si mesmo, automaticamente para de julgar os outros. Isso é compaixão verdadeira.</p>`
  },
  {
    title: "Ho'oponopono para Situações Legais",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⚖️ Justiça Através do Amor</h3><p style="line-height: 1.8; font-size: 1.1em;">Problemas legais sempre refletem conflitos internos não resolvidos. Quando você limpa as memórias que criaram a situação, soluções começam a aparecer naturalmente.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono não garante que você "ganhará" no sentido tradicional, mas garante que você encontrará paz, independentemente do resultado.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🏛️ <strong>Limpeza Legal:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Limpe ressentimentos contra oponentes</li><li>Libere necessidade de estar "certo"</li><li>Confie no processo divino</li><li>Aceite qualquer resultado com graça</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">A verdadeira vitória é interna: quando você não precisa mais de validação externa para se sentir completo.</p>`
  },
  {
    title: "Integrando Ho'oponopono na Vida Cotidiana",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌅 Vivendo em Estado de Limpeza</h3><p style="line-height: 1.8; font-size: 1.1em;">O objetivo final é que Ho'oponopono se torne tão natural quanto respirar. Cada momento se torna uma oportunidade de escolher amor ao invés de medo.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você não pratica Ho'oponopono apenas em momentos de crise, mas como um estilo de vida - uma forma de navegar pela existência com graça.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Cada momento é uma nova oportunidade de escolher o amor."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Quando Ho'oponopono se torna seu estado natural, você vive em paz constante, independentemente das circunstâncias externas.</p>`
      },
  {
      title: "Ho'oponopono e a Morte: Preparando-se para a Transição",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🕊️ A Passagem Sagrada</h3><p style="line-height: 1.8; font-size: 1.1em;">A morte é a última limpeza - o momento de liberar todas as memórias e retornar à fonte pura. Ho'oponopono prepara você para essa transição sagrada.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você pratica consistentemente, a morte perde seu terror porque você já aprendeu a morrer para as memórias diariamente. É apenas mais uma limpeza.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Preparação Espiritual:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Limpe ressentimentos diariamente</li><li>Perdoe todas as mágoas</li><li>Expresse gratidão pela vida</li><li>Viva cada dia como se fosse o último</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono também ajuda você a lidar com a morte de entes queridos, limpando a dor da separação e celebrando o amor eterno.</p>`
  },
  {
    title: "Criando Legados de Amor Através da Prática",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌺 Sementes de Transformação</h3><p style="line-height: 1.8; font-size: 1.1em;">Sua prática de Ho'oponopono cria ondas invisíveis de cura que tocam gerações futuras. Você está plantando sementes de amor que florescerão muito além de sua existência.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Cada memória que você limpa não apenas cura você, mas quebra padrões destrutivos que poderiam afetar seus descendentes. Este é seu legado mais precioso.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Minha cura hoje é o presente que deixo para o futuro."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Você pode não ver todos os frutos de sua prática, mas confie que cada momento de limpeza contribui para um mundo mais amoroso.</p>`
  },
  {
    title: "Ho'oponopono e Manifestação Consciente",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">✨ Criando do Espaço Limpo</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando você limpa regularmente, cria um espaço interno vazio de memórias limitantes. Deste espaço limpo, suas manifestações fluem naturalmente e em harmonia com seu bem maior.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Não é sobre conseguir o que você quer, mas sobre limpar os obstáculos para que a vida possa se expressar através de você da forma mais bela.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Manifestação Limpa:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Limpe expectativas sobre resultados</li><li>Confie no timing divino</li><li>Permita que o melhor aconteça</li><li>Agradeça antes de receber</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">As melhores manifestações vêm quando você para de forçar e permite que a vida flua através de um coração limpo.</p>`
  },
  {
    title: "Tornando-se um Mestre de Ho'oponopono",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👑 A Jornada do Mestre Interior</h3><p style="line-height: 1.8; font-size: 1.1em;">Um mestre de Ho'oponopono não é alguém que nunca tem problemas, mas alguém que vê cada problema como uma oportunidade sagrada de limpeza e crescimento.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você se torna mestre quando para de resistir à vida e começa a dançar com ela, limpando continuamente tudo que não é amor puro.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Sou um instrumento do amor divino, constantemente sendo afinado pela vida."</p></div><p style="line-height: 1.8; font-size: 1.1em;">A maestria não é um destino, mas um caminho. Cada dia oferece novas oportunidades de aprofundar sua prática e expandir seu amor.</p>`
  },
  {
    title: "O Futuro da Humanidade Através de Ho'oponopono",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌍 Visão de Um Mundo Curado</h3><p style="line-height: 1.8; font-size: 1.1em;">Imagine um mundo onde cada pessoa assume 100% de responsabilidade por sua experiência. Onde conflitos são vistos como oportunidades de cura mútua. Este é o potencial de Ho'oponopono.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você faz parte de uma geração pioneira que está plantando as sementes de uma nova consciência planetária. Sua prática pessoal contribui para essa transformação global.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>O Mundo que Estamos Criando:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Responsabilidade ao invés de culpa</li><li>Compaixão ao invés de julgamento</li><li>Unidade ao invés de separação</li><li>Amor ao invés de medo</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Continue limpando. Continue amando. Você é parte da solução que o mundo precisa. Obrigado por sua coragem de curar.</p><div style="background: rgba(139, 92, 246, 0.3); padding: 30px; border-radius: 20px; margin: 30px 0; text-align: center;"><h3 style="color: #e9d5ff; margin-bottom: 20px;">🙏 Encerramento do Módulo</h3><p style="color: #e9d5ff; font-size: 1.2em; line-height: 1.8;">"Sinto muito por todas as memórias em mim que causaram sofrimento. Me perdoe por não ter conhecido o amor antes. Te amo, vida, obrigado por esta oportunidade de cura. Que todos os seres sejam livres, felizes e em paz."</p></div>`
  }
            ]
        },
        7: {
            title: "Módulo 7: Ho'oponopono e Relacionamentos",
            description: "Ho'oponopono e Relacionamentos: O Espelho da Alma",
            pages: [
                {
                    title: "Ho'oponopono e Relacionamentos: O Espelho da Alma",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💕 O Laboratório do Amor</h3><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos são os maiores professores de Ho'oponopono. Cada pessoa em sua vida é um espelho perfeito, refletindo de volta as memórias que precisam ser limpas em você.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">🌟 O que Vamos Explorar:</h3><p style="line-height: 1.8; font-size: 1.1em;">• Curando relacionamentos tóxicos através da limpeza interior</p><p style="line-height: 1.8; font-size: 1.1em;">• Atraindo amor verdadeiro limpando memórias de abandono</p><p style="line-height: 1.8; font-size: 1.1em;">• Transformando conflitos em oportunidades de crescimento</p><div style="text-align: center; margin-top: 30px; color: #10b981; font-style: italic;">"O amor que você busca lá fora já existe dentro de você"</div>`
  },
  {
    title: "A Lei do Espelho nos Relacionamentos",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🪞 Reflexos Perfeitos</h3><p style="line-height: 1.8; font-size: 1.1em;">Tudo que você vê no outro - bom ou ruim - existe primeiro em você. Relacionamentos são espelhos que mostram suas memórias mais profundas de forma amplificada.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando alguém te irrita, está mostrando uma memória em você que precisa ser limpa. Quando alguém te inspira, está refletindo a luz já presente em seu ser.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🔍 <strong>Perguntas para Reflexão:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>O que mais me incomoda nesta pessoa?</li><li>Onde esta qualidade existe em mim?</li><li>Que memória criou esta reação?</li><li>Como posso limpar isso com amor?</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você limpa o que vê no espelho, automaticamente transforma a experiência do relacionamento.</p>`
  },
  {
    title: "Limpando Memórias de Abandono e Rejeição",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💔 Curando Feridas Primais</h3><p style="line-height: 1.8; font-size: 1.1em;">Memórias de abandono e rejeição são as mais dolorosas porque tocam nossa necessidade básica de amor e aceitação. Elas criam padrões de relacionamento que se repetem até serem limpas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Estas memórias geralmente vêm da infância, mas podem ser de vidas passadas ou ancestrais. Ho'oponopono as cura todas de uma vez, sem precisar analisá-las.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Limpo todas as memórias em mim que criaram a ilusão de separação do amor."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você limpa essas memórias, para de projetar abandono nos outros e começa a atrair relacionamentos baseados em amor verdadeiro.</p>`
  },
  {
    title: "Ho'oponopono para Relacionamentos Românticos",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💖 O Amor Consciente</h3><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos românticos são intensos porque ativam nossas memórias mais profundas sobre amor, valor próprio e intimidade. Eles são laboratórios perfeitos para Ho'oponopono.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa as memórias que criam drama, dependência ou conflito, o relacionamento se transforma em uma dança sagrada de duas almas crescendo juntas.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💕 <strong>Limpeza Romântica:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Limpe expectativas sobre o parceiro</li><li>Libere necessidade de controle</li><li>Cure memórias de traição</li><li>Ame sem condições</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Amor verdadeiro não precisa de garantias. Ele flui naturalmente de um coração limpo e livre.</p>`
  },
  {
    title: "Curando Relacionamentos com os Pais",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👨‍👩‍👧‍👦 As Raízes do Ser</h3><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos com pais são os mais fundamentais porque moldaram suas primeiras impressões sobre amor, segurança e valor próprio. Curar essas relações cura a base de todos os outros relacionamentos.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Seus pais fizeram o melhor que puderam com as memórias que tinham. Quando você limpa ressentimentos, libera tanto você quanto eles para experimentar amor puro.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Honro meus pais limpando as memórias que nos separam do amor."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Não importa se seus pais estão vivos ou não - a limpeza acontece no nível espiritual e transforma a energia entre vocês.</p>`
  },
  {
    title: "Transformando Relacionamentos Tóxicos",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔄 Alquimia Relacional</h3><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos tóxicos são os maiores presentes disfarçados. Eles forçam você a confrontar suas memórias mais profundas e desenvolver limites saudáveis.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa as memórias que atraíram a toxicidade, uma de duas coisas acontece: o relacionamento se transforma ou você se liberta dele naturalmente.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">⚖️ <strong>Processo de Transformação:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Identifique os padrões tóxicos</li><li>Encontre essas qualidades em você</li><li>Limpe as memórias sem julgar</li><li>Estabeleça limites com amor</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Lembre-se: você não está tentando mudar o outro, está limpando o que em você criou esta experiência.</p>`
  },
  {
    title: "Ho'oponopono para Relacionamentos Familiares",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🏠 Curando o Ninho</h3><p style="line-height: 1.8; font-size: 1.1em;">Famílias carregam memórias coletivas que se estendem por gerações. Padrões de comunicação, traumas e crenças limitantes passam de pais para filhos até alguém escolher limpá-los.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa memórias familiares, não apenas cura suas próprias feridas, mas quebra padrões que poderiam afetar futuras gerações.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Sou o elo curado na corrente familiar que passa amor adiante."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Reuniões familiares se tornam oportunidades sagradas de prática quando você as vê como chances de limpar memórias antigas.</p>`
  },
  {
    title: "Atraindo Relacionamentos Saudáveis",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌸 Magnetismo do Coração Limpo</h3><p style="line-height: 1.8; font-size: 1.1em;">Você atrai relacionamentos que correspondem ao seu nível de limpeza interior. Quanto mais você limpa memórias de indignidade e medo, mais atrai pessoas que vibram em amor.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Relacionamentos saudáveis não são sobre encontrar alguém perfeito, mas sobre duas pessoas comprometidas com o crescimento mútuo através do amor.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">✨ <strong>Preparando-se para Amor Verdadeiro:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Ame-se completamente primeiro</li><li>Limpe expectativas sobre parceiros</li><li>Cure memórias de relacionamentos passados</li><li>Confie no timing divino</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">O amor verdadeiro chega quando você não precisa mais dele para se sentir completo, mas o deseja para celebrar a vida.</p>`
  },
  {
    title: "Lidando com Traições e Decepções",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💔 Transformando Dor em Sabedoria</h3><p style="line-height: 1.8; font-size: 1.1em;">Traições são feridas profundas que ativam memórias primais de abandono e insegurança. Elas parecem vir do outro, mas sempre refletem memórias não resolvidas em você.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono não minimiza a dor da traição, mas oferece um caminho para transformá-la em sabedoria e compaixão mais profundas.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Limpo todas as memórias em mim que criaram esta experiência de traição."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Perdoar não significa aceitar comportamentos inadequados. Significa libertar-se do veneno do ressentimento que só prejudica você.</p>`
  },
  {
    title: "Comunicação Consciente Através de Ho'oponopono",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🗣️ Palavras que Curam</h3><p style="line-height: 1.8; font-size: 1.1em;">A comunicação consciente começa com limpeza interior. Antes de falar, limpe as memórias de raiva, medo ou necessidade de estar certo. Isso transforma completamente a qualidade de suas palavras.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você fala de um espaço limpo, suas palavras carregam amor mesmo quando precisa estabelecer limites ou expressar desacordo.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💬 <strong>Protocolo de Comunicação Limpa:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Pause antes de reagir</li><li>Limpe as emoções ativadas</li><li>Fale do coração, não da ferida</li><li>Escute para entender, não para rebater</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Suas palavras se tornam medicinas quando vêm de um coração limpo e uma intenção pura de conexão.</p>`
                    }
            ]
        },
        8: {
            title: "Módulo 8: Conectando com o Divino",
            description: "Os três selves",
            pages: [
                {
                    title: "Os Três Selves",
                    content: `<div style="text-align: center;"><h3 style="color: #a78bfa;">Unihipili - Criança Interior</h3><p>Guarda todas as memórias</p></div>`
                    }
            ]
        },
        9: {
            title: "Módulo 9: Conectando com o Divino",
            description: "Os três selves",
            pages: [
                {
                    title: "Os Três Selves",
                    content: `<div style="text-align: center;"><h3 style="color: #a78bfa;">Unihipili - Criança Interior</h3><p>Guarda todas as memórias</p></div>`
                    }
            ]
        },
        10: {
            title: "Módulo 10: Conectando com o Divino",
            description: "Os três selves",
            pages: [
                {
                    title: "Os Três Selves",
                    content: `<div style="text-align: center;"><h3 style="color: #a78bfa;">Unihipili - Criança Interior</h3><p>Guarda todas as memórias</p></div>`
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
