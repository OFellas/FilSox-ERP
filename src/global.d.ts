export interface IElectronAPI {
  listarOS: () => Promise<any[]>;
  criarOS: (data: any) => Promise<any>;
  atualizarOS: (data: any) => Promise<any>;
  getPendentes: () => Promise<any[]>;
  marcarSincronizado: (uuids: string[]) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}