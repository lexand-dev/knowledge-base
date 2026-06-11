-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable RLS on all tenant-scoped tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant isolation
CREATE POLICY documents_tenant_isolation ON documents
  USING (tenant_id = current_setting('app.tenant_id', true)::integer);

CREATE POLICY document_chunks_tenant_isolation ON document_chunks
  USING (tenant_id = current_setting('app.tenant_id', true)::integer);

CREATE POLICY chat_threads_tenant_isolation ON chat_threads
  USING (tenant_id = current_setting('app.tenant_id', true)::integer);

CREATE POLICY chat_messages_tenant_isolation ON chat_messages
  USING (tenant_id = current_setting('app.tenant_id', true)::integer);

CREATE POLICY citations_tenant_isolation ON citations
  USING (tenant_id = current_setting('app.tenant_id', true)::integer);