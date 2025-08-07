# Pix Message Reader

## 📝 Sobre

Este repositório contém o backend de uma aplicação desenvolvida com **NodeJS** e gerenciada com o **npm**.  
O projeto é parte do processo seletivo da Beeteller. Trata-se de uma API que gera e lê mensagens pix por meio de streams de leitura.

## 📁 Estrutura do Projeto

  O projeto foi feito com base na Clean Architecture. Esse design separa o sistema em camadas bem definidas, de modo que mudanças internas em cada camada não afete diretamente as outras. Essa arquitetura promove uma maior manutenibilidade, testabilidade e flexibilidade, além de reduzir acoplamento. O projeto segue a estrutura abaixo:

* `compose.yaml`: Arquivo do **Docker Compose** para orquestrar os serviços da aplicação (como o banco de dados).
* `package.json` / `package-lock.json`: Definem as dependências e scripts do projeto Node.js.
* `jest.config.js` / `tsconfig.json`: Arquivos de configuração para o framework de testes **Jest** e o compilador **TypeScript**.
* `prisma/`: Diretório do **Prisma ORM**.
    * `schema.prisma`: Define os modelos de dados e a conexão com o banco.
    * `migrations/`: Contém o histórico de evoluções do schema do banco de dados.
* `src/`: Contém todo o código-fonte da aplicação, dividido nas seguintes camadas:
    * `domain/`: A camada mais interna. Contém as **entidades** de negócio, **interfaces de repositório** e a lógica de domínio pura, sem depender de frameworks externos.
    * `application/`: Orquestra as regras de negócio. Contém os **casos de uso (use cases)** e os erros específicos da aplicação.
    * `infra/`: A camada mais externa. Contém as implementações de tecnologias e frameworks, como o **servidor HTTP**, a implementação dos **repositórios com Prisma**, e a configuração de rotas e controllers.
    * `main.ts`: Ponto de entrada **(entrypoint)** da aplicação, onde o servidor é inicializado e as dependências são injetadas.


## ⚙️ Tecnologias Utilizadas

- Typescript
- NodeJS
- Express
- PostgreSQL
- Prisma ORM
- Jest
- Docker

---

## 💡 Decisões Tomadas

### Redundância de receiverIspb no banco de dados
Propositalmente optei por ferir a normalização do banco de dados ao definir um campo "receiverIspb" na tabela "pix_message", o dado já estava disponível na tabela "participant", no entanto, considerando os requisitos da aplicação, observei que fazia sentido abrir mão da teoria de banco de dados e adicionar redundância nesse campo, uma vez que as consultas por mensagens pix dependem fortemente do "receiverIspb". Dessa forma, é possível ganhar em eficiência e perfomance ao realizar as consultas em troca de ferir um pouco com a ideia de normalização de banco de dados.

### Controle de Concorrência Pessimista
O controle de concorrência feito de maneira pessimista, para garantir que uma mesma mensagem pix não seja lida por duas streams diferentes de maneira simultânea. Para isso, foi criado um novo campo na tabela "pix_message", que é responsável por indicar se uma mensagem já foi lida por alguma stream, além disso, quando uma stream encontra mensagens para ler, as linhas do banco de dados que representam essas mensagens são travadas, impedindo que outras consultas leiam dados que estão sendo processados por outra consulta.

### Uso de EventEmitter para notificar a chegada de novas mensagens
Caso uma stream não encontre mensagens assim que criada, ela não retorna imediatamente que não existem mensagens. Ao invés disso, ela deve aguardar até 8 segundos antes de retornar que não encontrou mensagens. Uma das formas mais simples para fazer isso seria criar um loop, que realizasse consultas ao banco a cada x tempo, e, caso encontrasse uma nova mensagem disponível, encerrasse o loop e retornar as mensagens, no entanto, isso poderia causar problemas de performance devido a quantidade elevada de consultas "em vão" ao banco de dados. Para resolver essa regra de negócio, foram utilizados eventos, de modo que as streams ficassem a espera de um evento que uma nova mensagem que interesse a ele foi criada, que era emitido quando novas mensagens eram criadas. Caso n streams estivessem esperando e respondam ao evento ao mesmo tempo, as streams que não conseguiram consultar a mensagem devido a trava de leitura, ela voltava a aguardar uma nova notificação, até que se passasse os 8 segundos que definidos.

## 💡 Pontos de Evolução e Melhorias

### Criação de Testes de Integração, EndToEnd e Performance
Nesse projeto, criei testes unitários para as classes que implementavam use cases e que geravam os dados necessários para criar as mensagens pix e as streams. Além desses testes, criar testes de integração para as implementações das interfaces dos bancos de dados aumentaria a confiabilidade da aplicação. Testes EndtoEnd que atravessem todas as camadas do serviço para garantir o funcionamento como o esperado também seriam interessantes. Por fim, dado o contexto da aplicação, que espera um grande volume de mensagens, realizar testes de performance para entender como o serviço se porta recebendo um grande volume de requisições seriam úteis para validar que ela é capaz de lidar com um alto tráfego.

### Armazenar em Cache as Streams Ativas
Uma opção para melhorar o desempenho da aplicação seria guardar em um cache rápido, como o Redis, a quantidade de streams ativas simultaneamente, evitando realizar consultas diretamente no banco de dados todas as vezes que for criar uma nova stream. No entanto, é necessário estudar a viabilidade dessa adição, uma vez que armazenar em cache dados que mudam constantemente pode não resultar em um aumento de desempenho.

## ▶️ Como Rodar a Aplicação
É necessário possuir o Docker e o Docker Compose instalados na sua máquina.
Primeiramente, é necessário clonar o repositório:
```bash
git clone https://github.com/guilhermefpeixoto/beeteller-backend.git
```
Com o Docker instalado e repositório clonado, abra seu console na raiz do repositório e rode o comando abaixo:
```bash
docker compose up --build
```
Feito isso, os containers do banco de dados e da aplicação estarão rodando na sua máquina. É possível se comunicar com o serviço a partir da porta 8000.

## 🧪 Como Rodar os Testes Unitários
Para rodar os testes unitários, é importante que todas as dependências estejam instaladas. O responsável por gerenciar as dependências é o npm. Então é necessário que ele esteja instalado na sua máquina.
Para rodar os testes, entre no diretório raiz do projeto e rode o comando abaixo:
```bash
npm install
```
Feito isso, você terá instalado todas as dependências do projeto, incluindo as necessárias para os testes.
Então rode:
```
npm run test
```
