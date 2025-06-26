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
            if (isMobile) {
        // No mobile: criar uma página por spread, mostrar só uma de cada vez
        module.pages.forEach((page, index) => {
            const spreadDiv = document.createElement('div');
            spreadDiv.className = `page-spread ${index === 0 ? 'current' : 'hidden'}`;
            spreadDiv.id = `spread${index + 1}`;
            
            spreadDiv.innerHTML = `
                <div class="page-left">
                    <div class="page-content">
                        <h2>${page.title}</h2>
                        ${page.content}
                        <div class="page-number">${index + 1}</div>
                    </div>
                </div>
            `;
            
            container.appendChild(spreadDiv);
        });
        totalPages = module.pages.length;
    } else {
        // No desktop: manter lógica original (páginas duplas)
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
                        <div class="page-content">
                            <h2>${leftPage.title}</h2>
                            ${leftPage.content}
                            <div class="page-number">${i + 1}</div>
                        </div>
                    </div>
                `;
            }
            
            if (rightPage) {
                rightContent = `
                    <div class="page-right">
                        <div class="page-content">
                            <h2>${rightPage.title}</h2>
                            ${rightPage.content}
                            <div class="page-number">${i + 2}</div>
                        </div>
                    </div>
                `;
            } else {
                rightContent = `
                    <div class="page-right">
                        <div class="page-content">
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
}

function paginaAnterior() {
    if (currentPage > 1) {
        // Esconder página atual
        const paginaAtual = document.getElementById(`spread${currentPage}`);
        if (paginaAtual) {
            paginaAtual.className = 'page-spread hidden';
        }
        
        currentPage--;
        
        // Mostrar página anterior
        const paginaAnterior = document.getElementById(`spread${currentPage}`);
        if (paginaAnterior) {
            paginaAnterior.className = 'page-spread current';
        }
        
        atualizarPagina();
    }
}

function proximaPagina() {
    if (currentPage < totalPages) {
        // Esconder página atual
        const paginaAtual = document.getElementById(`spread${currentPage}`);
        if (paginaAtual) {
            paginaAtual.className = 'page-spread hidden';
        }
        
        currentPage++;
        
        // Mostrar próxima página
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
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // No mobile: mostrar "Página X de Y" onde Y é o total de páginas individuais
        document.getElementById('pageInfo').textContent = `Página ${currentPage} de ${totalPages}`;
    } else {
        // No desktop: manter lógica original de spreads
        document.getElementById('pageInfo').textContent = `Página ${currentPage} de ${totalPages}`;
    }
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // Atualizar estado dos botões
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        prevBtn.style.opacity = currentPage === 1 ? '0.3' : '1';
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.style.opacity = currentPage === totalPages ? '0.3' : '1';
    }
}

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

// Permitir Enter no campo de nome e adicionar debug
document.addEventListener('DOMContentLoaded', function() {
    const nameInput = document.getElementById('name');
    const btnIniciar = document.getElementById('btnIniciarJornada');
    
    if (nameInput) {
        nameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                entrarApp();
            }
        });
    }
    
    if (btnIniciar) {
        // Adicionar event listener adicional por segurança
        btnIniciar.addEventListener('click', function(e) {
            entrarApp();
        });
    }
});

// Verificar se há usuário salvo e carregar automaticamente
function verificarUsuarioSalvo() {
    try {
        const usuarioSalvo = StorageManager.load(StorageManager.KEYS.USER);
        if (usuarioSalvo && usuarioSalvo.nome && !isAdmin) {
            document.getElementById('name').value = usuarioSalvo.nome;
            // Não fazer auto-login para permitir acesso admin
        }
    } catch (e) {
        // Primeiro acesso ou erro ao carregar usuário
    }
}

// Inicialização quando a página carrega
window.addEventListener('load', function() {
    // Inicializar dados
    inicializarDadosPadrao();
    
    // Verificar usuário salvo
    verificarUsuarioSalvo();
});

// Adicionar suporte a gestos de toque para mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', function(e) {
    if (!touchStartX || !touchStartY) {
        return;
    }

    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    let diffX = touchStartX - touchEndX;
    let diffY = touchStartY - touchEndY;

    // Se está no leitor de livros, permitir navegação por gestos
    if (document.getElementById('book').style.display === 'block') {
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe left - próxima página
                proximaPagina();
            } else {
                // Swipe right - página anterior
                paginaAnterior();
            }
        }
    }

    touchStartX = 0;
    touchStartY = 0;
}, { passive: true });

// Funções globais para compatibilidade
window.ToastManager = ToastManager;
window.logoutAdminSimples = logoutAdminSimples;

// Prevenir F12 e outras teclas de desenvolvedor em produção
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    document.addEventListener('keydown', function(e) {
        // Bloquear F12, Ctrl+Shift+I, Ctrl+U, etc.
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'J') ||
            (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
            return false;
        }
    });
    
    // Bloquear clique direito
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
}typeof Storage !== "undefined") {
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

// Variáveis globais
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

// Inicializar dados padrão
function inicializarDadosPadrao() {
    const modulosPadrao = {
        1: {
            title: "Módulo 1: Descobrindo o Ho'oponopono",
            description: "Introdução à prática havaiana",
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
                }
            ]
        },
        2: {
            title: "Módulo 2: A Ciência da Responsabilidade",
            description: "100% de responsabilidade",
            pages: [
                {
                    title: "100% Responsável",
                    content: `<p style="line-height: 1.8; font-size: 1.1em;">"Você é 100% responsável por tudo que aparece em sua realidade" - Dr. Hew Len</p>`
                },
                {
                    title: "Memórias e Realidade",
                    content: `<p style="line-height: 1.8; font-size: 1.1em;">Nossas memórias subconscientes criam nossa realidade.</p>`
                }
            ]
        },
        3: {
            title: "Módulo 3: Conectando com o Divino",
            description: "Os três selves",
            pages: [
                {
                    title: "Os Três Selves",
                    content: `<div style="text-align: center;"><h3 style="color: #a78bfa;">Unihipili - Criança Interior</h3><p>Guarda todas as memórias</p></div>`
                }
            ]
        }
    };

    // Carregar dados salvos ou usar padrão
    modules = StorageManager.load(StorageManager.KEYS.MODULES, modulosPadrao);
    audiosPersonalizados = StorageManager.load(StorageManager.KEYS.AUDIOS, []);
    diaryEntries = StorageManager.load(StorageManager.KEYS.DIARY, []);
}

// Sequência secreta para revelar acesso admin
function contarCliquesSecretos() {
    const agora = Date.now();
    
    if (agora - tempoUltimoClique > 3000) {
        cliquesSecretos = 0;
    }
    
    cliquesSecretos++;
    tempoUltimoClique = agora;
    
    const logo = document.getElementById('logoSecret');
    logo.style.transform = 'scale(1.1)';
    setTimeout(() => {
        logo.style.transform = 'scale(1)';
    }, 150);
    
    if (cliquesSecretos >= 5) {
        document.getElementById('botaoAdminSecreto').style.display = 'block';
        
        const botao = document.getElementById('botaoAdminSecreto');
        botao.style.opacity = '0';
        botao.style.transform = 'scale(0.5)';
        botao.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            botao.style.opacity = '1';
            botao.style.transform = 'scale(1)';
        }, 100);
        
        cliquesSecretos = 0;
    }
}

// Funções principais
function entrarApp() {
    const nome = document.getElementById('name').value.trim();
    
    if (!nome) {
        alert('Por favor, digite seu nome antes de continuar! 📝');
        return;
    }
    
    userName = nome;
    
    // Salvar usuário
    StorageManager.save(StorageManager.KEYS.USER, { nome, lastLogin: new Date().toISOString() });
    
    // Atualizar interface
    const welcomeElement = document.getElementById('welcome');
    const splashElement = document.getElementById('splash');
    const mainElement = document.getElementById('main');
    
    if (welcomeElement) {
        welcomeElement.textContent = `Bem-vindo, ${nome}`;
    }
    
    if (splashElement && mainElement) {
        splashElement.style.display = 'none';
        mainElement.style.display = 'block';
    }
    
    // Carregar dados na interface
    try {
        carregarModulosNaInterface();
        carregarAudiosNaInterface();
        atualizarDiario();
    } catch (error) {
        // Silencioso
    }
}

// Carregar módulos na interface
function carregarModulosNaInterface() {
    const container = document.getElementById('modulesContainer');
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

// Carregar áudios na interface
function carregarAudiosNaInterface() {
    const audioGrid = document.getElementById('audioGrid');
    const mensagem = document.getElementById('mensagemSemAudios');
    
    if (audiosPersonalizados.length === 0) {
        mensagem.style.display = 'block';
        // Remover áudios antigos se existirem
        const audiosAntigos = audioGrid.querySelectorAll('[id^="audio-container-"]');
        audiosAntigos.forEach(audio => audio.remove());
    } else {
        mensagem.style.display = 'none';
        
        // Limpar e recriar todos os áudios
        const audiosAntigos = audioGrid.querySelectorAll('[id^="audio-container-"]');
        audiosAntigos.forEach(audio => audio.remove());
        
        audiosPersonalizados.forEach(audioData => {
            criarElementoAudio(audioData);
        });
    }
}

// Funções Admin
function abrirLoginAdmin() {
    document.getElementById('loginAdmin').style.display = 'flex';
}

function fecharLoginAdmin() {
    document.getElementById('loginAdmin').style.display = 'none';
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
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

function abrirPainelAdmin() {
    if (isAdmin) {
        document.getElementById('painelAdmin').style.display = 'block';
        carregarSeletorModulos();
        atualizarEstatisticas();
    } else {
        ToastManager.error('Acesso negado! Faça login como admin primeiro.');
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
    
    // Forçar resetar tudo
    isAdmin = false;
    userName = '';
    
    // Esconder main, mostrar splash
    document.getElementById('main').style.display = 'none';
    document.getElementById('splash').style.display = 'flex';
    
    // Limpar campos
    document.getElementById('name').value = '';
    document.getElementById('welcome').textContent = 'Bem-vindo';
    
    // Esconder admin
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('painelAdmin').style.display = 'none';
    document.getElementById('botaoAdminSecreto').style.display = 'none';
    
    // IMPORTANTE: Recarregar áudios sem botão de excluir
    carregarAudiosNaInterface();
    
    ToastManager.success('Logout admin realizado! 👤');
}

function fecharPainelAdmin() {
    document.getElementById('painelAdmin').style.display = 'none';
}

function carregarSeletorModulos() {
    const seletor = document.getElementById('seletorModulo');
    seletor.innerHTML = '<option value="">Selecione um módulo para editar</option>';
    
    Object.entries(modules).forEach(([id, module]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = module.title;
        seletor.appendChild(option);
    });
}

function atualizarEstatisticas() {
    document.getElementById('statModulos').textContent = Object.keys(modules).length;
    
    let totalPaginas = 0;
    Object.values(modules).forEach(mod => {
        totalPaginas += mod.pages.length;
    });
    document.getElementById('statPaginas').textContent = totalPaginas;
    document.getElementById('statAudios').textContent = audiosPersonalizados.length;
}

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

function editarPagina(index) {
    paginaAtualEditor = index;
    const modulo = modules[moduloAtualEditor];
    const pagina = modulo.pages[index];
    
    document.getElementById('editorPaginaAtual').style.display = 'block';
    document.getElementById('numeroPaginaAtual').textContent = index + 1;
    document.getElementById('tituloPagina').value = pagina.title;
    
    const areaConteudo = document.getElementById('areaConteudo');
    areaConteudo.innerHTML = '';
    
    if (pagina.content && pagina.content.trim()) {
        extrairECriarCamposEditaveis(pagina.content, areaConteudo);
    } else {
        areaConteudo.innerHTML = '<p style="color: #999; text-align: center; font-size: clamp(14px, 3vw, 16px);">Clique nos botões acima para adicionar elementos à página</p>';
    }
}

function extrairECriarCamposEditaveis(htmlContent, container) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const elementos = tempDiv.children;
    
    for (let i = 0; i < elementos.length; i++) {
        const elemento = elementos[i];
        elementosContador++;
        let campoEditavel = '';
        
        switch (elemento.tagName.toLowerCase()) {
            case 'h2':
                campoEditavel = `
                    <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #8b5cf6; border-radius: 5px; position: relative;">
                        <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                        <label style="color: #8b5cf6; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 5px;">📝 Título</label>
                        <input type="text" value="${elemento.textContent}" style="width: 100%; padding: clamp(6px, 2vw, 8px); background: rgba(0,0,0,0.3); border: 1px solid #8b5cf6; border-radius: 3px; color: #8b5cf6; font-weight: bold; font-size: clamp(14px, 3vw, 16px);">
                    </div>
                `;
                break;
                
            case 'h3':
                campoEditavel = `
                    <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #10b981; border-radius: 5px; position: relative;">
                        <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                        <label style="color: #10b981; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 5px;">📋 Subtítulo</label>
                        <input type="text" value="${elemento.textContent}" style="width: 100%; padding: clamp(6px, 2vw, 8px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; font-size: clamp(14px, 3vw, 16px);">
                    </div>
                `;
                break;
                
            case 'p':
                campoEditavel = `
                    <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #f59e0b; border-radius: 5px; position: relative;">
                        <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                        <label style="color: #f59e0b; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 5px;">📄 Texto</label>
                        <textarea style="width: 100%; height: clamp(80px, 20vw, 100px); padding: clamp(6px, 2vw, 8px); background: rgba(0,0,0,0.3); border: 1px solid #f59e0b; border-radius: 3px; color: white; resize: vertical; font-size: clamp(14px, 3vw, 16px);">${elemento.textContent}</textarea>
                    </div>
                `;
                break;
                
            case 'div':
                const img = elemento.querySelector('img');
                if (img) {
                    const alt = img.alt || '';
                    const src = img.src || '';
                    campoEditavel = `
                        <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #ef4444; border-radius: 5px; position: relative;">
                            <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                            <label style="color: #ef4444; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 5px;">🖼️ Imagem</label>
                            <input type="file" accept="image/*" style="margin-bottom: 10px;" onchange="carregarImagem(${elementosContador}, this)">
                            <input type="text" value="${alt}" placeholder="Texto alternativo da imagem..." style="width: 100%; padding: clamp(6px, 2vw, 8px); background: rgba(0,0,0,0.3); border: 1px solid #ef4444; border-radius: 3px; color: white; margin-bottom: 10px; font-size: clamp(14px, 3vw, 16px);">
                            <div id="preview-${elementosContador}" style="text-align: center;">
                                <img src="${src}" style="max-width: 200px; max-height: 200px; border-radius: 5px; border: 1px solid #ef4444;">
                                <p style="color: #ef4444; font-size: clamp(11px, 2.5vw, 13px); margin-top: 5px;">Clique em "Escolher arquivo" para trocar a imagem</p>
                            </div>
                        </div>
                    `;
                }
                break;
        }
        
        if (campoEditavel) {
            container.insertAdjacentHTML('beforeend', campoEditavel);
        }
    }
    
    if (container.children.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; font-size: clamp(14px, 3vw, 16px);">Clique nos botões acima para adicionar elementos à página</p>';
    }
}

function adicionarNovaPagina() {
    const modulo = modules[moduloAtualEditor];
    modulo.pages.push({
        title: `Nova Página ${modulo.pages.length + 1}`,
        content: ''
    });
    
    StorageManager.save(StorageManager.KEYS.MODULES, modules);
    carregarModulosNaInterface();
    atualizarListaPaginas();
    atualizarEstatisticas();
    editarPagina(modulo.pages.length - 1);
}

function adicionarElemento(tipo) {
    elementosContador++;
    const areaConteudo = document.getElementById('areaConteudo');
    
    let novoElemento = '';
    
    switch(tipo) {
        case 'titulo':
            novoElemento = `
                <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #8b5cf6; border-radius: 5px; position: relative;">
                    <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                    <label style="color: #8b5cf6; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 5px;">📝 Título</label>
                    <input type="text" placeholder="Digite o título..." style="width: 100%; padding: clamp(6px, 2vw, 8px); background: rgba(0,0,0,0.3); border: 1px solid #8b5cf6; border-radius: 3px; color: #8b5cf6; font-weight: bold; font-size: clamp(14px, 3vw, 16px);">
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
                    <input type="file" accept="image/*" style="margin-bottom: 10px;" onchange="carregarImagem(${elementosContador}, this)">
                    <input type="text" placeholder="Texto alternativo da imagem..." style="width: 100%; padding: clamp(6px, 2vw, 8px); background: rgba(0,0,0,0.3); border: 1px solid #ef4444; border-radius: 3px; color: white; margin-bottom: 10px; font-size: clamp(14px, 3vw, 16px);">
                    <div id="preview-${elementosContador}" style="text-align: center; color: #999; font-size: clamp(12px, 3vw, 14px);">Selecione uma imagem</div>
                </div>
            `;
            break;
    }
    
    if (areaConteudo.innerHTML.includes('Clique nos botões acima')) {
        areaConteudo.innerHTML = '';
    }
    
    areaConteudo.insertAdjacentHTML('beforeend', novoElemento);
    
    setTimeout(() => {
        const campoInput = areaConteudo.querySelector(`[data-elemento="${elementosContador}"] input[type="text"], [data-elemento="${elementosContador}"] textarea`);
        if (campoInput) {
            campoInput.focus();
        }
    }, 100);
}

function removerElemento(id) {
    const elemento = document.querySelector(`[data-elemento="${id}"]`);
    if (elemento) {
        elemento.remove();
    }
}

function carregarImagem(id, input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(`preview-${id}`);
            preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 5px;">`;
        };
        reader.readAsDataURL(file);
    }
}

function salvarPaginaAtual() {
    const titulo = document.getElementById('tituloPagina').value.trim();
    if (!titulo) {
        ToastManager.error('Digite o título da página!');
        return;
    }
    
    const areaConteudo = document.getElementById('areaConteudo');
    let htmlFinal = '';
    
    const elementos = areaConteudo.querySelectorAll('[data-elemento]');
    elementos.forEach(el => {
        const input = el.querySelector('input[type="text"]:not([type="file"])');
        const textarea = el.querySelector('textarea');
        const valor = (input ? input.value.trim() : '') || (textarea ? textarea.value.trim() : '');
        
        if (valor) {
            if (el.querySelector('input[style*="8b5cf6"]')) {
                htmlFinal += `<h2 style="color: #a78bfa; margin-bottom: 20px; text-align: center;">${valor}</h2>`;
            } else if (el.querySelector('input[style*="10b981"]')) {
                htmlFinal += `<h3 style="color: #10b981; margin-bottom: 15px;">${valor}</h3>`;
            } else if (textarea) {
                htmlFinal += `<p style="line-height: 1.8; font-size: 1.1em; margin-bottom: 15px;">${valor}</p>`;
            }
        }
        
        const img = el.querySelector('img');
        if (img) {
            const altInput = el.querySelector('input[type="text"]');
            const alt = altInput ? altInput.value || 'Imagem' : 'Imagem';
            htmlFinal += `<div style="text-align: center; margin: 20px 0;"><img src="${img.src}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 10px; border: 1px solid rgba(139, 92, 246, 0.3);"></div>`;
        }
    });
    
    // Salvar no módulo e persistir
    const modulo = modules[moduloAtualEditor];
    modulo.pages[paginaAtualEditor].title = titulo;
    modulo.pages[paginaAtualEditor].content = htmlFinal;
    
    StorageManager.save(StorageManager.KEYS.MODULES, modules);
    
    // FORÇAR ATUALIZAÇÃO IMEDIATA DA INTERFACE PARA TODOS OS USUÁRIOS
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
    status.style.display = 'none';
}

function testarAudioBasico() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
        
        ToastManager.success('✅ Teste básico de áudio funcionou! Se você ouviu um bip, o sistema está funcionando.');
        
    } catch (error) {
        ToastManager.error('❌ Problema detectado no sistema de áudio do navegador: ' + error.message);
    }
}

// Função global simples para excluir
window.excluirAudioFinal = function(audioId) {
    if (!isAdmin) {
        alert('Apenas administradores podem excluir áudios!');
        return;
    }
    
    if (confirm('EXCLUIR este áudio?\n\nEsta ação não pode ser desfeita!')) {
        // Remover visual
        const elemento = document.getElementById(`audio-container-${audioId}`);
        if (elemento) {
            elemento.remove();
        }
        
        // Remover do array
        const antes = audiosPersonalizados.length;
        audiosPersonalizados = audiosPersonalizados.filter(a => a.id != audioId);
        
        // Salvar
        StorageManager.save(StorageManager.KEYS.AUDIOS, audiosPersonalizados);
        
        // Mostrar mensagem se vazio
        if (audiosPersonalizados.length === 0) {
            document.getElementById('mensagemSemAudios').style.display = 'block';
        }
        
        atualizarEstatisticas();
        alert('Áudio excluído com sucesso!');
    }
};

function criarElementoAudio(audioData) {
    const audioGrid = document.querySelector('#audioContent .modules-grid');
    
    const novoAudio = document.createElement('div');
    novoAudio.className = 'audio-card';
    novoAudio.style.cssText = 'background: rgba(30, 0, 60, 0.3); backdrop-filter: blur(10px); border-radius: 20px; padding: clamp(15px, 4vw, 20px); border: 1px solid rgba(139, 92, 246, 0.3); position: relative; min-height: 200px;';
    novoAudio.id = `audio-container-${audioData.id}`;
    novoAudio.setAttribute('data-audio-id', audioData.id);
    
    // HTML base do áudio
    novoAudio.innerHTML = `
        <div class="audio-play-btn" style="width: clamp(50px, 12vw, 60px); height: clamp(50px, 12vw, 60px); background: linear-gradient(135deg, #8b5cf6, #10b981); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: clamp(24px, 6vw, 30px); margin-bottom: 15px; cursor: pointer; transition: all 0.3s ease;" 
             onclick="reproduzirAudio(${audioData.id})" id="play-btn-${audioData.id}">▶</div>
        
        <h3 style="color: #e9d5ff; margin-bottom: 10px; font-size: clamp(1.1em, 4vw, 1.3em);">${audioData.nome}</h3>
        <p style="color: #c4b5fd; font-size: clamp(0.9em, 3vw, 1em);">${audioData.descricao} • ${audioData.tamanho}KB</p>
        <p style="color: #86efac; font-size: clamp(0.7em, 2.5vw, 0.8em);">Formato: ${audioData.tipo.split('/')[1]?.toUpperCase() || 'MP3'}</p>
        
        <!-- Controles de áudio -->
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
    
    // ADICIONAR BOTÃO EXCLUIR APÓS ADICIONAR AO DOM (APENAS PARA ADMIN)
    if (isAdmin) {
        // Criar botão como elemento separado
        const btnExcluir = document.createElement('button');
        btnExcluir.innerHTML = '🗑️ Excluir';
        btnExcluir.style.cssText = 'position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 13px; font-weight: bold; z-index: 10; min-height: 32px;';
        btnExcluir.setAttribute('data-audio-id', audioData.id);
        
        // Adicionar evento usando addEventListener
        btnExcluir.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.excluirAudioFinal(audioData.id);
        });
        
        // Adicionar ao container
        novoAudio.appendChild(btnExcluir);
    }
}

function reproduzirAudio(audioId) {
    // Parar qualquer áudio que esteja tocando
    if (audioAtualTocando) {
        try {
            if (audioAtualTocando.pause) {
                audioAtualTocando.pause();
            }
            if (audioAtualTocando.source && audioAtualTocando.source.stop) {
                audioAtualTocando.source.stop();
            }
            resetarInterfaceAudio(audioAtualTocando.dataset?.audioId);
        } catch (e) {
            // Silencioso
        }
        audioAtualTocando = null;
    }
    
    // Encontrar o áudio no array
    const audioData = audiosPersonalizados.find(a => a.id === audioId);
    if (!audioData) {
        ToastManager.error('Áudio não encontrado!');
        return;
    }
    
    try {
        // Usar Web Audio API como no original
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Converter base64 para ArrayBuffer
        const base64Data = audioData.arquivo.split(',')[1];
        const binaryString = atob(base64Data);
        const arrayBuffer = new ArrayBuffer(binaryString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
        }
        
        // Mostrar controles
        const controls = document.getElementById(`controls-${audioId}`);
        const playBtn = document.getElementById(`play-btn-${audioId}`);
        
        if (!controls || !playBtn) {
            ToastManager.error('Erro na interface. Recarregue a página.');
            return;
        }
        
        controls.style.display = 'block';
        playBtn.innerHTML = '⌛';
        playBtn.style.background = 'linear-gradient(135deg, #f59e0b, #8b5cf6)';
        
        // Decodificar áudio
        audioContext.decodeAudioData(arrayBuffer)
            .then(audioBuffer => {
                // Atualizar tempo total
                const timeDisplay = document.getElementById(`time-${audioId}`);
                if (timeDisplay) {
                    timeDisplay.textContent = `00:00 / ${formatarTempo(audioBuffer.duration)}`;
                }
                
                // Criar source buffer
                const source = audioContext.createBufferSource();
                const gainNode = audioContext.createGain();
                
                source.buffer = audioBuffer;
                source.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // Armazenar referências para controle
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
                
                // Configurar eventos
                source.onended = function() {
                    resetarInterfaceAudio(audioId);
                    audioAtualTocando = null;
                };
                
                // Iniciar reprodução
                playBtn.innerHTML = '⏸';
                playBtn.style.background = 'linear-gradient(135deg, #ef4444, #f59e0b)';
                
                const startTime = audioContext.currentTime;
                audioAtualTocando.startTime = startTime;
                audioAtualTocando.isPlaying = true;
                
                source.start(0);
                
                // Iniciar timer para atualizar progresso
                iniciarTimerProgresso(audioId, audioBuffer.duration, startTime, audioContext);
                
            })
            .catch(error => {
                tentarReproducaoFallback(audioId, audioData);
            });
        
    } catch (error) {
        tentarReproducaoFallback(audioId, audioData);
    }
}

// Função auxiliar para tentar com método HTML5 (fallback)
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
            ToastManager.error('❌ Não foi possível reproduzir este arquivo. Tente converter para MP3 padrão.');
            resetarInterfaceAudio(audioId);
            audioAtualTocando = null;
        });
        
    } catch (error) {
        ToastManager.error('❌ Não foi possível reproduzir este arquivo. Tente converter para MP3 padrão.');
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
        // Web Audio API
        if (audioAtualTocando.isPlaying) {
            audioAtualTocando.source.stop();
            audioAtualTocando.isPlaying = false;
            document.getElementById(`play-btn-${audioId}`).innerHTML = '▶';
            document.getElementById(`pause-btn-${audioId}`).innerHTML = '▶';
        } else {
            ToastManager.error('Para retomar, clique no botão play principal');
        }
    } else {
        // HTML5 Audio tradicional
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
        // Web Audio API
        if (audioAtualTocando.isPlaying) {
            audioAtualTocando.source.stop();
        }
        audioAtualTocando.isPlaying = false;
        resetarInterfaceAudio(audioId);
        audioAtualTocando = null;
    } else {
        // HTML5 Audio tradicional
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

function irPara(secao) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    
    event.target.closest('.nav-item').classList.add('active');
    document.getElementById(secao + 'Content').classList.add('active');
}

function abrirModulo(num) {
    const module = modules[num];
    if (!module) {
        ToastManager.error('Módulo em desenvolvimento! 🚧');
        return;
    }
    
    currentPage = 1;
    totalPages = module.pages.length; // No mobile, cada página é uma visualização
    
    document.getElementById('bookTitle').textContent = module.title;
    
    const container = document.getElementById('flipbook');
    container.innerHTML = '';
    
    // Verificar se é mobile
    const isMobile = window.innerWidth <= 768;
    
    if (
    // ===== SISTEMA DE ACESSO ADMIN (ADICIONAR NO FINAL) =====

// Função para ativar acesso admin com cliques no logo
function contarCliquesSecretos() {
    const agora = Date.now();
    
    // Reset se passou mais de 3 segundos
    if (agora - tempoUltimoClique > 3000) {
        cliquesSecretos = 0;
    }
    
    cliquesSecretos++;
    tempoUltimoClique = agora;
    
    // Feedback visual no logo
    const logo = document.getElementById('logoSecret');
    if (logo) {
        logo.style.transform = 'scale(1.1)';
        setTimeout(() => {
            logo.style.transform = 'scale(1)';
        }, 150);
    }
    
    // Debug no console (temporário para testar)
    console.log(`Cliques: ${cliquesSecretos}/5`);
    
    // Revelar botão admin após 5 cliques
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
            
            // Mostrar mensagem de confirmação
            if (window.ToastManager) {
                ToastManager.success('🔐 Acesso Admin Desbloqueado!');
            } else {
                alert('🔐 Acesso Admin Desbloqueado!');
            }
        }
        
        cliquesSecretos = 0; // Reset contador
    }
}

// Garantir que as variáveis globais existam
if (typeof cliquesSecretos === 'undefined') {
    var cliquesSecretos = 0;
}
if (typeof tempoUltimoClique === 'undefined') {
    var tempoUltimoClique = 0;
}

// Forçar re-adicionar o evento ao logo quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    const logo = document.getElementById('logoSecret');
    if (logo) {
        // Remover event listeners antigos
        logo.onclick = null;
        // Adicionar novo
        logo.addEventListener('click', contarCliquesSecretos);
        console.log('✅ Event listener do logo admin ativado');
    }
});    
