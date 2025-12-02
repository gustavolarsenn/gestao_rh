# OrgKPI – Sistema de Análise de Performance Organizacional (SaaS)

<img width="1280" height="200" alt="OrgKPI - GitHub Banner" src="https://github.com/user-attachments/assets/8257248b-0f03-4208-9b9d-17b77319eb9d" />


> Plataforma SaaS para gestão de colaboradores, equipes, hierarquia organizacional, KPIs e performance em múltiplos níveis (individual, equipe e organização).

---

## Badges

![Status](https://img.shields.io/badge/status-Finalizado-green)
![Type](https://img.shields.io/badge/type-SaaS-blue)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-61dafb)
![Backend](https://img.shields.io/badge/backend-NestJS-red)
![Database](https://img.shields.io/badge/database-PostgreSQL-316192)
![Infra](https://img.shields.io/badge/infra-Azure-informational)

---

## Índice

1. [Descrição do Projeto](#descrição-do-projeto)  
2. [Funcionalidades e Demonstração da Aplicação](#funcionalidades-e-demonstração-da-aplicação)
3. [Acesso ao Projeto](#-acesso-ao-projeto)
   - [Testando a aplicação](#testando-a-aplicação)
        - [Acesso colaborador](#acesso-colaborador)
        - [Acesso colaborador](#acesso-colaborador)
        - [Acesso admin](#acesso-admin)
   - [Pré-requisitos](#pré-requisitos)  
   - [Clonando o repositório](#clonando-o-repositório)  
   - [Executando com Node (dev)](#executando-com-node-dev)  
   - [Executando com Docker](#executando-com-docker)  
5. [Tecnologias Utilizadas](#tecnologias-utilizadas)
   - [Frontend](#frontend)
   - [Backend](#backend)
   - [Infra e Monitoramento](#infra-e-monitoramento)
6. [Desenvolvedores do Projeto](#desenvolvedores-do-projeto)  

---

## Descrição do Projeto

O **OrgKPI** é um sistema de **Análise de Performance Organizacional** no modelo **SaaS**, voltado para áreas de RH e gestores que precisam acompanhar desempenho, carreira e estrutura organizacional de forma integrada.

A aplicação permite:

- Modelar a organização em **estrutura de árvore**, conectando colaboradores, gestores, equipes, filiais e unidades organizacionais.
- Definir e acompanhar **KPIs personalizados** em múltiplos níveis (colaborador, equipe e organização).  
- Registrar **avaliações de desempenho** individuais e coletivas.  
- Apoiar **planos de carreira**, evolução profissional e gestão salarial.  
- Disponibilizar **dashboards dinâmicos** com gráficos e indicadores para suporte à tomada de decisão.  
- Separar e analisar dados por **filiais/unidades**, mantendo uma visão consolidada da empresa.

A solução é pensada para ser:

- **Multi-nível** (RH, Gestor de Equipe, Colaborador)  
- **Data-driven**, com decisões guiadas por métricas de performance  
- **Acessível via navegador**, seguindo o modelo SaaS

---

## Funcionalidades e Demonstração da Aplicação

### Funcionalidades Principais

- **Gestão de Colaboradores**
  - Cadastro e atualização de dados pessoais
  - Associação a cargos, equipes e filiais
  - Registro de remuneração e histórico de carreira

- **Estrutura Organizacional**
  - Árvore hierárquica de equipes e gestores
  - Separação por filiais/unidades
  - Exportação da estrutura organizacional

- **Gestão de KPIs**
  - KPIs individuais, de equipe e organizacionais
  - Tipos de KPI: _quanto maior melhor_, _quanto menor melhor_, _binário_  
  - Workflow de aprovação para KPIs preenchidos pelo colaborador
  - Histórico de KPIs por período

- **Avaliação de Desempenho**
  - Registro de avaliações de colaboradores e equipes
  - Avaliação de gestores com base na performance da equipe e feedback dos liderados
  - Visualização da evolução de desempenho ao longo do tempo

- **Dashboards e Relatórios**
  - Dashboards interativos construídos com **Recharts**
  - Visualização de KPIs em tempo real
  - Filtros por período, equipe, funcionário e KPI

- **Segurança e Auditoria**
  - Autenticação com JWT  
  - Controle de acesso baseado em papéis (RBAC)  
  - Logs de auditoria (Grafana Loki)  

---

## 🔗 Acesso ao Projeto

### Testando a aplicação

#### Acesse a aplicação

https://orgkpi.com.br/

#### Acesso líder
- Acesse como líder de equipe, para gerar e visualizar KPIs de seus liderados
  - login: usuario.lider@gmail.com
  - senha: lider123

##### Crie tipos de avaliação ou use as existentes em KPIs -> Tipos de Avaliação (ex.: Features)

<img width="1915" height="664" alt="image" src="https://github.com/user-attachments/assets/61adf392-318a-43aa-b2cb-3889ecfada3c" />

##### A partir do tipo de avaliação criado, crie uma KPI em KPIs -> KPIs (ex.: Features entregues)

<img width="1918" height="674" alt="image" src="https://github.com/user-attachments/assets/39d1118c-43f6-46bc-9118-c8978613f64a" />

##### Atribua uma ou mais KPI para um ou mais colaborador da sua equipe em KPIs -> KPIs de Colaborador (ex.: 10 features entregues no período designado)

<img width="1915" height="790" alt="image" src="https://github.com/user-attachments/assets/33c8371a-74e1-43fb-bb11-49ec4be52843" />

#### Acesso colaborador

##### Registre uma evolução em uma KPI para seu colaborador, ou acesse com o usuário de colaborador para registrar como colaborador em Meus KPIs (ex.: 3)

- login: usuario.colaborador@gmail.com
- senha: usuario123

<img width="1917" height="756" alt="image" src="https://github.com/user-attachments/assets/1ca88423-1133-401d-9856-2182370035c7" />

##### Como líder de equipe, aprove ou reprove evoluções registradas em KPIs -> Revisão de KPIs. Com isso, será possível visualizar progressos em Dashboards

<img width="1919" height="701" alt="image" src="https://github.com/user-attachments/assets/b518f997-aff1-40c0-b63a-1a87aef82b97" />

##### Registre um feedback para seu Líder em Feedback ao Gestor

<img width="1919" height="692" alt="image" src="https://github.com/user-attachments/assets/c8fa02e7-ac89-48c4-9500-8fdde3e08461" />

#### Acesso admin

##### Verifique módulos de criações (pessoas, usuários, funcionários, times, etc) utilizando o login de admin:

- login: admin@admin.com
- senha: admin123

<img width="1892" height="946" alt="image" src="https://github.com/user-attachments/assets/601e0920-fd30-482a-af84-8e19b98c31d1" />


### Pré-requisitos

- **Node.js** LTS (recomendado ≥ 18.x)  
- **npm** ou **yarn**  
- **Docker** e **Docker Compose** (opcional, para subir tudo containerizado)  
- Conta/instância PostgreSQL (local, em contêiner ou Azure)

### Clonando o repositório

```bash
git clone https://github.com/gustavolarsenn/gestao_rh.git
cd gestao_rh
```

#### Executando com Node (dev)

```bash
cd backend
npm install

cp .env.example .env.development
# edite .env com credenciais do PostgreSQL, JWT_SECRET, etc.

# rodar migrations (TypeORM)
npm run migrations:create
npm run migrations:gen
npm run migrations:run

# subir API em modo desenvolvimento
npm run start:dev

cd frontend
npm install

npm run dev
```

#### Executando com docker

```bash
cd backend

cp .env.example .env.development
# edite .env com credenciais do PostgreSQL, JWT_SECRET, etc.

NODE_ENV=development \
VITE_API_URL=http://localhost:3000/api \
docker compose up --build
```
---

## Tecnologias Utilizadas

### Frontend
- React com TypeScript
- Vite
- Recharts (gráficos e dashboards)
- Material UI (componentes de interface)
- Hooks customizados e Context API

### Backend
- **NestJS** (Node.js framework)
- **TypeScript**
- **TypeORM** (ORM + migrations)
- **PostgreSQL** (Azure / VPS)
- **JWT** (autenticação e autorização)
- **Docker** (containerização)
- **Jest** (testes unitários e de integração)

### Infra e Monitoramento
- **Azure VPS** (hospedagem da aplicação e Banco de Dados)
- **GitHub** + **GitHub Actions** (CI/CD)
- **Prometheus** + **Grafana** (métricas e dashboards de monitoramento)
- **Grafana Loki** (centralização de logs)
- **SonarCloud** (Qualidade de Código e Análise Estática)
- **Jira** (gestão de projeto e sprints)
- **Postman** (tests de API)
- **VS Code** (IDE principal)

## Desenvolvedores do Projeto

- **Gustavo William Larsen** – Idealização, arquitetura, backend, frontend e documentação.
