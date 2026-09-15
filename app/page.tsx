import { Boxes, Layers, Users } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { VerticalCard } from "@/components/dashboard/VerticalCard";

export default function MainDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 lg:px-8">
      <header className="mb-10">
        <p className="text-sm font-medium text-accent">Inventory Management Platform</p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">
          One platform, tailored to every business
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Explore a live demo of what your inventory management system could look like —
          purpose-built navigation, fields, and workflows for Grocery, Medical, and Electronics
          retailers.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Inventory Types" value="3" icon={Layers} />
        <StatCard label="Demo Products Catalogued" value="30+" icon={Boxes} />
        <StatCard label="Demo Customer Records" value="18+" icon={Users} />
      </div>

      <h2 className="mt-10 mb-4 text-lg font-semibold text-foreground">
        Choose an inventory type
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <VerticalCard
          vertical="grocery"
          description="Track SKUs by weight and unit, manage expiry, and stay ahead of low stock."
          stats={[
            { label: "Products", value: "12" },
            { label: "Customers", value: "6" },
            { label: "Low Stock", value: "2" },
          ]}
        />
        <VerticalCard
          vertical="medical"
          description="Manage batches, expiry, prescriptions, and manufacturer compliance."
          stats={[
            { label: "Medicines", value: "—" },
            { label: "Customers", value: "—" },
            { label: "Batches", value: "—" },
          ]}
        />
        <VerticalCard
          vertical="electronics"
          description="Track serial numbers, IMEIs, warranty status, and returns."
          stats={[
            { label: "Products", value: "—" },
            { label: "Customers", value: "—" },
            { label: "Returns", value: "—" },
          ]}
        />
      </div>
    </div>
  );
}
