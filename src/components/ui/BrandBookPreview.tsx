"use client";

interface BrandIdentity {
  tem_identidade: boolean;
  cores: {
    primaria: string;
    secundaria: string;
    acento: string;
    fundo: string;
    texto: string;
  };
  fontes: {
    titulo: string;
    corpo: string;
  };
  estilo: string;
  personalidade: string;
  logo_descricao: string;
}

interface BrandBookPreviewProps {
  brand: BrandIdentity | null;
  nomeEmpresa: string;
  loading?: boolean;
}

export function BrandBookPreview({ brand, nomeEmpresa, loading }: BrandBookPreviewProps) {
  if (loading) {
    return (
      <div className="rounded-[14px] border border-white/5 bg-vms-card p-6 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-1/3 mb-4" />
        <div className="flex gap-3 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-12 h-12 rounded-[10px] bg-white/5" />
          ))}
        </div>
        <div className="h-3 bg-white/5 rounded w-2/3 mb-2" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
      </div>
    );
  }

  if (!brand) return null;

  return (
    <div className="rounded-[14px] border border-vms-primaria/20 bg-vms-card p-6 shadow-[0_0_30px_rgba(170,255,0,0.05)]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-vms-primaria animate-pulse" />
        <h3 className="text-vms-primaria text-xs font-semibold uppercase tracking-wider">
          BrandBook Gerado
        </h3>
      </div>

      <div className="mb-5">
        <div
          className="rounded-[12px] p-6 text-center"
          style={{ background: `linear-gradient(135deg, ${brand.cores.primaria}, ${brand.cores.secundaria})` }}
        >
          <span className="text-2xl font-bold" style={{ color: brand.cores.texto, fontFamily: brand.fontes.titulo }}>
            {nomeEmpresa}
          </span>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-vms-muted text-[10px] uppercase tracking-wider mb-2">Paleta de Cores</p>
        <div className="flex gap-2">
          {Object.entries(brand.cores).map(([name, color]) => (
            <div key={name} className="flex flex-col items-center gap-1 flex-1">
              <div
                className="w-full aspect-square rounded-[8px] border border-white/10"
                style={{ backgroundColor: color }}
              />
              <span className="text-vms-muted text-[9px] capitalize">{name}</span>
              <span className="text-vms-dark-5 text-[8px] font-mono">{color}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-vms-muted text-[10px] uppercase tracking-wider mb-2">Tipografia</p>
        <div className="flex flex-col gap-2">
          <div className="rounded-[8px] bg-white/[0.03] p-3">
            <span className="text-vms-dark-5 text-[9px]">TÍTULO</span>
            <p className="text-vms-texto text-lg font-bold" style={{ fontFamily: brand.fontes.titulo }}>
              {brand.fontes.titulo}
            </p>
          </div>
          <div className="rounded-[8px] bg-white/[0.03] p-3">
            <span className="text-vms-dark-5 text-[9px]">CORPO</span>
            <p className="text-vms-texto-2 text-sm" style={{ fontFamily: brand.fontes.corpo }}>
              {brand.fontes.corpo}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-vms-muted text-[10px] uppercase tracking-wider mb-1">Estilo</p>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-vms-primaria/10 text-vms-primaria capitalize">
          {brand.estilo}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-vms-muted text-[10px] uppercase tracking-wider mb-1">Personalidade</p>
        <p className="text-vms-texto-2 text-sm italic">&ldquo;{brand.personalidade}&rdquo;</p>
      </div>

      <div>
        <p className="text-vms-muted text-[10px] uppercase tracking-wider mb-1">Logo Conceito</p>
        <p className="text-vms-texto-2 text-xs">{brand.logo_descricao}</p>
      </div>
    </div>
  );
}
