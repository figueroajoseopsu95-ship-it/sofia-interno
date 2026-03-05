-- 1. Crear base de datos sofia_n8n_db para n8n
SELECT 'CREATE DATABASE sofia_n8n_db OWNER sofia_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sofia_n8n_db')\gexec

-- 2. Extensiones (en sofia_db)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 3. Crear los 4 schemas
CREATE SCHEMA IF NOT EXISTS knowledge;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS audit_mirror;

-- 4. ENUMs del schema public
CREATE TYPE document_type AS ENUM ('V', 'E', 'J', 'P');
CREATE TYPE user_role AS ENUM ('employee', 'supervisor', 'admin', 'superadmin');
CREATE TYPE user_status AS ENUM ('active', 'blocked', 'suspended', 'inactive');
CREATE TYPE channel_type AS ENUM ('web', 'google_chat');
CREATE TYPE conversation_status AS ENUM ('active', 'closed', 'archived');
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system', 'tool');
CREATE TYPE feedback_rating AS ENUM ('positive', 'negative');

-- 5. ENUMs del schema knowledge
CREATE TYPE knowledge.file_type AS ENUM ('pdf', 'docx', 'xlsx', 'html', 'txt', 'pptx');
CREATE TYPE knowledge.document_status AS ENUM ('pending', 'processing', 'indexed', 'error', 'archived');
CREATE TYPE knowledge.chunk_type AS ENUM ('text', 'table', 'header', 'list', 'image_description');
CREATE TYPE knowledge.job_type AS ENUM ('full_ingestion', 're_chunk', 're_embed', 'ocr_only');
CREATE TYPE knowledge.job_status AS ENUM ('queued', 'processing', 'completed', 'failed');

-- 6. Todas las 18 tablas DDL completas con constraints, indices y defaults

-- ** Schema public (7 tablas) **

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    document_type document_type NOT NULL,
    document_number VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    position VARCHAR(150) NULL,
    status user_status NOT NULL DEFAULT 'active',
    last_login_at TIMESTAMPTZ NULL,
    failed_login_attempts INT DEFAULT 0,
    google_chat_id VARCHAR(100) NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT NULL,
    parent_id UUID NULL REFERENCES departments(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, department_id)
);

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    channel channel_type NOT NULL DEFAULT 'web',
    title VARCHAR(255) NULL,
    status conversation_status DEFAULT 'active',
    current_agent VARCHAR(100) NULL,
    metadata JSONB NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ NULL
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role message_role NOT NULL,
    content TEXT NOT NULL,
    agent_id VARCHAR(100) NULL,
    sources_cited JSONB NULL,
    tool_calls JSONB NULL,
    token_count INT NULL,
    latency_ms INT NULL,
    model_used VARCHAR(50) NULL,
    cost_usd DECIMAL(10,6) NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id),
    user_id UUID NOT NULL REFERENCES users(id),
    rating feedback_rating NOT NULL,
    comment TEXT NULL,
    category VARCHAR(50) NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ** Schema knowledge (4 tablas) **

CREATE TABLE knowledge.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT NULL,
    department_id UUID NULL,
    embedding_model VARCHAR(50) NOT NULL DEFAULT 'text-embedding-3-small',
    chunk_strategy VARCHAR(50) DEFAULT 'semantic',
    chunk_size INT DEFAULT 512,
    chunk_overlap INT DEFAULT 50,
    document_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE knowledge.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES knowledge.collections(id),
    title VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    file_type knowledge.file_type NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    total_chunks INT DEFAULT 0,
    total_pages INT NULL,
    ocr_required BOOLEAN DEFAULT false,
    ocr_engine VARCHAR(20) NULL,
    language VARCHAR(10) DEFAULT 'es',
    version INT DEFAULT 1,
    status knowledge.document_status DEFAULT 'pending',
    metadata JSONB NULL,
    indexed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE knowledge.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES knowledge.documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    content_length INT NOT NULL,
    token_count INT NOT NULL,
    embedding VECTOR(1536) NULL,
    embedding_model VARCHAR(50) NULL,
    page_numbers INT[] NULL,
    section_title VARCHAR(500) NULL,
    chunk_type knowledge.chunk_type DEFAULT 'text',
    metadata JSONB NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON knowledge.document_chunks USING hnsw (embedding vector_cosine_ops) WITH (m=16, ef_construction=200);
CREATE INDEX ON knowledge.document_chunks USING GIN (metadata);

CREATE TABLE knowledge.ingestion_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES knowledge.documents(id) ON DELETE CASCADE,
    job_type knowledge.job_type NOT NULL,
    status knowledge.job_status DEFAULT 'queued',
    progress_percent INT DEFAULT 0,
    chunks_created INT DEFAULT 0,
    error_message TEXT NULL,
    started_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    processing_time_ms INT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ** Schema audit (4 tablas) **

CREATE TABLE audit.audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    correlation_id UUID NOT NULL,
    user_id UUID NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NULL,
    resource_id UUID NULL,
    details JSONB NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    channel VARCHAR(20) NULL,
    result VARCHAR(20) NOT NULL DEFAULT 'success',
    error_message TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON audit.audit_logs (user_id);
CREATE INDEX ON audit.audit_logs (action);
CREATE INDEX ON audit.audit_logs (created_at);
CREATE INDEX ON audit.audit_logs USING GIN (details);

CREATE TABLE audit.agent_execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NULL,
    agent_name VARCHAR(100) NOT NULL,
    agent_version VARCHAR(20) NULL,
    trigger_type VARCHAR(20) NOT NULL DEFAULT 'webhook',
    status VARCHAR(20) NOT NULL DEFAULT 'success',
    input_payload JSONB NULL,
    output_payload JSONB NULL,
    tools_invoked JSONB NULL,
    chunks_retrieved JSONB NULL,
    chunks_used_in_response INT NULL,
    llm_model VARCHAR(50) NULL,
    total_tokens INT NULL,
    prompt_tokens INT NULL,
    completion_tokens INT NULL,
    cost_usd DECIMAL(10,6) NULL,
    latency_ms INT NULL,
    n8n_execution_id VARCHAR(100) NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON audit.agent_execution_logs (agent_name);
CREATE INDEX ON audit.agent_execution_logs (conversation_id);
CREATE INDEX ON audit.agent_execution_logs (created_at);

CREATE TABLE audit.table_change_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL,
    old_data JSONB NULL,
    new_data JSONB NULL,
    changed_by UUID NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON audit.table_change_logs (table_name);
CREATE INDEX ON audit.table_change_logs (record_id);
CREATE INDEX ON audit.table_change_logs (changed_at);

CREATE TABLE audit.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    severity VARCHAR(20) NOT NULL DEFAULT 'low',
    event_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    user_id UUID NULL,
    ip_address VARCHAR(45) NULL,
    channel VARCHAR(20) NULL,
    metadata JSONB NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ** Schema audit_mirror (3 tablas) **

CREATE TABLE audit_mirror.users_mirror (
    mirror_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    mirror_version INT NOT NULL,
    mirror_operation VARCHAR(10) NOT NULL,
    mirror_timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    id UUID,
    employee_code VARCHAR(20),
    document_type document_type,
    document_number VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    password_hash VARCHAR(255),
    role user_role,
    position VARCHAR(150),
    status user_status,
    last_login_at TIMESTAMPTZ,
    failed_login_attempts INT,
    google_chat_id VARCHAR(100),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

CREATE TABLE audit_mirror.conversations_mirror (
    mirror_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    mirror_version INT NOT NULL,
    mirror_operation VARCHAR(10) NOT NULL,
    mirror_timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    id UUID,
    user_id UUID,
    channel channel_type,
    title VARCHAR(255),
    status conversation_status,
    current_agent VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

CREATE TABLE audit_mirror.documents_mirror (
    mirror_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    mirror_version INT NOT NULL,
    mirror_operation VARCHAR(10) NOT NULL,
    mirror_timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    id UUID,
    collection_id UUID,
    title VARCHAR(500),
    original_filename VARCHAR(500),
    file_type knowledge.file_type,
    file_size_bytes BIGINT,
    file_path VARCHAR(1000),
    content_hash VARCHAR(64),
    total_chunks INT,
    total_pages INT,
    ocr_required BOOLEAN,
    ocr_engine VARCHAR(20),
    language VARCHAR(10),
    version INT,
    status knowledge.document_status,
    metadata JSONB,
    indexed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- 7. Seed data de departamentos
INSERT INTO departments (name, code, description) VALUES
('Productos y Servicios Digitales', 'PSD', 'Foco de mayor impacto de ahorro FTE'),
('Productos Pasivos', 'PP', 'Cuentas, depositos, certificados'),
('Atencion al Cliente', 'ATC', 'Soporte y atencion al cliente'),
('Finanzas', 'FIN', 'Control de Pagos y Servicios Administrativos'),
('Gestion Comercial y Bancas', 'GCB', 'Ventas y gestion comercial'),
('Legal y Credito', 'LC', 'Mapas normativos y regulacion bancaria');

-- 8. Seed data de colecciones en knowledge
INSERT INTO knowledge.collections (name, code, description, embedding_model) VALUES
('Productos y Servicios Digitales', 'PSD', 'Documentacion de canales digitales', 'text-embedding-3-small'),
('Productos Pasivos', 'PP', 'Normativa de productos pasivos', 'text-embedding-3-small'),
('Atencion al Cliente', 'ATC', 'Procesos y guias de ATC', 'text-embedding-3-small'),
('Finanzas', 'FIN', 'Control de pagos y servicios admin', 'text-embedding-3-small'),
('Gestion Comercial', 'GCB', 'Playbooks comerciales y bancas', 'text-embedding-3-small'),
('Legal y Credito', 'LC', 'Mapas normativos y regulacion', 'text-embedding-3-small'),
('General', 'GENERAL', 'Documentos transversales del banco', 'text-embedding-3-small');
