import type { OS } from "../types/OS";

// FUNÇÃO PRINCIPAL DE EXPORTAÇÃO PARA CSV
export function exportarOS(osList: OS[]) {
  if (osList.length === 0) {
    alert("Nenhuma OS para exportar");
    return;
  }

  // CABEÇALHOS DO ARQUIVO CSV
  const headers = [
    "Numero OS",
    "Cliente",
    "Telefone",
    "Equipamento",
    "Problema",
    "Solucao",
    "Tecnico",
    "Status",
    "Status Garantia",
    "Data de Abertura",
    "Data de Conclusao",
  ];

  // MAPEAMENTO DOS DADOS DAS LINHAS
  const rows = osList.map(os => [
    os.numero ?? "",
    os.cliente ?? "",
    os.telefone ?? "",
    os.equipamento ?? "",
    os.problema ?? "",
    os.solucao ?? "",
    os.tecnico ?? "",
    os.status ?? "",
    os.garantiaStatus ?? "NAO",
    os.dataAbertura ? formatarData(os.dataAbertura) : "",
    os.dataConclusao ? formatarData(os.dataConclusao) : "",
  ]);

  // MONTAGEM DO CONTEÚDO CSV (SEPARADO POR ;)
  const csvContent = [
    headers.join(";"),
    ...rows.map(r => r.map(c => `"${c}"`).join(";")),
  ].join("\n");

  // CRIAÇÃO DO BLOB PARA DOWNLOAD
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // CRIA LINK INVISÍVEL E CLICA PARA BAIXAR
  const link = document.createElement("a");
  link.href = url;
  link.download = `OS_Export_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

// FORMATA DATA PARA PADRÃO BRASILEIRO
function formatarData(data: string) {
  if (!data) return "";
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR");
}