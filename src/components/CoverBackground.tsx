interface CoverBackgroundProps {
  imageUrl?: string | null;
}

export function CoverBackground({ imageUrl }: CoverBackgroundProps) {
  return (
    <div className="cover-background">
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="cover-background-image transition-opacity duration-700"
        />
      )}
      <div className="cover-background-overlay" />
    </div>
  );
}