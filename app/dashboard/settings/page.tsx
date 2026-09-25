import { CatalogSettings } from "@/components/records/catalog-settings";
import { DatabaseMigration } from "@/components/records/database-migration";
export default function Page() {
  return (
    <div className="space-y-6">
      <DatabaseMigration />
      <CatalogSettings />
    </div>
  );
}
