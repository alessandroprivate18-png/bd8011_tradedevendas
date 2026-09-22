// Componente de loading skeleton com animação shimmer
interface SkeletonProps {
  height: number;
  borderRadius?: number;
}

export function Skeleton({ height, borderRadius = 8 }: SkeletonProps) {
  return (
    <div
      className="skeleton"
      style={{ height, borderRadius }}
      aria-label="Carregando..."
      role="status"
    />
  );
}
