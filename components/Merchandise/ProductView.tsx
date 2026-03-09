import Image from "next/image";

export default function ProductViewer({ src }: { src: string }) {
  return (
    <div className="flex items-center justify-center">
      <div className="px-5 py-5 rounded-md">
        <Image
          src={src}
          alt="Merchandise T-Shirt"
          width={500}
          height={600}
          className="object-contain rounded-lg"
          priority
        />
      </div>
    </div>
  );
}
