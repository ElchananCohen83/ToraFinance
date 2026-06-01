import { DocumentViewClient } from "./document-view-client";

type DocumentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DocumentPage({ params }: DocumentPageProps) {
  const resolvedParams = await params;

  return <DocumentViewClient id={resolvedParams.id} />;
}

