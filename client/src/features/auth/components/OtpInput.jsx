import { useRef } from "react";

/**
 * OtpInput — 6 individual digit boxes with auto-focus, backspace, paste support
 * and a cyan glow on the active box (matching Aegis Deep design system).
 */
const OtpInput = ({ value = "", onChange, length = 6 }) => {
  const inputsRef = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function handleKeyDown(e, index) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = digits.map((d, i) => (i === index ? "" : d));
      onChange(next.join(""));
      if (index > 0 && !digits[index]) {
        inputsRef.current[index - 1]?.focus();
      } else if (digits[index]) {
        // just clear, stay on same box
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  }

  function handleInput(e, index) {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) return;
    const char = raw[raw.length - 1]; // take last digit typed
    const next = digits.map((d, i) => (i === index ? char : d));
    onChange(next.join(""));
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted.padEnd(length, "").slice(0, length));
    const focusIdx = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIdx]?.focus();
  }

  return (
    <div className="otp-row" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onInput={(e) => handleInput(e, i)}
          onChange={() => {}} // controlled
          className={`otp-box${digit ? " otp-box--filled" : ""}`}
          aria-label={`Digit ${i + 1}`}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};

export default OtpInput;
