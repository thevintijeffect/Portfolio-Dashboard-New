export default function ErrorState({ message }: { message: string }) {
  return (
    <div style={{ padding: 24, color: "var(--red)" }}>
      {message}
    </div>
  );
}
