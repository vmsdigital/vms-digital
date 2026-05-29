-- ============================================
-- Startzy - SQL Completo para Supabase
-- ============================================

-- Tabela: usuarios
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  whatsapp TEXT,
  plano TEXT NOT NULL DEFAULT 'gratuito' CHECK (plano IN ('gratuito', 'starter', 'pro', 'agency', 'admin')),
  afiliado_id UUID,
  cargo TEXT NOT NULL DEFAULT 'criador' CHECK (cargo IN ('admin', 'criador')),
  asaas_customer_id TEXT,
  asaas_subscription_id TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: sites
CREATE TABLE IF NOT EXISTS public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criador_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nome_site TEXT NOT NULL,
  nicho TEXT NOT NULL,
  slug TEXT UNIQUE,
  dominio_personalizado TEXT UNIQUE,
  dados_json JSONB DEFAULT '{}',
  template_id UUID,
  publicado BOOLEAN NOT NULL DEFAULT false,
  favorito BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: clientes
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criador_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT NOT NULL,
  plano_tipo TEXT CHECK (plano_tipo IN ('mensal', 'semestral', 'anual')),
  valor_mensal NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'ativo', 'inadimplente', 'cancelado')),
  vencimento DATE,
  asaas_customer_id TEXT,
  asaas_subscription_id TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: propostas
CREATE TABLE IF NOT EXISTS public.propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criador_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  nome_prospect TEXT NOT NULL,
  whatsapp TEXT,
  status TEXT NOT NULL DEFAULT 'gerado' CHECK (status IN ('gerado', 'enviado', 'negociando', 'fechado', 'perdido')),
  valor_proposto NUMERIC(10,2),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: templates
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nicho TEXT NOT NULL,
  nome TEXT NOT NULL,
  html_base TEXT,
  publico BOOLEAN NOT NULL DEFAULT true,
  criado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: prospeccao
CREATE TABLE IF NOT EXISTS public.prospeccao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criador_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  segmento TEXT NOT NULL,
  cidade TEXT NOT NULL,
  raio_km INTEGER NOT NULL DEFAULT 10,
  resultados JSONB,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: notificacoes
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'sistema' CHECK (tipo IN ('cliente_novo', 'proposta', 'pagamento', 'site_publicado', 'atualizacao', 'sistema')),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: transacoes
CREATE TABLE IF NOT EXISTS public.transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criador_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL DEFAULT 'receita' CHECK (tipo IN ('receita', 'despesa', 'custo_ia', 'reembolso', 'comissao')),
  valor NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pago', 'pendente', 'atrasado')),
  descricao TEXT,
  vencimento DATE,
  pago_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: carteira
CREATE TABLE IF NOT EXISTS public.carteira (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criador_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  saldo NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_entradas NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_saidas NUMERIC(10,2) NOT NULL DEFAULT 0,
  custo_ia_mes NUMERIC(10,2) NOT NULL DEFAULT 0,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: afiliados
CREATE TABLE IF NOT EXISTS public.afiliados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  codigo_indicacao TEXT UNIQUE NOT NULL,
  comissao_percentual NUMERIC(5,2) NOT NULL DEFAULT 20.00,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('ativo', 'inativo', 'pendente')),
  total_indicados INTEGER NOT NULL DEFAULT 0,
  total_comissoes NUMERIC(10,2) NOT NULL DEFAULT 0,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: indicacoes
CREATE TABLE IF NOT EXISTS public.indicacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  afiliado_id UUID NOT NULL REFERENCES public.afiliados(id) ON DELETE CASCADE,
  indicado_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  comissao NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: pagamento_asaas
CREATE TABLE IF NOT EXISTS public.pagamento_asaas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criador_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  asaas_payment_id TEXT,
  asaas_customer_id TEXT,
  tipo TEXT NOT NULL DEFAULT 'boleto' CHECK (tipo IN ('boleto', 'pix', 'cartao')),
  valor NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'overdue', 'cancelled')),
  link_pagamento TEXT,
  vencimento DATE NOT NULL,
  pago_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela: agente_tarefas
CREATE TABLE IF NOT EXISTS public.agente_tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criador_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  segmento TEXT NOT NULL,
  cidade TEXT NOT NULL,
  raio_km INTEGER NOT NULL DEFAULT 25,
  quantidade INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'agendado', 'prospectando', 'gerando', 'concluido', 'erro', 'parcial', 'cancelado')),
  filtro TEXT NOT NULL DEFAULT 'sem_site' CHECK (filtro IN ('sem_site', 'todos', 'com_site')),
  tema_padrao TEXT NOT NULL DEFAULT 'escuro' CHECK (tema_padrao IN ('claro', 'escuro')),
  cor_primaria TEXT NOT NULL DEFAULT '#667eea',
  cor_secundaria TEXT NOT NULL DEFAULT '#764ba2',
  horario_limite TIME NOT NULL DEFAULT '03:00',
  avaliacao_minima NUMERIC(2,1) NOT NULL DEFAULT 0,
  agendado_para TIMESTAMPTZ,
  resultados JSONB DEFAULT '[]',
  sites_criados JSONB DEFAULT '[]',
  sites_erro JSONB DEFAULT '[]',
  total_prospectados INTEGER NOT NULL DEFAULT 0,
  total_sites_criados INTEGER NOT NULL DEFAULT 0,
  total_erros INTEGER NOT NULL DEFAULT 0,
  log TEXT[],
  iniciado_em TIMESTAMPTZ,
  concluido_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Índices
-- ============================================
CREATE INDEX IF NOT EXISTS idx_sites_criador ON public.sites(criador_id);
CREATE INDEX IF NOT EXISTS idx_sites_slug ON public.sites(slug);
CREATE INDEX IF NOT EXISTS idx_sites_dominio ON public.sites(dominio_personalizado);
CREATE INDEX IF NOT EXISTS idx_clientes_criador ON public.clientes(criador_id);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_site ON public.clientes(site_id);
CREATE INDEX IF NOT EXISTS idx_clientes_asaas_customer ON public.clientes(asaas_customer_id);
CREATE INDEX IF NOT EXISTS idx_propostas_criador ON public.propostas(criador_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON public.notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_transacoes_criador ON public.transacoes(criador_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_cliente ON public.transacoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agente_tarefas_criador ON public.agente_tarefas(criador_id);
CREATE INDEX IF NOT EXISTS idx_agente_tarefas_status ON public.agente_tarefas(status);
CREATE INDEX IF NOT EXISTS idx_carteira_criador ON public.carteira(criador_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_criador_tipo ON public.transacoes(criador_id, tipo);

CREATE INDEX IF NOT EXISTS idx_pagamento_asaas_cliente ON public.pagamento_asaas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pagamento_asaas_payment ON public.pagamento_asaas(asaas_payment_id);
CREATE INDEX IF NOT EXISTS idx_afiliados_codigo ON public.afiliados(codigo_indicacao);
CREATE INDEX IF NOT EXISTS idx_indicacoes_afiliado ON public.indicacoes(afiliado_id);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospeccao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.afiliados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamento_asaas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agente_tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carteira ENABLE ROW LEVEL SECURITY;

-- RLS: usuarios
CREATE POLICY "Usuarios podem ver proprio perfil" ON public.usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin pode ver todos usuarios" ON public.usuarios
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND cargo = 'admin')
  );

CREATE POLICY "Usuarios podem atualizar proprio perfil" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id);

-- RLS: sites
CREATE POLICY "Criadores veem proprios sites" ON public.sites
  FOR SELECT USING (criador_id = auth.uid());

CREATE POLICY "Admin ve todos sites" ON public.sites
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND cargo = 'admin')
  );

CREATE POLICY "Criadores criam sites" ON public.sites
  FOR INSERT WITH CHECK (criador_id = auth.uid());

CREATE POLICY "Criadores atualizam proprios sites" ON public.sites
  FOR UPDATE USING (criador_id = auth.uid());

CREATE POLICY "Criadores deletam proprios sites" ON public.sites
  FOR DELETE USING (criador_id = auth.uid());

-- RLS: clientes
CREATE POLICY "Criadores veem proprios clientes" ON public.clientes
  FOR SELECT USING (criador_id = auth.uid());

CREATE POLICY "Clientes veem proprio registro" ON public.clientes
  FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admin ve todos clientes" ON public.clientes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND cargo = 'admin')
  );

CREATE POLICY "Criadores criam clientes" ON public.clientes
  FOR INSERT WITH CHECK (criador_id = auth.uid());

CREATE POLICY "Criadores atualizam proprios clientes" ON public.clientes
  FOR UPDATE USING (criador_id = auth.uid());

CREATE POLICY "Clientes atualizam proprio registro" ON public.clientes
  FOR UPDATE USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- RLS: propostas
CREATE POLICY "Criadores veem proprias propostas" ON public.propostas
  FOR SELECT USING (criador_id = auth.uid());

CREATE POLICY "Criadores criam propostas" ON public.propostas
  FOR INSERT WITH CHECK (criador_id = auth.uid());

CREATE POLICY "Criadores atualizam proprias propostas" ON public.propostas
  FOR UPDATE USING (criador_id = auth.uid());

CREATE POLICY "Criadores deletam proprias propostas" ON public.propostas
  FOR DELETE USING (criador_id = auth.uid());

-- RLS: templates
CREATE POLICY "Templates publicos visiveis" ON public.templates
  FOR SELECT USING (publico = true OR criado_por = auth.uid());

CREATE POLICY "Criadores criam templates" ON public.templates
  FOR INSERT WITH CHECK (criado_por = auth.uid());

-- RLS: prospeccao
CREATE POLICY "Criadores veem proprias prospeccoes" ON public.prospeccao
  FOR SELECT USING (criador_id = auth.uid());

CREATE POLICY "Criadores criam prospeccoes" ON public.prospeccao
  FOR INSERT WITH CHECK (criador_id = auth.uid());

-- RLS: notificacoes
CREATE POLICY "Usuarios veem proprias notificacoes" ON public.notificacoes
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios atualizam proprias notificacoes" ON public.notificacoes
  FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "Admin cria notificacoes" ON public.notificacoes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND cargo = 'admin')
    OR usuario_id = auth.uid()
  );

CREATE POLICY "Usuarios deletam proprias notificacoes" ON public.notificacoes
  FOR DELETE USING (usuario_id = auth.uid());

-- RLS: transacoes
CREATE POLICY "Criadores veem proprias transacoes" ON public.transacoes
  FOR SELECT USING (criador_id = auth.uid());

CREATE POLICY "Criadores criam transacoes" ON public.transacoes
  FOR INSERT WITH CHECK (criador_id = auth.uid());

CREATE POLICY "Criadores atualizam proprias transacoes" ON public.transacoes
  FOR UPDATE USING (criador_id = auth.uid());

-- RLS: afiliados
CREATE POLICY "Usuarios veem proprios afiliados" ON public.afiliados
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Admin ve todos afiliados" ON public.afiliados
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND cargo = 'admin')
  );

-- RLS: indicacoes
CREATE POLICY "Afiliados veem proprias indicacoes" ON public.indicacoes
  FOR SELECT USING (
    afiliado_id IN (SELECT id FROM public.afiliados WHERE usuario_id = auth.uid())
  );

-- RLS: carteira
CREATE POLICY "Criadores veem propria carteira" ON public.carteira
  FOR SELECT USING (criador_id = auth.uid());

CREATE POLICY "Criadores criam propria carteira" ON public.carteira
  FOR INSERT WITH CHECK (criador_id = auth.uid());

CREATE POLICY "Criadores atualizam propria carteira" ON public.carteira
  FOR UPDATE USING (criador_id = auth.uid());

-- RLS: agente_tarefas
CREATE POLICY "Criadores veem proprias tarefas agente" ON public.agente_tarefas
  FOR SELECT USING (criador_id = auth.uid());

CREATE POLICY "Criadores criam tarefas agente" ON public.agente_tarefas
  FOR INSERT WITH CHECK (criador_id = auth.uid());

CREATE POLICY "Criadores atualizam proprias tarefas agente" ON public.agente_tarefas
  FOR UPDATE USING (criador_id = auth.uid());

CREATE POLICY "Criadores deletam proprias tarefas agente" ON public.agente_tarefas
  FOR DELETE USING (criador_id = auth.uid());

-- RLS: pagamento_asaas
CREATE POLICY "Criadores veem pagamentos de seus clientes" ON public.pagamento_asaas
  FOR SELECT USING (criador_id = auth.uid());

CREATE POLICY "Clientes veem proprios pagamentos" ON public.pagamento_asaas
  FOR SELECT USING (
    cliente_id IN (SELECT id FROM public.clientes WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  );

CREATE POLICY "Criadores criam pagamentos" ON public.pagamento_asaas
  FOR INSERT WITH CHECK (criador_id = auth.uid());

CREATE POLICY "Criadores atualizam pagamentos" ON public.pagamento_asaas
  FOR UPDATE USING (criador_id = auth.uid());

-- ============================================
-- Storage Bucket para mídias
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('site-midias', 'site-midias', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Usuarios autenticados podem upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'site-midias' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Qualquer um pode ver midias publicas" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-midias');

CREATE POLICY "Criadores podem deletar proprias midias" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'site-midias' AND auth.role() = 'authenticated'
  );

-- ============================================
-- Trigger: criar usuario ao registrar no auth
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email, whatsapp, plano, cargo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'whatsapp',
    COALESCE(NEW.raw_user_meta_data->>'plano', 'gratuito'),
    COALESCE(NEW.raw_user_meta_data->>'cargo', 'criador')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Trigger: atualizar status cliente ao receber pagamento
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'received' AND (OLD.status IS NULL OR OLD.status != 'received') THEN
    UPDATE public.clientes SET status = 'ativo' WHERE id = NEW.cliente_id;
  ELSIF NEW.status = 'overdue' THEN
    UPDATE public.clientes SET status = 'inadimplente' WHERE id = NEW.cliente_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_payment_status_change ON public.pagamento_asaas;
CREATE TRIGGER on_payment_status_change
  AFTER UPDATE ON public.pagamento_asaas
  FOR EACH ROW EXECUTE FUNCTION public.handle_payment_status_change();

-- ============================================
-- Migrations
-- ============================================
ALTER TABLE sites ADD COLUMN IF NOT EXISTS favorito boolean DEFAULT false;
