import React, { useState } from "react";

const BlockSearch = () => {
  const [blockNumber, setBlockNumber] = useState("");
  const [blockData, setBlockData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalAmount, settotalAmount] = useState();

  const fetchBlock = async () => {
    // Configurações do nó Bitcoin
    const rpcConfig = {
      url: "/rpc",
      username: "user",
      password: "pass",
    };

    setIsLoading(true);
    setError(null);

    if (
      !isNaN(parseInt(blockNumber)) &&
      Number.isInteger(Number(blockNumber))
    ) {
      try {
        // Primeira chamada: obtém o hash do bloco
        const hashResponse = await fetch(rpcConfig.url, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
            Authorization:
              "Basic " + btoa(`${rpcConfig.username}:${rpcConfig.password}`),
          },
          body: JSON.stringify({
            jsonrpc: "1.0",
            method: "getblockhash",
            params: [parseInt(blockNumber)],
            id: "curltest",
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
            "Content-Type": "text/plain",
            Authorization:
              "Basic " + btoa(`${rpcConfig.username}:${rpcConfig.password}`),
          },
          body: JSON.stringify({
            jsonrpc: "1.0",
            method: "getblock",
            params: [hashData.result],
            id: "curltest",
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
    } else if (blockNumber.startsWith("bcrt1")) {
      try {
        const hashResponse = await fetch(rpcConfig.url, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
            Authorization:
              "Basic " + btoa(`${rpcConfig.username}:${rpcConfig.password}`),
          },
          body: JSON.stringify({
            jsonrpc: "1.0",
            method: "listunspent",
            params: [0, 9999999, [blockNumber]],
            id: "curltest",
          }),
        });

        const response = await hashResponse.json();
        let amount = 0;
        if (response.result && Array.isArray(response.result)) {
          amount = response.result.reduce(
            (sum, tx) => sum + (tx.amount || 0),
            0
          );

          settotalAmount(amount);
        }

        console.log(amount);
      } catch (error) {
        setError(`Erro ao buscar bloco: ${error.message}`);
      } finally {
        setBlockData(null);
        setIsLoading(false);
      }
    } else {
      try {
        const hashResponse = await fetch(rpcConfig.url, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
            "Authorization": "Basic " + btoa(`${rpcConfig.username}:${rpcConfig.password}`)
          },
          body: JSON.stringify({
            jsonrpc: "1.0",
            method: "gettransaction",
            params: [blockNumber],
            id: "curltest"
          }),
        });
  
        const response = await hashResponse.json();
        console.log(response.result);
      } catch (error) {
        setError(`Erro ao buscar bloco: ${error.message}`);
      } finally {
        setBlockData(null);
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="px-14 h-screen w-screen flex flex-col items-center justify-center bg-gray-900">
      <div className="mb-4 flex flex-col gap-2">
        <h1 className="text-4xl text-cyan-400 font-bold mb-7 ">
          Cyber BTC Explorer
        </h1>
        <input
          type="text"
          value={blockNumber}
          onChange={(e) => setBlockNumber(e.target.value)}
          placeholder="Search for block height, hash, wallet"
          className="p-2 border rounded"
        />
        <button
          onClick={fetchBlock}
          disabled={isLoading}
          className=" font-bold mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 text-black rounded-lg hover:shadow-pink-500/50"
        >
          {isLoading ? "Explorando..." : "Explorar"}
        </button>
      </div>
      {totalAmount && (
        <div className="bg-gray-700 rounded-2xl w-52 h-16 flex flex-col items-center justify-center text-green-400 text-xl">
          <p>Yor Balance is: {totalAmount}</p>
        </div>
      )}

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {blockData && (
        <div className="space-y-2 mx-16 justify-center flex items-center flex-col bg-gray-700 rounded-2xl">
          <h2 className="text-xl font-bold mb-4">Informações do Bloco</h2>
          <div className="h-full px-14">
            <div className="justify-between border-b-2 text-green-400">
              <strong>Hash:</strong> {blockData.hash}
            </div>

            <div className="justify-between border-b-2 text-green-400">
              <p>
                <strong>Altura:</strong> {blockData.height}
              </p>
            </div>
            <div className="justify-between border-b-2 text-green-400">
              {" "}
              <p>
                <strong>Timestamp:</strong>{" "}
                {new Date(blockData.time * 1000).toLocaleString()}
              </p>
            </div>
            <div className="justify-between border-b-2 text-green-400">
              {" "}
              <p>
                <strong>Nº de Transações:</strong> {blockData.nTx}
              </p>
            </div>
            <div className="justify-between border-b-2 text-green-400">
              {" "}
              <p>
                <strong>Tamanho:</strong> {blockData.size} bytes
              </p>
            </div>
            <div className="justify-between border-b-2 text-green-400">
              <p>
                <strong>Merkle Root:</strong> {blockData.merkleroot}
              </p>
            </div>
            <div className="justify-between border-b-2 text-green-400">
              {" "}
              <p>
                <strong>Versão:</strong> {blockData.version}
              </p>
            </div>
            <div className="justify-between border-b-2 text-green-400">
              <p>
                <strong>Dificuldade:</strong> {blockData.difficulty}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockSearch;
