<div> 
  <img height="200cm" src="/public/imagens/Letreiro.png"/>
</div>

<div>   
  <a href="https://hubies.onrender.com">
    Hospedagem
  </div>
Projeto para o HackaCriativa
<br>
    
## Resumo do projeto
    
Hubies é uma plataforma de rede social e portfólio profissional projetada para ser a ponte entre o talento universitário e o mercado de trabalho. A aplicação funciona como um "hub" onde estudantes podem exibir seus projetos acadêmicos e pessoais, enquanto empresas podem descobrir e se conectar com novos talentos de forma direcionada e interativa.

1. Públicos-Alvo

A plataforma atende a dois tipos principais de usuários, cada um com funcionalidades específicas:

Alunos: Estudantes universitários de diversas áreas que desejam criar um portfólio dinâmico, compartilhar seus trabalhos, receber feedback e ganhar visibilidade no mercado.

Empresas: Organizações e recrutadores que buscam ativamente por talentos emergentes, podendo avaliar projetos, interagir com estudantes e iniciar processos de recrutamento.

2. Funcionalidades Principais

Feed de Projetos: É a página inicial da plataforma, onde são exibidas as postagens mais recentes dos alunos. Funciona como uma vitrine contínua de novos trabalhos e ideias.

Perfis de Usuário:

Perfil de Aluno: Exibe informações pessoais (nome, curso, universidade, localização), uma galeria com todos os projetos publicados e a média de avaliações recebidas.

Perfil de Empresa: Apresenta o nome da empresa, ramo de atuação e logo.

Publicação e Avaliação: Alunos podem publicar projetos com texto e imagens. Empresas (e outros usuários) podem avaliar os projetos com notas (de 1 a 5 estrelas) e deixar comentários construtivos.

Sistema de Ranking: Uma página dedicada que classifica os projetos com base na média de suas avaliações. É possível filtrar o ranking por área de curso, permitindo que empresas encontrem os trabalhos mais bem avaliados em campos específicos.

Chat Direto: Empresas podem iniciar conversas privadas com alunos diretamente a partir de seus perfis, facilitando o contato para oportunidades de estágio e emprego.

Busca Inteligente: Uma barra de pesquisa global permite encontrar alunos rapidamente pelo nome, tornando a navegação e a descoberta de talentos mais eficiente.

3. Arquitetura e Tecnologia

O projeto é construído sobre uma arquitetura de cliente-servidor robusta e moderna:

Backend (Servidor):

Node.js com o framework Express.js para criar a API RESTful que gerencia toda a lógica de negócios.

SQLite3 como banco de dados para armazenar informações de usuários, projetos, avaliações e mensagens.

Multer para gerenciar o upload de imagens (fotos de perfil e de projetos).

CORS para garantir a comunicação segura entre o frontend e o backend em ambientes de produção.

Frontend (Cliente):

HTML5, CSS3 e JavaScript (Vanilla) para construir a interface do usuário.

Design responsivo e interativo, com animações e transições para uma melhor experiência do usuário.

Comunicação com o backend através de requisições fetch à API.

4. Objetivo do Projeto

O objetivo principal do Hubies é reduzir a distância entre a academia e o mercado, criando um ecossistema onde o mérito e a qualidade dos projetos estudantis são valorizados e facilmente acessíveis por empresas. A plataforma visa empoderar estudantes, oferecendo-lhes uma ferramenta para construir uma reputação profissional antes mesmo de se formarem, ao mesmo tempo que otimiza o processo de recrutamento para as empresas.
    
Tecnologias envolvidas: 
<div>  
  <img height="35cm" src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/HTML5_logo_and_wordmark.svg/2048px-HTML5_logo_and_wordmark.svg.png"/>
  <img height="35cm" src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/CSS3_logo_and_wordmark.svg/1200px-CSS3_logo_and_wordmark.svg.png"/>
  <img height="35cm" src="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png"/>
  <img height="35cm" src="https://upload.wikimedia.org/wikipedia/commons/8/87/Sql_data_base_with_logo.png"/>
  <img height="35cm" src="https://cdn-1.webcatalog.io/catalog/font-awesome/font-awesome-icon-filled-256.png?v=1714774397304"/>
  <img height="35cm" src="https://lh7-us.googleusercontent.com/16b_dSDTkhZe2KDWBjdYpj_rC01XZiPEGMw1crDk7qpuoI9eCOw4uHrUKAatApDT3MvHMjxYMfnGo2SEt-S1C_496zGgqR3yNgL_VioQlwGCRZgKiOq-uztLYJVxhDjja_8Zlf9H_SAJt-KVHlAvzw"/>
  <img height="35cm" src="https://cdn.freebiesupply.com/logos/large/2x/nodejs-1-logo-png-transparent.png"/>
  <img height="35cm" src="https://img.icons8.com/color/512/express-js.png"/>
  <img height="35cm" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Axios_logo_%282020%29.svg/2560px-Axios_logo_%282020%29.svg.png"/>
  <img height="35cm" src="https://download.logo.wine/logo/SQLite/SQLite-Logo.wine.png"/>
  <img height="35cm" src="https://s3.amazonaws.com/appforest_uf/f1614743655848x138438508074741460/brasilapi-logo-small.png"/>
</div>
<br> <br>

## Como fazer para rodar no seu sistema: 
1. Pré-requisitos
Antes de começar, você precisa ter duas ferramentas essenciais instaladas em sua máquina:

Node.js: É o ambiente que executa o nosso servidor JavaScript. Para verificar se você já o tem, abra seu terminal (Prompt de Comando, PowerShell ou Terminal) e digite node -v. Se um número de versão aparecer, ótimo! Se não, baixe e instale a versão LTS a partir do site oficial do Node.js.

Git: É o sistema de controle de versão que usaremos para baixar os arquivos do repositório. Para verificar se o tem, digite git --version. Se não o tiver, baixe-o em git-scm.com.

2. Clonando o Repositório
Primeiro, escolha uma pasta em seu computador onde você deseja salvar o projeto. Abra o terminal nessa pasta e execute o seguinte comando para baixar (clonar) todos os arquivos do repositório:

git clone https://github.com/mickeiascharles/Hubies.git

Após o download, navegue para dentro da pasta do projeto com o comando:

cd Hubies

3. Instalando as Dependências
Com o projeto baixado, precisamos instalar todos os pacotes e bibliotecas que o servidor (backend) precisa para funcionar (como Express, SQLite, etc.). No terminal, dentro da pasta do projeto, execute o seguinte comando:

npm install

Este comando lerá o arquivo package.json e baixará todas as dependências necessárias para a pasta node_modules.

4. Iniciando o Servidor
Agora que tudo está configurado, é hora de ligar o servidor! Execute o seguinte comando no terminal:

node servidor.js

Se tudo der certo, você verá uma mensagem de confirmação no terminal, parecida com esta:

Conectado ao banco de dados SQLite em: C:\...\Hubies-main\data\hubies.db
Servidor do Hubies rodando em http://localhost:3000

Importante: Mantenha esta janela do terminal aberta! Se você a fechar, o servidor será desligado.

5. Acessando a Aplicação
Parabéns! Seu servidor está no ar. Agora, abra o seu navegador de internet (Chrome, Firefox, etc.) e acesse o seguinte endereço:

http://localhost:3000

Você será redirecionado para a página de login e poderá usar a aplicação Hubies em sua máquina local.
<br><br>

<div>
Equipe:
  <a href="https://www.linkedin.com/in/mickeiascharles/">
  <img height="50cm" src="https://brandlogos.net/wp-content/uploads/2016/06/linkedin-logo.png"/>
  Mickeias Charles
  <a href="https://www.linkedin.com/in/gustavo-henrique-0a737229b/">
  <img height="50cm" src="https://brandlogos.net/wp-content/uploads/2016/06/linkedin-logo.png"/>
  Gustavo Henrique
  <a href="https://www.linkedin.com/in/tallysaraujo/">
  <img height="50cm" src="https://brandlogos.net/wp-content/uploads/2016/06/linkedin-logo.png"/>
  Tallys Araújo
  <a href="https://www.linkedin.com/in/yuri-barbosa-386464295/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app">
  <img height="50cm" src="https://brandlogos.net/wp-content/uploads/2016/06/linkedin-logo.png"/>
  Yuri Barbosa
</div>
