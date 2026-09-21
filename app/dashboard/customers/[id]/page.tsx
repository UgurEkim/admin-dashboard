import { ClickableDevice } from "@/components/clickable-device";
import { ClickableWorkOrder } from "@/components/clickable-work-order";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Mail,
  Package,
  Phone,
  Plus,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const customer = {
  id: "CUS-00124",
  name: "Mark Jansen",
  email: "mark.jansen@example.com",
  phone: "+31 6 12345678",
  created: "14 March 2025",
};
const devices = [
  {
    id: "DEV-00087",
    name: "PlayStation 5",
    serialNumber: "S01A23456789",
    workOrders: 2,
    status: "Repairing",
  },
  {
    id: "DEV-00052",
    name: "DualSense",
    serialNumber: "CFI-ZCT1W-12345",
    workOrders: 1,
    status: "Completed",
  },
];
const workOrders = [
  {
    id: "WO-00142",
    device: "PlayStation 5",
    issue: "No HDMI output",
    status: "Repairing",
    updated: "12 minutes ago",
  },
  {
    id: "WO-00135",
    device: "DualSense",
    issue: "Stick drift",
    status: "Completed",
    updated: "2 weeks ago",
  },
  {
    id: "WO-00121",
    device: "PlayStation 5",
    issue: "Overheating",
    status: "Completed",
    updated: "2 months ago",
  },
];
function getStatusClass(status: string) {
  switch (status) {
    case "Repairing":
      return "border-blue-500/30 bg-blue-500/10 text-blue-500";
    case "Waiting":
      return "border-amber-500/30 bg-amber-500/10 text-amber-500";
    case "Testing":
      return "border-purple-500/30 bg-purple-500/10 text-purple-500";
    case "Completed":
      return "border-green-500/30 bg-green-500/10 text-green-500";
    default:
      return "";
  }
}
export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-8">
      {" "}
      {/* Header */}{" "}
      <div>
        {" "}
        <Button
          size="sm"
          className="mb-4 -ml-2"
          nativeButton={false}
          render={<Link href="/dashboard/customers" />}
        >
          {" "}
          <ArrowLeft /> Back to Customers{" "}
        </Button>{" "}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          {" "}
          <div>
            {" "}
            <div className="flex items-center gap-3">
              {" "}
              <h1 className="text-3xl font-bold tracking-tight">
                {" "}
                {customer.name}{" "}
              </h1>{" "}
              <Badge variant="outline"> {id} </Badge>{" "}
            </div>{" "}
            <p className="mt-1 text-muted-foreground">
              {" "}
              Customer since {customer.created}{" "}
            </p>{" "}
          </div>{" "}
          <Button>
            {" "}
            <Plus /> New Work Order{" "}
          </Button>{" "}
        </div>{" "}
      </div>{" "}
      {/* Customer information */}{" "}
      <div className="grid gap-6 lg:grid-cols-3">
        {" "}
        <Card>
          {" "}
          <CardHeader>
            {" "}
            <CardTitle>Contact Information</CardTitle>{" "}
          </CardHeader>{" "}
          <CardContent className="space-y-4">
            {" "}
            <div className="flex items-center gap-3">
              {" "}
              <Mail className="size-4 text-muted-foreground" />{" "}
              <span className="text-sm"> {customer.email} </span>{" "}
            </div>{" "}
            <div className="flex items-center gap-3">
              {" "}
              <Phone className="size-4 text-muted-foreground" />{" "}
              <span className="text-sm"> {customer.phone} </span>{" "}
            </div>{" "}
            <Button variant="outline" className="w-full">
              {" "}
              <Mail /> Contact Customer{" "}
            </Button>{" "}
          </CardContent>{" "}
        </Card>{" "}
        <Card>
          {" "}
          <CardHeader>
            {" "}
            <CardTitle>Customer Overview</CardTitle>{" "}
          </CardHeader>{" "}
          <CardContent className="grid grid-cols-2 gap-4">
            {" "}
            <div>
              {" "}
              <p className="text-2xl font-bold"> {devices.length} </p>{" "}
              <p className="text-sm text-muted-foreground"> Devices </p>{" "}
            </div>{" "}
            <div>
              {" "}
              <p className="text-2xl font-bold"> {workOrders.length} </p>{" "}
              <p className="text-sm text-muted-foreground">
                {" "}
                Work Orders{" "}
              </p>{" "}
            </div>{" "}
            <div>
              {" "}
              <p className="text-2xl font-bold"> 1 </p>{" "}
              <p className="text-sm text-muted-foreground">
                {" "}
                Active Repairs{" "}
              </p>{" "}
            </div>{" "}
            <div>
              {" "}
              <p className="text-2xl font-bold"> 2 </p>{" "}
              <p className="text-sm text-muted-foreground"> Completed </p>{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
        <Card>
          {" "}
          <CardHeader>
            {" "}
            <CardTitle>Customer Since</CardTitle>{" "}
          </CardHeader>{" "}
          <CardContent>
            {" "}
            <div className="flex items-center gap-3">
              {" "}
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                {" "}
                <CalendarDays className="size-5 text-muted-foreground" />{" "}
              </div>{" "}
              <div>
                {" "}
                <p className="font-medium"> {customer.created} </p>{" "}
                <p className="text-sm text-muted-foreground">
                  {" "}
                  First registered{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
      </div>{" "}
      {/* Devices */}{" "}
      <Card>
        {" "}
        <CardHeader className="flex flex-row items-center justify-between">
          {" "}
          <div>
            {" "}
            <CardTitle>Devices</CardTitle>{" "}
          </div>{" "}
          <Button variant="outline" size="sm">
            {" "}
            <Plus /> Add Device{" "}
          </Button>{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <div className="space-y-2">
            {" "}
            {devices.map((device) => (
              <ClickableDevice key={device.id} id={device.id}>
                {" "}
                <div className="flex min-w-0 items-center gap-4">
                  {" "}
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    {" "}
                    <Package className="size-5 text-muted-foreground" />{" "}
                  </div>{" "}
                  <div className="min-w-0">
                    {" "}
                    <p className="font-medium"> {device.name} </p>{" "}
                    <p className="text-sm text-muted-foreground">
                      {" "}
                      Serial: {device.serialNumber}{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex shrink-0 items-center gap-4">
                  {" "}
                  <span className="hidden text-sm text-muted-foreground md:block">
                    {" "}
                    {device.workOrders} work orders{" "}
                  </span>{" "}
                  <Badge
                    variant="outline"
                    className={getStatusClass(device.status)}
                  >
                    {" "}
                    {device.status}{" "}
                  </Badge>{" "}
                </div>{" "}
              </ClickableDevice>
            ))}{" "}
          </div>{" "}
        </CardContent>{" "}
      </Card>{" "}
      {/* Work orders */}{" "}
      <Card>
        {" "}
        <CardHeader>
          {" "}
          <CardTitle>Work Order History</CardTitle>{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <div className="space-y-1">
            {" "}
            {workOrders.map((order) => (
              <ClickableWorkOrder key={order.id} id={order.id}>
                {" "}
                <div className="flex min-w-0 items-center gap-4">
                  {" "}
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    {" "}
                    <Wrench className="size-5 text-muted-foreground" />{" "}
                  </div>{" "}
                  <div className="min-w-0">
                    {" "}
                    <div className="flex items-center gap-3">
                      {" "}
                      <span className="font-medium"> {order.id} </span>{" "}
                      <span className="text-sm text-muted-foreground">
                        {" "}
                        {order.device}{" "}
                      </span>{" "}
                    </div>{" "}
                    <p className="mt-1 text-sm text-muted-foreground">
                      {" "}
                      {order.issue}{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex shrink-0 items-center gap-4">
                  {" "}
                  <span className="hidden text-sm text-muted-foreground md:block">
                    {" "}
                    {order.updated}{" "}
                  </span>{" "}
                  <Badge
                    variant="outline"
                    className={getStatusClass(order.status)}
                  >
                    {" "}
                    {order.status}{" "}
                  </Badge>{" "}
                </div>{" "}
              </ClickableWorkOrder>
            ))}{" "}
          </div>{" "}
        </CardContent>{" "}
      </Card>{" "}
    </div>
  );
}
