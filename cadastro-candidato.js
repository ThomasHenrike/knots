// ==========================================
// FUNÇÃO GLOBAL DE NOTIFICAÇÕES (TOAST)
// ==========================================
function mostrarToast(mensagem, tipo = 'aviso') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    let icone = 'fa-circle-info';
    if(tipo === 'sucesso') icone = 'fa-circle-check';
    if(tipo === 'erro') icone = 'fa-circle-xmark';
    if(tipo === 'aviso') icone = 'fa-triangle-exclamation';

    toast.className = `toast ${tipo}`;
    toast.innerHTML = `<i class="fa-solid ${icone}" style="font-size: 1.2rem;"></i> <span>${mensagem}</span>`;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('sumindo');
        setTimeout(() => toast.remove(), 400); 
    }, 4000);
}

// ==========================================
// 1. MÁSCARA DE CPF
// ==========================================
const inputCpf = document.getElementById('cpf');

inputCpf.addEventListener('input', function(e) {
    let valor = e.target.value.replace(/\D/g, ''); 
    if (valor.length > 11) valor = valor.slice(0, 11); 
    
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    e.target.value = valor;
});

// ==========================================
// 2. MOSTRAR / ESCONDER SENHAS (OLHINHO)
// ==========================================
document.querySelectorAll('.toggle-senha').forEach(icone => {
    icone.addEventListener('click', function() {
        const campoInput = this.previousElementSibling; 
        
        if (campoInput.type === 'password') {
            campoInput.type = 'text';
            this.classList.replace('fa-eye', 'fa-eye-slash'); 
        } else {
            campoInput.type = 'password';
            this.classList.replace('fa-eye-slash', 'fa-eye'); 
        }
    });
});

// ==========================================
// 3. NAVEGAÇÃO ENTRE AS ETAPAS
// ==========================================
const btnProximo = document.getElementById('btn-proximo');
const btnVoltar = document.querySelector('.btn-voltar');
const etapa1 = document.getElementById('etapa1');
const etapa2 = document.getElementById('etapa2');
const barraProgresso = document.getElementById('barra-progresso');

btnProximo.addEventListener('click', function() {
    if(inputCpf.value.length < 14) {
        mostrarToast("Preencha o CPF corretamente antes de avançar.", "aviso");
        return;
    }
    
    etapa1.classList.remove('active');
    etapa2.classList.add('active');
    barraProgresso.style.width = '100%';
});

btnVoltar.addEventListener('click', function() {
    etapa2.classList.remove('active');
    etapa1.classList.add('active');
    barraProgresso.style.width = '50%';
});

// ==========================================
// 4. VALIDAÇÃO DE SEGURANÇA E ENVIO
// ==========================================
const formCadastro = document.getElementById('form-cadastro-candidato');
const btnFinalizar = document.getElementById('btn-finalizar');
const urlApi = 'https://sheetdb.io/api/v1/jw8526i98cyvl'; 

formCadastro.addEventListener('submit', function(evento) {
    evento.preventDefault(); 

    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmar_senha').value;
    const termosLgpd = document.getElementById('termos_lgpd').checked;

    if(!termosLgpd) {
        mostrarToast("É necessário aceitar os Termos de Uso e LGPD.", "aviso");
        return; 
    }

    if(senha.length < 6) {
        mostrarToast("A senha precisa ter pelo menos 6 caracteres.", "erro");
        return;
    }

    if(senha !== confirmarSenha) {
        mostrarToast("As senhas não coincidem! Verifique e tente novamente.", "erro");
        return; 
    }
    
    btnFinalizar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando...';
    btnFinalizar.style.opacity = '0.7';
    btnFinalizar.disabled = true;

    const emailDigitado = formCadastro.querySelector('input[name="Email"]').value;
    const cpfDigitado = inputCpf.value; 

    const buscaEmail = fetch(`${urlApi}/search?Email=${emailDigitado}`).then(res => res.json());
    const buscaCPF = fetch(`${urlApi}/search?CPF=${cpfDigitado}`).then(res => res.json());

    Promise.all([buscaEmail, buscaCPF])
        .then(([resultadosEmail, resultadosCPF]) => {
            
            if (resultadosCPF.length > 0) {
                mostrarToast("Este CPF já está vinculado a outra conta!", "erro");
                restaurarBotao();
                
            } else if (resultadosEmail.length > 0) {
                mostrarToast("Este e-mail já está registado! Use outro.", "erro");
                restaurarBotao();
                
            } else {
                btnFinalizar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> A guardar...';
                
                const dadosFormulario = new FormData(formCadastro);

                fetch(urlApi, {
                    method: 'POST',
                    body: dadosFormulario
                })
                .then(respostaSalvar => respostaSalvar.json())
                .then(dadosSalvos => {
                    mostrarToast("Sucesso! Redirecionando para o painel...", "sucesso");
                    setTimeout(() => {
                        window.location.href = 'Perfil-candidato/perfil-candidato.html'; 
                    }, 2000);
                })
                .catch(erroSalvar => {
                    console.error("Erro ao guardar:", erroSalvar);
                    mostrarToast("Ocorreu um erro ao guardar os dados.", "erro");
                    restaurarBotao();
                });
            }
        })
        .catch(erroBusca => {
            console.error("Erro ao verificar dados:", erroBusca);
            mostrarToast("Erro de conexão. Tente novamente.", "erro");
            restaurarBotao();
        });
});

function restaurarBotao() {
    btnFinalizar.innerHTML = 'Criar Conta';
    btnFinalizar.style.opacity = '1';
    btnFinalizar.disabled = false;
}