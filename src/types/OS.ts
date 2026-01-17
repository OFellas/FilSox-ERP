export type OSStatus = 
  | "ABERTA" 
  | "EM_ANDAMENTO" 
  | "CONCLUIDA" 
  | "CANCELADA" 
  | string;

export type GarantiaStatus = 
  | "NAO" 
  | "GARANTIA" 
  | "EM_GARANTIA" 
  | "AGUARDANDO_RETIRADA" 
  | "AGUARDANDO_RETORNO"
  | string;

export interface OS {
  id: number;
  numero: string;
  cliente: string;
  documento?: string;
  tipo?: "CELULAR" | "GERAL";
  valor?: string;
  telefone?: string;
  cidade?: string;

  equipamento: string;
  marca?: string;
  operadora?: string;
  serial?: string;
  acessorios?: string;

  problema: string;
  informacoes?: string;
  solucao?: string;
  tecnico?: string;   
  prazo?:string; 

  status: OSStatus;
  garantiaStatus: GarantiaStatus;
  dataAbertura: string;
  dataConclusao?: string;

  foto?: string;        // URL ou Base64

  // --- Fiscal e Garantia ---
  empresaRMA?: string;
  nfNumero?: string;
  rastreio?: string;
}