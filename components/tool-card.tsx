import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ToolCardProps {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
}

export function ToolCard({
    title,
    description,
    href,
    icon: Icon,
}: ToolCardProps) {
    return (
        <Link href={href} className="group block">
            <Card className="h-full transition-colors hover:bg-muted/80">
                <CardHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted">
                        <Icon className="size-5" />
                    </div>

                    <CardTitle>{title}</CardTitle>
                </CardHeader>

                <CardContent>
                    <p className="text-sm text-muted-foreground">{description}</p>

                    <div className="mt-6 flex items-center text-sm font-medium">
                        Open Tool
                        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}