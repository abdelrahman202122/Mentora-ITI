import Link from "next/link";
import { Bot } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type AIFinderCtaProps = {
  href: string;
  title: string;
  description: string;
  actionLabel?: string;
};

export function AIFinderCta({
  actionLabel = "Find with AI",
  description,
  href,
  title,
}: AIFinderCtaProps) {
  return (
    <Card className="border-indigo-100 bg-indigo-50">
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-white p-2 text-indigo-600">
              <Bot size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{title}</p>
              <p className="mt-1 text-xs text-gray-500">{description}</p>
            </div>
          </div>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link href={href}>{actionLabel}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
