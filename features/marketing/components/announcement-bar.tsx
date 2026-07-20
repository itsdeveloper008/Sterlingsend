"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { routes } from "@/config/routes";

export function AnnouncementBar() {
  return (
    <div className="bonsai-announce">
      <div className="bonsai-container">
        <p className="bonsai-announce-text">
          Create a professional invoice in minutes - no account required.
          <Link href={routes.createInvoice} className="bonsai-announce-link">
            Try Guest Mode
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </p>
      </div>
    </div>
  );
}
