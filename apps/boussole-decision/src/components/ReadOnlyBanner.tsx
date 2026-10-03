import { Notice } from "@/components/ui";

export function ReadOnlyBanner({ ownerName }: { ownerName: string }) {
  return (
    <div className="mb-6">
      <Notice>
        👀 Tu consultes la boussole de <strong className="font-medium">{ownerName}</strong>, en lecture seule.
      </Notice>
    </div>
  );
}
