import React, { useState } from "react";
import FetchBlock from "./Chamada";

const Home = () => {
  const [blockNumber, setBlockNunber] = useState();

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900">
      <h1 className="text-4xl text-cyan-400 font-bold mb-7 ">
        Cyber BTC Explorer
      </h1>

      <input
        placeholder="Search for block height, hash, wallet"
        type="text"
        value={blockNumber}
        onChange={(e) => setBlockNunber(e.target.value)}
        className="w-1/3 h-14 rounded-xl placeholder-gradient bg-gray-800 text-white"
      />

      <button className=" font-bold mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 text-black rounded-lg hover:shadow-pink-500/50">
        Explorar
      </button>
    </div>
  );
};

export default Home;
