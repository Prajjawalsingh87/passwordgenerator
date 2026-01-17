import { useState, useCallback, useEffect, useRef } from "react";

function App() {
  const [length, setLength] = useState(8);
  const [numberAllowed, setNumberAllowed] = useState(false);
  const [charAllowed, setCharAllowed] = useState(false);
  const [password, setPassword] = useState("");

  const passwordRef = useRef(null);

  const passwordGenerator = useCallback(() => {
    let pass = "";
    let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    if (numberAllowed) str += "0123456789";
    if (charAllowed) str += "!@#$%^&*-_+=[]{}~`";

    for (let i = 1; i <= length; i++) {
      const char = Math.floor(Math.random() * str.length);
      pass += str.charAt(char);
    }

    setPassword(pass);
  }, [length, numberAllowed, charAllowed]);

  const copyPasswordToClipboard = useCallback(() => {
    passwordRef.current?.select();
    passwordRef.current?.setSelectionRange(0, 999);
    window.navigator.clipboard.writeText(password);
  }, [password]);

  useEffect(() => {
    passwordGenerator();
  }, [length, numberAllowed, charAllowed, passwordGenerator]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-2xl shadow-2xl rounded-2xl px-8 py-6 bg-gray-800 text-orange-500 text-lg">

        <h1 className="text-white text-center my-4 text-3xl font-bold">
          Password Generator
        </h1>

        {/* Password Row */}
        <div className="flex items-center gap-2 shadow-lg rounded-lg mb-6">

          <input
            type="text"
            value={password}
            ref={passwordRef}
            readOnly
            placeholder="Password"
            style={{
              width: `${Math.min(Math.max(password.length, 12), 50)}ch`,
              transition: "width 0.2s ease"
            }}
            className="outline-none py-3 px-4 text-xl text-black rounded-l-lg flex-none"
          />

          <button
            onClick={copyPasswordToClipboard}
            className="outline-none bg-blue-700 text-white px-6 py-3 text-lg shrink-0 rounded-r-lg hover:bg-blue-600 transition"
          >
            Copy
          </button>

        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-6 items-center justify-between">

          {/* Length Slider */}
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={8}
              max={70}
              value={length}
              className="cursor-pointer w-56 h-2"
              onChange={(e) => setLength(e.target.value)}
            />
            <label className="font-semibold">Length: {length}</label>
          </div>

          {/* Numbers */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="numberInput"
              className="w-5 h-5"
              defaultChecked={numberAllowed}
              onChange={() => setNumberAllowed((prev) => !prev)}
            />
            <label htmlFor="numberInput">Numbers</label>
          </div>

          {/* Characters */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="characterInput"
              className="w-5 h-5"
              defaultChecked={charAllowed}
              onChange={() => setCharAllowed((prev) => !prev)}
            />
            <label htmlFor="characterInput">Characters</label>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
