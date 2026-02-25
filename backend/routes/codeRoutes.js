// routes/codeRoutes.js
const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const router = express.Router();

// ── Helper: normalize whitespace for comparison ───────────────────────────
function normalize(str) {
  return str
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

// ── Helper: run a shell command with a timeout ─────────────────────────────
function runCommand(cmd, options = {}) {
  return new Promise((resolve) => {
    const proc = exec(cmd, { timeout: 10000, ...options }, (err, stdout, stderr) => {
      resolve({ stdout: stdout || "", stderr: stderr || "", error: err });
    });
  });
}

// ── Core executor: write file, compile if needed, run, cleanup ─────────────
async function executeCode(code, language) {
  const tmpDir = os.tmpdir();
  let filePath, runCmd, compileCmd;
  let options = {};

  language = language.toLowerCase();

  if (language === "python") {
    filePath = path.join(tmpDir, `code_${Date.now()}.py`);
    fs.writeFileSync(filePath, code);
    // Try python first, fall back to python3
    runCmd = `python "${filePath}"`;
  } else if (language === "c") {
    filePath = path.join(tmpDir, `code_${Date.now()}.c`);
    const outPath = filePath.replace(".c", ".exe");
    fs.writeFileSync(filePath, code);

    // Explicitly include the newly installed GCC path for Windows if the default gcc isn't found
    const gccDir = "C:\\Users\\jayasakthi\\AppData\\Local\\Microsoft\\WinGet\\Packages\\BrechtSanders.WinLibs.POSIX.UCRT_Microsoft.Winget.Source_8wekyb3d8bbwe\\mingw64\\bin";
    compileCmd = `gcc "${filePath}" -o "${outPath}"`;
    runCmd = `"${outPath}"`;

    // Merge paths if on Windows
    if (process.platform === "win32") {
      options.env = { ...process.env, PATH: `${process.env.PATH};${gccDir}` };
    }
  } else if (language === "java") {
    // Java: use a unique temp subdirectory so concurrent runs don't collide on Main.java
    const javaDir = path.join(tmpDir, `java_${Date.now()}`);
    fs.mkdirSync(javaDir, { recursive: true });
    const className = "Main";
    // Replace any public class declaration with "Main" so filename matches
    const fixedCode = code.replace(/public\s+class\s+\w+/g, `public class ${className}`);
    const javaFile = path.join(javaDir, `${className}.java`);
    fs.writeFileSync(javaFile, fixedCode);
    compileCmd = `javac "${javaFile}"`;
    runCmd = `java -cp "${javaDir}" ${className}`;
    filePath = javaDir; // store dir for cleanup
  } else {
    return { stdout: "", stderr: "Unsupported language", error: true };
  }

  try {
    // Compile step (C and Java)
    if (compileCmd) {
      const compileResult = await runCommand(compileCmd, options);
      // Detect "not recognized" (Windows) or "not found" (Linux) for missing compiler
      const errOut = compileResult.stderr || compileResult.error?.message || "";
      const notFound = errOut.includes("not recognized") || errOut.includes("not found") || errOut.includes("No such file");
      if (notFound && language === "c") {
        cleanup(filePath, language);
        return {
          stdout: "",
          stderr: "gcc (C compiler) is not installed on this machine.\nPlease use Python or Java instead.",
          isCompileError: true,
        };
      }
      if (compileResult.error || compileResult.stderr) {
        cleanup(filePath, language);
        return {
          stdout: "",
          stderr: compileResult.stderr || compileResult.error?.message || "Compilation failed",
          isCompileError: true,
        };
      }
    }

    // Run step
    const runResult = await runCommand(runCmd, options);
    cleanup(filePath, language);

    return {
      stdout: runResult.stdout,
      stderr: runResult.stderr || (runResult.error ? runResult.error.message : ""),
      isCompileError: false,
    };
  } catch (e) {
    cleanup(filePath, language);
    return { stdout: "", stderr: e.message, isCompileError: false };
  }
}

function cleanup(filePath, language) {
  try {
    if (language === "java") {
      // filePath is the java temp directory — remove whole dir
      if (fs.existsSync(filePath)) fs.rmSync(filePath, { recursive: true, force: true });
    } else {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (language === "c") {
        const exe = filePath.replace(".c", ".exe");
        if (fs.existsSync(exe)) fs.unlinkSync(exe);
      }
    }
  } catch (_) { }
}


// ── POST /api/code/run ─────────────────────────────────────────────────────
router.post("/run", async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ success: false, message: "Code or language missing ❌" });
  }

  const result = await executeCode(code, language);

  return res.json({
    success: true,
    stdout: result.stdout,
    stderr: result.stderr,
    compile_output: result.isCompileError ? result.stderr : "",
    status: result.stderr ? "Error" : "Accepted",
  });
});

// ── POST /api/code/judge ───────────────────────────────────────────────────
// Body: { code, language, expectedOutput }
// Returns: { success, isCorrect, stdout, stderr, compile_output, status }
router.post("/judge", async (req, res) => {
  const { code, language, expectedOutput } = req.body;

  if (!code || !language || expectedOutput === undefined) {
    return res.status(400).json({
      success: false,
      message: "code, language, and expectedOutput are required ❌",
    });
  }

  const result = await executeCode(code, language);

  // If there was a compiler or runtime error
  if (result.isCompileError) {
    return res.json({
      success: true,
      isCorrect: false,
      stdout: "",
      stderr: "",
      compile_output: result.stderr,
      status: "Compilation Error",
    });
  }

  if (result.stderr && !result.stdout) {
    return res.json({
      success: true,
      isCorrect: false,
      stdout: "",
      stderr: result.stderr,
      compile_output: "",
      status: "Runtime Error",
    });
  }

  const isCorrect = normalize(result.stdout) === normalize(expectedOutput);

  return res.json({
    success: true,
    isCorrect,
    stdout: result.stdout,
    stderr: result.stderr || "",
    compile_output: "",
    status: isCorrect ? "Accepted" : "Wrong Answer",
  });
});

module.exports = router;
