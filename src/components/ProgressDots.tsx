interface ProgressDotsProps {
  total: number;
  current: number;
}

const ProgressDots = ({ total, current }: ProgressDotsProps) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-colors ${
            i < current
              ? 'bg-primary'
              : i === current
              ? 'bg-accent'
              : 'bg-border'
          }`}
        />
      ))}
    </div>
  );
};

export default ProgressDots;
