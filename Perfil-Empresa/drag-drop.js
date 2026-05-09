// Seleciona todos os cards e todas as áreas onde podemos soltar (kanban-cards)
const cards = document.querySelectorAll('.candidato-card');
const zonasDrop = document.querySelectorAll('.kanban-cards');

let cardArrastado = null;

// Configura o que acontece quando clica e segura o card
cards.forEach(card => {
    card.addEventListener('dragstart', function() {
        cardArrastado = this;
        // O setTimeout é um truque para o card original ficar transparente, mas a "sombra" que você arrasta não
        setTimeout(() => this.classList.add('arrastando'), 0);
    });

    card.addEventListener('dragend', function() {
        this.classList.remove('arrastando');
        cardArrastado = null;
        atualizarContadores(); // Chama a função bônus para atualizar os números
    });
});

// Configura o que acontece com as colunas quando o card passa por elas
zonasDrop.forEach(zona => {
    // Permite que o elemento seja solto (por padrão o navegador bloqueia)
    zona.addEventListener('dragover', function(e) {
        e.preventDefault(); 
        this.classList.add('drag-over');
    });

    // Remove a cor de destaque quando o card sai de cima da coluna
    zona.addEventListener('dragleave', function() {
        this.classList.remove('drag-over');
    });

    // O que acontece quando você solta o botão do mouse
    zona.addEventListener('drop', function() {
        this.classList.remove('drag-over');
        if (cardArrastado) {
            this.append(cardArrastado); // Move o HTML do card para esta nova coluna
        }
    });
});

// FUNÇÃO BÔNUS: Atualiza os números no topo das colunas
function atualizarContadores() {
    // Procura todas as colunas
    document.querySelectorAll('.kanban-coluna').forEach(coluna => {
        // Conta quantos cards tem dentro dela agora
        const quantidadeCards = coluna.querySelectorAll('.candidato-card').length;
        // Procura o span com a classe contador e atualiza o número
        const contadorElement = coluna.querySelector('.contador');
        if (contadorElement) {
            contadorElement.textContent = quantidadeCards;
        }
    });
}