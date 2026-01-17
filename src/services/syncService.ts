import { api } from "./api";

export const SyncService = {
    rodarSincronizacao: async () => {
        try {
            // 1. Pega Configuração (URL da Nuvem)
            const config = await api.getConfig();
            if (!config || !config.cloud_url) {
                console.log(" Nuvem não configurada. Operando offline.");
                return;
            }

            // 2. Busca itens pendentes no Banco Local
            // (Precisamos adicionar essa chamada no api.ts, vou mostrar abaixo)
            const pendentes = await fetch("http://localhost:3001/sync/pendentes").then(r => r.json());

            if (pendentes.os.length === 0 && pendentes.produtos.length === 0) {
                return; // Nada para sincronizar
            }

            console.log(` Sincronizando: ${pendentes.os.length} OS, ${pendentes.produtos.length} Produtos...`);

            // 3. Envia para a Cloudflare
            const cloudResponse = await fetch(`${config.cloud_url}/sync`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    os_pendentes: pendentes.os,
                    produtos_pendentes: pendentes.produtos
                })
            });

            if (!cloudResponse.ok) throw new Error("Erro na Cloudflare");

            // 4. Se deu certo, avisa o Local para marcar como OK
            await fetch("http://localhost:3001/sync/confirmar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    os_ids: pendentes.os.map((i: any) => i.id),
                    produtos_ids: pendentes.produtos.map((i: any) => i.id)
                })
            });

            console.log(" Sincronização concluída com sucesso!");
            return true;

        } catch (error) {
            console.error(" Erro ao sincronizar:", error);
            return false;
        }
    }
};