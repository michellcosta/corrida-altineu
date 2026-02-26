# 🐳 Instalação do Docker Desktop no Windows

Guia passo a passo para instalar Docker Desktop e rodar o projeto completo.

---

## 📋 Pré-requisitos

- Windows 10/11 (64-bit)
- WSL 2 habilitado
- Virtualização habilitada na BIOS

---

## 🚀 Passo 1: Habilitar WSL 2

### 1.1 Abrir PowerShell como Administrador

```powershell
# Clique direito no Menu Iniciar
# Escolha "Windows PowerShell (Admin)" ou "Terminal (Admin)"
```

### 1.2 Instalar WSL 2

```powershell
wsl --install
```

**Aguarde a instalação** (pode demorar 5-10 minutos)

### 1.3 Reiniciar o Computador

```powershell
Restart-Computer
```

Após reiniciar, o WSL 2 pedirá para criar um usuário Linux (qualquer nome/senha).

---

## 🐳 Passo 2: Instalar Docker Desktop

### 2.1 Download

1. Acesse: https://www.docker.com/products/docker-desktop/
2. Clique em **"Download for Windows"**
3. Aguarde o download (~ 500 MB)

### 2.2 Instalação

1. Execute o instalador `Docker Desktop Installer.exe`
2. Marque: **"Use WSL 2 instead of Hyper-V"**
3. Clique **"OK"**
4. Aguarde a instalação (5-10 minutos)
5. Clique **"Close and restart"**

### 2.3 Primeira Execução

1. Após reiniciar, abra **Docker Desktop**
2. Aceite os termos de serviço
3. Aguarde inicializar (ícone de baleia na bandeja deve ficar verde)
4. **Pronto!** Docker está rodando

---

## ✅ Passo 3: Verificar Instalação

Abra um novo terminal PowerShell:

```powershell
# Verificar versão do Docker
docker --version
# Saída esperada: Docker version 24.x.x

# Verificar Docker Compose
docker compose version
# Saída esperada: Docker Compose version v2.x.x

# Testar
docker run hello-world
# Deve baixar e executar container de teste
```

Se todos os comandos funcionarem, **Docker está instalado corretamente!** ✅

---

## 🚀 Passo 4: Rodar o Projeto

Agora sim, execute os comandos do projeto:

```powershell
# Entre no diretório
cd "c:\Users\Michell Oliveira\Documents\GitHub\corrida-altineu"

# Subir PostgreSQL, Redis e MinIO
docker compose up -d

# Verificar se subiram
docker ps

# Saída esperada:
# CONTAINER ID   IMAGE                NAMES
# xxxxx          postgres:15-alpine   corrida-macuco-db
# xxxxx          redis:7-alpine       corrida-macuco-redis
# xxxxx          minio/minio          corrida-macuco-storage
```

**Pronto!** Banco de dados rodando! 🎉

---

## 🗄️ Passo 5: Configurar Backend

```powershell
# Entrar na pasta backend
cd backend

# Instalar dependências
npm install

# Copiar .env
cp .env.example .env

# Executar migrations
npx prisma migrate dev --name init

# Executar seeds
npm run prisma:seed

# Iniciar backend
npm run start:dev
```

**Resultado esperado:**
```
✅ Database connected
🚀 Backend running on http://localhost:4000
```

---

## 🎯 Verificar Tudo Funcionando

### PostgreSQL (Porta 5432)
```powershell
# Ver logs
docker logs corrida-macuco-db

# Conectar (opcional)
docker exec -it corrida-macuco-db psql -U postgres -d corrida_macuco
```

### Redis (Porta 6379)
```powershell
# Testar conexão
docker exec -it corrida-macuco-redis redis-cli ping
# Resposta: PONG
```

### MinIO (Portas 9000/9001)
```
Console: http://localhost:9001
User: minioadmin
Pass: minioadmin
```

### Prisma Studio
```powershell
cd backend
npx prisma studio
```
Abre em: http://localhost:5555

---

## 🛠️ Comandos Úteis

### Gerenciar Containers

```powershell
# Listar containers rodando
docker ps

# Listar todos (incluindo parados)
docker ps -a

# Parar todos os serviços
docker compose down

# Subir todos novamente
docker compose up -d

# Ver logs em tempo real
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f postgres

# Reiniciar um serviço
docker compose restart postgres

# Remover tudo (⚠️ PERDERÁ DADOS)
docker compose down -v
```

### Gerenciar Volumes

```powershell
# Listar volumes
docker volume ls

# Inspecionar volume do Postgres
docker volume inspect corrida-altineu_postgres_data

# Backup do banco (recomendado)
docker exec corrida-macuco-db pg_dump -U postgres corrida_macuco > backup.sql
```

---

## 🔧 Troubleshooting

### Problema: Docker Desktop não inicia

**Solução:**
1. Abrir "Services" no Windows (Win + R → `services.msc`)
2. Procurar "Docker Desktop Service"
3. Clicar direito → "Start"

### Problema: WSL 2 não está instalado

**Solução:**
```powershell
# PowerShell como Admin
wsl --install
wsl --set-default-version 2
```

### Problema: Virtualização não habilitada

**Solução:**
1. Reiniciar computador
2. Entrar na BIOS (geralmente F2 ou DEL ao ligar)
3. Procurar "Virtualization Technology" ou "Intel VT-x" ou "AMD-V"
4. Habilitar
5. Salvar e sair

### Problema: Porta 5432 já em uso

**Solução:**
```powershell
# Ver o que está usando a porta
netstat -ano | findstr :5432

# Parar PostgreSQL local se tiver instalado
# Ou mudar porta no docker-compose.yml:
#   ports:
#     - "5433:5432"  # Usar 5433 no host
```

### Problema: Docker muito lento

**Solução:**
1. Abrir Docker Desktop
2. Settings → Resources
3. Aumentar CPU: 4 cores
4. Aumentar Memory: 4 GB
5. Apply & Restart

---

## 📊 Recursos do Docker Desktop

### Interface Gráfica

Docker Desktop oferece:
- ✅ Visualização de containers
- ✅ Logs em tempo real
- ✅ Terminal integrado
- ✅ Estatísticas de uso
- ✅ Gerenciamento de volumes
- ✅ Configurações de recursos

### Acessar

1. Abrir **Docker Desktop**
2. Aba **"Containers"** - Ver containers rodando
3. Clicar em um container - Ver logs, terminal, stats

---

## ✅ Checklist Pós-Instalação

Após instalar Docker Desktop, verifique:

- [ ] Docker Desktop está aberto e rodando (ícone de baleia na bandeja)
- [ ] `docker --version` funciona no terminal
- [ ] `docker compose version` funciona
- [ ] `docker run hello-world` executa com sucesso
- [ ] `docker compose up -d` sobe os serviços
- [ ] `docker ps` mostra 3 containers (postgres, redis, minio)
- [ ] Backend conecta no banco
- [ ] Prisma Studio abre em localhost:5555

---

## 🎯 Após Docker Instalado

Continue com: **`BACKEND_SETUP.md`**

Os comandos funcionarão perfeitamente:

```powershell
# 1. Subir serviços
docker compose up -d

# 2. Backend
cd backend
npm install
npx prisma migrate dev
npm run prisma:seed
npm run start:dev
```

---

## 📞 Links Úteis

- **Docker Desktop**: https://www.docker.com/products/docker-desktop/
- **Documentação WSL**: https://learn.microsoft.com/pt-br/windows/wsl/install
- **Docker Docs**: https://docs.docker.com/desktop/install/windows-install/
- **Troubleshooting**: https://docs.docker.com/desktop/troubleshoot/overview/

---

## 🎊 Próximos Passos

### Agora
1. ⏳ Instalar Docker Desktop (10-15 min)
2. ⏳ Reiniciar computador
3. ⏳ Verificar instalação

### Depois
1. ✅ Rodar `docker compose up -d`
2. ✅ Executar backend
3. ✅ Sistema completo funcionando!

---

**Instalação do Docker**: ~20 minutos total (incluindo reinicializações)  
**Vale a pena**: Sistema completo com Postgres + Redis + MinIO funcionando! 🚀

---

**Próximo**: Instale Docker Desktop e volte aqui para continuar! 🎯








