import React, { useState } from "react";

const BlockSearch = () => {
  const [blockNumber, setBlockNumber] = useState("");
  const [blockData, setBlockData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBlock = async () => {
    // Configurações do nó Bitcoin
    const rpcConfig = {
      url: "http://137.131.145.51:18443",
    };

    setIsLoading(true);
    setError(null);

    try {
      // Primeira chamada: obtém o hash do bloco
      const hashResponse = await fetch(rpcConfig.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "getblockhash",
          params: [parseInt(blockNumber)],
          id: 1,
        }),
      });

      const hashData = await hashResponse.json();

      if (hashData.error) {
        throw new Error(hashData.error.message);
      }

      // Segunda chamada: obtém os detalhes do bloco
      const blockResponse = await fetch(rpcConfig.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "getblock",
          params: [hashData.result],
          id: 1,
        }),
      });

      const blockData = await blockResponse.json();

      if (blockData.error) {
        throw new Error(blockData.error.message);
      }

      setBlockData(blockData.result);
    } catch (error) {
      setError(`Erro ao buscar bloco: ${error.message}`);
      setBlockData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        <input
          type="number"
          value={blockNumber}
          onChange={(e) => setBlockNumber(e.target.value)}
          placeholder="Digite o número do bloco"
          className="p-2 border rounded"
        />
        <button
          onClick={fetchBlock}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {isLoading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {blockData && (
        <div className="space-y-2">
          <h2 className="text-xl font-bold mb-4">Informações do Bloco</h2>
          <p>
            <strong>Hash:</strong> {blockData.hash}
          </p>
          <p>
            <strong>Altura:</strong> {blockData.height}
          </p>
          <p>
            <strong>Timestamp:</strong>{" "}
            {new Date(blockData.time * 1000).toLocaleString()}
          </p>
          <p>
            <strong>Nº de Transações:</strong> {blockData.nTx}
          </p>
          <p>
            <strong>Tamanho:</strong> {blockData.size} bytes
          </p>
          <p>
            <strong>Merkle Root:</strong> {blockData.merkleroot}
          </p>
          <p>
            <strong>Versão:</strong> {blockData.version}
          </p>
          <p>
            <strong>Dificuldade:</strong> {blockData.difficulty}
          </p>
        </div>
      )}
    </div>
  );
};

export default BlockSearch;
