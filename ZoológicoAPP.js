const readline = require('readline');

// Entrada e saída padrão
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Função pra criar um novo animal
function criarAnimal(especie, tamanho, biomas, carnivoro = false) {
    return {
        especie: especie,
        tamanho: tamanho,
        biomas: biomas,
        carnivoro: carnivoro,
        adaptaAoBioma: function(biomasRecinto) {
            return biomasRecinto.some(biomaRecinto => this.biomas.includes(biomaRecinto));
        },
        eCarnivoro: function() {
            return this.carnivoro;
        }
    };
}

// Função pra criar um novo recinto
function criarRecinto(id, biomas, tamanhoTotal, animaisExistentes = []) {
    return {
        id: id,
        biomas: biomas,  // Lista de biomas para o recinto
        tamanhoTotal: tamanhoTotal,
        animaisExistentes: animaisExistentes,
        espacoOcupado: function() {
            let espacoOcupado = this.animaisExistentes.reduce((acc, animal) => acc + animal.tamanho, 0);

            // Espaço extra
            const especiesUnicas = [...new Set(this.animaisExistentes.map(a => a.especie))].length;
            if (especiesUnicas > 1) {
                espacoOcupado += 1;
            }
            return espacoOcupado;
        },
        espacoRestante: function() {
            return this.tamanhoTotal - this.espacoOcupado();
        },
        biomaAdequado: function(animal) {
            return animal.adaptaAoBioma(this.biomas);
        },
        podeAdicionarAnimal: function(animal, quantidade) {
            const especiesPresentes = [...new Set(this.animaisExistentes.map(a => a.especie))];
            const existeCarnivoroNoRecinto = this.animaisExistentes.some(a => a.carnivoro);
    
            // Regra: Se já existe um carnívoro no recinto, não pode adicionar animais não carnívoros
            if (existeCarnivoroNoRecinto && !animal.carnivoro) {
                return false;  // Não pode adicionar herbívoros ou animais não carnívoros a um recinto com carnívoro
            }
    
            // Regra: Carnívoros devem habitar somente com a própria espécie
            if (animal.carnivoro) {
                return this.animaisExistentes.every(a => a.especie === animal.especie);
            }

            //Hipopotamos
            if (animal.especie === 'HIPOPOTAMO' || this.animaisExistentes.some(a => a.especie === 'HIPOPOTAMO')) {
                if (!this.biomas.includes('savana') || !this.biomas.includes('rio')) {
                    return this.animaisExistentes.every(a => a.especie === animal.especie);
                }
            }

            //Macacos
            if (animal.especie === 'MACACO' && this.animaisExistentes.length === 0) {
                return false;
            }

            //Espaço necessario
            let espacoNecessario = animal.tamanho * quantidade;
            if (especiesPresentes.length > 0 && !especiesPresentes.includes(animal.especie)) {
                espacoNecessario += 1;
            }

            return this.espacoRestante() >= espacoNecessario;
        }
    };
}

//Iniciar recintos com múltiplos biomas
function iniciarRecintos() {
    return [
        criarRecinto(1, ['savana', 'floresta'], 10, [criarAnimal('MACACO', 1, ['savana', 'floresta'])]),
        criarRecinto(2, ['floresta'], 5),
        criarRecinto(3, ['savana', 'rio'], 7, [criarAnimal('GAZELA', 2, ['savana'])]), // Recinto com Savana e Rio
        criarRecinto(4, ['rio'], 8),
        criarRecinto(5, ['savana'], 9, [criarAnimal('LEAO', 3, ['savana'], true)])
    ];
}

//Iniciar especie
function iniciarEspecies() {
    return [
        criarAnimal('LEAO', 3, ['savana'], true),
        criarAnimal('LEOPARDO', 2, ['savana'], true),
        criarAnimal('CROCODILO', 3, ['rio'], true),
        criarAnimal('MACACO', 1, ['savana', 'floresta'], false),
        criarAnimal('GAZELA', 2, ['savana'], false),
        criarAnimal('HIPOPOTAMO', 4, ['savana', 'rio'], false) // Hipopótamo adaptado para ambos os biomas
    ];
}

///FUNÇÃO PRINCIPAL!!!///
function main() {
    const recintos = iniciarRecintos();
    const especiesDisponiveis = iniciarEspecies();

    rl.question('Digite o tipo do animal: ', tipoAnimal => {
        tipoAnimal = tipoAnimal.toUpperCase();
        rl.question('Digite a quantidade: ', quantidadeInput => {
            const quantidade = parseInt(quantidadeInput, 10);

            ///tipoAnimal = 'gazela'.toUpperCase();
            ///const quantidade = parseInt(2, 10);

            if (isNaN(quantidade) || quantidade <= 0) {
                console.log('Quantidade inválida');
                rl.close();
                return;
            }

            //Animal existe?
            const animalInformado = especiesDisponiveis.find(a => a.especie === tipoAnimal);
            if (!animalInformado) {
                console.log('Animal inválido');
                rl.close();
                return;
            }

            const recintosViaveis = recintos.filter(r => r.biomaAdequado(animalInformado) && r.podeAdicionarAnimal(animalInformado, quantidade))
                                            .sort((a, b) => a.id - b.id);

            //Resultados finalmente!
            if (recintosViaveis.length === 0) {
                console.log('Não há recinto viável');
            } else {
                recintosViaveis.forEach(recinto => {
                    const espacoRestante = recinto.espacoRestante() - (animalInformado.tamanho * quantidade);
                    console.log(`Recinto ${recinto.id} (espaço livre: ${espacoRestante}, total: ${recinto.tamanhoTotal})`);
                });
            }
            rl.close();
        });
    });
}

main();
