export default function PrimaryButton({ onClick, children, className = "", disabled = false, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 bg-[#16a34a] text-white text-xs font-bold rounded-xl hover:bg-[#15803d] active:bg-[#166534] transition-all shadow-xs cursor-pointer disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
