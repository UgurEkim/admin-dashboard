"use client";

import * as React from "react";
import { Plus, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const customers = [
  {
    id: "CUS-00124",
    name: "Mark Jansen",
    email: "mark.jansen@example.com",
    phone: "+31 6 12345678",
    workOrders: 4,
    activeRepairs: 1,
    lastActivity: "12 minutes ago",
  },
  {
    id: "CUS-00123",
    name: "Lisa de Vries",
    email: "lisa.devries@example.com",
    phone: "+31 6 23456789",
    workOrders: 2,
    activeRepairs: 1,
    lastActivity: "28 minutes ago",
  },
  {
    id: "CUS-00122",
    name: "Thomas Bakker",
    email: "thomas.bakker@example.com",
    phone: "+31 6 34567890",
    workOrders: 6,
    activeRepairs: 1,
    lastActivity: "1 hour ago",
  },
  {
    id: "CUS-00121",
    name: "Sophie Peters",
    email: "sophie.peters@example.com",
    phone: "+31 6 45678901",
    workOrders: 3,
    activeRepairs: 0,
    lastActivity: "2 hours ago",
  },
  {
    id: "CUS-00120",
    name: "Daan Smit",
    email: "daan.smit@example.com",
    phone: "+31 6 56789012",
    workOrders: 8,
    activeRepairs: 0,
    lastActivity: "3 hours ago",
  },
];

export default function CustomersPage() {
  const [search, setSearch] = React.useState("");
  const router = useRouter();
  const filteredCustomers = customers.filter((customer) => {
    const searchValue = search.toLowerCase();

    return (
      customer.name.toLowerCase().includes(searchValue) ||
      customer.email.toLowerCase().includes(searchValue) ||
      customer.phone.toLowerCase().includes(searchValue) ||
      customer.id.toLowerCase().includes(searchValue)
    );
  });

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>

          <p className="mt-1 text-muted-foreground">
            Manage your customers and their repair history.
          </p>
        </div>

        <Button>
          <Plus />
          New Customer
        </Button>
      </div>

      {/* Customer list */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customers..."
              className="pl-9"
            />
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Work Orders</TableHead>
                  <TableHead>Active Repairs</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/customers/${customer.id}`)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/dashboard/customers/${customer.id}`);
                      }
                    }}
                    tabIndex={0}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>

                        <div className="text-sm text-muted-foreground">
                          {customer.email}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {customer.phone}
                    </TableCell>

                    <TableCell>{customer.workOrders}</TableCell>

                    <TableCell>
                      {customer.activeRepairs > 0 ? (
                        <Badge
                          variant="outline"
                          className="border-blue-500/30 bg-blue-500/10 text-blue-500"
                        >
                          {customer.activeRepairs} active
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          None
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {customer.lastActivity}
                    </TableCell>
                  </TableRow>
                ))}

                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="rounded-full bg-muted p-3">
                          <Users className="size-5 text-muted-foreground" />
                        </div>

                        <h3 className="mt-4 font-medium">No customers found</h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Try changing your search.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredCustomers.length} of {customers.length} customers
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
