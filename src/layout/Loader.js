export default function Loader({ size = 1.5 }) {
  return (
    <p className="loader" style={{ fontSize: `${size}rem` }}>
      Loading . . .
    </p>
  );
}
