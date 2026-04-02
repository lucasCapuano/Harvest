"use client";

import Script from "next/script";
import { useMemo } from "react";
import {
  mapClientToAgentContext,
  type ClientPageData,
} from "@/lib/mapClientToAgentContext";

type AdvisorCopilotProps = {
  client: ClientPageData;
};

export default function AdvisorCopilot({ client }: AdvisorCopilotProps) {
  const dynamicVariables = useMemo(() => {
    return mapClientToAgentContext(client);
  }, [client]);

  return (
    <>
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="afterInteractive"
      />
      <div>
        <elevenlabs-convai
          agent-id="agent_3601kn42803kettadetreqdh54rb"
          dynamic-variables={JSON.stringify(dynamicVariables)}
        ></elevenlabs-convai>
      </div>
    </>
  );
}
