export default function PrimaryButton({ onClick, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
