import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-muted-foreground text-lg">The connection you're looking for doesn't exist or was removed.</p>
      <Button asChild>
        <Link href="/">
          Return to Connections
        </Link>
      </Button>
    </div>
  );
} 