import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-luxe flex flex-col items-center py-32 text-center">
      <p className="font-serif text-8xl font-light text-line">404</p>
      <h1 className="mt-4 font-serif text-3xl font-light uppercase tracking-wide2">Page Not Found</h1>
      <p className="mt-3 max-w-md text-sm text-stone">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back to the collection.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/"><Button>Back To Home</Button></Link>
        <Link href="/women"><Button variant="outline">Shop Women</Button></Link>
      </div>
    </div>
  );
}
