import { PhotoUploaderDemo } from "./_components/upload-manager";

export default function UploadPage() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Photo Upload Manager</h1>
        <p className="text-muted-foreground mt-2">
          Upload and manage images for your portfolio, blog posts, and other content
        </p>
      </div>

      <PhotoUploaderDemo />
    </div>
  );
}
