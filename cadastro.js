// ==========================================
// FUNÇÃO GLOBAL DE NOTIFICAÇÕES (TOAST)
// ==========================================
function mostrarToast(mensagem, tipo = 'aviso') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    // Define os ícones baseados no tipo
    let icone = 'fa-circle-info';
    if(tipo === 'sucesso') icone = 'fa-circle-check';
    if(tipo === 'erro') icone = 'fa-circle-xmark';
    if(tipo === 'aviso') icone = 'fa-triangle-exclamation';

    // Monta o visual do toast
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `<i class="fa-solid ${icone} style="font-size: 1.2rem;"></i> <span>${mensagem}</span>`;
    
    // Adiciona na tela
    container.appendChild(toast);

    // Remove automaticamente após 4 segundos
    setTimeout(() => {
        toast.classList.add('sumindo');
        // Espera a animação de saída terminar para remover do HTML
        setTimeout(() => toast.remove(), 400); 
    }, 4000);
}

// ==========================================
// 1. MÁSCARA E AUTOCOMPLETAR DO CNPJ
// ==========================================
const inputCnpj = document.getElementById('cnpj');
const inputRazao = document.getElementById('razao_social');
const avisoCnpj = document.getElementById('aviso-cnpj');

inputCnpj.addEventListener('input', function(e) {
    let valor = e.target.value.replace(/\D/g, ''); 
    if (valor.length > 14) valor = valor.slice(0, 14); 
    
    valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
    valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
    valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    
    e.target.value = valor;
});

inputCnpj.addEventListener('blur', function(e) {
    let cnpjLimpo = e.target.value.replace(/\D/g, ''); 
    
    if(cnpjLimpo.length === 14) {
        avisoCnpj.style.display = 'inline';
        inputRazao.value = ""; 
        
        fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`)
            .then(resposta => resposta.json())
            .then(dados => {
                avisoCnpj.style.display = 'none';
                if(dados.razao_social) {
                    inputRazao.value = dados.razao_social;
                    mostrarToast("Razão Social preenchida automaticamente!", "sucesso");
                } else {
                    mostrarToast("CNPJ não encontrado na Receita Federal.", "aviso");
                }
            })
            .catch(erro => {
                avisoCnpj.style.display = 'none';
                mostrarToast("Não foi possível consultar o CNPJ agora.", "erro");
            });
    }
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
    if(inputCnpj.value.length < 18 || inputRazao.value === "") {
        mostrarToast("Preencha o CNPJ corretamente antes de avançar.", "aviso");
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
const formCadastro = document.getElementById('form-cadastro-empresa');
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
    const cnpjDigitado = inputCnpj.value; 

    const buscaEmail = fetch(`${urlApi}/search?Email=${emailDigitado}`).then(res => res.json());
    const buscaCNPJ = fetch(`${urlApi}/search?CNPJ=${cnpjDigitado}`).then(res => res.json());

    Promise.all([buscaEmail, buscaCNPJ])
        .then(([resultadosEmail, resultadosCNPJ]) => {
            
            if (resultadosCNPJ.length > 0) {
                mostrarToast("Este CNPJ já está vinculado a outra conta!", "erro");
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
                    // Dá um tempinho de 2 segundos para o usuário ler o balão de sucesso antes de mudar de tela
                    setTimeout(() => {
                        window.location.href = '../Perfil-Empresa/perfil-empresa.html'; 
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