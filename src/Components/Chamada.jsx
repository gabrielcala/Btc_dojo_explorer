import React, { useState, useEffect } from "react";

const BlockSearch = () => {
  const [blockNumber, setBlockNumber] = useState("");
  const [blockData, setBlockData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalAmount, settotalAmount] = useState();
  const [transactionData, setTransactionData] = useState(null);
  const [minerAddress, setMinerAddress] = useState("");
  const [latestBlockInfo, setLatestBlockInfo] = useState(null);

  const fetchLatestBlock = async () => {
    const rpcConfig = {
      url: "/rpc",
      username: "user",
      password: "pass",
    };

    try {
      // Get blockchain info to get latest block height
      const infoResponse = await fetch(rpcConfig.url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          Authorization: "Basic " + btoa(`${rpcConfig.username}:${rpcConfig.password}`),
        },
        body: JSON.stringify({
          jsonrpc: "1.0",
          method: "getblockchaininfo",
          params: [],
          id: "curltest",
        }),
      });

      const infoData = await infoResponse.json();
      const latestHeight = infoData.result.blocks;

      // Get latest block hash
      const hashResponse = await fetch(rpcConfig.url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          Authorization: "Basic " + btoa(`${rpcConfig.username}:${rpcConfig.password}`),
        },
        body: JSON.stringify({
          jsonrpc: "1.0",
          method: "getblockhash",
          params: [latestHeight],
          id: "curltest",
        }),
      });

      const hashData = await hashResponse.json();

      // Get block details
      const blockResponse = await fetch(rpcConfig.url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          Authorization: "Basic " + btoa(`${rpcConfig.username}:${rpcConfig.password}`),
        },
        body: JSON.stringify({
          jsonrpc: "1.0",
          method: "getblock",
          params: [hashData.result],
          id: "curltest",
        }),
      });

      const blockData = await blockResponse.json();
      setLatestBlockInfo(blockData.result);
    } catch (error) {
      console.error("Error fetching latest block:", error);
    }
  };

  useEffect(() => {
    fetchLatestBlock();
    const interval = setInterval(fetchLatestBlock, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBlock = async () => {
    settotalAmount(null);
    setTransactionData(null);
    setBlockData(null);
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
            Authorization:
              "Basic " + btoa(`${rpcConfig.username}:${rpcConfig.password}`),
          },
          body: JSON.stringify({
            jsonrpc: "1.0",
            method: "gettransaction",
            params: [blockNumber],
            id: "curltest",
          }),
        });

        const response = await hashResponse.json();
        setTransactionData(response.result);
      } catch (error) {
        setError(`Erro ao buscar bloco: ${error.message}`);
      } finally {
        setBlockData(null);
        setIsLoading(false);
      }
    }
  };

  const mineBlocks = async () => {
    if (!minerAddress) {
      setError("Por favor, insira um endereço de minerador");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/rpc", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          Authorization: "Basic " + btoa("user:pass"),
        },
        body: JSON.stringify({
          jsonrpc: "1.0",
          method: "generatetoaddress",
          params: [1, minerAddress],
          id: "curltest",
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }

      // Limpar todos os dados do formulário e informações exibidas
      setBlockNumber("");
      setMinerAddress("");
      setBlockData(null);
      setTransactionData(null);
      settotalAmount(null);
      
      // Atualizar o painel lateral com o último bloco
      await fetchLatestBlock();
    } catch (error) {
      setError(`Erro ao minerar bloco: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-14 h-screen w-screen flex bg-gray-900">
      <div className="w-80 bg-gray-800 fixed right-0 h-full p-6 overflow-y-auto">
        <h2 className="text-2xl text-cyan-400 font-bold mb-4">Último Bloco</h2>
        {latestBlockInfo ? (
          <div className="space-y-2 text-green-400">
            <div className="border-b border-gray-700 py-2">
              <strong>Altura:</strong> {latestBlockInfo.height}
            </div>
            <div className="border-b border-gray-700 py-2">
              <strong>Hash:</strong>
              <div className="text-xs break-all">{latestBlockInfo.hash}</div>
            </div>
            <div className="border-b border-gray-700 py-2">
              <strong>Timestamp:</strong>
              <div>{new Date(latestBlockInfo.time * 1000).toLocaleString()}</div>
            </div>
            <div className="border-b border-gray-700 py-2">
              <strong>Transações:</strong> {latestBlockInfo.nTx}
            </div>
            <div className="border-b border-gray-700 py-2">
              <strong>Tamanho:</strong> {latestBlockInfo.size} bytes
            </div>
          </div>
        ) : (
          <div className="text-gray-400">Carregando...</div>
        )}
      </div>

      <div className="flex-1 mr-80 flex flex-col items-center justify-start pt-7">
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
          <input
            type="text"
            value={minerAddress}
            onChange={(e) => setMinerAddress(e.target.value)}
            placeholder="Endereço do minerador"
            className="p-2 border rounded"
          />
          <div className="flex gap-2">
            <button
              onClick={fetchBlock}
              disabled={isLoading}
              className="flex-1 font-bold mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 text-black rounded-lg hover:shadow-pink-500/50"
            >
              {isLoading ? "Explorando..." : "Explorar"}
            </button>
            <button
              onClick={mineBlocks}
              disabled={isLoading}
              className="flex-1 font-bold mt-4 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-lg hover:shadow-orange-500/50"
            >
              {isLoading ? "Minerando..." : "Minerar Bloco"}
            </button>
          </div>
        </div>
        {totalAmount && (
          <div className="bg-gray-700 rounded-2xl w-52 h-16 flex flex-col items-center justify-center text-green-400 text-xl">
            <p>Your Balance is: {totalAmount}</p>
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

        {transactionData && (
          <div className="space-y-2 mx-16 justify-center flex items-center flex-col bg-gray-700 rounded-2xl p-4">
            <h2 className="text-xl font-bold mb-4 text-white">
              Informações da Transação
            </h2>
            <div className="h-full px-14 text-green-400">
              <div className="justify-between border-b-2">
                <strong>Transaction ID:</strong> {transactionData.txid}
              </div>
              <div className="justify-between border-b-2">
                <strong>Amount:</strong> {transactionData.amount} BTC
              </div>
              <div className="justify-between border-b-2">
                <strong>Fee:</strong> {transactionData.fee} BTC
              </div>
              <div className="justify-between border-b-2">
                <strong>Confirmations:</strong> {transactionData.confirmations}
              </div>
              <div className="justify-between border-b-2">
                <strong>Block Hash:</strong> {transactionData.blockhash}
              </div>
              <div className="justify-between border-b-2">
                <strong>Block Index:</strong> {transactionData.blockindex}
              </div>
              <div className="justify-between border-b-2">
                <strong>Block Time:</strong>{" "}
                {new Date(transactionData.blocktime * 1000).toLocaleString()}
              </div>
              <div className="justify-between border-b-2">
                <strong>Time:</strong>{" "}
                {new Date(transactionData.time * 1000).toLocaleString()}
              </div>
              <div className="justify-between border-b-2">
                <strong>Time Received:</strong>{" "}
                {new Date(transactionData.timereceived * 1000).toLocaleString()}
              </div>

              {/* Details section */}
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-2">Details</h3>
                {transactionData.details &&
                  transactionData.details.map((detail, index) => (
                    <div
                      key={index}
                      className="mb-4 pl-4 border-l-2 border-green-400"
                    >
                      <div>
                        <strong>Address:</strong> {detail.address}
                      </div>
                      <div>
                        <strong>Category:</strong> {detail.category}
                      </div>
                      <div>
                        <strong>Amount:</strong> {detail.amount} BTC
                      </div>
                      {detail.fee && (
                        <div>
                          <strong>Fee:</strong> {detail.fee} BTC
                        </div>
                      )}
                      {detail.label && (
                        <div>
                          <strong>Label:</strong> {detail.label}
                        </div>
                      )}
                      {detail.vout !== undefined && (
                        <div>
                          <strong>Vout:</strong> {detail.vout}
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Hex data */}
              <div className="justify-between border-b-2">
                <strong>Hex:</strong>
                <div className="break-all text-xs">{transactionData.hex}</div>
              </div>

              {/* Wallet conflicts if any */}
              {transactionData.walletconflicts &&
                transactionData.walletconflicts.length > 0 && (
                  <div className="justify-between border-b-2">
                    <strong>Wallet Conflicts:</strong>
                    <ul>
                      {transactionData.walletconflicts.map((conflict, index) => (
                        <li key={index}>{conflict}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Bip125 replaceable */}
              <div className="justify-between border-b-2">
                <strong>BIP125 Replaceable:</strong>{" "}
                {transactionData.bip125_replaceable}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockSearch;
