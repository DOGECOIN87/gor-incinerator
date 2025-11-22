export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Page not found</p>
        <a href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
          Go Home
        </a>
      </div>
    </div>
  );
}
